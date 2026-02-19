# Настройка сохранения PDF отчётов в Profile

## 📋 Что было реализовано

1. **Кнопка "Сохранить в профиль"** в ResultsDashboard
2. **Вкладка "Мои отчёты"** в Profile с списком сохранённых PDF
3. **Скачивание PDF** из профиля
4. **Удаление отчётов** из профиля

## ⚙️ Настройка Supabase

### Шаг 1: Запуск SQL скрипта

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдите в ваш проект
3. Откройте **SQL Editor** (в левом меню)
4. Нажмите **New Query**
5. Скопируйте содержимое файла `supabase_setup.sql`
6. Вставьте в SQL Editor и нажмите **Run**

### Шаг 2: Создание Storage Bucket

1. В Supabase Dashboard перейдите в **Storage** (левое меню)
2. Нажмите **New Bucket**
3. Настройте bucket:
   - **Name**: `reports`
   - **Public**: false (приватный)
   - **File size limit**: `10485760` (10 MB)
   - **Allowed MIME types**: оставьте пустым (все типы)
4. Нажмите **Create bucket**

### Шаг 3: Настройка политик доступа к Storage

1. В **Storage** выберите bucket `reports`
2. Перейдите на вкладку **Policies**
3. Нажмите **New Policy**
4. Создайте 3 политики:

#### Политика 1: Upload (INSERT)
```sql
Policy name: Users can upload their own reports
Policy action: INSERT
Policy definition:
bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Политика 2: View (SELECT)
```sql
Policy name: Users can view their own reports
Policy action: SELECT
Policy definition:
bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Политика 3: Delete (DELETE)
```sql
Policy name: Users can delete their own reports
Policy action: DELETE
Policy definition:
bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]
```

## ✅ Проверка работы

1. **Запустите приложение**: `npm run dev`
2. **Войдите в систему** или зарегистрируйтесь
3. **Загрузите видео** для анализа
4. После анализа нажмите **"Сохранить в профиль"**
5. Перейдите в **Профиль** → вкладка **"Мои отчёты"**
6. Вы должны увидеть сохранённый отчёт с возможностью:
   - **Скачать PDF**
   - **Удалить отчёт**

## 🎨 Функции

### ResultsDashboard
- **"Скачать отчет"** — генерирует и скачивает PDF
- **"Сохранить в профиль"** — генерирует PDF, скачивает и сохраняет в базу

### Profile → Мои отчёты
Отображение:
- Название отчёта
- Дата создания
- Оценка (grade)
- Результат (баллы из 1000)
- Процент

Действия:
- **Скачать PDF** — загрузка файла из хранилища
- **Удалить** — удаление из базы и хранилища

## 📁 Структура данных

### Таблица `reports`

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Уникальный идентификатор |
| user_id | UUID | ID пользователя |
| title | TEXT | Название отчёта |
| file_name | TEXT | Имя файла PDF |
| file_url | TEXT | Публичная ссылка |
| storage_path | TEXT | Путь в хранилище |
| total_score | INTEGER | Общий балл (0-1000) |
| percentage | NUMERIC | Процент |
| grade | TEXT | Оценка (A+, A, B, etc.) |
| content | JSONB | Полные данные анализа |
| created_at | TIMESTAMPTZ | Дата создания |

## 🔒 Безопасность

- **RLS (Row Level Security)** включён
- Пользователи видят **только свои отчёты**
- Доступ к хранилищу через **аутентификацию Supabase**
- Автоматическое удаление отчётов при удалении пользователя

## 🐛 Troubleshooting

### Ошибка "Permission denied"
- Проверьте RLS политики в таблице `reports`
- Проверьте политики доступа к bucket `reports`

### Ошибка "Bucket not found"
- Убедитесь, что bucket назван точно `reports`
- Проверьте, что bucket приватный

### Отчёты не сохраняются
- Проверьте консоль браузера на ошибки
- Убедитесь, что пользователь авторизован
- Проверьте, что таблица `reports` существует
