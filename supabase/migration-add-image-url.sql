-- Migración para agregar la columna image_url si no existe
-- Ejecutar este script si obtienes el error: "Could not find the 'image_url' column"

-- Verificar si la columna existe y agregarla si no está presente
DO $$
BEGIN
    -- Intentar agregar la columna image_url
    BEGIN
        ALTER TABLE educational_content ADD COLUMN image_url VARCHAR(500);
        RAISE NOTICE 'Columna image_url agregada exitosamente';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'La columna image_url ya existe';
    END;
END $$;

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'educational_content'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mostrar algunas filas para verificar
SELECT id, title, image_url, created_at
FROM educational_content
LIMIT 5;