-- Tabla para supermercados
CREATE TABLE grocery_stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL, -- nombre_normalizado para IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para meses de compras
CREATE TABLE grocery_months (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_name VARCHAR(100) NOT NULL, -- ej: "junio_2024"
  display_name VARCHAR(100) NOT NULL, -- ej: "Junio 2024"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para productos de supermercado
CREATE TABLE grocery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID REFERENCES grocery_months(id) ON DELETE CASCADE,
  store_id UUID REFERENCES grocery_stores(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_grocery_stores_user_id ON grocery_stores(user_id);
CREATE INDEX idx_grocery_months_user_id ON grocery_months(user_id);
CREATE INDEX idx_grocery_items_user_id ON grocery_items(user_id);
CREATE INDEX idx_grocery_items_month_id ON grocery_items(month_id);
CREATE INDEX idx_grocery_items_store_id ON grocery_items(store_id);

-- RLS (Row Level Security)
ALTER TABLE grocery_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own grocery stores" ON grocery_stores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grocery stores" ON grocery_stores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grocery stores" ON grocery_stores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grocery stores" ON grocery_stores
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own grocery months" ON grocery_months
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grocery months" ON grocery_months
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grocery months" ON grocery_months
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grocery months" ON grocery_months
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own grocery items" ON grocery_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grocery items" ON grocery_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grocery items" ON grocery_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grocery items" ON grocery_items
  FOR DELETE USING (auth.uid() = user_id);


-- Agregar campo purchased a grocery_items
ALTER TABLE grocery_items ADD COLUMN purchased BOOLEAN DEFAULT FALSE;

-- Agregar campo notes para notas adicionales
ALTER TABLE grocery_items ADD COLUMN notes TEXT;

-- Agregar campo priority para prioridad de compra
ALTER TABLE grocery_items ADD COLUMN priority INTEGER DEFAULT 1;