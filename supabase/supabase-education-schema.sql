-- Primero crear la tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver y editar su propio perfil
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para insertar perfiles (se ejecuta cuando se registra un usuario)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Función para crear automáticamente un perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla para contenido educativo
CREATE TABLE educational_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('article', 'video')),
  category VARCHAR(50) NOT NULL,
  duration VARCHAR(20), -- Para videos: "12 min", para artículos: "5 min read"
  image_emoji VARCHAR(10) DEFAULT '📄',
  image_url VARCHAR(500), -- URL de la imagen del artículo
  url VARCHAR(500), -- URL externa para videos
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_educational_content_type ON educational_content(type);
CREATE INDEX idx_educational_content_category ON educational_content(category);
CREATE INDEX idx_educational_content_active ON educational_content(is_active);

-- RLS (Row Level Security)
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;

-- Política para lectura: todos pueden ver contenido activo
CREATE POLICY "Anyone can view active educational content" ON educational_content
  FOR SELECT USING (is_active = true);

-- Política para administradores: pueden hacer todo
CREATE POLICY "Admins can manage educational content" ON educational_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Insertar contenido inicial
INSERT INTO educational_content (title, summary, type, category, duration, image_emoji, is_featured) VALUES
('10 Estrategias para Ahorrar en el Supermercado', 'Descubre cómo reducir tus gastos de alimentación sin sacrificar calidad.', 'article', 'Ahorro', '5 min', '🛒', true),
('Cómo Crear un Presupuesto Familiar Efectivo', 'Guía paso a paso para organizar tus finanzas familiares.', 'video', 'Presupuesto', '12 min', '📹', true),
('Inversiones Básicas para Principiantes', 'Aprende los fundamentos de la inversión personal.', 'article', 'Inversión', '8 min', '📈', false),
('Planificación de Emergencias Financieras', 'Cómo prepararte para gastos inesperados.', 'video', 'Emergencias', '15 min', '🚨', false),
('Presupuesto 50/30/20', 'Aprende la regla de oro para distribuir tus ingresos', 'video', 'Presupuesto', '8 min', '▶️', true),
('Fondo de Emergencia', 'Cómo crear tu colchón financiero paso a paso', 'video', 'Emergencias', '12 min', '▶️', true),
('Inversión Inteligente', 'Primeros pasos en el mundo de las inversiones', 'video', 'Inversión', '15 min', '▶️', true);