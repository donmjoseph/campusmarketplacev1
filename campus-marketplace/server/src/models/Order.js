const mongoose = require('mongoose');

const cancellationSchema = new mongoose.Schema(
  {
    requested: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    requestedAt: { type: Date, default: null },
    decision: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending',
    },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false }
);

const checkoutSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['pickup', 'shipping'],
      required: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    shippingAddress: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    titleSnapshot: {
      type: String,
      required: true,
    },
    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled', 'cancellation_requested'],
      default: 'pending',
      index: true,
    },
    checkout: {
      type: checkoutSchema,
      required: true,
    },
    cancellation: {
      type: cancellationSchema,
      default: () => ({ requested: false, decision: 'pending' }),
    },
    fulfilledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
