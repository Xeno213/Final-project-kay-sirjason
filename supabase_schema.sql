-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('Admin', 'Warehouse Manager', 'Staff')),
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE products (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category text,
  supplier text,
  cost_price numeric NOT NULL,
  selling_price numeric NOT NULL,
  low_stock_threshold integer,
  created_at timestamptz DEFAULT now()
);

-- Create warehouses table
CREATE TABLE warehouses (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  location text,
  capacity integer,
  created_at timestamptz DEFAULT now()
);

-- Create stock table
CREATE TABLE stock (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id bigint NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create stock_movements table
CREATE TABLE stock_movements (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source_warehouse_id bigint REFERENCES warehouses(id),
  destination_warehouse_id bigint REFERENCES warehouses(id),
  quantity integer NOT NULL,
  status text CHECK (status IN ('Pending', 'In Transit', 'Received')),
  created_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE suppliers (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  contact_info text,
  created_at timestamptz DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE purchase_orders (
  id bigserial PRIMARY KEY,
  supplier_id bigint NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  status text CHECK (status IN ('Pending', 'Received')),
  created_at timestamptz DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE purchase_order_items (
  id bigserial PRIMARY KEY,
  purchase_order_id bigint NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  timestamp timestamptz DEFAULT now()
);
