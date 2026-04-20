const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const generateOrderNumber = require('../utils/generateOrderNumber');

async function checkout(req, res) {
  const { method, contactName, contactPhone, shippingAddress = '', notes = '' } = req.body;

  if (method === 'shipping' && !shippingAddress.trim()) {
    throw new AppError('Shipping address is required for shipping orders.', 400);
  }

  const buyer = await User.findById(req.user._id).populate({
    path: 'cartItems.listing',
    populate: { path: 'seller', select: 'name email role' },
  });

  if (!buyer.cartItems.length) {
    throw new AppError('Cart is empty.', 400);
  }

  const ordersToCreate = [];

  for (const entry of buyer.cartItems) {
    const listing = entry.listing;
    if (!listing) continue;

    if (listing.status !== 'active') {
      throw new AppError(`Listing "${listing.title}" is no longer available.`, 400);
    }

    ordersToCreate.push({
      orderNumber: generateOrderNumber(),
      buyer: buyer._id,
      seller: listing.seller._id,
      listing: listing._id,
      titleSnapshot: listing.title,
      priceSnapshot: listing.price,
      checkout: {
        method,
        contactName,
        contactPhone,
        shippingAddress,
        notes,
      },
      status: 'pending',
    });
  }

  if (!ordersToCreate.length) {
    throw new AppError('No valid items found in cart.', 400);
  }

  const createdOrders = await Order.insertMany(ordersToCreate);

  await Promise.all(
    ordersToCreate.map((order) => Listing.findByIdAndUpdate(order.listing, { status: 'sold' }))
  );

  buyer.cartItems = [];
  await buyer.save();

  const enrichedOrders = await Order.find({ _id: { $in: createdOrders.map((order) => order._id) } })
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('listing', 'title images');

  res.status(201).json({
    success: true,
    message: 'Checkout complete.',
    orders: enrichedOrders,
  });
}

async function getBuyerOrders(req, res) {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('seller', 'name email')
    .populate('listing', 'title images')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: orders.length, orders });
}

async function getSellerOrders(req, res) {
  const orders = await Order.find({ seller: req.user._id })
    .populate('buyer', 'name email')
    .populate('listing', 'title images')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: orders.length, orders });
}

async function requestCancellation(req, res) {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (String(order.buyer) !== String(req.user._id)) {
    throw new AppError('Not allowed to modify this order.', 403);
  }

  if (order.status !== 'pending') {
    throw new AppError('Only pending orders can request cancellation.', 400);
  }

  if (order.cancellation.requested) {
    throw new AppError('Cancellation already requested.', 409);
  }

  order.status = 'cancellation_requested';
  order.cancellation = {
    requested: true,
    reason,
    requestedAt: new Date(),
    decision: 'pending',
    reviewedAt: null,
    reviewedBy: null,
  };

  await order.save();

  res.json({
    success: true,
    message: 'Cancellation request submitted.',
    order,
  });
}

async function decideCancellation(req, res) {
  const { decision } = req.body;
  const order = await Order.findById(req.params.id).populate('listing');

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (String(order.seller) !== String(req.user._id)) {
    throw new AppError('Not allowed to review this order.', 403);
  }

  if (!order.cancellation.requested || order.status !== 'cancellation_requested') {
    throw new AppError('No pending cancellation request for this order.', 400);
  }

  order.cancellation.decision = decision;
  order.cancellation.reviewedAt = new Date();
  order.cancellation.reviewedBy = req.user._id;

  if (decision === 'approved') {
    order.status = 'cancelled';
    if (order.listing && order.listing.status === 'sold') {
      order.listing.status = 'active';
      await order.listing.save();
    }
  } else {
    order.status = 'pending';
  }

  await order.save();

  res.json({
    success: true,
    message: decision === 'approved' ? 'Cancellation approved.' : 'Cancellation denied.',
    order,
  });
}

async function confirmOrder(req, res) {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (String(order.seller) !== String(req.user._id)) {
    throw new AppError('Not allowed to confirm this order.', 403);
  }

  if (order.status !== 'pending') {
    throw new AppError('Only pending orders can be confirmed.', 400);
  }

  order.status = 'confirmed';
  await order.save();

  res.json({ success: true, message: 'Order confirmed.', order });
}

async function markFulfilled(req, res) {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (String(order.seller) !== String(req.user._id)) {
    throw new AppError('Not allowed to fulfill this order.', 403);
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw new AppError('Only pending or confirmed orders can be fulfilled.', 400);
  }

  order.status = 'fulfilled';
  order.fulfilledAt = new Date();
  await order.save();

  res.json({
    success: true,
    message: 'Order marked as fulfilled.',
    order,
  });
}

module.exports = {
  checkout,
  getBuyerOrders,
  getSellerOrders,
  requestCancellation,
  decideCancellation,
  confirmOrder,
  markFulfilled,
};
