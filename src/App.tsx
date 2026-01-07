import React, { useState } from 'react';
import { Upload, BarChart3, Users, Target, TrendingUp, Brain } from 'lucide-react'; // Brain оставил для списка функций внизу
import UploadSection from './components/UploadSection';
import AnalysisProgress from './components/AnalysisProgress';
import ResultsDashboard from './components/ResultsDashboard';
import LanguageSelector from './components/LanguageSelector';
import { languageService, type SupportedLanguage } from './services/LanguageService';

function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('ru');

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

  const texts = languageService.getText();

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#1D1D1F] antialiased">
      
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
              {/* ЗАМЕНА: Твой логотип из папки public */}
              <img 
                src="/logo-book.png" 
                alt="Logo" 
                className="w-10 h-10 object-contain rounded-lg shadow-sm"
              />

              <div>
                <h1 className="text-xl font-bold tracking-tighter text-black leading-tight">
                  {texts.appTitle}
                </h1>
                <p className="text-[10px] text-black/40 font-bold uppercase tracking-[0.2em] leading-none mt-1">
                  {texts.appSubtitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex items-center space-x-6 text-[13px] font-medium text-black/60">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{texts.teachersCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{texts.improvementRate}</span>
                </div>
              </div>
              
              <div className="pl-6 border-l border-black/10">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="transition-all duration-700 ease-in-out">
          {currentStep === 'upload' && (
            <UploadSection onFileUpload={handleFileUpload} />
          )}
          
          {currentStep === 'analyzing' && uploadedFile && (
            <AnalysisProgress 
              fileName={uploadedFile.name} 
              onAnalysisComplete={handleAnalysisComplete}
              videoFile={uploadedFile}
            />
          )}
          
          {currentStep === 'results' && analysisResults && (
            <ResultsDashboard results={analysisResults} onReset={resetApp} />
          )}
        </div>
      </main>

      {/* Features Section */}
      {currentStep === 'upload' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-black/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-black mb-4">
              {texts.featuresTitle}
            </h2>
            <p className="text-xl text-black/40 font-light max-w-2xl mx-auto">
              {texts.featuresSubtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="bg-white rounded-[24px] p-8 border border-black/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 cursor-default group"
              >
                <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                  <feature.icon className="w-6 h-6 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-[15px] leading-relaxed text-black/50 font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-black/5 text-center">
        <p className="text-[13px] text-black/30 font-medium tracking-tight">
          © 2026 {texts.appTitle}. Built for excellence.
        </p>
      </footer>
    </div>
  );
}

export default App;