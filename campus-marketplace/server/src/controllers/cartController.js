const cartRepository = require('../repositories/cartRepository');
const listingRepository = require('../repositories/listingRepository');
const AppError = require('../utils/AppError');

async function getCart(req, res) {
  const entries = await cartRepository.findItems(req.user._id);

  const items = entries.map(({ listing, addedAt }) => ({
    listingId: listing._id,
    title: listing.title,
    price: listing.price,
    status: listing.status,
    seller: { _id: listing.seller._id, name: listing.seller.name, email: listing.seller.email },
    image: listing.images[0] || '',
    addedAt,
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
  const listing = await listingRepository.findById(listingId);

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  if (String(listing.seller._id) === String(req.user._id)) {
    throw new AppError('You cannot add your own listing to cart.', 400);
  }

  if (listing.status !== 'active') {
    throw new AppError('This listing is not currently available.', 400);
  }

  if (await cartRepository.hasItem(req.user._id, listing._id)) {
    throw new AppError('Item is already in your cart.', 409);
  }

  await cartRepository.add(req.user._id, listing._id);

  res.status(201).json({
    success: true,
    message: 'Item added to cart.',
  });
}

async function removeFromCart(req, res) {
  await cartRepository.remove(req.user._id, req.params.listingId);

  res.json({
    success: true,
    message: 'Item removed from cart.',
  });
}

async function clearCart(req, res) {
  await cartRepository.clear(req.user._id);

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
