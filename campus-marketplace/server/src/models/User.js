const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cartItemSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const notificationPrefsSchema = new mongoose.Schema(
  {
    orderUpdates: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    suspensionReason: {
      type: String,
      default: '',
    },
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
    notificationPrefs: {
      type: notificationPrefsSchema,
      default: () => ({}),
    },
    cartItems: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
