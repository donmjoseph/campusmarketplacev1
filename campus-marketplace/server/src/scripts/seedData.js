const fs = require('fs');
const path = require('path');
const { format } = require('mysql2');
const { batch, splitSchema } = require('../config/database');
const { connectDatabase, closeDatabase, readSchema } = require('../config/mysql');
const userRepository = require('../repositories/userRepository');
const listingRepository = require('../repositories/listingRepository');
const cartRepository = require('../repositories/cartRepository');
const orderRepository = require('../repositories/orderRepository');
const conversationRepository = require('../repositories/conversationRepository');
const reportRepository = require('../repositories/reportRepository');
const { newId } = require('../repositories/helpers');
const { hashPassword } = require('../utils/password');
const generateOrderNumber = require('../utils/generateOrderNumber');

const DAY_MS = 1000 * 60 * 60 * 24;

function daysAgo(days, hour = 12) {
  const date = new Date(Date.now() - days * DAY_MS);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function withIds(docs) {
  return docs.map((doc) => ({ ...doc, _id: newId() }));
}

// `npm run seed -- --sql <file>` writes the schema and seed data to a SQL file
// instead of connecting, for importing through `sf db console` on Spacefast.
function sqlOutputPath() {
  const index = process.argv.indexOf('--sql');
  if (index === -1) return null;
  return path.resolve(process.argv[index + 1] || 'seed.sql');
}

function writeSqlFile(filePath, statements) {
  const lines = [
    ...splitSchema(readSchema()).map((statement) => `${statement};\n`),
    'START TRANSACTION;',
    ...statements.map(([sql, params = []]) => `${format(sql, params, false, 'Z').trim()};`),
    'COMMIT;',
    '',
  ];
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`Wrote seed SQL to ${filePath}`);
}

