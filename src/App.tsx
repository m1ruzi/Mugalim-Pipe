import { useState, useEffect } from 'react';
import { Upload, BarChart3, Users, Target, TrendingUp, Brain, Sparkles, CircleUser, LogOut, MessageCircle } from 'lucide-react';
import UploadSection from './components/UploadSection';
import AnalysisProgress from './components/AnalysisProgress';
import ResultsDashboard from './components/ResultsDashboard';
import LanguageSelector from './components/LanguageSelector';
import Auth from './components/Auth';
import Landing from './components/Landing';
import Profile from './components/Profile';
import { supabase } from './supabase';
import { languageService, type SupportedLanguage } from './services/LanguageService';

// pages
import Pricing from './pages/Pricing.tsx';
import Termsandpolicies from './pages/Termsandpolicies.tsx';
import TermsOfService from './pages/TermsOfService.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import RefundPolicy from './pages/RefundPolicy.tsx';
import About from './pages/About.tsx';

function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('ru');

  // auth session state
  const [session, setSession] = useState<any>(null);

  const handleLanguageChange = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    languageService.setLanguage(language);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setCurrentStep('analyzing');
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
    setCurrentStep('results');
  };

  const resetApp = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setAnalysisResults(null);
  };

  const handleSaveReport = async (pdfBlob: Blob, fileName: string) => {
    if (!session?.user) {
      alert('Пожалуйста, войдите в систему для сохранения отчета');
      return;
    }

    try {
      // Создаем безопасный путь: user_id/date_filename.pdf
      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${session.user.id}/${new Date().toISOString().split('T')[0]}_${safeFileName}`;

      console.log('💾 Saving report to storage:', storagePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(storagePath, pdfBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf'
        });

      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(storagePath);

      console.log('🔗 Public URL:', publicUrl);

      const { error: dbError } = await supabase
        .from('reports')
        .insert([{
          user_id: session.user.id,
          title: `Анализ урока от ${new Date().toLocaleDateString('ru-RU')}`,
          file_name: safeFileName,
          file_url: publicUrl,
          storage_path: storagePath,
          total_score: analysisResults?.totalScore || 0,
          percentage: analysisResults?.percentage || 0,
          grade: analysisResults?.grade || 'N/A',
          content: analysisResults,
          status: 'completed'
        }]);

      if (dbError) {
        console.error('Error saving report to database:', dbError);
        throw dbError;
      }

      console.log('✅ Report saved to database');
      alert('✅ Отчет успешно сохранен!');
    } catch (error: any) {
      console.error('Error saving report:', error);
      alert('❌ Ошибка: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const texts = languageService.getText();

  const [route, setRoute] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0f] to-[#0f0507]"></div>
        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--purple)]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-14 sm:pt-16">

      {/* Top Navigation Bar - Liquid Glass Style */}
      <header className="fixed top-0 left-0 right-0 z-20 liquid-nav">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 sm:space-x-3 group"
            >
              <div className="liquid-glass w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img src="/logo-book.png" alt="Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
              </div>
              <div className="text-left">
                <h1 className="text-sm sm:text-base font-600 tracking-tight text-[var(--text-primary)] whitespace-nowrap">
                  {texts.appTitle}
                </h1>
                <p className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] uppercase tracking-wider hidden xs:block">
                  {texts.appSubtitle}
                </p>
              </div>
            </button>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Language Selector - hidden on mobile */}
              <div className="hidden md:block">
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
              </div>

              {/* Not logged in */}
              {!session?.user ? (
                <>
                  {/* Support Button */}
                  <a
                    href="https://t.me/q4rzhas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 liquid-button"
                    title="Поддержка"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </a>
                  {/* Login Button */}
                  <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center justify-center w-10 h-10 liquid-button liquid-button-primary"
                    title="Войти"
                  >
                    <CircleUser className="w-5 h-5 text-white" />
                  </button>
                </>
              ) : (
                <>
                  {/* Profile Button */}
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center justify-center w-10 h-10 liquid-button"
                    title="Профиль"
                  >
                    <CircleUser className="w-5 h-5 text-white" />
                  </button>
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      supabase.auth.signOut();
                      setSession(null);
                    }}
                    className="flex items-center justify-center w-10 h-10 liquid-button"
                    title="Выход"
                  >
                    <LogOut className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {!session ? (
          route === '/auth' ? (
            <Auth />
          ) : route === '/about' ? (
            <About />
          ) : route === '/pricing' ? (
            <Pricing />
          ) : route === '/privacy-policy' ? (
            <PrivacyPolicy />
          ) : route === '/terms-of-service' ? (
            <TermsOfService />
          ) : route === '/refund-policy' ? (
            <RefundPolicy />
          ) : route === '/terms-and-policies' ? (
            <Termsandpolicies />
          ) : (
            <Landing onLoginClick={() => navigate('/auth')} />
          )
        ) : (
          route === '/profile' ? (
            <Profile session={session} />
          ) : route === '/pricing' ? (
            <Pricing />
          ) : route === '/privacy-policy' ? (
            <PrivacyPolicy />
          ) : route === '/terms-of-service' ? (
            <TermsOfService />
          ) : route === '/refund-policy' ? (
            <RefundPolicy />
          ) : route === '/terms-and-policies' ? (
            <Termsandpolicies />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="space-y-8">
                {currentStep === 'upload' && <UploadSection onFileSelect={handleFileUpload} />}
                {currentStep === 'analyzing' && uploadedFile && <AnalysisProgress file={uploadedFile} onComplete={handleAnalysisComplete} />}
                {currentStep === 'results' && analysisResults && (
                  <>
                    <ResultsDashboard results={analysisResults} onReset={resetApp} onSaveReport={handleSaveReport} />
                    <button
                      onClick={resetApp}
                      className="px-6 py-3 glass-button glass-button-primary font-600 w-full sm:w-auto"
                    >
                      Анализировать ещё видео
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 liquid-nav mt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-2 liquid-badge">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--accent)]" />
              <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
                © 2026 {texts.appTitle}. Built for excellence.
              </p>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <button onClick={() => navigate('/about')} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                О нас
              </button>
              <button onClick={() => navigate('/pricing')} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Тарифы
              </button>
              <button onClick={() => navigate('/privacy-policy')} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Privacy
              </button>
              <button onClick={() => navigate('/terms-of-service')} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Terms
              </button>
              <button onClick={() => navigate('/refund-policy')} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Refund
              </button>
            </nav>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default App;
