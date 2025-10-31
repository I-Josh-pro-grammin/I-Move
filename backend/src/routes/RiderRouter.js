import express from "express";
import {
  acceptRide,
  declineRide,
  getRideRequests,
  getMyRides,
  completeRide,
  updateAvailability
} from "../controllers/riderController.js";
import { authenticate } from "../midelwares/Authentication.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get incoming ride requests
router.get("/requests", getRideRequests);

// Accept a ride request
router.post("/accept", acceptRide);

// Decline a ride request
router.post("/decline", declineRide);

// Get rider's rides history
router.get("/rides", getMyRides);

// Complete a ride
router.post("/complete", completeRide);

// Update rider availability
router.put("/availability", updateAvailability);

export default router;
