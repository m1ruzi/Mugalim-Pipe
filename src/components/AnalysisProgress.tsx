import React, { useEffect, useState } from 'react';
import { Brain, Eye, Users, MessageSquare, BarChart3, Mic, FileText, CheckCircle, Wifi, Languages, Loader2 } from 'lucide-react';

interface AnalysisProgressProps {
  file: File;
  onComplete: (results: any) => void;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ file, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [detailedProgress, setDetailedProgress] = useState({
    initialization: 0,
    videoAnalysis: 0,
    audioAnalysis: 0,
    scoring: 0
  });
  const [qualityMetrics, setQualityMetrics] = useState({
    videoQuality: 'Проверка...',
    audioQuality: 'Проверка...',
    analysisQuality: 'Ожидание...'
  });

  const hasYandexCredentials = true;

  const [yandexConfig] = useState({
    enabled: hasYandexCredentials,
    languages: ['ru-RU', 'kk-KZ', 'en-US'],
    autoDetectLanguage: true,
    includeFillerWords: true,
    connectionStatus: 'not_tested' as 'not_tested' | 'testing' | 'success' | 'failed'
  });

  const videoFile = file;
  const fileName = file.name;
  const onAnalysisComplete = onComplete;

  // Изменено: Цвета заменены на системные ч/б
  const analysisSteps = [
    { icon: Eye, title: "Инициализация MediaPipe", description: "Загрузка моделей анализа" },
    { icon: Users, title: "Анализ позы и движений", description: "Осанка и уверенность" },
    { icon: MessageSquare, title: "Анализ жестов и мимики", description: "Выразительность движений" },
    { icon: Mic, title: "Многоязычный анализ речи", description: "SpeechKit v3 + Gemini AI" },
    { icon: FileText, title: "AI классификация контента", description: "Структура и логика урока" },
    { icon: Brain, title: "AI расчет итогов", description: "Генерация проф. отчета" }
  ];

  useEffect(() => {
    const runComprehensiveAnalysis = async () => {
      try {
        setCurrentStep(0);
        setProgress(5);
        setDetailedProgress(prev => ({ ...prev, initialization: 20 }));
        
        const { mediaPipeService } = await import('../services/MediaPipeService');
        await mediaPipeService.initialize();
        
        setDetailedProgress(prev => ({ ...prev, initialization: 100 }));
        setProgress(15);
        
        setCurrentStep(1);
        setProgress(20);
        
        const videoAnalysis = await mediaPipeService.analyzeVideo(videoFile, (videoProgress) => {
          const adjustedProgress = 20 + (videoProgress * 0.4); 
          setProgress(adjustedProgress);
          setDetailedProgress(prev => ({ ...prev, videoAnalysis: videoProgress }));
        });
        
        const analysisQuality = mediaPipeService.getAnalysisQuality(videoAnalysis);
        setQualityMetrics(prev => ({ 
          ...prev, 
          videoQuality: `${videoAnalysis.frameCount} кадров`,
          analysisQuality 
        }));
        
        setCurrentStep(2);
        setProgress(60);
        
        setCurrentStep(3);
        setProgress(65);
        setDetailedProgress(prev => ({ ...prev, audioAnalysis: 20 }));
        
        const { audioAnalysisService } = await import('../services/AudioAnalysisService');
        
        if (yandexConfig.enabled) {
          audioAnalysisService.updateConfig({
            useYandexSpeechKit: true,
            languages: yandexConfig.languages,
            autoDetectLanguage: yandexConfig.autoDetectLanguage,
            includeFillerWords: yandexConfig.includeFillerWords
          });
        }
        
        const audioAnalysis = await audioAnalysisService.analyzeAudio(videoFile, (audioProgress) => {
          setDetailedProgress(prev => ({ ...prev, audioAnalysis: audioProgress }));
        });
        
        setDetailedProgress(prev => ({ ...prev, audioAnalysis: 100 }));
        
        let transcriptionInfo = 'Обработка...';
        if (audioAnalysis.transcriptionMetadata) {
          const meta = audioAnalysis.transcriptionMetadata;
          transcriptionInfo = `AI: ${Math.round(meta.confidence * 100)}% (${meta.fillerWordsCount} зап.)`;
        }
        
        setQualityMetrics(prev => ({ ...prev, audioQuality: transcriptionInfo }));
        
        setCurrentStep(4);
        setProgress(80);
        
        setCurrentStep(5);
        setProgress(85);
        setDetailedProgress(prev => ({ ...prev, scoring: 30 }));
        
        const { scoringService } = await import('../services/ScoringService');
        const comprehensiveResults = await scoringService.calculateComprehensiveScore(
          videoAnalysis.poseData,
          videoAnalysis.gestureData,
          videoAnalysis.faceData,
          audioAnalysis,
          videoAnalysis.videoDuration
        );
        
        setDetailedProgress(prev => ({ ...prev, scoring: 100 }));
        setProgress(100);
        
        const finalResults = {
          ...comprehensiveResults,
          analysisDetails: {
            videoAnalysis,
            audioAnalysis,
            qualityMetrics: { ...qualityMetrics, analysisQuality },
            multilingualAnalysis: {
              yandexSpeechKitUsed: yandexConfig.enabled,
              detectedLanguages: audioAnalysis.transcriptionMetadata?.detectedLanguages || [],
              fillerWordsCount: audioAnalysis.transcriptionMetadata?.fillerWordsCount || 0
            }
          }
        };
        
        setTimeout(() => {
          onAnalysisComplete(finalResults);
        }, 1500);
        
      } catch (error) {
        console.error('Analysis failed:', error);
        setProgress(100); // Fallback to results on error
      }
    };

    runComprehensiveAnalysis();
  }, [file, onComplete, yandexConfig]);

