import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import LoginTrackingService from "../services/loginTrackingService.js";

class UserAnalyticsController {
  /**
   * Get overall login analytics
   */
  static async getLoginAnalytics(req, res) {
    try {
      console.log("📊 Getting login analytics...");

      const analytics = await LoginTrackingService.getLoginAnalytics();

      if (!analytics) {
        return res.status(500).json({ message: "Failed to get analytics" });
      }

      return res.status(200).json({
        message: "Login analytics retrieved successfully",
        data: analytics,
      });

    } catch (error) {
      console.error("❌ Error getting login analytics:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  /**
   * Get frequent users list
   */
  static async getFrequentUsers(req, res) {
    try {
      const { threshold = 10, limit = 50 } = req.query;

      console.log(`📊 Getting frequent users (threshold: ${threshold}, limit: ${limit})`);

      const frequentUsers = await LoginTrackingService.getFrequentUsers(
        parseInt(threshold),
        parseInt(limit)
      );

      return res.status(200).json({
        message: "Frequent users retrieved successfully",
        data: frequentUsers,
        count: frequentUsers.length,
      });

    } catch (error) {
      console.error("❌ Error getting frequent users:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  /**
   * Get specific user login statistics
   */
  static async getUserLoginStats(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`📊 Getting login stats for user ${userId}`);

      const stats = await LoginTrackingService.getUserLoginStats(parseInt(userId));

      if (!stats) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "User login stats retrieved successfully",
        data: stats,
      });

    } catch (error) {
      console.error("❌ Error getting user login stats:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  /**
   * Update frequent user status for all users
   */
  static async updateFrequentUserStatus(req, res) {
    try {
      const { threshold = 10 } = req.body;

      console.log(`🔄 Updating frequent user status (threshold: ${threshold})`);

      const result = await LoginTrackingService.updateFrequentUserStatus(parseInt(threshold));

      if (!result) {
        return res.status(500).json({ message: "Failed to update frequent user status" });
      }

      return res.status(200).json({
        message: "Frequent user status updated successfully",
        data: result,
      });

    } catch (error) {
      console.error("❌ Error updating frequent user status:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  /**
   * Get user engagement metrics
   */
  static async getUserEngagementMetrics(req, res) {
    try {
      console.log("📊 Getting user engagement metrics...");

      // Get user distribution by login count
      const userDistribution = await db
        .select({
          login_range: sql`
            CASE
              WHEN login_count = 0 THEN 'Never Logged In'
              WHEN login_count BETWEEN 1 AND 5 THEN '1-5 Logins'
              WHEN login_count BETWEEN 6 AND 10 THEN '6-10 Logins'
              WHEN login_count BETWEEN 11 AND 20 THEN '11-20 Logins'
              WHEN login_count BETWEEN 21 AND 50 THEN '21-50 Logins'
              ELSE '50+ Logins'
            END
          `,
          user_count: sql`count(*)`,
        })
        .from(users)
        .where(eq(users.is_deleted, false))
        .groupBy(sql`
          CASE
            WHEN login_count = 0 THEN 'Never Logged In'
            WHEN login_count BETWEEN 1 AND 5 THEN '1-5 Logins'
            WHEN login_count BETWEEN 6 AND 10 THEN '6-10 Logins'
            WHEN login_count BETWEEN 11 AND 20 THEN '11-20 Logins'
            WHEN login_count BETWEEN 21 AND 50 THEN '21-50 Logins'
            ELSE '50+ Logins'
          END
        `);

      // Get recent login activity (last 7 days)
      const recentActivity = await db
        .select({
          date: sql`DATE(last_login_at)`,
          login_count: sql`count(*)`,
        })
        .from(users)
        .where(and(
          eq(users.is_deleted, false),
          sql`last_login_at >= NOW() - INTERVAL '7 days'`
        ))
        .groupBy(sql`DATE(last_login_at)`)
        .orderBy(sql`DATE(last_login_at)`);

      const metrics = {
        user_distribution: userDistribution,
        recent_activity: recentActivity,
      };

      return res.status(200).json({
        message: "User engagement metrics retrieved successfully",
        data: metrics,
      });

    } catch (error) {
      console.error("❌ Error getting user engagement metrics:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }
}

export default UserAnalyticsController;
