const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');

async function getListings(req, res) {
  const {
    q,
    category,
    condition,
    minPrice,
    maxPrice,
    status,
    sort = 'newest',
    courseTag,
    sellerId,
    mine,
    limit,
  } = req.query;

  const resultLimit = Math.min(Number(limit) || 200, 200);

  const query = {};

  if (!req.user || req.user.role === 'buyer') {
    query.status = 'active';
  }

  if (status && req.user && (req.user.role === 'admin' || req.user.role === 'seller')) {
    query.status = status;
  }

  if (req.user && req.user.role === 'seller' && mine === 'true') {
    query.seller = req.user._id;
    if (!status) {
      delete query.status;
    }
  }

  if (sellerId) {
    query.seller = sellerId;
  }

  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (courseTag) query.courseTag = { $regex: courseTag, $options: 'i' };

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { courseTag: { $regex: q, $options: 'i' } },
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortBy = { createdAt: -1 };
  if (sort === 'price_asc') sortBy = { price: 1 };
  if (sort === 'price_desc') sortBy = { price: -1 };
  if (sort === 'oldest') sortBy = { createdAt: 1 };

  const listings = await Listing.find(query)
    .populate('seller', 'name email role')
    .sort(sortBy)
    .limit(resultLimit);

  res.json({
    success: true,
    count: listings.length,
    listings,
  });
}

async function getListingById(req, res) {
  const listing = await Listing.findById(req.params.id).populate('seller', 'name email role profile');

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  const canViewRestricted = req.user
    && (req.user.role === 'admin' || String(req.user._id) === String(listing.seller._id));

  if (listing.status !== 'active' && !canViewRestricted) {
    throw new AppError('Listing is not available.', 404);
  }

  listing.views += 1;
  await listing.save();

  res.json({
    success: true,
    listing,
  });
}

async function createListing(req, res) {
  const listing = await Listing.create({
    ...req.body,
    seller: req.user._id,
  });

  const populated = await Listing.findById(listing._id).populate('seller', 'name email');

  res.status(201).json({
    success: true,
    listing: populated,
  });
}

async function updateListing(req, res) {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  const isOwner = String(listing.seller) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('Not allowed to modify this listing.', 403);
  }

  const editableFields = ['title', 'description', 'category', 'condition', 'price', 'courseTag', 'images', 'status'];
  for (const field of editableFields) {
    if (field in req.body) {
      listing[field] = req.body[field];
    }
  }

  await listing.save();

  res.json({
    success: true,
    listing,
  });
}

async function deleteListing(req, res) {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  const isOwner = String(listing.seller) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Not allowed to delete this listing.', 403);
  }

  await listing.deleteOne();
  return res.json({ success: true, message: 'Listing deleted.' });
}

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
