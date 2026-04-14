-- =============================
-- ENUM TYPES
-- =============================
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');

CREATE TYPE tag_type AS ENUM (
  'room', 'style', 'material', 'height', 'length', 'width', 'general', 'color'
);

ALTER TYPE order_status RENAME TO order_status_enum;
ALTER TYPE tag_type RENAME TO tag_type_enum;

-- =============================
-- TABLES
-- =============================

CREATE TABLE organization (
    org_id SERIAL PRIMARY KEY,
    org_name VARCHAR(100) NOT NULL UNIQUE,
    org_contact VARCHAR(12),
    org_email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    role_id SMALLINT PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id SMALLINT DEFAULT 2,
    org_id INT NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (org_id, email),

    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (org_id) REFERENCES organization(org_id)
);

CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL,
    user_id INT NOT NULL,

    label VARCHAR(50),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,

    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (org_id) REFERENCES organization(org_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    description TEXT,

    UNIQUE (org_id, category_name),
    FOREIGN KEY (org_id) REFERENCES organization(org_id)
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL,
    category_id INT NOT NULL,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),

    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),

    material VARCHAR(100),
    color VARCHAR(50),

    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),

    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (org_id) REFERENCES organization(org_id)
);

CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    org_id INT NOT NULL,
    product_id INT NOT NULL,

    quantity INT CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, org_id, product_id),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (org_id) REFERENCES organization(org_id)
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    org_id INT NOT NULL,

    order_status order_status_enum DEFAULT 'pending',

    total_amount DECIMAL(10,2) NOT NULL,
    payment_id VARCHAR(100),
    shipping_address_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (org_id) REFERENCES organization(org_id),
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id)
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,

    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,

    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE wishlists (
    wishlist_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL,
    user_id INT NOT NULL,
    product_id INT NOT NULL,

    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, product_id),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (org_id) REFERENCES organization(org_id)
);

CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    tag_type tag_type_enum,

    UNIQUE (org_id, tag_name),

    FOREIGN KEY (org_id) REFERENCES organization(org_id)
);

CREATE TABLE product_tags (
    product_id INT NOT NULL,
    tag_id INT NOT NULL,

    PRIMARY KEY (product_id, tag_id),

    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,

    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

INSERT INTO roles VALUES(1, 'Admin'),(2, 'User');

INSERT INTO organization(org_name, org_contact, org_email) VALUES('Furn', '7272727272', 'Furn@mail.com');

select * from organization;