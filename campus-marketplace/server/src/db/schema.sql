-- Applied on server start and before seeding. Statements must stay idempotent.
-- Timestamps are always written by the app in UTC.

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'buyer',
  status VARCHAR(10) NOT NULL DEFAULT 'active',
  suspension_reason VARCHAR(300) NOT NULL DEFAULT '',
  phone VARCHAR(30) NOT NULL DEFAULT '',
  location VARCHAR(120) NOT NULL DEFAULT '',
  bio VARCHAR(500) NOT NULL DEFAULT '',
  notify_order_updates TINYINT(1) NOT NULL DEFAULT 1,
  notify_messages TINYINT(1) NOT NULL DEFAULT 1,
  notify_promotions TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_status (status),
  KEY idx_users_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listings (
  id CHAR(36) NOT NULL,
  seller_id CHAR(36) NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(20) NOT NULL,
  item_condition VARCHAR(20) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  course_tag VARCHAR(40) NOT NULL DEFAULT '',
  images JSON NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'active',
  views INT NOT NULL DEFAULT 0,
  removed_reason VARCHAR(250) NOT NULL DEFAULT '',
  removed_by CHAR(36) NULL,
  removed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_listings_seller (seller_id),
  KEY idx_listings_status (status),
  KEY idx_listings_category (category),
  KEY idx_listings_price (price),
  KEY idx_listings_created (created_at),
  CONSTRAINT fk_listings_seller FOREIGN KEY (seller_id) REFERENCES users (id),
  CONSTRAINT fk_listings_removed_by FOREIGN KEY (removed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_items (
  user_id CHAR(36) NOT NULL,
  listing_id CHAR(36) NOT NULL,
  added_at DATETIME(3) NOT NULL,
  PRIMARY KEY (user_id, listing_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) NOT NULL,
  order_number VARCHAR(30) NOT NULL,
  buyer_id CHAR(36) NOT NULL,
  seller_id CHAR(36) NOT NULL,
  listing_id CHAR(36) NULL,
  title_snapshot VARCHAR(120) NOT NULL,
  price_snapshot DECIMAL(10, 2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  checkout_method VARCHAR(10) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(30) NOT NULL,
  shipping_address VARCHAR(250) NOT NULL DEFAULT '',
  notes VARCHAR(500) NOT NULL DEFAULT '',
  cancel_requested TINYINT(1) NOT NULL DEFAULT 0,
  cancel_reason VARCHAR(500) NOT NULL DEFAULT '',
  cancel_requested_at DATETIME(3) NULL,
  cancel_decision VARCHAR(10) NOT NULL DEFAULT 'pending',
  cancel_reviewed_at DATETIME(3) NULL,
  cancel_reviewed_by CHAR(36) NULL,
  fulfilled_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_number (order_number),
  KEY idx_orders_buyer (buyer_id),
  KEY idx_orders_seller (seller_id),
  KEY idx_orders_status (status),
  KEY idx_orders_created (created_at),
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users (id),
  CONSTRAINT fk_orders_seller FOREIGN KEY (seller_id) REFERENCES users (id),
  CONSTRAINT fk_orders_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_reviewed_by FOREIGN KEY (cancel_reviewed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user_a_id < user_b_id, so one listing + pair of users maps to one row.
CREATE TABLE IF NOT EXISTS conversations (
  id CHAR(36) NOT NULL,
  listing_id CHAR(36) NULL,
  user_a_id CHAR(36) NOT NULL,
  user_b_id CHAR(36) NOT NULL,
  unread_a TINYINT(1) NOT NULL DEFAULT 0,
  unread_b TINYINT(1) NOT NULL DEFAULT 0,
  last_message_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conversations_pair (listing_id, user_a_id, user_b_id),
  KEY idx_conversations_user_a (user_a_id),
  KEY idx_conversations_user_b (user_b_id),
  KEY idx_conversations_last_message (last_message_at),
  CONSTRAINT fk_conversations_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE SET NULL,
  CONSTRAINT fk_conversations_user_a FOREIGN KEY (user_a_id) REFERENCES users (id),
  CONSTRAINT fk_conversations_user_b FOREIGN KEY (user_b_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id CHAR(36) NOT NULL,
  conversation_id CHAR(36) NOT NULL,
  sender_id CHAR(36) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_messages_conversation (conversation_id, created_at),
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) NOT NULL,
  conversation_id CHAR(36) NOT NULL,
  reporter_id CHAR(36) NOT NULL,
  against_user_id CHAR(36) NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'pending',
  action_taken VARCHAR(10) NOT NULL DEFAULT 'none',
  admin_note VARCHAR(300) NOT NULL DEFAULT '',
  reviewed_by CHAR(36) NULL,
  reviewed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_reports_conversation (conversation_id),
  KEY idx_reports_status (status),
  CONSTRAINT fk_reports_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users (id),
  CONSTRAINT fk_reports_against FOREIGN KEY (against_user_id) REFERENCES users (id),
  CONSTRAINT fk_reports_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
