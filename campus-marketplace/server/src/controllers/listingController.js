const listingRepository = require('../repositories/listingRepository');
const AppError = require('../utils/AppError');

function toNumberOrUndefined(value) {
  if (value === undefined || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

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

  const filters = {
    category,
    condition,
    courseTag,
    q,
    minPrice: toNumberOrUndefined(minPrice),
    maxPrice: toNumberOrUndefined(maxPrice),
    sort,
    limit: Math.min(Number(limit) || 200, 200),
  };

  if (!req.user || req.user.role === 'buyer') {
    filters.status = 'active';
  }

  if (status && req.user && (req.user.role === 'admin' || req.user.role === 'seller')) {
    filters.status = status;
  }

  if (req.user && req.user.role === 'seller' && mine === 'true') {
    filters.sellerId = req.user._id;
    if (!status) {
      delete filters.status;
    }
  }

  if (sellerId) {
    filters.sellerId = sellerId;
  }

  const listings = await listingRepository.findMany(filters);

  res.json({
    success: true,
    count: listings.length,
    listings,
  });
}

async function getListingById(req, res) {
  const listing = await listingRepository.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  const canViewRestricted = req.user
    && (req.user.role === 'admin' || String(req.user._id) === String(listing.seller._id));

  if (listing.status !== 'active' && !canViewRestricted) {
    throw new AppError('Listing is not available.', 404);
  }

  await listingRepository.incrementViews(listing._id);
  listing.views += 1;

  res.json({
    success: true,
    listing,
  });
}

async function createListing(req, res) {
  const { title, description, category, condition, price, courseTag, images, status } = req.body;

  const listing = await listingRepository.create({
    sellerId: req.user._id,
    title,
    description,
    category,
    condition,
    price: Number(price),
    courseTag: courseTag ? String(courseTag).trim() : '',
    images: Array.isArray(images) ? images : [],
    status: status || 'active',
  });

  res.status(201).json({
    success: true,
    listing,
  });
}

async function updateListing(req, res) {
  const listing = await listingRepository.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  const isOwner = String(listing.seller._id) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('Not allowed to modify this listing.', 403);
  }

  const updated = await listingRepository.update(listing._id, req.body);

  res.json({
    success: true,
    listing: updated,
  });
}

async function deleteListing(req, res) {
  const listing = await listingRepository.findById(req.params.id);

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  const isOwner = String(listing.seller._id) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Not allowed to delete this listing.', 403);
  }

  await listingRepository.remove(listing._id);
  return res.json({ success: true, message: 'Listing deleted.' });
}

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
