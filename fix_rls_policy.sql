-- ============================================
-- FIX: RLS Policy для таблицы reports
-- ============================================
-- Выполни этот SQL в Supabase SQL Editor
-- чтобы исправить ошибку "new row violates row-level security policy"
-- ============================================

-- 1. Сначала проверим текущие политики
SELECT * FROM pg_policies WHERE tablename = 'reports';

-- 2. Удаляем ВСЕ существующие политики для reports
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;
DROP POLICY IF EXISTS "authenticated_users_insert" ON reports;
DROP POLICY IF EXISTS "authenticated_users_select" ON reports;
DROP POLICY IF EXISTS "authenticated_users_update" ON reports;
DROP POLICY IF EXISTS "authenticated_users_delete" ON reports;

-- 3. Создаем ОДНУ новую политику для всех операций
CREATE POLICY "users_all_operations"
  ON reports
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Проверяем что RLS включен
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 5. Проверяем результат
SELECT * FROM pg_policies WHERE tablename = 'reports';

-- ============================================
-- Готово! ✅
-- ============================================
-- Теперь пользователи могут:
-- - Создавать свои отчеты (INSERT)
-- - Просматривать свои отчеты (SELECT)
-- - Обновлять свои отчеты (UPDATE)
-- - Удалять свои отчеты (DELETE)
-- ============================================
