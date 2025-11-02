const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  renter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending_approval",
      "awaiting_signatures", // New status
      "awaiting_payment",    // New status
      "confirmed",
      "rejected",
    ],
    default: "pending_approval",
  },
  
  // Pricing Details
  advanceAmount: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true }, // advance + commission

  // E-Signature Simulation
  renterSigned: { type: Boolean, default: false },
  ownerSigned: { type: Boolean, default: false },

  // Payment Simulation
  paymentSimulated: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;

