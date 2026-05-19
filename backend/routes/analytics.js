import express from "express";
import AnalyticsController from "../controllers/analytics.js";
import UserAnalyticsController from "../controllers/userAnalytics.js";
import { requireAuthAdmin } from '../middlewares/requireAuthAdmin.js';
import { requireAuthGroomer } from '../middlewares/requireAuthGroomer.js';

const router = express.Router();

// Existing analytics routes
router.get("/dashboardCounters", requireAuthAdmin, AnalyticsController.dashboardCounters);
router.get("/dashboardCountersGroomer", requireAuthGroomer, AnalyticsController.dashboardCountersGroomer);

// NEW: User login analytics routes
router.get("/login", requireAuthAdmin, UserAnalyticsController.getLoginAnalytics);
router.get("/frequent-users", requireAuthAdmin, UserAnalyticsController.getFrequentUsers);
router.get("/user/:userId/stats", requireAuthAdmin, UserAnalyticsController.getUserLoginStats);
router.post("/update-frequent-status", requireAuthAdmin, UserAnalyticsController.updateFrequentUserStatus);
router.get("/engagement", requireAuthAdmin, UserAnalyticsController.getUserEngagementMetrics);

export default router;
