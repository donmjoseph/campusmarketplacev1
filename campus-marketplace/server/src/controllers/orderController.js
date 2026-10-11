const { batch } = require('../config/database');
const cartRepository = require('../repositories/cartRepository');
const listingRepository = require('../repositories/listingRepository');
const orderRepository = require('../repositories/orderRepository');
const { newId } = require('../repositories/helpers');
const AppError = require('../utils/AppError');
const generateOrderNumber = require('../utils/generateOrderNumber');

async function checkout(req, res) {
  const { method, contactName, contactPhone, shippingAddress = '', notes = '' } = req.body;

  if (method === 'shipping' && !shippingAddress.trim()) {
    throw new AppError('Shipping address is required for shipping orders.', 400);
  }

  const cartItems = await cartRepository.findItems(req.user._id);

  if (!cartItems.length) {
    throw new AppError('Cart is empty.', 400);
  }

  const orderIds = [];
  const orderNumbers = new Set();
  const statements = [];

  for (const { listing } of cartItems) {
    if (listing.status !== 'active') {
      throw new AppError(`Listing "${listing.title}" is no longer available.`, 400);
    }

    let orderNumber = generateOrderNumber();
    while (orderNumbers.has(orderNumber)) {
      orderNumber = generateOrderNumber();
    }
    orderNumbers.add(orderNumber);

    const id = newId();
    orderIds.push(id);

    statements.push(
      orderRepository.insertStatement({
        id,
        orderNumber,
        buyerId: req.user._id,
        sellerId: listing.seller._id,
        listingId: listing._id,
        titleSnapshot: listing.title,
        priceSnapshot: listing.price,
        checkout: {
          method,
          contactName,
          contactPhone,
          shippingAddress,
          notes,
        },
      }),
      listingRepository.setStatusStatement(listing._id, 'sold')
    );
  }

  statements.push(cartRepository.clearStatement(req.user._id));
  await batch(statements);

  const orders = await orderRepository.findByIds(orderIds);

  res.status(201).json({
    success: true,
    message: 'Checkout complete.',
    orders,
  });
}

async function getBuyerOrders(req, res) {
  const orders = await orderRepository.findMany({ buyerId: req.user._id });
  res.json({ success: true, count: orders.length, orders });
}

async function getSellerOrders(req, res) {
  const orders = await orderRepository.findMany({ sellerId: req.user._id });
  res.json({ success: true, count: orders.length, orders });
}

async function requestCancellation(req, res) {
  const { reason } = req.body;
  const order = await orderRepository.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (String(order.buyer._id) !== String(req.user._id)) {
    throw new AppError('Not allowed to modify this order.', 403);
  }

  if (order.status !== 'pending') {
    throw new AppError('Only pending orders can request cancellation.', 400);
  }

  if (order.cancellation.requested) {
    throw new AppError('Cancellation already requested.', 409);
  }

  const updated = await orderRepository.update(order._id, {
    status: 'cancellation_requested',
    cancellation: {
      requested: true,
      reason,
      requestedAt: new Date(),
      decision: 'pending',
      reviewedAt: null,
      reviewedBy: null,
    },
  });

  res.json({
    success: true,
    message: 'Cancellation request submitted.',
    order: updated,
  });
}

async function decideCancellation(req, res) {
  const { decision } = req.body;
  const order = await orderRepository.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (String(order.seller._id) !== String(req.user._id)) {
    throw new AppError('Not allowed to review this order.', 403);
  }

  if (!order.cancellation.requested || order.status !== 'cancellation_requested') {
    throw new AppError('No pending cancellation request for this order.', 400);
  }

  const statements = [
    orderRepository.updateStatement(order._id, {
      status: decision === 'approved' ? 'cancelled' : 'pending',
      cancellation: {
        ...order.cancellation,
        decision,
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
      },
    }),
  ];

  if (decision === 'approved' && order.listing && order.listing.status === 'sold') {
    statements.push(listingRepository.setStatusStatement(order.listing._id, 'active'));
  }

  await batch(statements);

  res.json({
    success: true,
    message: decision === 'approved' ? 'Cancellation approved.' : 'Cancellation denied.',
    order: await orderRepository.findById(order._id),
  });
}

async function confirmOrder(req, res) {
  const order = await orderRepository.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (String(order.seller._id) !== String(req.user._id)) {
    throw new AppError('Not allowed to confirm this order.', 403);
  }

  if (order.status !== 'pending') {
    throw new AppError('Only pending orders can be confirmed.', 400);
  }

  const updated = await orderRepository.update(order._id, { status: 'confirmed' });

  res.json({ success: true, message: 'Order confirmed.', order: updated });
}

async function markFulfilled(req, res) {
  const order = await orderRepository.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (String(order.seller._id) !== String(req.user._id)) {
    throw new AppError('Not allowed to fulfill this order.', 403);
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw new AppError('Only pending or confirmed orders can be fulfilled.', 400);
  }

  const updated = await orderRepository.update(order._id, { status: 'fulfilled', fulfilledAt: new Date() });

  res.json({
    success: true,
    message: 'Order marked as fulfilled.',
    order: updated,
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
