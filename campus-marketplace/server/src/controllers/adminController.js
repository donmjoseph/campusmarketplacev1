const { batch } = require('../config/database');
const userRepository = require('../repositories/userRepository');
const listingRepository = require('../repositories/listingRepository');
const orderRepository = require('../repositories/orderRepository');
const reportRepository = require('../repositories/reportRepository');
const AppError = require('../utils/AppError');

async function getDashboard(req, res) {
  const [totalUsers, activeListings, totalOrders, pendingReports, recentUsers, recentOrders] = await Promise.all([
    userRepository.count(),
    listingRepository.count('active'),
    orderRepository.count(),
    reportRepository.countPending(),
    userRepository.findRecent(8),
    orderRepository.findMany({ limit: 8 }),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      activeListings,
      totalOrders,
      pendingReports,
    },
    recentUsers,
    recentOrders,
  });
}

async function getUsers(req, res) {
  const { q, role, status } = req.query;
  const users = await userRepository.findMany({ q, role, status });
  res.json({ success: true, count: users.length, users });
}

async function updateUserStatus(req, res) {
  const { status, suspensionReason = '' } = req.body;

  if (!['active', 'suspended'].includes(status)) {
    throw new AppError('Invalid user status.', 400);
  }

  const user = await userRepository.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.role === 'admin' && status === 'suspended') {
    throw new AppError('Admin accounts cannot be suspended via this route.', 400);
  }

  const updated = await userRepository.updateStatus(
    user._id,
    status,
    status === 'suspended' ? suspensionReason : ''
  );

  res.json({
    success: true,
    user: updated,
  });
}

async function getListings(req, res) {
  const { q, category, status } = req.query;
  const listings = await listingRepository.findMany({ q, category, status });
  res.json({ success: true, count: listings.length, listings });
}

async function moderateListing(req, res) {
  const { action, reason = '' } = req.body;
  if (!['remove', 'restore'].includes(action)) {
    throw new AppError('Invalid moderation action.', 400);
  }

  const listing = await listingRepository.findById(req.params.id);
  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  const updated = await listingRepository.setModeration(
    listing._id,
    action === 'remove'
      ? { status: 'removed', removedReason: reason, removedBy: req.user._id, removedAt: new Date() }
      : { status: 'active', removedReason: '', removedBy: null, removedAt: null }
  );

  res.json({
    success: true,
    listing: updated,
  });
}

async function getOrders(req, res) {
  const { status, q } = req.query;
  const orders = await orderRepository.findMany({ status, q });
  res.json({ success: true, count: orders.length, orders });
}

async function getAnalytics(req, res) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers, totalListings, activeListings, soldListings, totalOrders,
    totalRevenue, byCategory, ordersByStatus, revenueByDay, usersByDay, topListings,
  ] = await Promise.all([
    userRepository.count(),
    listingRepository.count(),
    listingRepository.count('active'),
    listingRepository.count('sold'),
    orderRepository.count(),
    orderRepository.totalRevenue(),
    listingRepository.countByCategory(),
    orderRepository.countByStatus(),
    orderRepository.revenueByDay(thirtyDaysAgo),
    userRepository.signupsByDay(thirtyDaysAgo),
    orderRepository.topListings(5),
  ]);

  const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

  res.json({
    success: true,
    metrics: { totalUsers, totalListings, activeListings, soldListings, totalOrders, totalRevenue, avgOrderValue },
    byCategory,
    ordersByStatus,
    revenueByDay,
    usersByDay,
    topListings,
  });
}

async function getReports(req, res) {
  const { status } = req.query;
  const reports = await reportRepository.findMany({ status });

  res.json({
    success: true,
    count: reports.length,
    reports,
  });
}

const REPORT_ACTIONS = {
  dismiss: { status: 'dismissed', actionTaken: 'dismissed' },
  warn: { status: 'reviewed', actionTaken: 'warned' },
  suspend: { status: 'reviewed', actionTaken: 'suspended' },
};

async function resolveReport(req, res) {
  const { action, note = '' } = req.body;
  if (!REPORT_ACTIONS[action]) {
    throw new AppError('Invalid report action.', 400);
  }

  const report = await reportRepository.findById(req.params.id);
  if (!report) {
    throw new AppError('Report not found.', 404);
  }

  const statements = [
    reportRepository.resolveStatement(report._id, {
      ...REPORT_ACTIONS[action],
      adminNote: note,
      reviewedBy: req.user._id,
    }),
  ];

  if (action === 'suspend') {
    statements.push(
      userRepository.updateStatusStatement(
        report.againstUser._id,
        'suspended',
        note || 'Suspended by admin after message review.'
      )
    );
  }

  await batch(statements);

  res.json({
    success: true,
    report: await reportRepository.findById(report._id),
  });
}

module.exports = {
  getDashboard,
  getUsers,
  updateUserStatus,
  getListings,
  moderateListing,
  getOrders,
  getAnalytics,
  getReports,
  resolveReport,
};
