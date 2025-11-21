-- Create tables schema (migration)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name_vi` VARCHAR(255) NOT NULL,
  `name_en` VARCHAR(255) NOT NULL,
  `price_per_kg` INT NOT NULL,
  `img_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `total_amount` INT NOT NULL,
  `status` VARCHAR(50),
  `checkout_at` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_item` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity_gram` INT NOT NULL,
  `price_per_kg_at_purchase` INT NOT NULL,
  `subtotal` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed products
SET NAMES utf8mb4;
INSERT INTO `products` (`name_en`, `name_vi`, `price_per_kg`, `img_url`, `created_at`, `updated_at`) VALUES
('Apple', 'Táo', 100000, 'apple.png', NOW(), NOW()),
('Bell Pepper', 'Ớt chuông', 50000, 'bell_pepper.png', NOW(), NOW()),
('Carrot', 'Cà rốt', 20000, 'carrot.png', NOW(), NOW()),
('Cucumber', 'Dưa leo', 25000, 'cucumber.png', NOW(), NOW()),
('Custard Apple', 'Na', 60000, 'custard_apple.png', NOW(), NOW()),
('Green Guava', 'Ổi xanh', 30000, 'green_guava.png', NOW(), NOW()),
('Mango', 'Xoài', 50000, 'mango.png', NOW(), NOW()),
('Pear', 'Lê', 80000, 'pear.png', NOW(), NOW()),
('Tomato', 'Cà chua', 30000, 'tomato.png', NOW(), NOW()),
('Wax Apple', 'Roi', 35000, 'wax_apple.png', NOW(), NOW());
