-- SQL to create the stock_transfers table in Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS public.stock_transfers (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    source_warehouse_id INTEGER NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    destination_warehouse_id INTEGER NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'In Transit', 'Received')),
    transfer_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_transfers_product_id ON public.stock_transfers(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_source_warehouse_id ON public.stock_transfers(source_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_destination_warehouse_id ON public.stock_transfers(destination_warehouse_id);
