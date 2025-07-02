-- Configuración de Storage para imágenes del contenido educativo

-- Crear bucket para contenido educativo
INSERT INTO storage.buckets (id, name, public)
VALUES ('education-content', 'education-content', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que todos puedan ver las imágenes (lectura pública)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'education-content');

-- Política para permitir que los administradores suban imágenes
CREATE POLICY "Admin can upload education images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'education-content' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Política para permitir que los administradores actualicen imágenes
CREATE POLICY "Admin can update education images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'education-content' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Política para permitir que los administradores eliminen imágenes
CREATE POLICY "Admin can delete education images" ON storage.objects FOR DELETE USING (
  bucket_id = 'education-content' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Habilitar RLS en storage.objects si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;