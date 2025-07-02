-- Configuración simplificada de Storage para imágenes del contenido educativo
-- Este script no requiere permisos de superusuario

-- 1. Crear bucket para contenido educativo
INSERT INTO storage.buckets (id, name, public)
VALUES ('education-content', 'education-content', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política básica para lectura pública de imágenes
CREATE POLICY "Public read access for education content" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'education-content');

-- 3. Política para que usuarios autenticados puedan subir imágenes
CREATE POLICY "Authenticated users can upload education images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'education-content' AND 
  auth.role() = 'authenticated'
);

-- 4. Política para que usuarios puedan actualizar sus propias imágenes
CREATE POLICY "Users can update their education images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'education-content' AND 
  auth.uid() = owner
);

-- 5. Política para que usuarios puedan eliminar sus propias imágenes
CREATE POLICY "Users can delete their education images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'education-content' AND 
  auth.uid() = owner
);

-- Nota: Si necesitas restricciones de administrador, puedes modificar las políticas
-- después de que el bucket esté funcionando correctamente.