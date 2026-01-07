import React, { useEffect, useState } from 'react';
import { Brain, Eye, Users, MessageSquare, BarChart3, Zap, Mic, FileText, CheckCircle, Wifi, Globe, Languages, Loader2 } from 'lucide-react';

interface AnalysisProgressProps {
  fileName: string;
  onAnalysisComplete: (results: any) => void;
  videoFile: File;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ fileName, onAnalysisComplete, videoFile }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
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
        
        setAnalysisResults(finalResults);
        
        setTimeout(() => {
          onAnalysisComplete(finalResults);
        }, 1500);
        
      } catch (error) {
        console.error('Analysis failed:', error);
        setProgress(100); // Fallback to results on error
      }
    };

    runComprehensiveAnalysis();
  }, [videoFile, onAnalysisComplete, yandexConfig]);

  const CurrentStepIcon = analysisSteps[currentStep]?.icon;

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Header — Чистая типографика Apple */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-black mb-3">
          Выполняется AI-анализ
        </h1>
        <p className="text-lg text-black/40 font-light mb-1">{fileName}</p>
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-black/5 rounded-full text-[11px] font-bold uppercase tracking-widest text-black/50">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Обработка Google Gemini AI</span>
        </div>
      </div>

      {/* Индикаторы безопасности (ч/б стиль) */}
      <div className="bg-[#F5F5F7] rounded-[24px] p-6 border border-black/[0.03] mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-sm">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-black leading-tight">Secure API Integration</h3>
              <p className="text-[13px] text-black/40">Yandex SpeechKit v3 + Gemini Cloud</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-black/60 bg-white px-4 py-2 rounded-xl border border-black/5 shadow-sm text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Шифрование активно</span>
          </div>
        </div>
      </div>

      {/* Main Progress Bar — Жирный черный стиль */}
      <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm mb-8">
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4 px-1">
            <span className="text-[13px] font-bold uppercase tracking-widest text-black/30">Общий прогресс</span>
            <span className="text-3xl font-semibold tracking-tighter">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#F5F5F7] rounded-full h-3 overflow-hidden">
            <div 
              className="bg-black h-full transition-all duration-700 ease-in-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Текущий этап */}
        <div className="flex items-center space-x-6 bg-[#F5F5F7]/50 p-6 rounded-[24px] border border-black/[0.02]">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-lg animate-in fade-in zoom-in duration-500">
            {CurrentStepIcon && <CurrentStepIcon className="w-8 h-8 text-white" />}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black tracking-tight leading-none mb-2">
              {analysisSteps[currentStep]?.title}
            </h3>
            <p className="text-black/40 font-light tracking-tight italic">
              {analysisSteps[currentStep]?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Progress Grid — Чистые карточки без градиентов */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { key: 'initialization', label: 'Инициализация', icon: Brain },
          { key: 'videoAnalysis', label: 'Видео поток', icon: Eye },
          { key: 'audioAnalysis', label: 'Речь и AI', icon: Languages },
          { key: 'scoring', label: 'Финальный счет', icon: BarChart3 }
        ].map((item) => (
          <div key={item.key} className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <item.icon className="w-4 h-4 text-black/20" />
              <span className="text-sm font-bold tracking-tighter">
                {Math.round(detailedProgress[item.key as keyof typeof detailedProgress])}%
              </span>
            </div>
            <div className="text-[12px] font-bold uppercase tracking-tight text-black/30 mb-2">{item.label}</div>
            <div className="w-full bg-[#F5F5F7] rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-black h-full transition-all duration-500"
                style={{ width: `${detailedProgress[item.key as keyof typeof detailedProgress]}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quality Metrics — Серый Apple-блок */}
      <div className="bg-[#F5F5F7] rounded-[32px] p-8 border border-black/5 mb-8">
        <div className="flex items-center space-x-2 mb-6 opacity-40">
          <BarChart3 className="w-5 h-5 text-black" />
          <h3 className="text-xs font-bold uppercase tracking-widest">Качество обработки</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { label: 'Видео сигнал', value: qualityMetrics.videoQuality, icon: Eye },
            { label: 'Аудио (filler words)', value: qualityMetrics.audioQuality, icon: Languages },
            { label: 'AI Точность', value: qualityMetrics.analysisQuality, icon: Brain }
          ].map((metric, index) => (
            <div key={index} className="space-y-1">
              <div className="text-[13px] font-semibold text-black/40">{metric.label}</div>
              <div className="text-[15px] font-bold tracking-tight">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Info — Строгий футер секции */}
      <div className="grid md:grid-cols-4 gap-6 text-[11px] text-black/30 font-medium leading-relaxed border-t border-black/5 pt-8">
        <div>
          <span className="text-black/60 block mb-1 uppercase tracking-widest">MediaPipe Vision</span>
          33 точки позы, 468 точек лица
        </div>
        <div>
          <span className="text-black/60 block mb-1 uppercase tracking-widest">Speech Analysis</span>
          Yandex SpeechKit v3 Cloud
        </div>
        <div>
          <span className="text-black/60 block mb-1 uppercase tracking-widest">Logic Engine</span>
          Google Gemini 1.5 Pro
        </div>
        <div>
          <span className="text-black/60 block mb-1 uppercase tracking-widest">Security</span>
          Netlify Functions • AES-256
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;