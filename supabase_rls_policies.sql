-- Enable Row Level Security on stock and products tables
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow select for authenticated users on stock table
CREATE POLICY "Allow select for authenticated users on stock"
ON stock
FOR SELECT
USING (auth.role() IN ('authenticated'));

-- Allow select for authenticated users on products table
CREATE POLICY "Allow select for authenticated users on products"
ON products
FOR SELECT
USING (auth.role() IN ('authenticated'));

-- If you want to allow service role key full access, no policies needed for service role key usage
-- Make sure your backend uses the service role key for full access