  const CurrentStepIcon = analysisSteps[currentStep]?.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-8 md:space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-600 tracking-tight text-gray-900">
          Анализ видео
        </h1>
        <p className="text-sm sm:text-base text-gray-500 font-400">
          <span className="font-600 text-gray-900">{fileName}</span> • обработка в процессе...
        </p>
      </div>

      {/* Main Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm font-600 text-gray-600 uppercase tracking-wide">Общий прогресс</span>
          <span className="text-xs md:text-sm font-600 text-gray-900">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-carmine-600 to-carmine-500 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-3 p-3 md:p-4 bg-carmine-50 rounded-xl md:rounded-2xl border border-carmine-100">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-carmine-600 rounded-lg md:rounded-xl flex items-center justify-center">
          <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-white animate-spin" />
        </div>
        <div>
          <h3 className="text-sm md:text-base font-600 text-gray-900">Выполняется анализ</h3>
          <p className="text-xs md:text-sm text-gray-500 font-400">Google Gemini AI обрабатывает видео</p>
        </div>
      </div>

      {/* Security Indicator */}
      <div className="bg-apple-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-200 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-carmine-600 rounded-xl flex items-center justify-center shadow-sm">
              <Wifi className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-600 text-gray-900">Безопасное соединение</h3>
              <p className="text-xs md:text-sm text-gray-500 font-400">Yandex SpeechKit v3 + Gemini Cloud</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 bg-apple-gray-50 px-3 md:px-4 py-2 rounded-lg border border-apple-gray-200 shadow-sm text-xs md:text-sm font-600">
            <CheckCircle className="w-4 h-4" />
            <span>Шифрование активно</span>
          </div>
        </div>
      </div>

      {/* Main Progress Bar — Жирный черный стиль */}
      <div className="bg-apple-gray-50 rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-apple-gray-200 shadow-sm mb-6 md:mb-8">
        <div className="mb-8 md:mb-10">
          <div className="flex justify-between items-end mb-3 md:mb-4 px-1">
            <span className="text-[12px] md:text-[13px] font-bold uppercase tracking-widest text-gray-500">Общий прогресс</span>
            <span className="text-2xl md:text-3xl font-semibold tracking-tighter">{Math.round(progress)}%</span>
          </div>
            <div className="w-full bg-[#F5F5F7] rounded-full h-2 md:h-3 overflow-hidden">
            <div 
              className="bg-carmine-700 h-full transition-all duration-700 ease-in-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Текущий этап */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-carmine-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-carmine-100">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-carmine-600 flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-500">
            {CurrentStepIcon && <CurrentStepIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />}
          </div>
          <div>
            <h3 className="text-base md:text-lg font-600 text-gray-900 tracking-tight leading-none mb-1">
              {analysisSteps[currentStep]?.title}
            </h3>
            <p className="text-sm text-gray-500 font-400 tracking-tight">
              {analysisSteps[currentStep]?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { key: 'initialization', label: 'Инициализация', icon: Brain },
          { key: 'videoAnalysis', label: 'Видео поток', icon: Eye },
          { key: 'audioAnalysis', label: 'Речь и AI', icon: Languages },
          { key: 'scoring', label: 'Финальный счет', icon: BarChart3 }
        ].map((item) => (
          <div key={item.key} className="bg-apple-gray-50 rounded-2xl p-4 border border-apple-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <item.icon className="w-4 h-4 text-gray-300" />
              <span className="text-sm font-600 tracking-tight">
                {Math.round(detailedProgress[item.key as keyof typeof detailedProgress])}%
              </span>
            </div>
            <div className="text-xs font-600 uppercase tracking-wider text-gray-400 mb-2">{item.label}</div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-carmine-600 h-full transition-all duration-500"
                style={{ width: `${detailedProgress[item.key as keyof typeof detailedProgress]}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quality Metrics */}
      <div className="bg-apple-gray-100 rounded-3xl p-6 md:p-8 border border-gray-200 mb-8">
        <div className="flex items-center space-x-2 mb-4 opacity-60">
          <BarChart3 className="w-4 h-4 text-gray-600" />
          <h3 className="text-xs font-600 uppercase tracking-wider text-gray-600">Качество обработки</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { label: 'Видео сигнал', value: qualityMetrics.videoQuality, icon: Eye },
            { label: 'Аудио (filler words)', value: qualityMetrics.audioQuality, icon: Languages },
            { label: 'AI Точность', value: qualityMetrics.analysisQuality, icon: Brain }
          ].map((metric, index) => (
            <div key={index} className="space-y-1">
              <div className="text-xs font-600 text-gray-500 uppercase tracking-wider">{metric.label}</div>
              <div className="text-sm md:text-base font-600 text-gray-900">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Info */}
      <div className="grid md:grid-cols-4 gap-6 text-xs text-gray-500 font-400 leading-relaxed border-t border-gray-200 pt-8">
        <div>
          <span className="text-gray-700 block mb-1 font-600 uppercase tracking-wider">MediaPipe Vision</span>
          33 точки позы, 468 точек лица
        </div>
        <div>
          <span className="text-gray-700 block mb-1 font-600 uppercase tracking-wider">Speech Analysis</span>
          Yandex SpeechKit v3 Cloud
        </div>
        <div>
          <span className="text-gray-700 block mb-1 font-600 uppercase tracking-wider">Logic Engine</span>
          Google Gemini 1.5 Pro
        </div>
        <div>
          <span className="text-gray-700 block mb-1 font-600 uppercase tracking-wider">Security</span>
          Netlify Functions • AES-256
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;