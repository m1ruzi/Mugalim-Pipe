import { useState } from 'react';
import { supabase } from '../supabase';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (nicknameValue: string, passwordValue: string) => {
    setError(null);
    setSuccess(null);
    
    if (!nicknameValue || !passwordValue) {
      setError('Пожалуйста, укажите никнейм и пароль.');
      return;
    }

    setLoading(true);
    const fakeEmail = `${nicknameValue.toLowerCase()}@app.local`;

    try {
      // Пробуем войти
      let { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: passwordValue,
      });

      // Если юзера нет — регистрируем его
      if (loginError && loginError.message.includes('Invalid login credentials')) {
        console.log('User not found, creating new account...');
        const { data: signData, error: signError } = await supabase.auth.signUp({
          email: fakeEmail,
          password: passwordValue,
          options: { data: { user_name: nicknameValue } },
        });

        if (signError) {
          console.error('SignUp error:', signError);
          setError(signError.message);
        } else {
          setSuccess('✅ Аккаунт создан успешно! Попробуй войти ещё раз.');
          setNickname('');
          setPassword('');
          setMode('login');
        }
      } else if (loginError) {
        console.error('Login error:', loginError);
        setError(loginError.message);
      } else {
        setSuccess('✅ Вы успешно вошли!');
        setNickname('');
        setPassword('');
      }
    } catch (err) {
      console.error('Auth exception:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  // Функция регистрации (для старой логики)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAuth(nickname, password);
  };

  // Функция входа (для старой логики)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAuth(nickname, password);
  };

  return (
    <div style={{ maxWidth: '450px', margin: '30px auto', padding: '0' }}>
      {/* Вкладки */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' }}>
        <button
          onClick={() => {
            setMode('login');
            setError(null);
            setSuccess(null);
          }}
          style={{
            flex: 1,
            padding: '12px 0',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: mode === 'login' ? '#dc2626' : '#9ca3af',
            borderBottom: mode === 'login' ? '2px solid #dc2626' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          Вход
        </button>
        <button
          onClick={() => {
            setMode('signup');
            setError(null);
            setSuccess(null);
          }}
          style={{
            flex: 1,
            padding: '12px 0',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: mode === 'signup' ? '#dc2626' : '#9ca3af',
            borderBottom: mode === 'signup' ? '2px solid #dc2626' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          Регистрация
        </button>
      </div>

      {/* Основной контент */}
      <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        {/* Сообщение об ошибке */}
        {error && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '15px', 
            backgroundColor: '#fee2e2', 
            color: '#991b1b',
            borderRadius: '6px',
            border: '1px solid #fecaca',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Сообщение об успехе */}
        {success && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '15px', 
            backgroundColor: '#dcfce7', 
            color: '#166534',
            borderRadius: '6px',
            border: '1px solid #bbf7d0',
            fontSize: '14px'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Форма входа */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Никнейм
              </label>
              <input
                type="text"
                placeholder="your_nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '10px', 
                  boxSizing: 'border-box',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Пароль
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '10px', 
                  boxSizing: 'border-box',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
          </form>
        ) : (
          /* Форма регистрации */
          <form onSubmit={handleSignUp}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Никнейм
              </label>
              <input
                type="text"
                placeholder="your_nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '10px', 
                  boxSizing: 'border-box',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#6b7280' }}>
              Пароль должен быть не менее 6 символов
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Пароль
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '10px', 
                  boxSizing: 'border-box',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Загрузка...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
