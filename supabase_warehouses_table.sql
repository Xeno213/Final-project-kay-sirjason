-- SQL to create the warehouses table in Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS public.warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Example inserts for warehouses
INSERT INTO public.warehouses (name, location) VALUES
('Main Warehouse', 'Location A'),
('Secondary Warehouse', 'Location B'),
('Overflow Warehouse', 'Location C');

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_warehouses_name ON public.warehouses(name);