async function seed() {
  const sqlOutput = sqlOutputPath();
  if (!sqlOutput) {
    await connectDatabase();
  }

  const statements = [
    ['DELETE FROM reports'],
    ['DELETE FROM messages'],
    ['DELETE FROM conversations'],
    ['DELETE FROM cart_items'],
    ['DELETE FROM orders'],
    ['DELETE FROM listings'],
    ['DELETE FROM users'],
  ];

  // ── Users ────────────────────────────────────────────────────────────────
  const userDates = [
    daysAgo(42), daysAgo(37), daysAgo(31), daysAgo(26), daysAgo(21),
    daysAgo(9), daysAgo(9), daysAgo(14), daysAgo(14), daysAgo(11),
    daysAgo(7), daysAgo(7), daysAgo(5), daysAgo(5), daysAgo(5),
    daysAgo(3), daysAgo(3), daysAgo(2), daysAgo(1), daysAgo(1),
  ];
  const users = withIds([
    {
      name: 'Admin One',
      email: 'admin1@wsu.edu',
      password: 'admin123',
      role: 'admin',
      profile: { location: 'WSU IT Office' },
      createdAt: userDates[0],
      updatedAt: userDates[0],
    },
    {
      name: 'Admin Two',
      email: 'admin2@wsu.edu',
      password: 'admin123',
      role: 'admin',
      profile: { location: 'WSU IT Office' },
      createdAt: userDates[1],
      updatedAt: userDates[1],
    },
    {
      name: 'Admin Three',
      email: 'admin3@wsu.edu',
      password: 'admin123',
      role: 'admin',
      profile: { location: 'WSU IT Office' },
      createdAt: userDates[2],
      updatedAt: userDates[2],
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
      createdAt: userDates[3],
      updatedAt: userDates[3],
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
      createdAt: userDates[4],
      updatedAt: userDates[4],
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
      createdAt: userDates[5],
      updatedAt: userDates[5],
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
      createdAt: userDates[6],
      updatedAt: userDates[6],
    },
    {
      name: 'Taylor Seller',
      email: 'seller3@wsu.edu',
      password: 'password123',
      role: 'seller',
      profile: {
        phone: '(509) 555-0203',
        location: 'Pullman, WA',
        bio: 'Moving out of an apartment and selling extra furniture.',
      },
      createdAt: userDates[7],
      updatedAt: userDates[7],
    },
    {
      name: 'Morgan Seller',
      email: 'seller4@wsu.edu',
      password: 'password123',
      role: 'seller',
      profile: {
        phone: '(509) 555-0204',
        location: 'Pullman, WA',
        bio: 'Selling lab gear, books, and outdoor equipment.',
      },
      createdAt: userDates[8],
      updatedAt: userDates[8],
    },
    {
      name: 'Riley Seller',
      email: 'seller5@wsu.edu',
      password: 'password123',
      role: 'seller',
      profile: {
        phone: '(509) 555-0205',
        location: 'Pullman, WA',
        bio: 'Recent graduate clearing out dorm and sports gear.',
      },
      createdAt: userDates[9],
      updatedAt: userDates[9],
    },
    {
      name: 'Avery Buyer',
      email: 'buyer3@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0303', location: 'Pullman, WA', bio: 'Looking for used electronics and furniture.' },
      createdAt: userDates[10],
      updatedAt: userDates[10],
    },
    {
      name: 'Quinn Buyer',
      email: 'buyer4@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0304', location: 'Pullman, WA', bio: 'Freshman shopping for dorm essentials.' },
      createdAt: userDates[11],
      updatedAt: userDates[11],
    },
    {
      name: 'Jamie Buyer',
      email: 'buyer5@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0305', location: 'Pullman, WA', bio: 'Interested in textbooks and course supplies.' },
      createdAt: userDates[12],
      updatedAt: userDates[12],
    },
    {
      name: 'Drew Buyer',
      email: 'buyer6@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0306', location: 'Pullman, WA', bio: 'Commuter student watching for good deals.' },
      createdAt: userDates[13],
      updatedAt: userDates[13],
    },
    {
      name: 'Skyler Buyer',
      email: 'buyer7@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0307', location: 'Pullman, WA', bio: 'Needs apartment basics before winter.' },
      createdAt: userDates[14],
      updatedAt: userDates[14],
    },
    {
      name: 'Reese Buyer',
      email: 'buyer8@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0308', location: 'Pullman, WA', bio: 'Buying sports gear and WSU apparel.' },
      createdAt: userDates[15],
      updatedAt: userDates[15],
    },
    {
      name: 'Parker Buyer',
      email: 'buyer9@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0309', location: 'Pullman, WA', bio: 'Grad student replacing worn-out study gear.' },
      createdAt: userDates[16],
      updatedAt: userDates[16],
    },
    {
      name: 'Cameron Buyer',
      email: 'buyer10@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0310', location: 'Pullman, WA', bio: 'Browses marketplace listings between classes.' },
      createdAt: userDates[17],
      updatedAt: userDates[17],
    },
    {
      name: 'Devon Buyer',
      email: 'buyer11@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0311', location: 'Pullman, WA', bio: 'Looking for last-minute lab supplies.' },
      createdAt: userDates[18],
      updatedAt: userDates[18],
    },
    {
      name: 'Hayden Buyer',
      email: 'buyer12@wsu.edu',
      password: 'password123',
      role: 'buyer',
      profile: { phone: '(509) 555-0312', location: 'Pullman, WA', bio: 'New to Pullman and furnishing a room.' },
      createdAt: userDates[19],
      updatedAt: userDates[19],
    },
  ]);

  const passwordHashes = {};
  for (const password of new Set(users.map((user) => user.password))) {
    passwordHashes[password] = await hashPassword(password);
  }

  for (const user of users) {
    statements.push(userRepository.insertStatement({
      id: user._id,
      name: user.name,
      email: user.email,
      passwordHash: passwordHashes[user.password],
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  const [
    , , , seller1, seller2, buyer1, buyer2, seller3, seller4, seller5,
  ] = users;
  const buyerUsers = users.filter((user) => user.role === 'buyer');

  // ── Listings (20) ────────────────────────────────────────────────────────
  const listingDates = [
    daysAgo(29), daysAgo(27), daysAgo(24), daysAgo(20), daysAgo(18),
    daysAgo(15), daysAgo(12), daysAgo(8), daysAgo(5), daysAgo(1),
    daysAgo(28), daysAgo(25), daysAgo(22), daysAgo(17), daysAgo(13),
    daysAgo(10), daysAgo(6), daysAgo(4), daysAgo(2), daysAgo(1),
  ];
  const listings = withIds([
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
      createdAt: listingDates[0],
      updatedAt: listingDates[0],
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
      createdAt: listingDates[1],
      updatedAt: listingDates[1],
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
      createdAt: listingDates[2],
      updatedAt: listingDates[2],
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
      createdAt: listingDates[3],
      updatedAt: listingDates[3],
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
      createdAt: listingDates[4],
      updatedAt: listingDates[4],
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
      createdAt: listingDates[5],
      updatedAt: listingDates[5],
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
      createdAt: listingDates[6],
      updatedAt: listingDates[6],
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
      createdAt: listingDates[7],
      updatedAt: listingDates[7],
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
      createdAt: listingDates[8],
      updatedAt: listingDates[8],
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
      createdAt: listingDates[9],
      updatedAt: listingDates[9],
    },
    // Additional campus essentials
    {
      title: 'TI-84 Plus CE Graphing Calculator',
      description: 'Works perfectly and includes charging cable. Used for calculus and statistics courses.',
      category: 'Electronics',
      condition: 'Good',
      price: 75,
      courseTag: 'MATH 171',
      images: ['https://picsum.photos/seed/ti84calculator/800/600'],
      status: 'active',
      seller: seller3._id,
      createdAt: listingDates[10],
      updatedAt: listingDates[10],
    },
    {
      title: 'iPad Bluetooth Keyboard Case',
      description: 'Fits 10.2-inch iPad models. Keys and trackpad work well. Great for taking lecture notes.',
      category: 'Electronics',
      condition: 'Like New',
      price: 38,
      courseTag: '',
      images: ['https://picsum.photos/seed/ipadkeyboard/800/600'],
      status: 'active',
      seller: seller4._id,
      createdAt: listingDates[11],
      updatedAt: listingDates[11],
    },
    {
      title: 'Dorm Mini Fridge with Freezer Shelf',
      description: 'Compact fridge, clean inside, and cold enough for drinks and leftovers. Pickup only.',
      category: 'Furniture',
      condition: 'Good',
      price: 85,
      courseTag: '',
      images: ['https://picsum.photos/seed/minifridge/800/600'],
      status: 'active',
      seller: seller5._id,
      createdAt: listingDates[12],
      updatedAt: listingDates[12],
    },
    {
      title: 'Rolling Office Chair',
      description: 'Adjustable height chair with lumbar support. Some wear on the arm rests but rolls smoothly.',
      category: 'Furniture',
      condition: 'Fair',
      price: 35,
      courseTag: '',
      images: ['https://picsum.photos/seed/officechair/800/600'],
      status: 'active',
      seller: seller3._id,
      createdAt: listingDates[13],
      updatedAt: listingDates[13],
    },
    {
      title: 'Patagonia Rain Shell – Unisex Medium',
      description: 'Lightweight waterproof shell. Perfect for walking across campus in fall weather.',
      category: 'Clothing',
      condition: 'Good',
      price: 70,
      courseTag: '',
      images: ['https://picsum.photos/seed/rainshell/800/600'],
      status: 'active',
      seller: seller4._id,
      createdAt: listingDates[14],
      updatedAt: listingDates[14],
    },
    {
      title: 'WSU Basketball Jersey – Large',
      description: 'Crimson jersey in great shape. Worn to two games and washed cold.',
      category: 'Clothing',
      condition: 'Like New',
      price: 32,
      courseTag: '',
      images: ['https://picsum.photos/seed/wsujersey/800/600'],
      status: 'active',
      seller: seller5._id,
      createdAt: listingDates[15],
      updatedAt: listingDates[15],
    },
    {
      title: 'Yoga Mat and Foam Roller Set',
      description: 'Lightly used mat with carrying strap plus a firm foam roller for recovery.',
      category: 'Sports',
      condition: 'Good',
      price: 24,
      courseTag: '',
      images: ['https://picsum.photos/seed/yogaset/800/600'],
      status: 'active',
      seller: seller3._id,
      createdAt: listingDates[16],
      updatedAt: listingDates[16],
    },
    {
      title: 'Beginner Snowboard Package',
      description: 'Board, bindings, and soft travel bag. Good starter setup for weekend trips.',
      category: 'Sports',
      condition: 'Fair',
      price: 140,
      courseTag: '',
      images: ['https://picsum.photos/seed/snowboard/800/600'],
      status: 'active',
      seller: seller4._id,
      createdAt: listingDates[17],
      updatedAt: listingDates[17],
    },
    {
      title: 'Chemistry Lab Goggles and Coat',
      description: 'Meets intro chemistry lab requirements. Coat is size medium and goggles are clear.',
      category: 'Other',
      condition: 'Good',
      price: 20,
      courseTag: 'CHEM 105',
      images: ['https://picsum.photos/seed/labkit/800/600'],
      status: 'active',
      seller: seller5._id,
      createdAt: listingDates[18],
      updatedAt: listingDates[18],
    },
    {
      title: 'Single-Serve Coffee Maker',
      description: 'Small coffee maker for a dorm or apartment. Includes reusable filter cup.',
      category: 'Other',
      condition: 'Good',
      price: 26,
      courseTag: '',
      images: ['https://picsum.photos/seed/coffeemaker/800/600'],
      status: 'active',
      seller: seller3._id,
      createdAt: listingDates[19],
      updatedAt: listingDates[19],
    },
  ]);

  for (const listing of listings) {
    statements.push(listingRepository.insertStatement({ ...listing, id: listing._id, sellerId: listing.seller }));
  }

  // ── Orders (20, one per listing with mixed statuses) ──────────────────────
  const orderDates = [
    daysAgo(28), daysAgo(26), daysAgo(23), daysAgo(19), daysAgo(17),
    daysAgo(14), daysAgo(11), daysAgo(7), daysAgo(4), daysAgo(1),
    daysAgo(25), daysAgo(22), daysAgo(20), daysAgo(15), daysAgo(12),
    daysAgo(9), daysAgo(5), daysAgo(3), daysAgo(1), daysAgo(0, 8),
  ];
  const orderStatuses = [
    'fulfilled', 'confirmed', 'pending', 'fulfilled', 'cancelled',
    'confirmed', 'fulfilled', 'cancellation_requested', 'fulfilled', 'pending',
    'confirmed', 'fulfilled', 'cancelled', 'confirmed', 'fulfilled',
    'pending', 'fulfilled', 'cancellation_requested', 'confirmed', 'pending',
  ];
  const priceAdjustments = [0, -5, 3, -10, 2, 0, -7, 4, 8, -3, -6, 5, 0, -4, 10, -2, 1, -15, 6, -1];

  const usedOrderNumbers = new Set();
  const orderSeedData = listings.map((listing, index) => {
    let orderNumber = generateOrderNumber();
    while (usedOrderNumbers.has(orderNumber)) {
      orderNumber = generateOrderNumber();
    }
    usedOrderNumbers.add(orderNumber);

    const buyer = buyerUsers[index % buyerUsers.length];
    const createdAt = orderDates[index];
    const status = orderStatuses[index];
    const priceSnapshot = Math.max(5, listing.price + priceAdjustments[index]);
    const requestedAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
    const reviewedAt = new Date(createdAt.getTime() + 4 * 60 * 60 * 1000);
    const fulfilledAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    let updatedAt = createdAt;
    let cancellation = { requested: false, decision: 'pending' };

    if (status === 'fulfilled') {
      updatedAt = fulfilledAt;
    } else if (status === 'cancelled') {
      cancellation = {
        requested: true,
        reason: 'Buyer changed plans before pickup.',
        requestedAt,
        decision: 'approved',
        reviewedAt,
      };
      updatedAt = reviewedAt;
    } else if (status === 'cancellation_requested') {
      cancellation = {
        requested: true,
        reason: 'Buyer can no longer make the scheduled pickup time.',
        requestedAt,
        decision: 'pending',
      };
      updatedAt = requestedAt;
    }

    const order = {
      orderNumber,
      buyer: buyer._id,
      seller: listing.seller,
      listing: listing._id,
      titleSnapshot: listing.title,
      priceSnapshot,
      status,
      checkout: {
        method: index % 4 === 0 ? 'shipping' : 'pickup',
        contactName: buyer.name,
        contactPhone: buyer.profile?.phone || '(509) 555-0300',
        shippingAddress: index % 4 === 0 ? `${100 + index} College Ave, Pullman, WA` : '',
        notes: index % 3 === 0 ? 'Prefers afternoon pickup if available.' : 'Flexible timing.',
      },
      cancellation,
      createdAt,
      updatedAt,
    };

    if (status === 'fulfilled') {
      order.fulfilledAt = fulfilledAt;
    }

    return { order, createdAt, updatedAt };
  });

  const orders = orderSeedData.map(({ order }) => order);
  for (const order of orders) {
    statements.push(orderRepository.insertStatement({
      ...order,
      buyerId: order.buyer,
      sellerId: order.seller,
      listingId: order.listing,
    }));
  }

  orderSeedData.forEach(({ order, updatedAt }, index) => {
    if (['confirmed', 'fulfilled'].includes(order.status)) {
      statements.push(listingRepository.setStatusStatement(listings[index]._id, 'sold', updatedAt));
    }
  });

  // ── Buyer cart items ──────────────────────────────────────────────────────
  statements.push(
    cartRepository.addStatement(buyer1._id, listings[1]._id),
    cartRepository.addStatement(buyer1._id, listings[8]._id),
    cartRepository.addStatement(buyer2._id, listings[5]._id),
    cartRepository.addStatement(buyer2._id, listings[6]._id)
  );

  // ── Conversations (3, for reports) ────────────────────────────────────────
  const conversationDates = [daysAgo(19), daysAgo(13), daysAgo(3)];
  const conversations = withIds([
    {
      listing: listings[0]._id,
      participants: [buyer1._id, seller1._id],
      messages: [
        {
          sender: buyer1._id,
          body: 'Hi, is the CPTS 321 textbook still available?',
          createdAt: daysAgo(19, 10),
        },
        {
          sender: seller1._id,
          body: 'Yes it is! Can you Venmo me $50 outside the app?',
          createdAt: daysAgo(19, 11),
        },
        {
          sender: buyer1._id,
          body: 'That doesn\'t seem right, the listing says $45.',
          createdAt: daysAgo(19, 12),
        },
      ],
      unreadBy: [seller1._id],
      lastMessageAt: daysAgo(19, 12),
      createdAt: conversationDates[0],
      updatedAt: daysAgo(19, 12),
    },
    {
      listing: listings[3]._id,
      participants: [buyer1._id, seller2._id],
      messages: [
        {
          sender: buyer1._id,
          body: 'Received the headphones. The band is cracked on one side.',
          createdAt: daysAgo(13, 9),
        },
        {
          sender: seller2._id,
          body: 'They were fine when I shipped them.',
          createdAt: daysAgo(13, 10),
        },
        {
          sender: buyer1._id,
          body: 'The listing said "Good" condition. This is not good.',
          createdAt: daysAgo(13, 11),
        },
      ],
      unreadBy: [seller2._id],
      lastMessageAt: daysAgo(13, 11),
      createdAt: conversationDates[1],
      updatedAt: daysAgo(13, 11),
    },
    {
      listing: listings[7]._id,
      participants: [buyer2._id, seller2._id],
      messages: [
        {
          sender: buyer2._id,
          body: 'We agreed to meet at 5pm at the CUB. I waited 45 minutes.',
          createdAt: daysAgo(3, 17),
        },
        {
          sender: seller2._id,
          body: 'Sorry, something came up.',
          createdAt: daysAgo(3, 18),
        },
        {
          sender: buyer2._id,
          body: 'This is the second time. I\'m requesting a cancellation.',
          createdAt: daysAgo(3, 19),
        },
      ],
      unreadBy: [seller2._id],
      lastMessageAt: daysAgo(3, 19),
      createdAt: conversationDates[2],
      updatedAt: daysAgo(3, 19),
    },
  ]);
  for (const conversation of conversations) {
    const [userId1, userId2] = conversation.participants;
    statements.push(conversationRepository.insertStatement({
      id: conversation._id,
      listingId: conversation.listing,
      userId1,
      userId2,
      unreadFor: conversation.unreadBy,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }));

    for (const message of conversation.messages) {
      statements.push(conversationRepository.messageInsertStatement({
        conversationId: conversation._id,
        senderId: message.sender,
        body: message.body,
        createdAt: message.createdAt,
      }));
    }
  }

  // ── Reports (3) ───────────────────────────────────────────────────────────
  const reportDates = [daysAgo(18), daysAgo(12), daysAgo(2)];
  const reports = [
    {
      conversation: conversations[0]._id,
      reporter: buyer1._id,
      againstUser: seller1._id,
      reason: 'Seller asked me to send payment via Venmo outside the platform to avoid fees. This feels like a scam.',
      status: 'pending',
      actionTaken: 'none',
      createdAt: reportDates[0],
      updatedAt: reportDates[0],
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
      reviewedAt: daysAgo(11),
      createdAt: reportDates[1],
      updatedAt: daysAgo(11),
    },
    {
      conversation: conversations[2]._id,
      reporter: buyer2._id,
      againstUser: seller2._id,
      reason: 'Seller was a no-show for the second scheduled meetup without any prior notice.',
      status: 'pending',
      actionTaken: 'none',
      createdAt: reportDates[2],
      updatedAt: reportDates[2],
    },
  ];

  for (const report of reports) {
    statements.push(reportRepository.insertStatement({
      ...report,
      conversationId: report.conversation,
      reporterId: report.reporter,
      againstUserId: report.againstUser,
    }));
  }

  if (sqlOutput) {
    writeSqlFile(sqlOutput, statements);
  } else {
    await batch(statements);
  }

  console.log('\nSeed complete.\n');
  console.log('Admin accounts (password: admin123):');
  console.log('  admin1@wsu.edu');
  console.log('  admin2@wsu.edu');
  console.log('  admin3@wsu.edu');
  console.log('\nSeller accounts (password: password123):');
  for (let i = 1; i <= 5; i += 1) {
    console.log(`  seller${i}@wsu.edu`);
  }
  console.log('\nBuyer accounts (password: password123):');
  for (let i = 1; i <= 12; i += 1) {
    console.log(`  buyer${i}@wsu.edu`);
  }
  console.log(`\nListings: ${listings.length}, Orders: ${orders.length}, Conversations: ${conversations.length}, Reports: 3`);

  await closeDatabase();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await closeDatabase();
  process.exit(1);
});
