-- ============================================================
-- E-BookNest – Smart Digital Library Platform
-- MySQL Database Schema
-- ============================================================

DROP DATABASE IF EXISTS ebooknest;
CREATE DATABASE ebooknest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ebooknest;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  college_id VARCHAR(50) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- books
-- ------------------------------------------------------------
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id VARCHAR(30) NOT NULL UNIQUE,       -- human-friendly code, encoded in QR
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(30) UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  publisher VARCHAR(150),
  publication_year INT,
  language VARCHAR(50) DEFAULT 'English',
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  cover_image VARCHAR(255),
  ebook_file VARCHAR(255),
  qr_code VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_books_title (title),
  INDEX idx_books_author (author),
  INDEX idx_books_category (category),
  INDEX idx_books_isbn (isbn),
  FULLTEXT INDEX ft_books_search (title, author, description)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- borrowings
-- ------------------------------------------------------------
CREATE TABLE borrowings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  returned_at TIMESTAMP NULL,
  status ENUM('active', 'returned', 'overdue') NOT NULL DEFAULT 'active',
  fine_amount DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  fine_paid BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_borrowings_user (user_id),
  INDEX idx_borrowings_book (book_id),
  INDEX idx_borrowings_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- renewals
-- ------------------------------------------------------------
CREATE TABLE renewals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  borrowing_id INT NOT NULL,
  user_id INT NOT NULL,
  old_due_date DATE NOT NULL,
  new_due_date DATE NOT NULL,
  renewal_number INT NOT NULL DEFAULT 1,
  renewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (borrowing_id) REFERENCES borrowings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_renewals_borrowing (borrowing_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- wishlist
-- ------------------------------------------------------------
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_wishlist_user_book (user_id, book_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- reviews
-- ------------------------------------------------------------
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  status ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_review_user_book (user_id, book_id),
  INDEX idx_reviews_book (book_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- reading_history
-- ------------------------------------------------------------
CREATE TABLE reading_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  progress DECIMAL(5,2) NOT NULL DEFAULT 0.00,  -- percentage 0-100
  last_page INT NOT NULL DEFAULT 1,
  last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_history_user_book (user_id, book_id),
  INDEX idx_history_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('due_soon', 'overdue', 'renewal', 'new_book', 'wishlist_available', 'recommendation', 'general') NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB;
