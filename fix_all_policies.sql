-- ============================================
-- ПОЛНОЕ ИСПРАВЛЕНИЕ RLS и Storage
-- ============================================
-- Выполни весь этот скрипт в Supabase SQL Editor
-- ============================================

-- ЧАСТЬ 1: Исправляем RLS для таблицы reports
-- ============================================

-- Удаляем ВСЕ существующие политики для reports
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'reports'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON reports';
    END LOOP;
END $$;

-- Создаем новую политику для всех операций
CREATE POLICY "allow_all_user_operations"
  ON reports
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Проверяем что RLS включен
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;


-- ЧАСТЬ 2: Создаем Storage Bucket если не существует
-- ============================================

-- Создаем bucket для отчетов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,  -- Private bucket
  104857600,  -- 100 MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;


-- ЧАСТЬ 3: Политики для Storage
-- ============================================

-- Удаляем старые политики storage
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'storage'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Создаем политики для storage.objects
CREATE POLICY "users_can_upload_to_own_folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'reports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_can_view_own_files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'reports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_can_delete_own_files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'reports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_can_update_own_files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'reports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ЧАСТЬ 4: Проверка
-- ============================================

-- Показываем все политики для reports
SELECT 'Table: reports' as info, * FROM pg_policies WHERE tablename = 'reports';

-- Показываем все политики для storage
SELECT 'Table: storage.objects' as info, * FROM pg_policies WHERE schemaname = 'storage';

-- Показываем bucket
SELECT * FROM storage.buckets WHERE id = 'reports';

-- ============================================
-- ГОТОВО! ✅
-- ============================================
