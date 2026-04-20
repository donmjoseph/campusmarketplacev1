const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Report = require('../models/Report');
const AppError = require('../utils/AppError');

async function getDashboard(req, res) {
  const [totalUsers, activeListings, totalOrders, pendingReports, recentUsers, recentOrders] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments({ status: 'active' }),
    Order.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
    User.find().sort({ createdAt: -1 }).limit(8).select('name email role status createdAt'),
    Order.find().sort({ createdAt: -1 }).limit(8).populate('buyer seller listing', 'name title').select('orderNumber status createdAt'),
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

  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).select('-password');

  res.json({ success: true, count: users.length, users });
}

async function updateUserStatus(req, res) {
  const { status, suspensionReason = '' } = req.body;

  if (!['active', 'suspended'].includes(status)) {
    throw new AppError('Invalid user status.', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.role === 'admin' && status === 'suspended') {
    throw new AppError('Admin accounts cannot be suspended via this route.', 400);
  }

  user.status = status;
  user.suspensionReason = status === 'suspended' ? suspensionReason : '';
  await user.save();

  res.json({
    success: true,
    user,
  });
}

async function getListings(req, res) {
  const { q, category, status } = req.query;
  const query = {};

  if (category) query.category = category;
  if (status) query.status = status;

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  const listings = await Listing.find(query)
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: listings.length, listings });
}

async function moderateListing(req, res) {
  const { action, reason = '' } = req.body;
  if (!['remove', 'restore'].includes(action)) {
    throw new AppError('Invalid moderation action.', 400);
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  if (action === 'remove') {
    listing.status = 'removed';
    listing.removedReason = reason;
    listing.removedBy = req.user._id;
    listing.removedAt = new Date();
  } else {
    listing.status = 'active';
    listing.removedReason = '';
    listing.removedBy = null;
    listing.removedAt = null;
  }

  await listing.save();

  res.json({
    success: true,
    listing,
  });
}

async function getOrders(req, res) {
  const { status, q } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  if (q) {
    query.$or = [
      { orderNumber: { $regex: q, $options: 'i' } },
      { titleSnapshot: { $regex: q, $options: 'i' } },
    ];
  }

  const orders = await Order.find(query)
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('listing', 'title status')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: orders.length, orders });
}

async function getAnalytics(req, res) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers, totalListings, activeListings, soldListings, totalOrders,
    revenueAgg, byCategory, ordersByStatus, revenueByDay, usersByDay, topListings,
  ] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Listing.countDocuments({ status: 'active' }),
    Listing.countDocuments({ status: 'sold' }),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$priceSnapshot' } } }]),
    Listing.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$priceSnapshot' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $group: { _id: '$listing', count: { $sum: 1 }, title: { $first: '$titleSnapshot' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
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
  const query = {};
  if (status) query.status = status;

  const reports = await Report.find(query)
    .populate({
      path: 'conversation',
      populate: [
        { path: 'listing', select: 'title' },
        { path: 'participants', select: 'name email role status' },
      ],
    })
    .populate('reporter', 'name email role')
    .populate('againstUser', 'name email role status')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: reports.length,
    reports,
  });
}

async function resolveReport(req, res) {
  const { action, note = '' } = req.body;
  if (!['dismiss', 'warn', 'suspend'].includes(action)) {
    throw new AppError('Invalid report action.', 400);
  }

  const report = await Report.findById(req.params.id).populate('againstUser');
  if (!report) {
    throw new AppError('Report not found.', 404);
  }

  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  report.adminNote = note;

  if (action === 'dismiss') {
    report.status = 'dismissed';
    report.actionTaken = 'dismissed';
  }

  if (action === 'warn') {
    report.status = 'reviewed';
    report.actionTaken = 'warned';
  }

  if (action === 'suspend') {
    report.status = 'reviewed';
    report.actionTaken = 'suspended';

    if (report.againstUser) {
      report.againstUser.status = 'suspended';
      report.againstUser.suspensionReason = note || 'Suspended by admin after message review.';
      await report.againstUser.save();
    }
  }

  await report.save();

  res.json({
    success: true,
    report,
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
