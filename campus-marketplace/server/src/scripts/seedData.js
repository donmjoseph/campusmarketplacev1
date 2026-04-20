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

  // ── Users ────────────────────────────────────────────────────────────────
  const users = await User.create([
    {
      name: 'Admin One',
      email: 'admin1@wsu.edu',
      password: 'admin123',
      role: 'admin',
      profile: { location: 'WSU IT Office' },
    },
    {
      name: 'Admin Two',
      email: 'admin2@wsu.edu',
      password: 'admin123',
      role: 'admin',
      profile: { location: 'WSU IT Office' },
    },
    {
      name: 'Admin Three',
      email: 'admin3@wsu.edu',
      password: 'admin123',
      role: 'admin',
      profile: { location: 'WSU IT Office' },
    },
    {
      name: 'Sam Seller',
      email: 'seller1@wsu.edu',
      password: 'password123',
      role: 'seller',
      profile: {
        phone: '(509) 555-0201',
        location: 'Pullman, WA',
        bio: 'Senior selling textbooks and electronics after graduation.',
      },
    },
    {
      name: 'Jordan Seller',
      email: 'seller2@wsu.edu',
      password: 'password123',
      role: 'seller',
      profile: {
        phone: '(509) 555-0202',
        location: 'Pullman, WA',
        bio: 'Clearing out dorm gear, tickets, and winter clothing.',
      },
    },
    {
      name: 'Blake Buyer',
      email: 'buyer1@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: {
        phone: '(509) 555-0301',
        location: 'Pullman, WA',
        bio: 'Sophomore looking for affordable course materials.',
      },
    },
    {
      name: 'Casey Buyer',
      email: 'buyer2@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: {
        phone: '(509) 555-0302',
        location: 'Pullman, WA',
        bio: 'Transfer student setting up my first apartment near campus.',
      },
    },
  ]);

  const [, , , seller1, seller2, buyer1, buyer2] = users;

  // ── Listings (10) ────────────────────────────────────────────────────────
  const listings = await Listing.create([
    // Books
    {
      title: 'CPTS 321 Software Engineering Textbook',
      description: 'Sommerville Software Engineering 10th edition. Used one semester, no highlights or writing inside. Spine is intact.',
      category: 'Books',
      condition: 'Good',
      price: 45,
      courseTag: 'CPTS 321',
      images: ['https://picsum.photos/seed/cpts321book/800/600'],
      status: 'active',
      seller: seller1._id,
    },
    {
      title: 'Organic Chemistry 5th Edition – Brown & Foote',
      description: 'Light pencil marks in first two chapters, otherwise clean. Comes with the original solutions manual.',
      category: 'Books',
      condition: 'Like New',
      price: 60,
      courseTag: 'CHEM 345',
      images: ['https://picsum.photos/seed/orgchem5/800/600'],
      status: 'active',
      seller: seller2._id,
    },
    // Electronics
    {
      title: 'HP 65W USB-C Laptop Charger',
      description: 'Compatible with most HP laptops. Tested and working. Original cable included, no adapter.',
      category: 'Electronics',
      condition: 'Good',
      price: 22,
      courseTag: '',
      images: ['https://picsum.photos/seed/hpcharger/800/600'],
      status: 'active',
      seller: seller1._id,
    },
    {
      title: 'Sony WH-1000XM4 Wireless Headphones',
      description: 'Excellent noise cancellation. Used daily for one year. Carrying case and both cables included. Battery life still strong.',
      category: 'Electronics',
      condition: 'Good',
      price: 120,
      courseTag: '',
      images: ['https://picsum.photos/seed/sonyheadphones/800/600'],
      status: 'active',
      seller: seller2._id,
    },
    // Furniture
    {
      title: 'Adjustable LED Desk Lamp',
      description: 'Three brightness settings, USB charging port on base. Perfect for a dorm desk. Minor scratch on the arm.',
      category: 'Furniture',
      condition: 'Good',
      price: 18,
      courseTag: '',
      images: ['https://picsum.photos/seed/desklamp/800/600'],
      status: 'active',
      seller: seller1._id,
    },
    {
      title: 'Microfiber Area Rug 5×7 ft – Grey',
      description: 'Soft, low-pile rug in grey. Cleaned before listing. No stains. Rolling up for easy transport.',
      category: 'Furniture',
      condition: 'Fair',
      price: 15,
      courseTag: '',
      images: ['https://picsum.photos/seed/greyrug/800/600'],
      status: 'active',
      seller: seller2._id,
    },
    // Clothing
    {
      title: 'North Face Thermoball Winter Jacket – Women\'s M',
      description: 'Warm puffer jacket in navy. Worn two winters. All zippers function. No tears or stains.',
      category: 'Clothing',
      condition: 'Good',
      price: 55,
      courseTag: '',
      images: ['https://picsum.photos/seed/northfacejacket/800/600'],
      status: 'active',
      seller: seller1._id,
    },
    {
      title: 'WSU Crimson Hoodie – Men\'s Large',
      description: 'Official WSU pullover hoodie. Worn a handful of times. No fading or pilling. Great for game day.',
      category: 'Clothing',
      condition: 'Like New',
      price: 28,
      courseTag: '',
      images: ['https://picsum.photos/seed/wsuhoodie/800/600'],
      status: 'active',
      seller: seller2._id,
    },
    // Sports
    {
      title: 'Adidas Ultraboost Running Shoes – Men\'s Size 10',
      description: 'Worn about 15 miles total. No visible sole wear. Original box included. Black and white colorway.',
      category: 'Sports',
      condition: 'Like New',
      price: 65,
      courseTag: '',
      images: ['https://picsum.photos/seed/adidasshoes/800/600'],
      status: 'active',
      seller: seller1._id,
    },
    {
      title: 'Intramural Soccer Cleats – Size 9',
      description: 'Nike Tiempo cleats worn one season. Studs in good shape. Washed and ready to go.',
      category: 'Sports',
      condition: 'Good',
      price: 30,
      courseTag: '',
      images: ['https://picsum.photos/seed/soccercleats/800/600'],
      status: 'active',
      seller: seller2._id,
    },
  ]);

  // ── Orders (5, mixed statuses) ────────────────────────────────────────────
  const now = new Date();

  const orders = await Order.create([
    {
      orderNumber: generateOrderNumber(),
      buyer: buyer1._id,
      seller: seller1._id,
      listing: listings[2]._id,
      titleSnapshot: listings[2].title,
      priceSnapshot: listings[2].price,
      status: 'pending',
      checkout: {
        method: 'pickup',
        contactName: 'Blake Buyer',
        contactPhone: '(509) 555-0301',
        notes: 'Can meet near the CUB any weekday after 2pm.',
      },
      cancellation: { requested: false, decision: 'pending' },
    },
    {
      orderNumber: generateOrderNumber(),
      buyer: buyer1._id,
      seller: seller2._id,
      listing: listings[3]._id,
      titleSnapshot: listings[3].title,
      priceSnapshot: listings[3].price,
      status: 'fulfilled',
      fulfilledAt: new Date(now - 1000 * 60 * 60 * 48),
      checkout: {
        method: 'pickup',
        contactName: 'Blake Buyer',
        contactPhone: '(509) 555-0301',
        notes: 'Met at the library entrance.',
      },
      cancellation: { requested: false, decision: 'pending' },
    },
    {
      orderNumber: generateOrderNumber(),
      buyer: buyer2._id,
      seller: seller1._id,
      listing: listings[0]._id,
      titleSnapshot: listings[0].title,
      priceSnapshot: listings[0].price,
      status: 'cancelled',
      checkout: {
        method: 'pickup',
        contactName: 'Casey Buyer',
        contactPhone: '(509) 555-0302',
        notes: '',
      },
      cancellation: {
        requested: true,
        reason: 'Found the same book at the library for free.',
        requestedAt: new Date(now - 1000 * 60 * 60 * 72),
        decision: 'approved',
        reviewedAt: new Date(now - 1000 * 60 * 60 * 70),
      },
    },
    {
      orderNumber: generateOrderNumber(),
      buyer: buyer2._id,
      seller: seller2._id,
      listing: listings[7]._id,
      titleSnapshot: listings[7].title,
      priceSnapshot: listings[7].price,
      status: 'cancellation_requested',
      checkout: {
        method: 'pickup',
        contactName: 'Casey Buyer',
        contactPhone: '(509) 555-0302',
        notes: 'Will pick up tickets at the stadium gate.',
      },
      cancellation: {
        requested: true,
        reason: 'Schedule conflict — can no longer attend the game.',
        requestedAt: new Date(now - 1000 * 60 * 60 * 5),
        decision: 'pending',
      },
    },
    {
      orderNumber: generateOrderNumber(),
      buyer: buyer1._id,
      seller: seller1._id,
      listing: listings[4]._id,
      titleSnapshot: listings[4].title,
      priceSnapshot: listings[4].price,
      status: 'pending',
      checkout: {
        method: 'pickup',
        contactName: 'Blake Buyer',
        contactPhone: '(509) 555-0301',
        notes: 'Flexible on timing, text me to arrange.',
      },
      cancellation: { requested: false, decision: 'pending' },
    },
  ]);

  // Mark fulfilled listing as sold
  listings[3].status = 'sold';
  await listings[3].save();

  // ── Buyer cart items ──────────────────────────────────────────────────────
  buyer1.cartItems = [
    { listing: listings[1]._id },
    { listing: listings[8]._id },
  ];
  await buyer1.save();

  buyer2.cartItems = [
    { listing: listings[5]._id },
    { listing: listings[6]._id },
  ];
  await buyer2.save();

  // ── Conversations (3, for reports) ────────────────────────────────────────
  const conversations = await Conversation.create([
    {
      listing: listings[0]._id,
      participants: [buyer1._id, seller1._id],
      messages: [
        {
          sender: buyer1._id,
          body: 'Hi, is the CPTS 321 textbook still available?',
          createdAt: new Date(now - 1000 * 60 * 60 * 10),
        },
        {
          sender: seller1._id,
          body: 'Yes it is! Can you Venmo me $50 outside the app?',
          createdAt: new Date(now - 1000 * 60 * 60 * 9),
        },
        {
          sender: buyer1._id,
          body: 'That doesn\'t seem right, the listing says $45.',
          createdAt: new Date(now - 1000 * 60 * 60 * 8),
        },
      ],
      unreadBy: [seller1._id],
      lastMessageAt: new Date(now - 1000 * 60 * 60 * 8),
    },
    {
      listing: listings[3]._id,
      participants: [buyer1._id, seller2._id],
      messages: [
        {
          sender: buyer1._id,
          body: 'Received the headphones. The band is cracked on one side.',
          createdAt: new Date(now - 1000 * 60 * 60 * 50),
        },
        {
          sender: seller2._id,
          body: 'They were fine when I shipped them.',
          createdAt: new Date(now - 1000 * 60 * 60 * 49),
        },
        {
          sender: buyer1._id,
          body: 'The listing said "Good" condition. This is not good.',
          createdAt: new Date(now - 1000 * 60 * 60 * 48),
        },
      ],
      unreadBy: [seller2._id],
      lastMessageAt: new Date(now - 1000 * 60 * 60 * 48),
    },
    {
      listing: listings[7]._id,
      participants: [buyer2._id, seller2._id],
      messages: [
        {
          sender: buyer2._id,
          body: 'We agreed to meet at 5pm at the CUB. I waited 45 minutes.',
          createdAt: new Date(now - 1000 * 60 * 60 * 6),
        },
        {
          sender: seller2._id,
          body: 'Sorry, something came up.',
          createdAt: new Date(now - 1000 * 60 * 60 * 5.5),
        },
        {
          sender: buyer2._id,
          body: 'This is the second time. I\'m requesting a cancellation.',
          createdAt: new Date(now - 1000 * 60 * 60 * 5),
        },
      ],
      unreadBy: [seller2._id],
      lastMessageAt: new Date(now - 1000 * 60 * 60 * 5),
    },
  ]);

  // ── Reports (3) ───────────────────────────────────────────────────────────
  await Report.create([
    {
      conversation: conversations[0]._id,
      reporter: buyer1._id,
      againstUser: seller1._id,
      reason: 'Seller asked me to send payment via Venmo outside the platform to avoid fees. This feels like a scam.',
      status: 'pending',
      actionTaken: 'none',
    },
    {
      conversation: conversations[1]._id,
      reporter: buyer1._id,
      againstUser: seller2._id,
      reason: 'Item condition was misrepresented. Headphones arrived with a cracked band; listing said Good condition.',
      status: 'reviewed',
      actionTaken: 'warned',
      adminNote: 'Seller warned. Buyer offered partial refund.',
      reviewedBy: users[0]._id,
      reviewedAt: new Date(now - 1000 * 60 * 60 * 24),
    },
    {
      conversation: conversations[2]._id,
      reporter: buyer2._id,
      againstUser: seller2._id,
      reason: 'Seller was a no-show for the second scheduled meetup without any prior notice.',
      status: 'pending',
      actionTaken: 'none',
    },
  ]);

  console.log('\nSeed complete.\n');
  console.log('Admin accounts (password: admin123):');
  console.log('  admin1@wsu.edu');
  console.log('  admin2@wsu.edu');
  console.log('  admin3@wsu.edu');
  console.log('\nSeller accounts (password: password123):');
  console.log('  seller1@wsu.edu');
  console.log('  seller2@wsu.edu');
  console.log('\nBuyer accounts (password: password123):');
  console.log('  buyer1@wsu.edu');
  console.log('  buyer2@wsu.edu');
  console.log(`\nListings: ${listings.length}, Orders: ${orders.length}, Conversations: ${conversations.length}, Reports: 3`);

  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.connection.close();
  process.exit(1);
});
