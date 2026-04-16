const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
require('../config/env');

const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Conversation = require('../models/Conversation');
const Report = require('../models/Report');
const generateOrderNumber = require('../utils/generateOrderNumber');

async function seed() {
  await connectDatabase();

  await Promise.all([
    Report.deleteMany({}),
    Conversation.deleteMany({}),
    Order.deleteMany({}),
    Listing.deleteMany({}),
    User.deleteMany({}),
  ]);

  const users = await User.create([
    {
      name: 'Avery Buyer',
      email: 'buyer@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: {
        phone: '(509) 555-0111',
        location: 'Pullman, WA',
        bio: 'Computer Science student buying and selling course gear.',
      },
    },
    {
      name: 'Alex Seller',
      email: 'alex@wsu.edu',
      password: 'password123',
      role: 'seller',
      profile: {
        phone: '(509) 555-0112',
        location: 'Pullman, WA',
        bio: 'Senior seller focused on electronics and textbooks.',
      },
    },
    {
      name: 'Morgan Seller',
      email: 'morgan@wsu.edu',
      password: 'password123',
      role: 'seller',
      profile: {
        phone: '(509) 555-0113',
        location: 'Pullman, WA',
        bio: 'Furniture and housing sublets around campus.',
      },
    },
    {
      name: 'Admin User',
      email: 'admin@wsu.edu',
      password: 'admin123',
      role: 'admin',
      profile: {
        location: 'WSU IT Office',
      },
    },
  ]);

  const buyer = users.find((user) => user.role === 'buyer');
  const alex = users.find((user) => user.email === 'alex@wsu.edu');
  const morgan = users.find((user) => user.email === 'morgan@wsu.edu');

  const listings = await Listing.create([
    {
      title: 'CPTS 355 Textbook - Like New',
      description: 'Used one semester, no highlights. Great condition for systems programming.',
      category: 'Textbooks',
      condition: 'Like New',
      price: 65,
      courseTag: 'CPTS 355',
      images: ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80'],
      status: 'active',
      seller: alex._id,
    },
    {
      title: 'TI-84 Plus Graphing Calculator',
      description: 'Fully working calculator with cover and batteries included.',
      category: 'Electronics',
      condition: 'Good',
      price: 52,
      courseTag: 'MATH 171',
      images: ['https://images.unsplash.com/photo-1565373679107-9083f20d2a0f?w=800&q=80'],
      status: 'active',
      seller: alex._id,
    },
    {
      title: 'Mini Fridge for Dorm',
      description: 'Compact fridge in good condition. Great for dorm rooms.',
      category: 'Furniture',
      condition: 'Good',
      price: 80,
      courseTag: '',
      images: ['https://images.unsplash.com/photo-1599658880436-c61792e70672?w=800&q=80'],
      status: 'active',
      seller: morgan._id,
    },
    {
      title: 'Spring Football Ticket Bundle',
      description: 'Two student section tickets for the spring games.',
      category: 'Tickets',
      condition: 'New',
      price: 25,
      courseTag: '',
      images: ['https://images.unsplash.com/photo-1543357480-c60d40007a3f?w=800&q=80'],
      status: 'active',
      seller: morgan._id,
    },
    {
      title: 'Apartment Sublease - Summer',
      description: '1 bed in a 3 bed apartment, 10 mins from campus, furnished.',
      category: 'Housing',
      condition: 'Good',
      price: 500,
      courseTag: '',
      images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'],
      status: 'draft',
      seller: morgan._id,
    },
  ]);

  buyer.cartItems = [
    { listing: listings[0]._id },
    { listing: listings[2]._id },
  ];
  await buyer.save();

  const seededOrders = await Order.create([
    {
      orderNumber: generateOrderNumber(),
      buyer: buyer._id,
      seller: alex._id,
      listing: listings[1]._id,
      titleSnapshot: listings[1].title,
      priceSnapshot: listings[1].price,
      status: 'pending',
      checkout: {
        method: 'pickup',
        contactName: 'Avery Buyer',
        contactPhone: '(509) 555-0111',
        shippingAddress: '',
        notes: 'Can pick up near Chinook.',
      },
      cancellation: {
        requested: false,
        reason: '',
        decision: 'pending',
      },
    },
    {
      orderNumber: generateOrderNumber(),
      buyer: buyer._id,
      seller: morgan._id,
      listing: listings[3]._id,
      titleSnapshot: listings[3].title,
      priceSnapshot: listings[3].price,
      status: 'cancellation_requested',
      checkout: {
        method: 'pickup',
        contactName: 'Avery Buyer',
        contactPhone: '(509) 555-0111',
        shippingAddress: '',
        notes: '',
      },
      cancellation: {
        requested: true,
        reason: 'Schedule conflict, cannot attend game anymore.',
        requestedAt: new Date(),
        decision: 'pending',
      },
    },
  ]);

  listings[1].status = 'sold';
  listings[3].status = 'sold';
  await listings[1].save();
  await listings[3].save();

  const conversation = await Conversation.create({
    listing: listings[0]._id,
    participants: [buyer._id, alex._id],
    messages: [
      {
        sender: buyer._id,
        body: 'Hi Alex, is the textbook still available this week?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
      {
        sender: alex._id,
        body: 'Yes, still available. I can meet at the CUB tomorrow.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
      {
        sender: buyer._id,
        body: 'Perfect, thanks! I may also be interested in your calculator.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
    ],
    unreadBy: [alex._id],
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  });

  await Report.create({
    conversation: conversation._id,
    reporter: buyer._id,
    againstUser: alex._id,
    reason: 'Testing admin report moderation flow for project demo.',
    status: 'pending',
    actionTaken: 'none',
  });

  console.log('Seed complete. Demo users created:');
  console.log('Buyer: buyer@wsu.edu / password123');
  console.log('Seller: alex@wsu.edu / password123');
  console.log('Admin: admin@wsu.edu / admin123');
  console.log(`Listings: ${listings.length}, Orders: ${seededOrders.length}`);

  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.connection.close();
  process.exit(1);
});
