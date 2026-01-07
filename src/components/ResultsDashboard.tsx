import React, { useState } from 'react';
import { BarChart3, TrendingUp, Star, Download, Share2, RotateCcw, Target, Users, Brain, MessageSquare, BookOpen, Lightbulb, Award, ChevronRight, Info, Sparkles } from 'lucide-react';
import { ComprehensiveAnalysis } from '../services/ScoringService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsDashboardProps {
  results: ComprehensiveAnalysis;
  onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'recommendations' | 'ai-report' | 'analytics'>('overview');

  const generatePDFReport = async () => {
    if (!results.aiReport) {
      alert('AI-отчет недоступен для скачивания');
      return;
    }

    try {
      console.log('Начинаем генерацию PDF...');

      // Создаем временный HTML элемент с отчетом
      const reportElement = document.createElement('div');
      reportElement.style.width = '800px';
      reportElement.style.padding = '40px';
      reportElement.style.fontFamily = 'Arial, sans-serif';
      reportElement.style.backgroundColor = 'white';
      reportElement.style.color = 'black';
      reportElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">AI Анализ мастерства преподавания</h1>
          <p style="font-size: 18px;">Общий балл: ${results.totalScore}/1000 (${results.percentage.toFixed(1)}%)</p>
          <p style="font-size: 16px;">Оценка: ${results.grade}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">Резюме:</h2>
          <p style="line-height: 1.6;">${results.aiReport.professionalReport.executiveSummary}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">Сильные стороны:</h2>
          <ul style="line-height: 1.8;">
            ${results.aiReport.professionalReport.detailedAnalysis.strengths.map((s: string) => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">Области для улучшения:</h2>
          <ul style="line-height: 1.8;">
            ${results.aiReport.professionalReport.detailedAnalysis.areasForImprovement.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">Рекомендации:</h2>
          
          <h3 style="font-size: 16px; margin-bottom: 5px;">Немедленные действия:</h3>
          <ul style="line-height: 1.6; margin-bottom: 15px;">
            ${results.aiReport.professionalReport.recommendations.immediate.map((r: string) => `<li>${r}</li>`).join('')}
          </ul>

          <h3 style="font-size: 16px; margin-bottom: 5px;">Краткосрочные цели:</h3>
          <ul style="line-height: 1.6; margin-bottom: 15px;">
            ${results.aiReport.professionalReport.recommendations.shortTerm.map((r: string) => `<li>${r}</li>`).join('')}
          </ul>

          <h3 style="font-size: 16px; margin-bottom: 5px;">Долгосрочные цели:</h3>
          <ul style="line-height: 1.6;">
            ${results.aiReport.professionalReport.recommendations.longTerm.map((r: string) => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 10px;">План действий:</h2>
          
          <h3 style="font-size: 16px; margin-bottom: 5px;">Неделя 1:</h3>
          <ul style="line-height: 1.6; margin-bottom: 10px;">
            ${results.aiReport.professionalReport.actionPlan.week1.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>

          <h3 style="font-size: 16px; margin-bottom: 5px;">Неделя 2:</h3>
          <ul style="line-height: 1.6; margin-bottom: 10px;">
            ${results.aiReport.professionalReport.actionPlan.week2.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>

          <h3 style="font-size: 16px; margin-bottom: 5px;">Неделя 3:</h3>
          <ul style="line-height: 1.6; margin-bottom: 10px;">
            ${results.aiReport.professionalReport.actionPlan.week3.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>

          <h3 style="font-size: 16px; margin-bottom: 5px;">Неделя 4:</h3>
          <ul style="line-height: 1.6;">
            ${results.aiReport.professionalReport.actionPlan.week4.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>

        <div>
          <h2 style="font-size: 18px; margin-bottom: 10px;">Мотивация:</h2>
          <p style="font-style: italic; line-height: 1.6;">${results.aiReport.motivationalMessage}</p>
        </div>
      `;

      // Добавляем элемент в DOM временно
      document.body.appendChild(reportElement);

      // Конвертируем в canvas
      console.log('Конвертируем HTML в canvas...');
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Удаляем временный элемент
      document.body.removeChild(reportElement);

      // Создаем PDF
      console.log('Создаем PDF...');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Добавляем первую страницу
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Добавляем дополнительные страницы если нужно
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Скачиваем PDF
      console.log('Скачиваем PDF...');
      pdf.save(`AI-отчет-анализа-${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF успешно создан и скачан');

    } catch (error) {
      console.error('Ошибка генерации PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('Детали ошибки:', errorMessage, errorStack);
      alert(`Ошибка при генерации PDF отчета: ${errorMessage}`);
    }
  };

  // Изменено: Больше нет цветового кодирования, всё в ч/б стиле
  const categories = [
    { key: 'posture', title: 'Поза и осанка', icon: Target, data: results.metrics.posture, description: 'Осанка и уверенность' },
    { key: 'gesticulation', title: 'Жестикуляция', icon: Users, data: results.metrics.gesticulation, description: 'Выразительность жестов' },
    { key: 'facial', title: 'Мимика', icon: Brain, data: results.metrics.facial, description: 'Зрительный контакт' },
    { key: 'speech', title: 'Речь', icon: BookOpen, data: results.metrics.speech, description: 'Дикция и темп' },
    { key: 'engagement', title: 'Вовлеченность', icon: MessageSquare, data: results.metrics.engagement, description: 'Харизма и внимание' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      {/* Header — Минимализм */}
      <div className="text-center mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black">
            Результаты анализа
          </h1>
          {results.aiReport && (
            <div className="px-3 py-1 bg-black/5 rounded-full border border-black/5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">AI Enhanced</span>
            </div>
          )}
        </div>
        <p className="text-lg md:text-xl text-black/40 font-light tracking-tight max-w-2xl mx-auto px-4">
          Комплексная оценка мастерства по 1000-балльной системе
        </p>
      </div>

      {/* Overall Score Card — Apple Style */}
      <div className="bg-white rounded-[24px] md:rounded-[40px] p-6 md:p-10 border border-black/5 shadow-sm mb-8 md:mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-center">
          
          {/* Score Circle — Черно-белый прогресс */}
          <div className="flex flex-col items-center order-2 lg:order-1">
            <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center rounded-full bg-black shadow-2xl">
              <div className="text-center z-10">
                <span className="text-4xl md:text-6xl font-bold text-white tracking-tighter">{results.totalScore}</span>
                <div className="text-white/40 text-[10px] md:text-[11px] font-bold uppercase tracking-widest mt-1">баллов</div>
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
              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-white border-2 md:border-4 border-[#FBFBFB] px-2 md:px-4 py-1 rounded-full shadow-sm text-black font-black text-sm md:text-xl tracking-tighter">
                {results.grade}
              </div>
            </div>
            <div className="mt-4 md:mt-6 text-center">
               <div className="text-xl md:text-2xl font-bold tracking-tighter">{results.percentage.toFixed(1)}%</div>
               <div className="text-xs font-bold uppercase tracking-widest text-black/30">Общий результат</div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8 order-1 lg:order-2">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-black">
              {results.aiReport?.professionalReport?.executiveSummary || results.overallFeedback}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Strengths */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-black/30 mb-3 md:mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" /> Сильные стороны
                </h3>
                <div className="space-y-2 md:space-y-3">
                  {(results.aiReport?.professionalReport?.detailedAnalysis?.strengths || results.strengths).map((strength: string, index: number) => (
                    <div key={index} className="flex items-start text-[14px] md:text-[15px] font-medium text-black/70">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mr-2 md:mr-3 mt-2 flex-shrink-0"></div>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Areas */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-black/30 mb-3 md:mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Области развития
                </h3>
                <div className="space-y-2 md:space-y-3">
                  {(results.aiReport?.professionalReport?.detailedAnalysis?.areasForImprovement || results.priorityAreas).map((area: string, index: number) => (
                    <div key={index} className="flex items-start text-[14px] md:text-[15px] font-medium text-black/40 italic">
                      <div className="w-1.5 h-1.5 border border-black/20 rounded-full mr-2 md:mr-3 mt-2 flex-shrink-0"></div>
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons — Чистый стиль */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 md:mt-12 pt-8 md:pt-10 border-t border-black/5">
          <button 
            onClick={generatePDFReport}
            className="flex items-center space-x-2 px-6 md:px-8 py-3 md:py-4 bg-black text-white font-bold rounded-full hover:bg-neutral-800 transition-all shadow-xl active:scale-95 text-sm md:text-base"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            <span>Скачать AI-отчет</span>
          </button>
          <button className="flex items-center space-x-2 px-6 md:px-8 py-3 md:py-4 bg-[#F5F5F7] text-black font-bold rounded-full hover:bg-black/5 transition-all text-sm md:text-base">
            <Share2 className="w-4 h-4 md:w-5 md:h-5 opacity-40" />
            <span>Поделиться</span>
          </button>
          <button 
            onClick={onReset}
            className="flex items-center space-x-2 px-6 md:px-8 py-3 md:py-4 bg-white border border-black/10 text-black font-bold rounded-full hover:border-black transition-all text-sm md:text-base"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5 opacity-40" />
            <span>Новый анализ</span>
          </button>
        </div>
      </div>

      {/* Tabs — Сегментированный контроль Apple */}
      <div className="flex justify-center mb-8 md:mb-12 px-4">
        <div className="bg-[#F5F5F7] p-1 md:p-1.5 rounded-[16px] md:rounded-[20px] flex gap-1 shadow-inner overflow-x-auto no-scrollbar max-w-full">
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
              className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-6 py-2 md:py-2.5 rounded-[12px] md:rounded-[16px] text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-black text-white shadow-lg'
                  : 'text-black/40 hover:text-black hover:bg-black/5'
              }`}
            >
              <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content — Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-16 md:mb-20">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-black/5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-6 md:mb-8">
                <div className="flex items-center space-x-3 md:space-x-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black flex items-center justify-center shadow-lg">
                    <category.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight text-black">{category.title}</h3>
                    <p className="text-xs md:text-sm text-black/30 font-medium">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-black tracking-tighter">{category.data.score}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-black/20">из {category.data.maxScore}</div>
                </div>
              </div>
              
              <div className="mb-4 md:mb-6">
                <div className="w-full bg-[#F5F5F7] rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-1000 ease-out"
                    style={{ width: `${(category.data.score / category.data.maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-black/50 text-[14px] md:text-[15px] leading-relaxed font-light italic mb-4 md:mb-6">
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
                    {results.aiReport.professionalReport.recommendations.immediate.map((r: string, i: number) => <li key={i}>— {r}</li>)}
                  </ul>
               </div>
               <div>
                  <h5 className="text-sm font-bold uppercase tracking-widest mb-4">В планах</h5>
                  <ul className="space-y-2 text-white/50 text-sm">
                    {results.aiReport.professionalReport.recommendations.shortTerm.map((r: string, i: number) => <li key={i}>• {r}</li>)}
                  </ul>
               </div>
               <div>
                  <h5 className="text-sm font-bold uppercase tracking-widest mb-4">Стратегия</h5>
                  <ul className="space-y-2 text-white/50 text-sm">
                    {results.aiReport.professionalReport.recommendations.longTerm.map((r: string, i: number) => <li key={i}>• {r}</li>)}
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