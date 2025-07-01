-- Esquema de base de datos para el sistema de presupuestos
-- Ejecuta estos comandos en el SQL Editor de tu panel de Supabase

-- 1. Tabla de presupuestos
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  gross_income DECIMAL(10,2) DEFAULT 0,
  tithe_percentage DECIMAL(5,2) DEFAULT 10.00,
  tithe_enabled BOOLEAN DEFAULT false,
  savings_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- 2. Tabla de categorías de gastos
CREATE TABLE expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7), -- Para códigos de color hex
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de ítems de presupuesto (ingresos y gastos)
CREATE TABLE budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  description VARCHAR(255) NOT NULL,
  estimated_amount DECIMAL(10,2) NOT NULL,
  actual_amount DECIMAL(10,2),
  due_date DATE,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insertar categorías por defecto
INSERT INTO expense_categories (name, icon, color, is_default) VALUES
('Alquiler', '🏠', '#3B82F6', true),
('Compras', '🛒', '#10B981', true),
('Transporte', '🚗', '#F59E0B', true),
('Salud', '⚕️', '#EF4444', true),
('Día a día', '📅', '#8B5CF6', true),
('Entretenimiento', '🎬', '#EC4899', true),
('Educación', '📚', '#06B6D4', true),
('Servicios', '⚡', '#84CC16', true),
('Otros', '📦', '#6B7280', true);

-- 5. Políticas de seguridad RLS (Row Level Security)
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Políticas para budgets
CREATE POLICY "Users can view their own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para budget_items
CREATE POLICY "Users can view their own budget items" ON budget_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_items.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own budget items" ON budget_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_items.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own budget items" ON budget_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_items.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own budget items" ON budget_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_items.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

-- Política para expense_categories (solo lectura para todos)
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view expense categories" ON expense_categories
  FOR SELECT USING (true);

-- 6. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Triggers para actualizar updated_at
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();