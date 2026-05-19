import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { eq, sql, desc, and } from "drizzle-orm";

class LoginTrackingService {
  /**
   * Track user login activity
   */
  static async trackUserLogin(userId, ipAddress = null, userAgent = null) {
    try {
      console.log(`🔍 Tracking login for user ${userId}`);

      // Get current user data
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!currentUser) {
        console.log(`❌ User ${userId} not found`);
        return null;
      }

      const now = new Date();
      const currentLoginCount = currentUser.login_count || 0;
      const newLoginCount = currentLoginCount + 1;

      // Check if this is the actual first login (login_count was 0)
      const isFirstLogin = currentLoginCount === 0;

      // Determine if user is frequent (login count >= 10)
      const isFrequentUser = newLoginCount >= 10;

      // Update user login information
      await db
        .update(users)
        .set({
          last_login_at: now,
          login_count: newLoginCount,
          first_login_at: isFirstLogin ? now : currentUser.first_login_at,
          is_frequent_user: isFrequentUser,
          updated_at: now,
        })
        .where(eq(users.id, userId));

      console.log(`✅ Login tracked for user ${userId}: Login count = ${newLoginCount}, First login = ${isFirstLogin}, Frequent = ${isFrequentUser}`);

      return {
        userId,
        loginCount: newLoginCount,
        isFirstLogin,
        isFrequentUser,
        loginTime: now,
      };

    } catch (error) {
      console.error(`❌ Error tracking login for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get user login statistics
   */
  static async getUserLoginStats(userId) {
    try {
      const [user] = await db
        .select({
          id: users.id,
          user_name: users.user_name,
          email_id: users.email_id,
          login_count: users.login_count,
          last_login_at: users.last_login_at,
          first_login_at: users.first_login_at,
          is_frequent_user: users.is_frequent_user,
          created_at: users.created_at,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return null;
      }

      // Calculate additional stats
      const stats = {
        ...user,
        days_since_first_login: user.first_login_at ?
          Math.floor((new Date() - new Date(user.first_login_at)) / (1000 * 60 * 60 * 24)) : 0,
        days_since_last_login: user.last_login_at ?
          Math.floor((new Date() - new Date(user.last_login_at)) / (1000 * 60 * 60 * 24)) : 0,
        average_logins_per_day: user.first_login_at && user.login_count > 0 ?
          (user.login_count / Math.max(1, Math.floor((new Date() - new Date(user.first_login_at)) / (1000 * 60 * 60 * 24)))) : 0,
      };

      return stats;

    } catch (error) {
      console.error(`❌ Error getting login stats for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get frequent users (login count >= threshold)
   */
  static async getFrequentUsers(threshold = 10, limit = 50) {
    try {
      const frequentUsers = await db
        .select({
          id: users.id,
          user_name: users.user_name,
          email_id: users.email_id,
          mobile_number: users.mobile_number,
          login_count: users.login_count,
          last_login_at: users.last_login_at,
          first_login_at: users.first_login_at,
          created_at: users.created_at,
        })
        .from(users)
        .where(and(
          eq(users.is_deleted, false),
          sql`${users.login_count} >= ${threshold}`
        ))
        .orderBy(desc(users.login_count))
        .limit(limit);

      console.log(`📊 Found ${frequentUsers.length} frequent users (threshold: ${threshold})`);
      return frequentUsers;

    } catch (error) {
      console.error(`❌ Error getting frequent users:`, error);
      return [];
    }
  }

  /**
   * Get overall login analytics
   */
  static async getLoginAnalytics() {
    try {
      // Get various login statistics
      const [totalUsersResult] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(eq(users.is_deleted, false));

      const [activeUsersResult] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(and(
          eq(users.is_deleted, false),
          sql`${users.last_login_at} >= NOW() - INTERVAL '30 days'`
        ));

      const [frequentUsersResult] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(and(
          eq(users.is_deleted, false),
          eq(users.is_frequent_user, true)
        ));

      const [newUsersResult] = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(and(
          eq(users.is_deleted, false),
          sql`${users.created_at} >= NOW() - INTERVAL '30 days'`
        ));

      const analytics = {
        total_users: parseInt(totalUsersResult?.count || 0),
        active_users_30_days: parseInt(activeUsersResult?.count || 0),
        frequent_users: parseInt(frequentUsersResult?.count || 0),
        new_users_30_days: parseInt(newUsersResult?.count || 0),
        user_engagement_rate: totalUsersResult?.count > 0 ?
          ((parseInt(activeUsersResult?.count || 0) / parseInt(totalUsersResult?.count)) * 100).toFixed(2) : 0,
      };

      console.log(`📊 Login analytics:`, analytics);
      return analytics;

    } catch (error) {
      console.error(`❌ Error getting login analytics:`, error);
      return null;
    }
  }

  /**
   * Update frequent user status for all users
   * This can be run periodically to update user statuses
   */
  static async updateFrequentUserStatus(threshold = 10) {
    try {
      // Update users who meet the frequent criteria
      const result = await db
        .update(users)
        .set({ is_frequent_user: true })
        .where(and(
          eq(users.is_deleted, false),
          sql`${users.login_count} >= ${threshold}`,
          eq(users.is_frequent_user, false)
        ));

      // Reset frequent status for users who no longer meet criteria
      const resetResult = await db
        .update(users)
        .set({ is_frequent_user: false })
        .where(and(
          eq(users.is_deleted, false),
          sql`${users.login_count} < ${threshold}`,
          eq(users.is_frequent_user, true)
        ));

      console.log(`✅ Updated ${result.rowCount || 0} users to frequent status`);
      console.log(`✅ Reset ${resetResult.rowCount || 0} users from frequent status`);

      return {
        updated: result.rowCount || 0,
        reset: resetResult.rowCount || 0,
      };

    } catch (error) {
      console.error(`❌ Error updating frequent user status:`, error);
      return null;
    }
  }
}

export default LoginTrackingService;
