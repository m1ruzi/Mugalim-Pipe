# 📊 Настройка Supabase для AI отчетов

## Шаг 1: Выполните SQL скрипт

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor** (в левом меню)
4. Нажмите **New Query**
5. Скопируйте содержимое файла `supabase_reports_setup.sql`
6. Вставьте в SQL Editor
7. Нажмите **Run** (или Ctrl+Enter)

## Шаг 2: Создайте Storage Bucket

### Вариант A: Через Dashboard (рекомендуется)

1. В Supabase Dashboard перейдите в **Storage**
2. Нажмите **New bucket**
3. Заполните:
   - **Name:** `reports`
   - **Public:** ❌ (выключите)
   - **File size limit:** `10485760` (10 MB)
   - **Allowed MIME types:** `application/pdf`
4. Нажмите **Create bucket**

### Вариант B: Через SQL

Выполните этот SQL в SQL Editor:

```sql
-- Создаем bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Создаем политики
INSERT INTO storage.policies (bucket_id, name, action, expression)
VALUES
  ('reports', 'Users can upload their own reports', 'INSERT', 
   'bucket_id = ''reports'' AND auth.uid()::text = (storage.foldername(name))[1]'),
  ('reports', 'Users can view their own reports', 'SELECT', 
   'bucket_id = ''reports'' AND auth.uid()::text = (storage.foldername(name))[1]'),
  ('reports', 'Users can delete their own reports', 'DELETE', 
   'bucket_id = ''reports'' AND auth.uid()::text = (storage.foldername(name))[1]')
ON CONFLICT (bucket_id, name) DO NOTHING;
```

## Шаг 3: Проверьте что все создано

### Проверка таблиц

Выполните SQL:

```sql
-- Проверяем таблицу reports
SELECT COUNT(*) FROM reports;

-- Проверяем таблицу user_statistics
SELECT COUNT(*) FROM user_statistics;

-- Проверяем view
SELECT * FROM user_dashboard LIMIT 1;
```

### Проверка политик безопасности

```sql
-- Проверяем RLS политики
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('reports', 'user_statistics');
```

### Проверка Storage

1. Перейдите в **Storage** в Dashboard
2. Убедитесь что bucket `reports` существует
3. Убедитесь что он **Private** (иконка замка)

## Шаг 4: Настройте переменные окружения

Убедитесь что в файле `.env` указаны правильные данные:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Где взять:
1. Откройте Supabase Dashboard
2. Перейдите в **Settings** → **API**
3. Скопируйте:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

## Шаг 5: Протестируйте

### Тест 1: Создание отчета

```sql
-- Вставьте тестовый отчет (замените YOUR_USER_ID на ваш user_id)
INSERT INTO reports (
  user_id,
  title,
  total_score,
  percentage,
  grade,
  strengths,
  priority_areas,
  status
) VALUES (
  'YOUR_USER_ID'::uuid,
  'Тестовый анализ',
  750,
  75.0,
  'B+',
  ARRAY['Хорошая осанка', 'Четкая речь'],
  ARRAY['Работать над жестикуляцией'],
  'completed'
);
```

### Тест 2: Проверка RLS

```sql
-- Должно вернуть пустой результат (если вы не авторизованы)
SELECT * FROM reports;

-- Должно вернуть тестовый отчет (если вы авторизованы как владелец)
SELECT * FROM reports WHERE user_id = auth.uid();
```

## Структура базы данных

### Таблица `reports`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Уникальный ID отчета |
| `user_id` | UUID | ID пользователя |
| `title` | TEXT | Заголовок отчета |
| `total_score` | INTEGER | Общий балл (0-1000) |
| `percentage` | NUMERIC | Процент (0-100) |
| `grade` | TEXT | Оценка (A+, A, B, etc) |
| `metrics` | JSONB | Детальные метрики анализа |
| `ai_report` | JSONB | Полный AI отчет |
| `strengths` | TEXT[] | Массив сильных сторон |
| `priority_areas` | TEXT[] | Массив зон роста |
| `file_name` | TEXT | Имя PDF файла |
| `file_url` | TEXT | Публичная ссылка на PDF |
| `storage_path` | TEXT | Путь в Storage |
| `created_at` | TIMESTAMPTZ | Дата создания |

### Таблица `user_statistics`

| Поле | Тип | Описание |
|------|-----|----------|
| `user_id` | UUID | ID пользователя |
| `total_analyses` | INTEGER | Всего анализов |
| `completed_analyses` | INTEGER | Завершенных анализов |
| `average_score` | NUMERIC | Средний балл |
| `best_score` | INTEGER | Лучший балл |
| `worst_score` | INTEGER | Худший балл |
| `last_analysis_date` | TIMESTAMPTZ | Дата последнего анализа |
| `achievements` | JSONB | Достижения |

## Автоматические функции

### `update_user_statistics()`

Автоматически обновляет статистику пользователя при:
- ✅ Создании нового отчета
- ✅ Удалении отчета

### `update_updated_at_column()`

Автоматически обновляет `updated_at` при изменении записи.

## Готовые API функции

### `get_user_stats()`

Возвращает статистику текущего пользователя:

```sql
SELECT * FROM get_user_stats();
```

### `get_user_reports(limit, offset, status)`

Возвращает отчеты пользователя с пагинацией:

```sql
SELECT * FROM get_user_reports(20, 0, 'completed');
```

## Решение проблем

### Ошибка: "permission denied for table reports"

**Решение:** Проверьте что RLS включен:

```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

### Ошибка: "relation reports does not exist"

**Решение:** Выполните SQL скрипт еще раз.

### Storage bucket не создается

**Решение:** Создайте вручную через Dashboard (Шаг 2, Вариант A).

### Отчеты не сохраняются

**Проверьте:**
1. ✅ Пользователь авторизован
2. ✅ `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` правильные
3. ✅ RLS политики созданы
4. ✅ Storage bucket существует

## 🎉 Готово!

Теперь ваш сайт готов к сохранению AI отчетов в Supabase!

Отчеты будут:
- ✅ Сохраняться в базе данных
- ✅ Загружаться в Storage (PDF файлы)
- ✅ Отображаться в профиле пользователя
- ✅ Автоматически обновлять статистику
