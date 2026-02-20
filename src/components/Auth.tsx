import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase';

interface AuthProps {
  onLoggedIn?: () => void;
}

export default function Auth({ onLoggedIn }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('✅ Проверьте email для подтверждения');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoggedIn?.();
      }
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="liquid-glass p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 liquid-glass liquid-button-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-700 text-[var(--text-primary)] mb-2">
              {isSignUp ? 'Создать аккаунт' : 'С возвращением!'}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {isSignUp ? 'Начните анализировать свои уроки' : 'Войдите для продолжения'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-500 text-[var(--text-primary)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="liquid-input w-full pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-500 text-[var(--text-primary)] mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="liquid-input w-full pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`text-sm p-3 rounded-lg ${
                message.startsWith('✅') 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 liquid-button liquid-button-primary font-600 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Загрузка...' : (
                <>
                  {isSignUp ? 'Создать аккаунт' : 'Войти'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Создать'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
