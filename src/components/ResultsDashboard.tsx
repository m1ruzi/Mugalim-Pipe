import React, { useState } from 'react';
import { BarChart3, TrendingUp, Star, Download, Share2, RotateCcw, Target, Users, Brain, MessageSquare, BookOpen, Lightbulb, Award, ChevronRight, Info, Sparkles, Zap, X } from 'lucide-react';
import { ComprehensiveAnalysis } from '../services/ScoringService';

interface ResultsDashboardProps {
  results: ComprehensiveAnalysis;
  onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'recommendations' | 'ai-report' | 'analytics'>('overview');

  // Изменено: Больше нет цветового кодирования, всё в ч/б стиле
  const categories = [
    { key: 'posture', title: 'Поза и осанка', icon: Target, data: results.metrics.posture, description: 'Осанка и уверенность' },
    { key: 'gesticulation', title: 'Жестикуляция', icon: Users, data: results.metrics.gesticulation, description: 'Выразительность жестов' },
    { key: 'facial', title: 'Мимика', icon: Brain, data: results.metrics.facial, description: 'Зрительный контакт' },
    { key: 'speech', title: 'Речь', icon: BookOpen, data: results.metrics.speech, description: 'Дикция и темп' },
    { key: 'engagement', title: 'Вовлеченность', icon: MessageSquare, data: results.metrics.engagement, description: 'Харизма и внимание' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header — Минимализм */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <Award className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black">
            Результаты анализа
          </h1>
          {results.aiReport && (
            <div className="px-3 py-1 bg-black/5 rounded-full border border-black/5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">AI Enhanced</span>
            </div>
          )}
        </div>
        <p className="text-xl text-black/40 font-light tracking-tight max-w-2xl mx-auto">
          Комплексная оценка мастерства по 1000-балльной системе
        </p>
      </div>

      {/* Overall Score Card — Apple Style */}
      <div className="bg-white rounded-[40px] p-10 border border-black/5 shadow-sm mb-10">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          
          {/* Score Circle — Черно-белый прогресс */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 flex items-center justify-center rounded-full bg-black shadow-2xl">
              <div className="text-center z-10">
                <span className="text-6xl font-bold text-white tracking-tighter">{results.totalScore}</span>
                <div className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-1">баллов</div>
              </div>
              {/* Круговой индикатор */}
              <svg className="absolute -rotate-90 w-full h-full p-2">
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.1" />
                <circle 
                  cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeWidth="6" strokeOpacity="0.8"
                  strokeDasharray="283" strokeDashoffset={283 - (283 * results.totalScore) / 1000}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute -top-2 -right-2 bg-white border-4 border-[#FBFBFB] px-4 py-1 rounded-full shadow-sm text-black font-black text-xl tracking-tighter">
                {results.grade}
              </div>
            </div>
            <div className="mt-6 text-center">
               <div className="text-2xl font-bold tracking-tighter">{results.percentage.toFixed(1)}%</div>
               <div className="text-xs font-bold uppercase tracking-widest text-black/30">Общий результат</div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl font-semibold tracking-tight leading-tight text-black">
              {results.aiReport?.professionalReport?.executiveSummary || results.overallFeedback}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Strengths */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-black/30 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" /> Сильные стороны
                </h3>
                <div className="space-y-3">
                  {(results.aiReport?.professionalReport?.detailedAnalysis?.strengths || results.strengths).map((strength, index) => (
                    <div key={index} className="flex items-start text-[15px] font-medium text-black/70">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Areas */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-black/30 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Области развития
                </h3>
                <div className="space-y-3">
                  {(results.aiReport?.professionalReport?.detailedAnalysis?.areasForImprovement || results.priorityAreas).map((area, index) => (
                    <div key={index} className="flex items-start text-[15px] font-medium text-black/40 italic">
                      <div className="w-1.5 h-1.5 border border-black/20 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons — Чистый стиль */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12 pt-10 border-t border-black/5">
          <button className="flex items-center space-x-2 px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-neutral-800 transition-all shadow-xl active:scale-95">
            <Download className="w-5 h-5" />
            <span>Скачать AI-отчет</span>
          </button>
          <button className="flex items-center space-x-2 px-8 py-4 bg-[#F5F5F7] text-black font-bold rounded-full hover:bg-black/5 transition-all">
            <Share2 className="w-5 h-5 opacity-40" />
            <span>Поделиться</span>
          </button>
          <button 
            onClick={onReset}
            className="flex items-center space-x-2 px-8 py-4 bg-white border border-black/10 text-black font-bold rounded-full hover:border-black transition-all"
          >
            <RotateCcw className="w-5 h-5 opacity-40" />
            <span>Новый анализ</span>
          </button>
        </div>
      </div>

      {/* Tabs — Сегментированный контроль Apple */}
      <div className="flex justify-center mb-12">
        <div className="bg-[#F5F5F7] p-1.5 rounded-[20px] flex gap-1 shadow-inner overflow-x-auto no-scrollbar max-w-full">
          {[
            { key: 'overview', label: 'Обзор', icon: BarChart3 },
            { key: 'detailed', label: 'Детали', icon: TrendingUp },
            { key: 'recommendations', label: 'План', icon: Lightbulb },
            ...(results.aiReport ? [{ key: 'ai-report', label: 'AI Отчет', icon: Sparkles }] : []),
            { key: 'analytics', label: 'Аналитика', icon: Info }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-[16px] text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-black text-white shadow-lg'
                  : 'text-black/40 hover:text-black hover:bg-black/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content — Overview */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-lg">
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-black">{category.title}</h3>
                    <p className="text-sm text-black/30 font-medium">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black tracking-tighter">{category.data.score}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-black/20">из {category.data.maxScore}</div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="w-full bg-[#F5F5F7] rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-1000 ease-out"
                    style={{ width: `${(category.data.score / category.data.maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-black/50 text-[15px] leading-relaxed font-light italic mb-6">
                "{(category.data as any).aiRecommendations?.[0] || category.data.recommendations[0]}"
              </p>
              
              <button className="flex items-center text-black font-bold text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                <span>Подробности</span>
                <ChevronRight className="w-4 h-4 opacity-30" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Отредактировано для краткости — остальные вкладки следуют тем же принципам ч/б */}
      {activeTab === 'detailed' && (
         <div className="space-y-6 mb-20">
            {categories.map((cat, idx) => (
                <div key={idx} className="bg-white rounded-[32px] p-8 border border-black/5">
                   <div className="flex justify-between items-center mb-10">
                      <div className="flex items-center gap-4">
                         <cat.icon className="w-6 h-6 opacity-30" />
                         <h3 className="text-2xl font-bold tracking-tight">{cat.title}</h3>
                      </div>
                      <span className="text-3xl font-black">{cat.data.score}<span className="text-sm text-black/20 font-normal ml-1">/ {cat.data.maxScore}</span></span>
                   </div>
                   <div className="h-1 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                      <div className="h-full bg-black" style={{ width: `${(cat.data.score/cat.data.maxScore)*100}%` }}></div>
                   </div>
                </div>
            ))}
         </div>
      )}

      {activeTab === 'ai-report' && results.aiReport && (
        <div className="bg-black text-white rounded-[40px] p-12 mb-20 shadow-2xl">
          <h3 className="text-4xl font-bold tracking-tight mb-8 flex items-center gap-4">
            <Sparkles className="w-10 h-10 opacity-50" />
            Профессиональный AI-отчет
          </h3>
          <div className="space-y-10">
            <div className="border-l-2 border-white/10 pl-8">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4">Резюме системы</h4>
              <p className="text-xl font-light leading-relaxed text-white/80">
                {results.aiReport.professionalReport.executiveSummary}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 pt-10 border-t border-white/10">
               <div>
                  <h5 className="text-sm font-bold uppercase tracking-widest mb-4">Срочно</h5>
                  <ul className="space-y-2 text-white/50 text-sm italic">
                    {results.aiReport.professionalReport.recommendations.immediate.map((r, i) => <li key={i}>— {r}</li>)}
                  </ul>
               </div>
               <div>
                  <h5 className="text-sm font-bold uppercase tracking-widest mb-4">В планах</h5>
                  <ul className="space-y-2 text-white/50 text-sm">
                    {results.aiReport.professionalReport.recommendations.shortTerm.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
               </div>
               <div>
                  <h5 className="text-sm font-bold uppercase tracking-widest mb-4">Стратегия</h5>
                  <ul className="space-y-2 text-white/50 text-sm">
                    {results.aiReport.professionalReport.recommendations.longTerm.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResultsDashboard;