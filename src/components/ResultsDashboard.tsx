import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Star, Download, Share2, RotateCcw, Target, Users, Brain, MessageSquare, BookOpen, Award, Sparkles } from 'lucide-react';
import { ComprehensiveAnalysis } from '../services/ScoringService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

interface ResultsDashboardProps {
  results: ComprehensiveAnalysis;
  onReset: () => void;
  onSaveReport?: (pdfBlob: Blob, fileName: string) => Promise<void>;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, onReset, onSaveReport }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'analytics'>('overview');
  const [saving, setSaving] = useState(false);

  // Debug - выводим данные в консоль
  useEffect(() => {
    console.log('📊 ResultsDashboard Data:', {
      totalScore: results.totalScore,
      percentage: results.percentage,
      strengths: results.strengths,
      priorityAreas: results.priorityAreas,
      hasAiReport: !!results.aiReport,
      metrics: {
        posture: results.metrics.posture,
        speech: results.metrics.speech
      }
    });
  }, [results]);

  // Проверка на валидность данных
  if (!results || !results.metrics) {
    console.error('❌ ResultsDashboard: Invalid results data');
    return (
      <div className="liquid-glass p-8 text-center">
        <h2 className="text-2xl font-700 text-[var(--text-primary)] mb-4">Ошибка загрузки результатов</h2>
        <p className="text-[var(--text-secondary)] mb-6">Данные анализа повреждены</p>
        <button onClick={onReset} className="liquid-button liquid-button-primary px-6 py-3">
          Попробовать снова
        </button>
      </div>
    );
  }

  // Функция для получения сильных сторон
  const getStrengths = (data: any): string[] => {
    console.log('🔍 getStrengths called with:', data);
    // Пробуем разные поля где могут быть сильные стороны
    if (data.strengths && data.strengths.length > 0) {
      console.log('✅ Found strengths:', data.strengths);
      return data.strengths;
    }
    if (data.positiveAspects && data.positiveAspects.length > 0) return data.positiveAspects;
    if (data.goodPoints && data.goodPoints.length > 0) return data.goodPoints;
    // Если нет явных сильных сторон, берем первые рекомендации как позитивные
    if (data.recommendations && data.recommendations.length > 0) {
      return data.recommendations.slice(0, 2);
    }
    console.log('⚠️ No strengths found, returning empty array');
    return [];
  };

  // Функция для получения зон роста/рекомендаций
  const getImprovements = (data: any): string[] => {
    console.log('🔍 getImprovements called with:', data);
    // Пробуем разные поля где могут быть рекомендации
    if (data.areasForImprovement && data.areasForImprovement.length > 0) {
      console.log('✅ Found areasForImprovement:', data.areasForImprovement);
      return data.areasForImprovement;
    }
    if (data.issues && data.issues.length > 0) return data.issues;
    if (data.aiRecommendations && data.aiRecommendations.length > 0) return data.aiRecommendations;
    if (data.improvementSuggestions && data.improvementSuggestions.length > 0) return data.improvementSuggestions;
    // Если нет явных рекомендаций, берем остальные рекомендации
    if (data.recommendations && data.recommendations.length > 2) {
      return data.recommendations.slice(2, 5);
    }
    console.log('⚠️ No improvements found, returning empty array');
    return [];
  };

  const radarData = [
    { subject: 'Поза', A: results.metrics.posture.score, fullMark: 200 },
    { subject: 'Жесты', A: results.metrics.gesticulation.score, fullMark: 200 },
    { subject: 'Мимика', A: results.metrics.facial.score, fullMark: 200 },
    { subject: 'Речь', A: results.metrics.speech.score, fullMark: 200 },
    { subject: 'Вовлеченность', A: results.metrics.engagement.score, fullMark: 200 },
  ];

  const barData = [
    { name: 'Поза', score: results.metrics.posture.score, max: 200, percentage: Math.round((results.metrics.posture.score / 200) * 100) },
    { name: 'Жесты', score: results.metrics.gesticulation.score, max: 200, percentage: Math.round((results.metrics.gesticulation.score / 200) * 100) },
    { name: 'Мимика', score: results.metrics.facial.score, max: 200, percentage: Math.round((results.metrics.facial.score / 200) * 100) },
    { name: 'Речь', score: results.metrics.speech.score, max: 200, percentage: Math.round((results.metrics.speech.score / 200) * 100) },
    { name: 'Вовлеченность', score: results.metrics.engagement.score, max: 200, percentage: Math.round((results.metrics.engagement.score / 200) * 100) },
  ];

  const generatePDFReport = async (saveToDb: boolean = false) => {
    try {
      setSaving(true);
      
      console.log('📄 Generating PDF...', {
        hasAiReport: !!results.aiReport,
        totalScore: results.totalScore,
        strengths: results.strengths?.length,
        priorityAreas: results.priorityAreas?.length
      });

      const reportElement = document.createElement('div');
      reportElement.style.width = '800px';
      reportElement.style.padding = '40px';
      reportElement.style.fontFamily = 'Arial, sans-serif';
      reportElement.style.backgroundColor = 'white';
      reportElement.style.color = 'black';

      // Используем AI отчет ИЛИ fallback данные
      const hasAiReport = results.aiReport?.professionalReport;
      
      reportElement.innerHTML = `
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="font-size:28px;margin-bottom:10px;color:#800020;">MugalimPipe - Анализ урока</h1>
          <p style="font-size:18px;color:#666;">Результаты анализа</p>
        </div>
        
        <div style="background:#f5f5f7;padding:20px;border-radius:12px;margin-bottom:30px;">
          <div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:48px;font-weight:700;color:#800020;margin-bottom:5px;">${results.totalScore}/1000</div>
            <div style="font-size:18px;color:#666;">Общий балл (${results.grade})</div>
          </div>
          <div style="display:flex;justify-content:space-around;text-align:center;">
            <div>
              <div style="font-size:24px;font-weight:600;color:#800020;">${results.percentage.toFixed(1)}%</div>
              <div style="font-size:12px;color:#999;">Процент</div>
            </div>
          </div>
        </div>

        ${hasAiReport ? `
          <div style="margin-bottom:30px;">
            <h2 style="font-size:20px;color:#800020;margin-bottom:15px;border-bottom:2px solid #800020;padding-bottom:5px;">Резюме</h2>
            <p style="line-height:1.6;color:#333;">${results.aiReport.professionalReport.executiveSummary || 'Нет данных'}</p>
          </div>

          <div style="margin-bottom:30px;">
            <h2 style="font-size:20px;color:#800020;margin-bottom:15px;border-bottom:2px solid #800020;padding-bottom:5px;">Сильные стороны</h2>
            <ul style="line-height:1.8;color:#333;">
              ${(results.aiReport.professionalReport.detailedAnalysis.strengths || []).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom:30px;">
            <h2 style="font-size:20px;color:#800020;margin-bottom:15px;border-bottom:2px solid #800020;padding-bottom:5px;">Зоны роста</h2>
            <ul style="line-height:1.8;color:#333;">
              ${(results.aiReport.professionalReport.detailedAnalysis.areasForImprovement || []).map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom:30px;">
            <h2 style="font-size:20px;color:#800020;margin-bottom:15px;border-bottom:2px solid #800020;padding-bottom:5px;">Рекомендации</h2>
            
            <h3 style="font-size:16px;color:#666;margin:15px 0 8px 0;">Немедленные действия:</h3>
            <ul style="line-height:1.6;color:#333;">
              ${(results.aiReport.professionalReport.recommendations.immediate || []).map(r => `<li>${r}</li>`).join('')}
            </ul>

            <h3 style="font-size:16px;color:#666;margin:15px 0 8px 0;">Краткосрочные цели:</h3>
            <ul style="line-height:1.6;color:#333;">
              ${(results.aiReport.professionalReport.recommendations.shortTerm || []).map(r => `<li>${r}</li>`).join('')}
            </ul>

            <h3 style="font-size:16px;color:#666;margin:15px 0 8px 0;">Долгосрочные цели:</h3>
            <ul style="line-height:1.6;color:#333;">
              ${(results.aiReport.professionalReport.recommendations.longTerm || []).map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom:30px;">
            <h2 style="font-size:20px;color:#800020;margin-bottom:15px;border-bottom:2px solid #800020;padding-bottom:5px;">План действий</h2>
            
            <h3 style="font-size:16px;color:#666;margin:15px 0 8px 0;">Неделя 1:</h3>
            <ul style="line-height:1.6;color:#333;">
              ${(results.aiReport.professionalReport.actionPlan.week1 || []).map(a => `<li>${a}</li>`).join('')}
            </ul>

            <h3 style="font-size:16px;color:#666;margin:15px 0 8px 0;">Неделя 2:</h3>
            <ul style="line-height:1.6;color:#333;">
              ${(results.aiReport.professionalReport.actionPlan.week2 || []).map(a => `<li>${a}</li>`).join('')}
            </ul>

            <h3 style="font-size:16px;color:#666;margin:15px 0 8px 0;">Неделя 3:</h3>
            <ul style="line-height:1.6;color:#333;">
              ${(results.aiReport.professionalReport.actionPlan.week3 || []).map(a => `<li>${a}</li>`).join('')}
            </ul>

            <h3 style="font-size:16px;color:#666;margin:15px 0 8px 0;">Неделя 4:</h3>
            <ul style="line-height:1.6;color:#333;">
              ${(results.aiReport.professionalReport.actionPlan.week4 || []).map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>

          <div style="background:#f5f5f7;padding:20px;border-radius:12px;margin-top:30px;">
            <p style="font-style:italic;line-height:1.6;color:#666;text-align:center;">${results.aiReport.motivationalMessage || ''}</p>
          </div>
        ` : `
          <div style="margin-bottom:30px;">
            <h2 style="font-size:20px;color:#800020;margin-bottom:15px;border-bottom:2px solid #800020;padding-bottom:5px;">Сильные стороны</h2>
            <ul style="line-height:1.8;color:#333;">
              ${(results.strengths || ['Анализ завершен', 'Данные обрабатываются']).map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-bottom:30px;">
            <h2 style="font-size:20px;color:#800020;margin-bottom:15px;border-bottom:2px solid #800020;padding-bottom:5px;">Зоны роста</h2>
            <ul style="line-height:1.8;color:#333;">
              ${(results.priorityAreas || ['Продолжать развитие', 'Работать над навыками']).map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>

          <div style="background:#f5f5f7;padding:20px;border-radius:12px;margin-top:30px;">
            <p style="font-style:italic;line-height:1.6;color:#666;text-align:center;">Продолжайте совершенствоваться! Каждый урок - возможность стать лучше.</p>
          </div>
        `}

        <div style="margin-top:40px;padding-top:20px;border-top:1px solid #ddd;text-align:center;color:#999;font-size:12px;">
          <p>Сгенерировано MugalimPipe ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>
      `;

      document.body.appendChild(reportElement);
      
      console.log('📸 Creating canvas from HTML...');
      const canvas = await html2canvas(reportElement, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(reportElement);
      
      console.log('📄 Creating PDF...');
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

      const pdfBlob = pdf.output('blob');
      const fileName = `AI-отчет-${new Date().toISOString().split('T')[0]}.pdf`;

      console.log('💾 PDF created, saving...', { fileName, size: pdfBlob.size });

      if (saveToDb && onSaveReport) {
        await onSaveReport(pdfBlob, fileName);
      }

      // Скачиваем PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ PDF downloaded successfully');
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert('Ошибка PDF: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { key: 'posture', title: 'Поза и осанка', icon: Target, data: results.metrics.posture, description: 'Осанка и уверенность' },
    { key: 'gesticulation', title: 'Жестикуляция', icon: Users, data: results.metrics.gesticulation, description: 'Выразительность жестов' },
    { key: 'facial', title: 'Мимика', icon: Brain, data: results.metrics.facial, description: 'Зрительный контакт' },
    { key: 'speech', title: 'Речь', icon: BookOpen, data: results.metrics.speech, description: 'Дикция и темп' },
    { key: 'engagement', title: 'Вовлеченность', icon: MessageSquare, data: results.metrics.engagement, description: 'Харизма и внимание' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="liquid-glass liquid-button-primary w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-700 tracking-tight text-[var(--text-primary)] mb-2">Результаты</h1>
        {results.aiReport && (
          <div className="liquid-badge">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-700 uppercase">AI Enhanced</span>
          </div>
        )}
        <p className="text-lg text-[var(--text-secondary)] mt-4">
          Ваш результат: <span className="text-2xl font-700 text-gradient">{results.totalScore}/1000</span> баллов
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-8">
        <div className="liquid-glass p-2 inline-flex">
          {(['overview', 'analytics', 'detailed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-700 transition-all ${
                activeTab === tab ? 'liquid-button liquid-button-primary' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab === 'overview' && '📊 Обзор'}
              {tab === 'analytics' && '📈 Графики'}
              {tab === 'detailed' && '📋 Детали'}
            </button>
          ))}
        </div>
      </motion.div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="liquid-glass p-8 md:p-10 mb-6">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Score Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[var(--accent)] via-[var(--accent-light)] to-[var(--accent-dark)] shadow-lg flex items-center justify-center">
                <div className="text-center z-10">
                  <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-5xl md:text-6xl font-700 text-white">{results.totalScore}</motion.span>
                  <div className="text-white/70 text-xs uppercase mt-1">из 1000 баллов</div>
                </div>
              </div>
              <div className="mt-4 text-2xl font-700 text-gradient">{results.percentage.toFixed(1)}%</div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Ваш результат</p>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl md:text-2xl font-600 text-[var(--text-primary)]">{results.aiReport?.professionalReport?.executiveSummary || results.overallFeedback}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-700 uppercase text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[var(--accent)]" /> Сильные стороны
                  </h3>
                  {(results.aiReport?.professionalReport?.detailedAnalysis?.strengths || results.strengths).slice(0, 4).map((s: string, i: number) => (
                    <div key={i} className="flex items-start text-sm text-[var(--text-primary)] mb-2">
                      <div className="w-2 h-2 bg-[var(--accent)] rounded-full mr-3 mt-1.5"></div>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-xs font-700 uppercase text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[var(--accent)]" /> Для улучшения
                  </h3>
                  {(results.aiReport?.professionalReport?.detailedAnalysis?.areasForImprovement || results.priorityAreas).slice(0, 4).map((a: string, i: number) => (
                    <div key={i} className="flex items-start text-sm text-[var(--text-primary)] mb-2">
                      <div className="w-2 h-2 bg-[var(--accent)]/50 rounded-full mr-3 mt-1.5"></div>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-[var(--glass-border)]">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={() => generatePDFReport(false)} disabled={saving} className="liquid-button liquid-button-primary px-6 py-3 flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>{saving ? '...' : 'Скачать отчет'}</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={() => generatePDFReport(true)} disabled={saving} className="liquid-button px-6 py-3 flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>{saving ? '...' : 'В профиль'}</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={onReset} className="liquid-button px-6 py-3 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              <span>Новый анализ</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="liquid-glass p-6">
            <h3 className="text-lg font-600 text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Radar className="w-5 h-5 text-[var(--accent)]" /> Диаграмма
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 200]} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                  <Radar name="Результат" dataKey="A" stroke="#FF2D55" strokeWidth={3} fill="#FF2D55" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(28,28,30,0.9)', border: 'none', borderRadius: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar */}
          <div className="liquid-glass p-6">
            <h3 className="text-lg font-600 text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--accent)]" /> Сравнение
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <YAxis domain={[0, 200]} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(28,28,30,0.9)', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={['#800020', '#990033', '#6B0F2A', '#8B1A3A', '#7A0026'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Cards */}
          {categories.map((cat, i) => (
            <motion.div key={cat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.02 }} className="liquid-glass p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="liquid-glass w-12 h-12 rounded-xl flex items-center justify-center">
                    <cat.icon className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h4 className="font-600 text-[var(--text-primary)]">{cat.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{cat.data.score}/{cat.data.maxScore}</p>
                  </div>
                </div>
              </div>
              <div className="liquid-glass h-2.5 rounded-full overflow-hidden">
                <motion.div className="bg-gradient-to-r from-[var(--accent)] to-orange-500 h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(cat.data.score / cat.data.maxScore) * 100}%` }} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'detailed' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="liquid-glass p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="liquid-glass liquid-button-primary w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                    <cat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-700 text-[var(--text-primary)] mb-1">{cat.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{cat.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-700 text-gradient">{cat.data.score}</span>
                      <span className="text-sm text-[var(--text-tertiary)]">из {cat.data.maxScore}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-700 text-gradient">{Math.round((cat.data.score / cat.data.maxScore) * 100)}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="liquid-glass h-3 rounded-full overflow-hidden mb-6">
                <motion.div
                  className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-light)] to-[var(--accent-dark)] h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.data.score / cat.data.maxScore) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="liquid-glass p-4">
                  <h4 className="text-xs font-700 uppercase text-[var(--accent)] mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Сильные стороны
                  </h4>
                  <ul className="space-y-2">
                    {/* Сильные стороны из метрик */}
                    {getStrengths(cat.data).length > 0 ? (
                      getStrengths(cat.data).slice(0, 3).map((r: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                          <span className="text-[var(--accent)] mt-1">•</span>
                          <span>{r}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-[var(--text-tertiary)]">Нет данных</li>
                    )}
                  </ul>
                </div>
                <div className="liquid-glass p-4">
                  <h4 className="text-xs font-700 uppercase text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Зоны роста
                  </h4>
                  <ul className="space-y-2">
                    {/* Рекомендации по улучшению */}
                    {getImprovements(cat.data).length > 0 ? (
                      getImprovements(cat.data).slice(0, 3).map((r: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                          <span className="text-[var(--text-tertiary)] mt-1">•</span>
                          <span>{r}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-[var(--text-tertiary)]">Нет данных</li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ResultsDashboard;
