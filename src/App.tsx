import { useState, useEffect } from 'react';
import { Upload, BarChart3, Users, Target, TrendingUp, Brain } from 'lucide-react'; // Brain оставил для списка функций внизу
import UploadSection from './components/UploadSection';
import AnalysisProgress from './components/AnalysisProgress';
import ResultsDashboard from './components/ResultsDashboard';
import LanguageSelector from './components/LanguageSelector';
import Auth from './components/Auth';
import Landing from './components/Landing';
import Profile from './components/Profile';
import SilkSimple from './components/SilkSimple';
import { supabase } from './supabase';
import { languageService, type SupportedLanguage } from './services/LanguageService';

// pages
import Pricing from './pages/Pricing.tsx';
import Termsandpolicies from './pages/Termsandpolicies.tsx';
import TermsOfService from './pages/TermsOfService.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import RefundPolicy from './pages/RefundPolicy.tsx';

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
      // Загружаем PDF файл в Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(`${session.user.id}/${fileName}`, pdfBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        throw uploadError;
      }

      // Получаем публичную ссылку на файл
      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(`${session.user.id}/${fileName}`);

      // Сохраняем запись в таблице reports
      const { error: dbError } = await supabase
        .from('reports')
        .insert({
          user_id: session.user.id,
          title: `Анализ урока от ${new Date().toLocaleDateString('ru-RU')}`,
          file_name: fileName,
          file_url: publicUrl,
          storage_path: `${session.user.id}/${fileName}`,
          total_score: analysisResults?.totalScore || 0,
          percentage: analysisResults?.percentage || 0,
          grade: analysisResults?.grade || 'N/A',
          content: analysisResults
        });

      if (dbError) {
        console.error('Error saving report to database:', dbError);
        throw dbError;
      }

      alert('✅ Отчет успешно сохранен в профиль!');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('❌ Ошибка при сохранении отчета: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  const texts = languageService.getText();

  // simple client-side routing based on pathname
  const [route, setRoute] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // check auth session & listen for changes
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
    <div className="min-h-screen bg-apple-gray-50 text-gray-900 antialiased relative">
      {/* Silk Background - только для страницы загрузки */}
      {!session && route !== '/auth' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.15 }}>
          <SilkSimple
            speed={2}
            scale={1.5}
            color="#682c2c"
            noiseIntensity={0.8}
            rotation={0}
          />
        </div>
      )}

      {/* Header */}
      <header className="bg-apple-gray-50/80 backdrop-blur-2xl border-b border-apple-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* glassy tab for logo + name */}
              <div className="flex items-center space-x-3 bg-white/40 backdrop-blur-lg rounded-2xl px-3 py-1">
                <img 
                  src="/logo-book.png" 
                  alt="Logo" 
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg"
                />
                <div>
                  <h1 className="text-base sm:text-lg font-600 tracking-tight leading-tight bg-white/30 backdrop-blur-sm rounded-md px-1">
                    {texts.appTitle}
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 font-500 uppercase tracking-[0.15em] leading-none mt-0.5">
                    {texts.appSubtitle}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 sm:space-x-8">
              <div className="hidden md:flex items-center space-x-6 text-[13px] font-500 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{texts.teachersCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{texts.improvementRate}</span>
                </div>
              </div>
              
              {/* Auth Button or Profile */}
              {!session ? (
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 bg-carmine-600 text-white rounded-lg font-500 text-sm hover:bg-carmine-700 transition-colors duration-200"
                >
                  Войти
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-500 text-sm hover:bg-blue-700 transition-colors duration-200"
                  >
                    👤 Профиль
                  </button>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="px-4 py-2 bg-carmine-600 text-white rounded-lg font-500 text-sm hover:bg-carmine-700 transition-colors duration-200"
                  >
                    Выход
                  </button>
                </div>
              )}
              
              <div className="pl-4 sm:pl-6 border-l border-gray-200">
                <LanguageSelector 
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {!session ? (
          // If not logged in
          route === '/auth' ? (
            <Auth />
          ) : (
            <Landing onLoginClick={() => navigate('/auth')} />
          )
        ) : (
          // If logged in
          route === '/profile' ? (
            <Profile session={session} />
          ) : (
            // Upload interface
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-700 text-gray-900">Загрузи видео для анализа</h1>
                  <p className="text-gray-600 mt-2">Получи детальный анализ своих педагогических навыков</p>
                </div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-500 text-sm hover:bg-gray-300 transition-colors"
                >
                  Выход
                </button>
              </div>

              {currentStep === 'upload' && <UploadSection onFileSelect={handleFileUpload} />}
              {currentStep === 'analyzing' && uploadedFile && <AnalysisProgress file={uploadedFile} onComplete={handleAnalysisComplete} />}
              {currentStep === 'results' && analysisResults && (
                <>
                  <ResultsDashboard 
                    results={analysisResults} 
                    onReset={resetApp}
                    onSaveReport={handleSaveReport}
                  />
                  <button
                    onClick={resetApp}
                    className="mt-8 px-6 py-3 bg-carmine-600 text-white rounded-lg font-600 hover:bg-carmine-700 transition-colors"
                  >
                    Анализировать ещё видео
                  </button>
                </>
              )}
            </div>
          )
        )}
      </main>

      {/* Features Section */}
      {currentStep === 'upload' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-gray-200">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-600 tracking-tight mb-3 sm:mb-4">
              {texts.featuresTitle}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 font-400 max-w-2xl mx-auto">
              {texts.featuresSubtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              { icon: Target, title: texts.features.poseAnalysis.title, description: texts.features.poseAnalysis.description },
              { icon: Users, title: texts.features.gestureRecognition.title, description: texts.features.gestureRecognition.description },
              { icon: Brain, title: texts.features.facialAnalysis.title, description: texts.features.facialAnalysis.description },
              { icon: BarChart3, title: texts.features.speechAnalysis.title, description: texts.features.speechAnalysis.description },
              { icon: Upload, title: texts.features.contentClassification.title, description: texts.features.contentClassification.description },
              { icon: TrendingUp, title: texts.features.recommendations.title, description: texts.features.recommendations.description }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="rounded-2xl p-6 sm:p-8 border border-apple-gray-200 bg-apple-gray-50 hover:bg-apple-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group"
              >
                <div className="w-10 h-10 bg-carmine-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-carmine-500 group-hover:text-white transition-all duration-300">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-600 text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-500 font-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-gray-200 text-center">
        <nav className="mb-4 space-x-4 sm:space-x-6 flex justify-center flex-wrap">
          <a href="/pricing" className="text-sm text-carmine-600 hover:text-carmine-700" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}>
            Pricing
          </a>
          <a href="/terms-of-service" className="text-sm text-carmine-600 hover:text-carmine-700" onClick={(e) => { e.preventDefault(); navigate('/terms-of-service'); }}>
            Terms
          </a>
          <a href="/privacy-policy" className="text-sm text-carmine-600 hover:text-carmine-700" onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }}>
            Privacy
          </a>
          <a href="/refund-policy" className="text-sm text-carmine-600 hover:text-carmine-700" onClick={(e) => { e.preventDefault(); navigate('/refund-policy'); }}>
            Refund
          </a>
        </nav>
        <p className="text-xs sm:text-sm text-gray-400 font-400 tracking-tight">
          © 2026 {texts.appTitle}. Built for excellence.
        </p>
      </footer>
    </div>
  );
}

export default App;