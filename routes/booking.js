const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Main dashboard
router.get(
  "/dashboard",
  isLoggedIn,
  wrapAsync(bookingController.renderDashboard)
);

// 1. Renter requests to book
router.post(
  "/listings/:id/book",
  isLoggedIn,
  wrapAsync(bookingController.requestBooking)
);

// 2. Owner clicks "Approve"
router.post(
  "/booking/:id/approve",
  isLoggedIn,
  wrapAsync(bookingController.approveBooking)
);

// 3. ⬇️ ADD THIS NEW ROUTE FOR REJECTING ⬇️
router.post(
  "/booking/:id/reject",
  isLoggedIn,
  wrapAsync(bookingController.rejectBooking)
);

// 4. User (Renter or Owner) views the agreement (PDF)
router.get(
  "/booking/:id/agreement",
  isLoggedIn,
  wrapAsync(bookingController.generateAgreement)
);

// 5. User (Renter or Owner) "signs" the agreement
router.post(
  "/booking/:id/sign",
  isLoggedIn,
  wrapAsync(bookingController.signAgreement)
);

// 6. Renter goes to the (fake) payment page
router.get(
  "/booking/:id/pay",
  isLoggedIn,
  wrapAsync(bookingController.renderPaymentPage)
);

// 7. Renter "confirms" the simulated payment
router.post(
  "/booking/:id/payment/simulate",
  isLoggedIn,
  wrapAsync(bookingController.simulatePayment)
);

module.exports = router;

