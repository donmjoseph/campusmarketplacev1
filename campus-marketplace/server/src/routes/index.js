const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const cartRoutes = require('./cartRoutes');
const listingRoutes = require('./listingRoutes');
const orderRoutes = require('./orderRoutes');
const messageRoutes = require('./messageRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Campus Marketplace API is running.' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cart', cartRoutes);
router.use('/listings', listingRoutes);
router.use('/orders', orderRoutes);
router.use('/messages', messageRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
