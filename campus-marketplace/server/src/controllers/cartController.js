const User = require('../models/User');
const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');

async function getCart(req, res) {
  const user = await User.findById(req.user._id).populate({
    path: 'cartItems.listing',
    select: 'title price status seller images',
    populate: {
      path: 'seller',
      select: 'name email',
    },
  });

  const items = user.cartItems
    .filter((entry) => entry.listing)
    .map((entry) => ({
      listingId: entry.listing._id,
      title: entry.listing.title,
      price: entry.listing.price,
      status: entry.listing.status,
      seller: entry.listing.seller,
      image: entry.listing.images[0] || '',
      addedAt: entry.addedAt,
    }));

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  res.json({
    success: true,
    items,
    subtotal,
  });
}

async function addToCart(req, res) {
  const { listingId } = req.body;
  const user = await User.findById(req.user._id);
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  if (String(listing.seller) === String(req.user._id)) {
    throw new AppError('You cannot add your own listing to cart.', 400);
  }

  if (listing.status !== 'active') {
    throw new AppError('This listing is not currently available.', 400);
  }

  const alreadyInCart = user.cartItems.some((item) => String(item.listing) === String(listing._id));
  if (alreadyInCart) {
    throw new AppError('Item is already in your cart.', 409);
  }

  user.cartItems.push({ listing: listing._id });
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Item added to cart.',
  });
}

async function removeFromCart(req, res) {
  const { listingId } = req.params;
  const user = await User.findById(req.user._id);

  user.cartItems = user.cartItems.filter((item) => String(item.listing) !== String(listingId));
  await user.save();

  res.json({
    success: true,
    message: 'Item removed from cart.',
  });
}

async function clearCart(req, res) {
  const user = await User.findById(req.user._id);
  user.cartItems = [];
  await user.save();

  res.json({
    success: true,
    message: 'Cart cleared.',
  });
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};
