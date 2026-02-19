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
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="mb-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-carmine-600 rounded-xl flex items-center justify-center shadow-md mx-auto mb-4">
            <Award className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-600 tracking-tight text-gray-900 mb-2">
            Результаты анализа
          </h1>
          {results.aiReport && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-carmine-50 rounded-full border border-carmine-100">
              <Sparkles className="w-4 h-4 text-carmine-600" />
              <span className="text-xs font-600 uppercase tracking-wide text-carmine-700">AI Enhanced</span>
            </div>
          )}
        </div>
        <p className="text-base md:text-lg text-gray-500 font-400 tracking-tight max-w-2xl mx-auto px-4">
          Комплексная оценка мастерства по 1000-балльной системе
        </p>
      </div>

      {/* Overall Score Card */}
      <div className="bg-apple-gray-50 rounded-3xl md:rounded-4xl p-6 md:p-10 border border-apple-gray-200 shadow-sm mb-8 md:mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-center">
          
          {/* Score Circle */}
          <div className="flex flex-col items-center order-2 lg:order-1">
            <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center rounded-full bg-carmine-600 shadow-lg">
              <div className="text-center z-10">
                <span className="text-4xl md:text-6xl font-700 text-white tracking-tighter">{results.totalScore}</span>
                <div className="text-white/70 text-xs md:text-sm font-500 uppercase tracking-wide mt-1">баллов</div>
              </div>
              {/* Progress Circle */}
              <svg className="absolute -rotate-90 w-full h-full p-2">
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
                <circle 
                  cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeWidth="6" strokeOpacity="1"
                  strokeDasharray="283" strokeDashoffset={283 - (283 * results.totalScore) / 1000}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-white border-4 md:border-6 border-white px-2 md:px-3 py-0.5 rounded-full shadow-md text-gray-900 font-700 text-lg md:text-2xl tracking-tighter">
                {results.grade}
              </div>
            </div>
            <div className="mt-4 md:mt-6 text-center">
               <div className="text-xl md:text-2xl font-700 text-gray-900">{results.percentage.toFixed(1)}%</div>
               <div className="text-xs font-600 uppercase tracking-wide text-gray-400 mt-1">Общий результат</div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1 lg:order-2">
            <h2 className="text-xl md:text-2xl font-600 tracking-tight leading-tight text-gray-900">
              {results.aiReport?.professionalReport?.executiveSummary || results.overallFeedback}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div>
                <h3 className="text-xs font-700 uppercase tracking-wide text-gray-600 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-carmine-600" /> Сильные стороны
                </h3>
                <div className="space-y-2">
                  {(results.aiReport?.professionalReport?.detailedAnalysis?.strengths || results.strengths).map((strength: string, index: number) => (
                    <div key={index} className="flex items-start text-sm md:text-base font-400 text-gray-700">
                      <div className="w-2 h-2 bg-carmine-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Areas */}
              <div>
                <h3 className="text-xs font-700 uppercase tracking-wide text-gray-600 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-carmine-600" /> Области развития
                </h3>
                <div className="space-y-2">
                  {(results.aiReport?.professionalReport?.detailedAnalysis?.areasForImprovement || results.priorityAreas).map((area: string, index: number) => (
                    <div key={index} className="flex items-start text-sm md:text-base font-400 text-gray-600">
                      <div className="w-2 h-2 bg-carmine-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 md:mt-12 pt-8 md:pt-10 border-t border-gray-200">
          <button 
            onClick={generatePDFReport}
            className="flex items-center space-x-2 px-6 md:px-8 py-3 md:py-4 bg-carmine-600 text-white font-600 rounded-full hover:bg-carmine-700 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm md:text-base"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            <span>Скачать отчет</span>
          </button>
          <button className="flex items-center space-x-2 px-6 md:px-8 py-3 md:py-4 bg-gray-100 text-gray-900 font-600 rounded-full hover:bg-gray-200 transition-all text-sm md:text-base">
            <Share2 className="w-4 h-4 md:w-5 md:h-5 opacity-60" />
            <span>Поделиться</span>
          </button>
          <button 
            onClick={onReset}
            className="flex items-center space-x-2 px-6 md:px-8 py-3 md:py-4 bg-apple-gray-50 border border-apple-gray-200 text-gray-900 font-600 rounded-full hover:bg-apple-gray-100 transition-all text-sm md:text-base"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5 opacity-60" />
            <span>Новый анализ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;