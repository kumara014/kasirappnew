-- Database: restaurant_api

CREATE DATABASE IF NOT EXISTS restaurant_api;
USE restaurant_api;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    color VARCHAR(20) DEFAULT '#ffecdb',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_no VARCHAR(10) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    status VARCHAR(20) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Mock Data for Products
INSERT INTO products (name, category, price, image, color) VALUES 
('Pepperoni Pizza', 'Pizza', 12.99, '🍕', '#ffecdb'),
('Cheese Pizza', 'Pizza', 10.99, '🍕', '#ffecdb'),
('Orange Juice', 'Drink', 3.50, '🍹', '#e6f4f1'),
('Cola', 'Drink', 2.00, '🥤', '#e6f4f1'),
('Chocolate Cake', 'Dessert', 5.50, '🍰', '#fbe7ec'),
('Ice Cream', 'Dessert', 4.50, '🍦', '#fbe7ec'),
('Fries', 'Snack', 3.50, '🍟', '#fff5d9'),
('Burger', 'Snack', 8.50, '🍔', '#fff5d9');
