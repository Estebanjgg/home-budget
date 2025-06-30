-- Configuración de Supabase para Home Budget
-- Ejecuta estos comandos en el SQL Editor de tu panel de Supabase

-- IMPORTANTE: Primero elimina las políticas existentes si ya las creaste
-- DROP POLICY IF EXISTS "Los usuarios pueden subir sus propios avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Los avatars son públicamente visibles" ON storage.objects;
-- DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propios avatars" ON storage.objects;

-- 1. Crear bucket para avatars (solo si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear políticas de storage para avatars
-- Nota: En Supabase, las políticas de storage se crean automáticamente cuando usas el dashboard
-- Si necesitas crearlas manualmente, usa estos comandos:

-- Política para subir avatars (INSERT)
CREATE POLICY "avatar_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para ver avatars (SELECT)
CREATE POLICY "avatar_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Política para actualizar avatars (UPDATE)
CREATE POLICY "avatar_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para eliminar avatars (DELETE)
CREATE POLICY "avatar_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ALTERNATIVA MÁS SIMPLE: Usar el Dashboard de Supabase
-- Ve a Storage > avatars bucket > Configuration > Policies
-- Y crea las políticas usando la interfaz gráfica con estas reglas:
-- INSERT: bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
-- SELECT: bucket_id = 'avatars'
-- UPDATE: bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
-- DELETE: bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text