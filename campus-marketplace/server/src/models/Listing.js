const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    category: {
      type: String,
      required: true,
      enum: ['Textbooks', 'Electronics', 'Furniture', 'Housing', 'Tickets', 'Other'],
      index: true,
    },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair'],
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    courseTag: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'inactive', 'sold', 'removed'],
      default: 'active',
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    removedReason: {
      type: String,
      default: '',
    },
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    removedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text', courseTag: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
