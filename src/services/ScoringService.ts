import { geminiAIService, type GeminiAnalysisRequest } from './GeminiAIService';
import { languageService } from './LanguageService';

export interface DetailedMetrics {
  posture: PostureMetrics;
  gesticulation: GesticulationMetrics;
  facial: FacialMetrics;
  speech: SpeechMetrics;
  engagement: EngagementMetrics;
}

export interface PostureMetrics {
  score: number;
  maxScore: 200;
  spineAlignment: number;
  shoulderSymmetry: number;
  headPosition: number;
  stability: number;
  confidence: number;
  issues: string[];
  recommendations: string[];
  aiRecommendations?: string[];
}

export interface GesticulationMetrics {
  score: number;
  maxScore: 200;
  variety: number;
  frequency: number;
  appropriateness: number;
  expressiveness: number;
  coordination: number;
  gestures: string[];
  recommendations: string[];
  aiRecommendations?: string[];
}

export interface FacialMetrics {
  score: number;
  maxScore: 200;
  expressiveness: number;
  eyeContact: number;
  smileFrequency: number;
  emotionalRange: number;
  authenticity: number;
  expressions: string[];
  recommendations: string[];
  aiRecommendations?: string[];
}

export interface SpeechMetrics {
  score: number;
  maxScore: 200;
  clarity: number;
  pace: number;
  volume: number;
  vocabulary: number;
  grammar: number;
  fillerWords: number;
  transcription: string;
  recommendations: string[];
  aiRecommendations?: string[];
}

export interface EngagementMetrics {
  score: number;
  maxScore: 200;
  attention: number;
  interaction: number;
  energy: number;
  presence: number;
  charisma: number;
  recommendations: string[];
  aiRecommendations?: string[];
}

export interface ComprehensiveAnalysis {
  totalScore: number;
  maxTotalScore: 1000;
  percentage: number;
  grade: string;
  metrics: DetailedMetrics;
  overallFeedback: string;
  priorityAreas: string[];
  strengths: string[];
  improvementPlan: string[];
  aiReport?: {
    professionalReport: any;
    enhancedRecommendations: any;
    motivationalMessage: string;
    nextSteps: string[];
  };
}

class ScoringService {
  async calculateComprehensiveScore(
    poseData: any[],
    gestureData: any[],
    faceData: any[],
    audioData: any,
    videoDuration: number
  ): Promise<ComprehensiveAnalysis> {
    
    // Проверка на валидную длительность видео
    if (!videoDuration || videoDuration <= 0 || isNaN(videoDuration)) {
      console.warn('Invalid video duration, using fallback values');
      return this.getFallbackAnalysis();
    }
    
    const postureMetrics = this.analyzePostureMetrics(poseData, videoDuration);
    const gesticulationMetrics = this.analyzeGesticulationMetrics(gestureData, videoDuration);
    const facialMetrics = this.analyzeFacialMetrics(faceData, videoDuration);
    const speechMetrics = this.analyzeSpeechMetrics(audioData, videoDuration);
    const engagementMetrics = this.analyzeEngagementMetrics(
      poseData, gestureData, faceData, audioData, videoDuration
    );

    const totalScore = 
      postureMetrics.score + 
      gesticulationMetrics.score + 
      facialMetrics.score + 
      speechMetrics.score + 
      engagementMetrics.score;

    const percentage = (totalScore / 1000) * 100;
    const grade = this.calculateGrade(percentage);

    const metrics: DetailedMetrics = {
      posture: postureMetrics,
      gesticulation: gesticulationMetrics,
      facial: facialMetrics,
      speech: speechMetrics,
      engagement: engagementMetrics
    };

    // Generate AI-enhanced analysis
    let aiReport;
    try {
      console.log('🤖 Generating AI-enhanced professional report...');

      const currentLanguage = languageService.getCurrentLanguage();
      const geminiRequest: GeminiAnalysisRequest = {
        transcription: speechMetrics.transcription,
        videoAnalysis: { poseData, gestureData, faceData, videoDuration },
        audioAnalysis: audioData,
        scoringResults: {
          totalScore,
          percentage,
          grade,
          metrics
        },
        multilingualData: audioData.transcriptionMetadata?.isMultilingual ? {
          detectedLanguages: audioData.transcriptionMetadata.detectedLanguages,
          isMultilingual: audioData.transcriptionMetadata.isMultilingual,
          languageSwitches: audioData.transcriptionMetadata.languageSwitches,
          dominantLanguage: audioData.transcriptionMetadata.detectedLanguages?.[0]?.languageCode
        } : undefined,
        userLanguage: currentLanguage
      };

      aiReport = await geminiAIService.generateProfessionalReport(geminiRequest);

      // ОТКЛЮЧЕНО: Enhance metrics with AI recommendations (слишком долго)
      // await this.enhanceMetricsWithAI(metrics, currentLanguage);

      console.log('✅ AI-enhanced analysis completed');

    } catch (error) {
      console.error('❌ AI analysis failed, using fallback:', error);
      aiReport = undefined;
    }

    return {
      totalScore,
      maxTotalScore: 1000,
      percentage,
      grade,
      metrics,
      overallFeedback: this.generateOverallFeedback(percentage, metrics),
      strengths: this.identifyStrengths(metrics), // Сильные стороны на основе баллов
      priorityAreas: this.identifyPriorityAreas(metrics), // Зоны роста на основе баллов
      improvementPlan: this.generateImprovementPlan(metrics),
      aiReport
    };
  }

  /**
   * Определяет СИЛЬНЫЕ стороны на основе метрик с высокими баллами
   */
  private identifyStrengths(metrics: DetailedMetrics): string[] {
    const strengths: string[] = [];

    // Поза и осанка - сильные стороны
    if (metrics.posture.score >= 140) {
      if (metrics.posture.spineAlignment >= 35) strengths.push('Прямая осанка на протяжении урока');
      if (metrics.posture.shoulderSymmetry >= 35) strengths.push('Симметричное положение плеч');
      if (metrics.posture.confidence >= 35) strengths.push('Уверенная поза преподавателя');
    }

    // Жестикуляция - сильные стороны
    if (metrics.gesticulation.score >= 140) {
      if (metrics.gesticulation.variety >= 35) strengths.push('Разнообразные жесты');
      if (metrics.gesticulation.expressiveness >= 35) strengths.push('Выразительная жестикуляция');
      if (metrics.gesticulation.coordination >= 35) strengths.push('Координированные движения руками');
    }

    // Мимика - сильные стороны
    if (metrics.facial.score >= 140) {
      if (metrics.facial.eyeContact >= 35) strengths.push('Хороший зрительный контакт с аудиторией');
      if (metrics.facial.expressiveness >= 35) strengths.push('Выразительная мимика');
      if (metrics.facial.smileFrequency >= 35) strengths.push('Частые улыбки');
    }

    // Речь - сильные стороны
    if (metrics.speech.score >= 140) {
      if (metrics.speech.clarity >= 35) strengths.push('Четкая дикция');
      if (metrics.speech.vocabulary >= 35) strengths.push('Богатый словарный запас');
      if (metrics.speech.grammar >= 35) strengths.push('Грамотная речь');
    }

    // Вовлеченность - сильные стороны
    if (metrics.engagement.score >= 140) {
      if (metrics.engagement.energy >= 35) strengths.push('Энергичная подача материала');
      if (metrics.engagement.charisma >= 35) strengths.push('Харизматичное присутствие');
      if (metrics.engagement.attention >= 35) strengths.push('Внимательное отношение к аудитории');
    }

    // Если мало сильных сторон, добавляем общие
    if (strengths.length === 0) {
      if (metrics.posture.score >= 100) strengths.push('Стабильная поза');
      if (metrics.gesticulation.score >= 100) strengths.push('Использование жестов');
      if (metrics.facial.score >= 100) strengths.push('Эмоциональная вовлеченность');
      if (metrics.speech.score >= 100) strengths.push('Понятная речь');
      if (metrics.engagement.score >= 100) strengths.push('Вовлеченность в процесс');
    }

    // Если все еще пусто, возвращаем дефолтные
    if (strengths.length === 0) {
      strengths.push('Понимание материала урока', 'Стремление к развитию', 'Работа над собой');
    }

    return strengths.slice(0, 5); // Максимум 5 сильных сторон
  }

  /**
   * Определяет ЗОНЫ РОСТА на основе метрик с низкими баллами
   */
  private identifyPriorityAreas(metrics: DetailedMetrics): string[] {
    const areas: string[] = [];

    // Поза и осанка - проблемы
    if (metrics.posture.score < 120) {
      if (metrics.posture.spineAlignment < 30) areas.push('Работать над выравниванием позвоночника');
      if (metrics.posture.shoulderSymmetry < 30) areas.push('Контролировать симметрию плеч');
      if (metrics.posture.headPosition < 30) areas.push('Держать голову прямо');
      if (metrics.posture.stability < 30) areas.push('Уменьшить избыточные движения');
    }

    // Жестикуляция - проблемы
    if (metrics.gesticulation.score < 120) {
      if (metrics.gesticulation.variety < 30) areas.push('Разнообразить жесты');
      if (metrics.gesticulation.frequency < 30) areas.push('Добавить больше жестов');
      if (metrics.gesticulation.expressiveness < 30) areas.push('Улучшить выразительность жестов');
    }

    // Мимика - проблемы
    if (metrics.facial.score < 120) {
      if (metrics.facial.eyeContact < 30) areas.push('Поддерживать зрительный контакт');
      if (metrics.facial.smileFrequency < 30) areas.push('Чаще улыбаться');
      if (metrics.facial.expressiveness < 30) areas.push('Развивать эмоциональную выразительность');
    }

    // Речь - проблемы
    if (metrics.speech.score < 120) {
      if (metrics.speech.clarity < 30) areas.push('Работать над четкостью речи');
      if (metrics.speech.pace < 30) areas.push('Контролировать темп речи');
      if (metrics.speech.fillerWords > 5) areas.push('Сократить слова-паразиты');
    }

    // Вовлеченность - проблемы
    if (metrics.engagement.score < 120) {
      if (metrics.engagement.energy < 30) areas.push('Добавить энергии в подачу');
      if (metrics.engagement.charisma < 30) areas.push('Развивать харизму');
      if (metrics.engagement.interaction < 30) areas.push('Взаимодействовать с аудиторией');
    }

    // Если мало проблем, добавляем общие рекомендации
    if (areas.length === 0) {
      if (metrics.posture.score < 160) areas.push('Продолжать работать над осанкой');
      if (metrics.gesticulation.score < 160) areas.push('Совершенствовать жестикуляцию');
      if (metrics.facial.score < 160) areas.push('Развивать мимику');
      if (metrics.speech.score < 160) areas.push('Улучшать речь');
    }

    // Если все еще пусто, возвращаем дефолтные
    if (areas.length === 0) {
      areas.push('Продолжать профессиональное развитие', 'Изучать новые методики преподавания');
    }

    return areas.slice(0, 5); // Максимум 5 зон роста
  }

  /**
   * Enhances metrics with AI-generated recommendations
   */
  private async enhanceMetricsWithAI(metrics: DetailedMetrics, language: 'ru' | 'kk'): Promise<void> {
    try {
      const enhancementPromises = [
        this.enhanceMetricWithAI('posture', metrics.posture, language),
        this.enhanceMetricWithAI('gesticulation', metrics.gesticulation, language),
        this.enhanceMetricWithAI('facial', metrics.facial, language),
        this.enhanceMetricWithAI('speech', metrics.speech, language),
        this.enhanceMetricWithAI('engagement', metrics.engagement, language)
      ];

      const results = await Promise.allSettled(enhancementPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const metricNames = ['posture', 'gesticulation', 'facial', 'speech', 'engagement'];
          const metricName = metricNames[index] as keyof DetailedMetrics;
          (metrics[metricName] as any).aiRecommendations = result.value;
        }
      });
      
    } catch (error) {
      console.warn('Failed to enhance metrics with AI:', error);
    }
  }

  /**
   * Enhances a specific metric with AI recommendations
   */
  private async enhanceMetricWithAI(
    metricType: 'posture' | 'gesticulation' | 'facial' | 'speech' | 'engagement',
    metricData: any,
    language: 'ru' | 'kk'
  ): Promise<string[]> {
    try {
      return await geminiAIService.generateEnhancedRecommendations(
        metricType,
        metricData.score,
        metricData.maxScore,
        metricData,
        language
      );
    } catch (error) {
      console.warn(`Failed to enhance ${metricType} with AI:`, error);
      return [];
    }
  }

  private analyzePostureMetrics(poseData: any[], videoDuration: number): PostureMetrics {
    if (poseData.length === 0) {
      return {
        score: 50,
        maxScore: 200,
        spineAlignment: 50,
        shoulderSymmetry: 50,
        headPosition: 50,
        stability: 50,
        confidence: 50,
        issues: ["Недостаточно данных о позе"],
        recommendations: ["Убедитесь, что камера захватывает всю фигуру"]
      };
    }

    let spineAlignmentScore = 0;
    let shoulderSymmetryScore = 0;
    let headPositionScore = 0;
    let stabilityScore = 0;
    let confidenceScore = 0;

    const issues: string[] = [];
    let forwardLeanCount = 0;
    let shoulderAsymmetryCount = 0;
    let headTiltCount = 0;
    let movementVariance = 0;

    // Анализ каждого кадра
    poseData.forEach((frame, index) => {
      if (!frame || !frame.landmarks || !Array.isArray(frame.landmarks) || frame.landmarks.length < 25) {
        return; // Skip invalid frames
      }

      const landmarks = frame.landmarks;

      // Анализ выравнивания позвоночника
      const nose = landmarks[0];
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      // Validate required landmarks
      if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) {
        return; // Skip frames with missing landmarks
      }

      if (typeof nose.x !== 'number' || typeof leftShoulder.x !== 'number' ||
          typeof rightShoulder.x !== 'number' || typeof leftHip.x !== 'number' ||
          typeof rightHip.x !== 'number') {
        return; // Skip frames with invalid data
      }

      // Центр плеч и бедер
      const shoulderCenter = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
      const hipCenter = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
      };

      // Проверка наклона вперед
      if (nose.x < shoulderCenter.x - 0.08) {
        forwardLeanCount++;
      }

      // Проверка симметрии плеч
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      if (shoulderDiff > 0.04) {
        shoulderAsymmetryCount++;
      }

      // Проверка наклона головы
      const headTilt = Math.abs(nose.x - shoulderCenter.x);
      if (headTilt > 0.06) {
        headTiltCount++;
      }

      // Анализ стабильности (изменение позиции между кадрами)
      if (index > 0) {
        const prevFrame = poseData[index - 1];
        const prevNose = prevFrame.landmarks[0];
        const movement = Math.sqrt(
          Math.pow(nose.x - prevNose.x, 2) + Math.pow(nose.y - prevNose.y, 2)
        );
        movementVariance += movement;
      }
    });

    const frameCount = poseData.length;
    const forwardLeanRatio = forwardLeanCount / frameCount;
    const shoulderAsymmetryRatio = shoulderAsymmetryCount / frameCount;
    const headTiltRatio = headTiltCount / frameCount;
    const avgMovement = movementVariance / (frameCount - 1);

    // Проверка на NaN и установка дефолтных значений
    const safeForwardLeanRatio = isNaN(forwardLeanRatio) ? 0 : forwardLeanRatio;
    const safeShoulderAsymmetryRatio = isNaN(shoulderAsymmetryRatio) ? 0 : shoulderAsymmetryRatio;
    const safeHeadTiltRatio = isNaN(headTiltRatio) ? 0 : headTiltRatio;
    const safeAvgMovement = isNaN(avgMovement) ? 0 : avgMovement;

    // Расчет баллов (каждый компонент из 40 баллов)
    spineAlignmentScore = Math.max(0, 40 - (safeForwardLeanRatio * 40));
    shoulderSymmetryScore = Math.max(0, 40 - (safeShoulderAsymmetryRatio * 40));
    headPositionScore = Math.max(0, 40 - (safeHeadTiltRatio * 40));
    stabilityScore = Math.max(0, 40 - (safeAvgMovement * 200)); // Нормализация движения
    confidenceScore = Math.min(40, (spineAlignmentScore + shoulderSymmetryScore) / 2);

    // Определение проблем
    if (forwardLeanRatio > 0.3) issues.push("Частые наклоны вперед");
    if (shoulderAsymmetryRatio > 0.2) issues.push("Асимметрия плеч");
    if (headTiltRatio > 0.25) issues.push("Наклоны головы");
    if (avgMovement > 0.02) issues.push("Избыточные движения");

    const totalScore = spineAlignmentScore + shoulderSymmetryScore + headPositionScore + stabilityScore + confidenceScore;

    return {
      score: Math.round(totalScore),
      maxScore: 200,
      spineAlignment: Math.round(spineAlignmentScore),
      shoulderSymmetry: Math.round(shoulderSymmetryScore),
      headPosition: Math.round(headPositionScore),
      stability: Math.round(stabilityScore),
      confidence: Math.round(confidenceScore),
      issues,
      recommendations: this.generatePostureRecommendations(issues, totalScore)
    };
  }

  private analyzeGesticulationMetrics(gestureData: any[], videoDuration: number): GesticulationMetrics {
    if (gestureData.length === 0) {
      return {
        score: 60,
        maxScore: 200,
        variety: 20,
        frequency: 20,
        appropriateness: 20,
        expressiveness: 20,
        coordination: 20,
        gestures: [],
        recommendations: ["Добавьте больше жестов для выразительности"]
      };
    }

    const gestureTypes = new Set<string>();
    const gestureTimestamps: number[] = [];
    let totalGestures = 0;
    let expressiveGestures = 0;
    let appropriateGestures = 0;

    // Анализ жестов
    gestureData.forEach(frame => {
      frame.gestures.forEach((handGestures: any[]) => {
        handGestures.forEach((gesture: any) => {
          if (gesture.score > 0.6) {
            gestureTypes.add(gesture.categoryName);
            gestureTimestamps.push(frame.timestamp);
            totalGestures++;

            // Оценка выразительности
            if (gesture.score > 0.8) expressiveGestures++;

            // Оценка уместности
            const appropriateGestures_list = [
              'Open_Palm', 'Pointing_Up', 'Thumb_Up', 'Victory'
            ];
            if (appropriateGestures_list.includes(gesture.categoryName)) {
              appropriateGestures++;
            }
          }
        });
      });
    });

    const gestureVariety = gestureTypes.size;
    const gestureFrequency = totalGestures / videoDuration; // жестов в секунду
    const expressivenessRatio = totalGestures > 0 ? expressiveGestures / totalGestures : 0;
    const appropriatenessRatio = totalGestures > 0 ? appropriateGestures / totalGestures : 0;

    // Проверка на NaN
    const safeGestureFrequency = isNaN(gestureFrequency) ? 0 : gestureFrequency;

    // Анализ координации (равномерность распределения жестов)
    let coordinationScore = 40;
    if (gestureTimestamps.length > 1) {
      const intervals: number[] = [];
      for (let i = 1; i < gestureTimestamps.length; i++) {
        intervals.push(gestureTimestamps[i] - gestureTimestamps[i-1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      coordinationScore = Math.max(0, 40 - (variance * 10));
    }

    // Расчет баллов (каждый компонент из 40 баллов)
    const varietyScore = Math.min(40, gestureVariety * 8); // До 5 типов жестов
    const frequencyScore = Math.min(40, safeGestureFrequency * 40); // Оптимально 1 жест в секунду
    const appropriatenessScore = appropriatenessRatio * 40;
    const expressivenessScore = expressivenessRatio * 40;

    const totalScore = varietyScore + frequencyScore + appropriatenessScore + expressivenessScore + coordinationScore;

    return {
      score: Math.round(totalScore),
      maxScore: 200,
      variety: Math.round(varietyScore),
      frequency: Math.round(frequencyScore),
      appropriateness: Math.round(appropriatenessScore),
      expressiveness: Math.round(expressivenessScore),
      coordination: Math.round(coordinationScore),
      gestures: Array.from(gestureTypes),
      recommendations: this.generateGestureRecommendations(gestureTypes.size, gestureFrequency, totalScore)
    };
  }

  private analyzeFacialMetrics(faceData: any[], videoDuration: number): FacialMetrics {
    if (faceData.length === 0) {
      return {
        score: 50,
        maxScore: 200,
        expressiveness: 20,
        eyeContact: 20,
        smileFrequency: 20,
        emotionalRange: 20,
        authenticity: 20,
        expressions: [],
        recommendations: ["Улучшите освещение для лучшего анализа лица"]
      };
    }

    let smileCount = 0;
    let eyeContactCount = 0;
    let expressiveCount = 0;
    let emotionalVariety = new Set<string>();
    let authenticityScore = 0;

    faceData.forEach(frame => {
      if (frame.blendshapes && frame.blendshapes.categories) {
        const blendshapes = frame.blendshapes.categories;
        
        // Анализ улыбки
        const smileShapes = blendshapes.filter((bs: any) => 
          bs.categoryName.includes('mouthSmile') || 
          bs.categoryName.includes('mouthLeft') || 
          bs.categoryName.includes('mouthRight')
        );
        const maxSmile = Math.max(...smileShapes.map((bs: any) => bs.score), 0);
        if (maxSmile > 0.3) {
          smileCount++;
          emotionalVariety.add('smile');
        }

        // Анализ зрительного контакта
        const eyeLookDown = blendshapes.find((bs: any) => bs.categoryName.includes('eyeLookDown'));
        const eyeLookUp = blendshapes.find((bs: any) => bs.categoryName.includes('eyeLookUp'));
        const eyeLookLeft = blendshapes.find((bs: any) => bs.categoryName.includes('eyeLookLeft'));
        const eyeLookRight = blendshapes.find((bs: any) => bs.categoryName.includes('eyeLookRight'));
        
        const lookingAway = (eyeLookDown?.score || 0) + (eyeLookUp?.score || 0) + 
                          (eyeLookLeft?.score || 0) + (eyeLookRight?.score || 0);
        
        if (lookingAway < 0.3) {
          eyeContactCount++;
        }

        // Анализ выразительности
        const browShapes = blendshapes.filter((bs: any) => bs.categoryName.includes('brow'));
        const maxBrow = Math.max(...browShapes.map((bs: any) => bs.score), 0);
        if (maxBrow > 0.2) {
          expressiveCount++;
          emotionalVariety.add('expressive');
        }

        // Анализ подлинности (естественность выражений)
        const totalExpression = maxSmile + maxBrow + lookingAway;
        if (totalExpression > 0.1 && totalExpression < 0.8) {
          authenticityScore += 1; // Естественные выражения
        }
      }
    });

    const frameCount = faceData.length;
    const smileRatio = smileCount / frameCount;
    const eyeContactRatio = eyeContactCount / frameCount;
    const expressivenessRatio = expressiveCount / frameCount;
    const emotionalRangeScore = emotionalVariety.size;
    const authenticityRatio = authenticityScore / frameCount;

    // Проверка на NaN
    const safeSmileRatio = isNaN(smileRatio) ? 0 : smileRatio;
    const safeEyeContactRatio = isNaN(eyeContactRatio) ? 0 : eyeContactRatio;
    const safeExpressivenessRatio = isNaN(expressivenessRatio) ? 0 : expressivenessRatio;
    const safeAuthenticityRatio = isNaN(authenticityRatio) ? 0 : authenticityRatio;

    // Расчет баллов (каждый компонент из 40 баллов)
    const expressivenessScore = Math.min(40, safeExpressivenessRatio * 80);
    const eyeContactScore = safeEyeContactRatio * 40;
    const smileFrequencyScore = Math.min(40, safeSmileRatio * 60); // Оптимально 60% времени
    const emotionalRangeScoreNorm = Math.min(40, emotionalRangeScore * 20);
    const authenticityScoreNorm = safeAuthenticityRatio * 40;

    const totalScore = expressivenessScore + eyeContactScore + smileFrequencyScore + 
                      emotionalRangeScoreNorm + authenticityScoreNorm;

    return {
      score: Math.round(totalScore),
      maxScore: 200,
      expressiveness: Math.round(expressivenessScore),
      eyeContact: Math.round(eyeContactScore),
      smileFrequency: Math.round(smileFrequencyScore),
      emotionalRange: Math.round(emotionalRangeScoreNorm),
      authenticity: Math.round(authenticityScoreNorm),
      expressions: Array.from(emotionalVariety),
      recommendations: this.generateFacialRecommendations(smileRatio, eyeContactRatio, totalScore)
    };
  }

  private analyzeSpeechMetrics(audioData: any, videoDuration: number): SpeechMetrics {
    // Здесь будет реальный анализ аудио, пока используем симуляцию
    const mockTranscription = audioData?.transcription || this.generateMockTranscription();
    
    const words = mockTranscription.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word: string) => word.length > 0);
    
    const uniqueWords = new Set(words);
    const wordCount = words.length;
    const uniqueWordCount = uniqueWords.size;
    const wordsPerMinute = (wordCount / videoDuration) * 60;

    // Анализ слов-паразитов
    const fillerWords = ['эм', 'ах', 'ну', 'так', 'значит', 'короче', 'типа', 'как бы', 'вот', 'это'];
    const fillerCount = words.filter((word: string) => fillerWords.includes(word)).length;
    const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0;

    // Анализ сложности словаря
    const avgWordLength = wordCount > 0 ? words.reduce((sum: number, word: string) => sum + word.length, 0) / wordCount : 0;
    const vocabularyRichness = wordCount > 0 ? uniqueWordCount / wordCount : 0;

    // Анализ грамматики (упрощенный)
    const sentences = mockTranscription.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const sentenceCount = sentences.length;
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    // Проверка на NaN
    const safeWordsPerMinute = isNaN(wordsPerMinute) ? 0 : wordsPerMinute;

    // Расчет баллов (каждый компонент из 40 баллов)
    let clarityScore = 40 - (fillerRatio * 80); // Штраф за слова-паразиты
    let paceScore = 40;
    if (safeWordsPerMinute < 120) paceScore = (safeWordsPerMinute / 120) * 40;
    else if (safeWordsPerMinute > 180) paceScore = 40 - ((safeWordsPerMinute - 180) / 60) * 20;

    const volumeScore = 35; // Базовая оценка, требует реального анализа аудио
    const vocabularyScore = Math.min(40, vocabularyRichness * 80 + avgWordLength * 5);
    const grammarScore = Math.min(40, avgSentenceLength * 3);

    const totalScore = clarityScore + paceScore + volumeScore + vocabularyScore + grammarScore;

    return {
      score: Math.round(Math.max(0, totalScore)),
      maxScore: 200,
      clarity: Math.round(Math.max(0, clarityScore)),
      pace: Math.round(paceScore),
      volume: Math.round(volumeScore),
      vocabulary: Math.round(vocabularyScore),
      grammar: Math.round(grammarScore),
      fillerWords: fillerCount,
      transcription: mockTranscription,
      recommendations: this.generateSpeechRecommendations(fillerRatio, wordsPerMinute, vocabularyRichness, totalScore)
    };
  }

  private analyzeEngagementMetrics(
    poseData: any[], 
    gestureData: any[], 
    faceData: any[], 
    audioData: any, 
    videoDuration: number
  ): EngagementMetrics {
    
    // Анализ внимания (стабильность позы + зрительный контакт)
    let attentionScore = 0;
    if (poseData.length > 0 && faceData.length > 0) {
      const poseStability = this.calculatePoseStability(poseData);
      const eyeContactRatio = this.calculateEyeContactRatio(faceData);
      attentionScore = (poseStability + eyeContactRatio) * 20;
    }

    // Анализ взаимодействия (жесты + мимика)
    let interactionScore = 0;
    if (gestureData.length > 0 && faceData.length > 0 && videoDuration > 0) {
      const gestureActivity = Math.min(1, gestureData.length / (videoDuration * 10));
      const facialActivity = Math.min(1, faceData.length / (videoDuration * 30));
      interactionScore = (gestureActivity + facialActivity) * 20;
    }

    // Анализ энергии (динамика речи + движения)
    let energyScore = 30; // Базовая оценка
    if (audioData && poseData.length > 0) {
      const speechDynamics = this.calculateSpeechDynamics(audioData);
      const movementDynamics = this.calculateMovementDynamics(poseData);
      energyScore = (speechDynamics + movementDynamics) * 20;
    }

    // Анализ присутствия (общая уверенность)
    const presenceScore = Math.min(40, (attentionScore + interactionScore + energyScore) / 3);

    // Анализ харизмы (комбинация всех факторов)
    const charismaScore = Math.min(40, (attentionScore + interactionScore + energyScore + presenceScore) / 4);

    const totalScore = attentionScore + interactionScore + energyScore + presenceScore + charismaScore;

    return {
      score: Math.round(totalScore),
      maxScore: 200,
      attention: Math.round(attentionScore),
      interaction: Math.round(interactionScore),
      energy: Math.round(energyScore),
      presence: Math.round(presenceScore),
      charisma: Math.round(charismaScore),
      recommendations: this.generateEngagementRecommendations(totalScore)
    };
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'D';
  }

  private generateOverallFeedback(percentage: number, metrics: DetailedMetrics): string {
    if (percentage >= 90) {
      return "Превосходное педагогическое мастерство! Вы демонстрируете высокий уровень профессионализма во всех аспектах преподавания. Ваша харизма, отличная осанка, выразительная жестикуляция и грамотная речь создают идеальную атмосферу для обучения. Продолжайте совершенствоваться и делиться своим мастерством с другими!";
    } else if (percentage >= 85) {
      return "Отличный результат! Вы показываете уверенное владение педагогическими навыками. Большинство аспектов вашего преподавания находятся на высоком уровне. Сосредоточьтесь на небольших улучшениях в областях с более низкими показателями, и вы достигнете совершенства.";
    } else if (percentage >= 80) {
      return "Очень хороший уровень преподавания! У вас есть прочная база педагогических навыков. Вы уверенно держитесь перед аудиторией и эффективно передаёте материал. Рекомендуется работа над отдельными аспектами для достижения ещё лучших результатов.";
    } else if (percentage >= 75) {
      return "Хорошие педагогические навыки с потенциалом для дальнейшего развития. Вы демонстрируете уверенное владение основами преподавания. Сосредоточьтесь на приоритетных областях для улучшения, и вы заметите значительный прогресс.";
    } else if (percentage >= 70) {
      return "Базовый уровень преподавания выше среднего. У вас есть хорошие навыки, но некоторые аспекты требуют доработки. Рекомендуется систематическая работа над выявленными слабыми зонами для повышения общего уровня мастерства.";
    } else if (percentage >= 65) {
      return "Удовлетворительный результат. Базовые педагогические навыки присутствуют, но требуется значительная работа над улучшением техники преподавания. Обратите особое внимание на области с наименьшими показателями.";
    } else if (percentage >= 60) {
      return "Базовый уровень преподавания. Вы владеете основами, но многие аспекты требуют улучшения. Рекомендуется интенсивная работа над осанкой, речью и вовлеченностью для повышения эффективности преподавания.";
    } else if (percentage >= 55) {
      return "Начальный уровень педагогического мастерства. Базовые навыки присутствуют, но требуется систематическая работа над улучшением. Следуйте плану улучшений и регулярно практикуйтесь для достижения прогресса.";
    } else if (percentage >= 50) {
      return "Требуется значительная работа над педагогическими навыками. Многие аспекты преподавания нуждаются в улучшении. Рекомендуется интенсивная практика и, возможно, работа с тренером или наставником.";
    } else {
      return "Рекомендуется интенсивная работа над развитием педагогических навыков. Начните с базовых упражнений для осанки, речи и жестикуляции. Регулярная практика и анализ своих уроков помогут вам достичь прогресса.";
    }
  }

  private generateImprovementPlan(metrics: DetailedMetrics): string[] {
    const plan: string[] = [];

    // Поза и осанка
    if (metrics.posture.score < 100) {
      plan.push("❗ Критично: Ежедневные упражнения для осанки (планка, стенка) — 15 мин/день");
      plan.push("❗ Контролируйте положение спины во время урока — ставьте напоминания");
    } else if (metrics.posture.score < 140) {
      plan.push("Неделя 1-2: Упражнения для укрепления мышц спины (10 мин/день)");
      plan.push("Практикуйте 'королевскую позу' — стойте прямо, плечи расправлены");
      plan.push("Делайте микро-паузы каждые 5 минут для проверки осанки");
    } else if (metrics.posture.score < 160) {
      plan.push("Неделя 1: Легкая разминка перед уроком для тонуса мышц");
      plan.push("Йога или пилатес 2-3 раза в неделю для улучшения стабильности");
    }

    // Жестикуляция
    if (metrics.gesticulation.score < 100) {
      plan.push("❗ Критично: Изучите базовые педагогические жесты (указывающие, открывающие)");
      plan.push("❗ Практикуйтесь перед зеркалом — 15 мин ежедневно");
    } else if (metrics.gesticulation.score < 140) {
      plan.push("Неделя 2-3: Тренировка жестикуляции перед зеркалом (10 мин/день)");
      plan.push("Используйте указывающие жесты для акцентирования ключевых моментов");
      plan.push("Избегайте скрещенных рук и рук в карманах");
    } else if (metrics.gesticulation.score < 160) {
      plan.push("Неделя 2: Добавьте больше выразительных жестов");
      plan.push("Наблюдайте за жестами успешных спикеров и перенимайте приёмы");
    }

    // Мимика
    if (metrics.facial.score < 100) {
      plan.push("❗ Критично: Работайте над выразительностью лица перед зеркалом");
      plan.push("❗ Улучшите освещение для лучшего визуального контакта");
    } else if (metrics.facial.score < 140) {
      plan.push("Неделя 4-5: Упражнения для мимики и зрительного контакта");
      plan.push("Практикуйте 'технику маяка' — переводите взгляд между разными частями аудитории");
      plan.push("Улыбайтесь чаще — это создаёт позитивную атмосферу");
    } else if (metrics.facial.score < 160) {
      plan.push("Неделя 3: Работайте над эмоциональным диапазоном");
      plan.push("Записывайте себя на видео для анализа мимики");
    }

    // Речь
    if (metrics.speech.score < 100) {
      plan.push("❗ Критично: Работа с логопедом или диктором для улучшения дикции");
      plan.push("❗ Полностью исключите слова-паразиты — записывайте и анализируйте");
    } else if (metrics.speech.score < 140) {
      plan.push("Неделя 2-3: Практика дикции — скороговорки (10 мин/день)");
      plan.push("Контролируйте темп речи — делайте паузы между важными мыслями");
      plan.push("Записывайте свою речь и анализируйте на наличие слов-паразитов");
      plan.push("Расширяйте словарный запас через чтение профессиональной литературы");
    } else if (metrics.speech.score < 160) {
      plan.push("Неделя 2: Чтение вслух для улучшения артикуляции");
      plan.push("Практикуйте осознанные паузы вместо 'эм' и 'ах'");
    }

    // Вовлеченность
    if (metrics.engagement.score < 100) {
      plan.push("❗ Критично: Увеличьте энергию подачи — работайте над тонусом");
      plan.push("❗ Добавьте интерактивные элементы в урок (вопросы, задания)");
    } else if (metrics.engagement.score < 140) {
      plan.push("Неделя 5-6: Практика интерактивных техник преподавания");
      plan.push("Варьируйте тон голоса и темп речи для удержания внимания");
      plan.push("Добавьте больше движений по аудитории");
      plan.push("Используйте истории и примеры из жизни для вовлечения");
    } else if (metrics.engagement.score < 160) {
      plan.push("Неделя 4: Развивайте харизму через практику");
      plan.push("Работайте над эмоциональной выразительностью");
    }

    // Общий план
    plan.push("");
    plan.push("📅 Еженедельно: Запись и анализ 10-минутных уроков для отслеживания прогресса");
    plan.push("📅 Раз в 2 недели: Сравнение результатов для оценки улучшений");

    return plan;
  }

  // Вспомогательные методы
  private generatePostureRecommendations(issues: string[], score: number): string[] {
    const recommendations: string[] = [];

    if (issues.includes("Частые наклоны вперед")) {
      recommendations.push("Держите спину прямо, представьте нить, тянущую вас вверх за макушку");
      recommendations.push("Делайте паузы для проверки осанки каждые 5 минут");
      recommendations.push("Укрепляйте мышцы кора — это основа правильной осанки");
    }
    if (issues.includes("Асимметрия плеч")) {
      recommendations.push("Выполняйте упражнения для выравнивания плеч у стены");
      recommendations.push("Проверяйте симметрию в зеркале перед уроком");
      recommendations.push("Избегайте ношения тяжёлых сумок на одном плече");
    }
    if (issues.includes("Наклоны головы")) {
      recommendations.push("Держите голову прямо, взгляд на уровне горизонта");
      recommendations.push("Делайте упражнения на растяжку шеи");
    }
    if (issues.includes("Избыточные движения")) {
      recommendations.push("Контролируйте перемещения по аудитории — двигайтесь осознанно");
      recommendations.push("Избегайте покачивания из стороны в сторону");
    }
    if (score < 100) {
      recommendations.push("❗ Практикуйте упражнение 'стенка' — 5 мин в день");
      recommendations.push("❗ Рассмотрите консультацию с физиотерапевтом");
    } else if (score < 140) {
      recommendations.push("Практикуйте стояние у стены для запоминания правильной осанки");
      recommendations.push("Рассмотрите занятия йогой или пилатесом 2-3 раза в неделю");
      recommendations.push("Используйте напоминания на телефоне для проверки позы");
    } else if (score < 160) {
      recommendations.push("Продолжайте работать над укреплением мышц спины");
      recommendations.push("Добавьте лёгкую разминку перед каждым уроком");
    }

    return recommendations;
  }

  private generateGestureRecommendations(variety: number, frequency: number, score: number): string[] {
    const recommendations: string[] = [];

    if (variety < 2) {
      recommendations.push("❗ Изучите и практикуйте различные педагогические жесты");
      recommendations.push("❗ Используйте указывающие жесты для акцентирования внимания");
      recommendations.push("Освойте жесты 'открытые ладони' для создания доверия");
    }
    if (variety < 4) {
      recommendations.push("Добавьте жесты для счёта (перечисления)");
      recommendations.push("Используйте жесты для показа размера и формы объектов");
    }
    if (frequency < 0.3) {
      recommendations.push("❗ Увеличьте частоту жестикуляции для большей выразительности");
      recommendations.push("Жестикулируйте на ключевых моментах объяснения");
    } else if (frequency < 0.5) {
      recommendations.push("Добавьте больше естественных жестов в вашу речь");
    }
    if (frequency > 2) {
      recommendations.push("Уменьшите частоту жестов, делайте их более осмысленными");
      recommendations.push("Избегайте хаотичных движений руками");
    }
    if (score < 100) {
      recommendations.push("❗ Практикуйтесь перед зеркалом ежедневно по 15 минут");
      recommendations.push("❗ Записывайте себя на видео и анализируйте жесты");
    } else if (score < 140) {
      recommendations.push("Практикуйте жестикуляцию перед зеркалом");
      recommendations.push("Изучите язык тела успешных преподавателей");
      recommendations.push("Смотрите выступления TED и перенимайте жесты спикеров");
    } else if (score < 160) {
      recommendations.push("Работайте над плавностью и естественностью жестов");
      recommendations.push("Координируйте жесты с ключевыми словами речи");
    }

    return recommendations;
  }

  private generateFacialRecommendations(smileRatio: number, eyeContactRatio: number, score: number): string[] {
    const recommendations: string[] = [];

    if (smileRatio < 0.2) {
      recommendations.push("❗ Чаще улыбайтесь для создания позитивной атмосферы");
      recommendations.push("❗ Практикуйте естественную улыбку перед зеркалом");
      recommendations.push("Начинайте урок с улыбки — это настраивает аудиторию");
    } else if (smileRatio < 0.4) {
      recommendations.push("Старайтесь улыбаться в ключевые моменты урока");
      recommendations.push("Используйте 'мягкую улыбку' при объяснении сложного материала");
    }
    if (eyeContactRatio < 0.4) {
      recommendations.push("❗ Поддерживайте зрительный контакт с разными частями аудитории");
      recommendations.push("❗ Используйте технику 'маяка' — фокусируйтесь на отдельных студентах 3-5 секунд");
      recommendations.push("Избегайте взгляда 'в никуда' или постоянно в одну точку");
    } else if (eyeContactRatio < 0.6) {
      recommendations.push("Практикуйте распределение внимания по всей аудитории");
      recommendations.push("Задерживайте взгляд на каждом студенте немного дольше");
    }
    if (score < 100) {
      recommendations.push("❗ Работайте над выразительностью лица ежедневно");
      recommendations.push("❗ Записывайте себя для анализа мимики");
      recommendations.push("Практикуйте разные эмоции перед зеркалом");
    } else if (score < 140) {
      recommendations.push("Работайте над выразительностью лица");
      recommendations.push("Записывайте себя для анализа мимики");
      recommendations.push("Развивайте эмоциональный интеллект через наблюдение за актёрами");
    } else if (score < 160) {
      recommendations.push("Продолжайте развивать эмоциональную выразительность");
      recommendations.push("Практикуйте 'активное лицо' — реагируйте мимикой на ответы студентов");
    }

    return recommendations;
  }

  private generateSpeechRecommendations(fillerRatio: number, wpm: number, vocabularyRichness: number, score: number): string[] {
    const recommendations: string[] = [];

    if (fillerRatio > 0.1) {
      recommendations.push("❗ Критично: Работайте над устранением слов-паразитов");
      recommendations.push("❗ Делайте осознанные паузы вместо 'эм', 'ах', 'ну'");
      recommendations.push("Записывайте свою речь и подсчитывайте слова-паразиты");
    } else if (fillerRatio > 0.05) {
      recommendations.push("Работайте над устранением слов-паразитов");
      recommendations.push("Делайте паузы вместо использования 'эм' и 'ах'");
      recommendations.push("Используйте технику 'паза вместо filler words'");
    }
    if (wpm < 100) {
      recommendations.push("❗ Увеличьте темп речи для большей динамичности");
      recommendations.push("Практикуйте энергичную подачу материала");
    } else if (wpm < 120) {
      recommendations.push("Немного увеличьте темп речи");
      recommendations.push("Добавьте энергии в вашу подачу");
    }
    if (wpm > 200) {
      recommendations.push("❗ Замедлите темп речи для лучшего понимания");
      recommendations.push("Делайте паузы между важными мыслями");
    } else if (wpm > 180) {
      recommendations.push("Замедлите темп речи для лучшего понимания");
      recommendations.push("Контролируйте скорость через осознанные паузы");
    }
    if (vocabularyRichness < 0.5) {
      recommendations.push("❗ Расширяйте словарный запас, избегайте повторов");
      recommendations.push("Читайте профессиональную литературу по вашей теме");
    } else if (vocabularyRichness < 0.6) {
      recommendations.push("Расширяйте словарный запас через чтение");
      recommendations.push("Используйте синонимы для избежания тавтологии");
    }
    if (score < 100) {
      recommendations.push("❗ Практикуйте чтение вслух для улучшения дикции — 20 мин/день");
      recommendations.push("❗ Записывайте свою речь для анализа");
      recommendations.push("Рассмотрите занятия с логопедом или ораторским тренером");
    } else if (score < 140) {
      recommendations.push("Практикуйте чтение вслух для улучшения дикции");
      recommendations.push("Записывайте свою речь для анализа");
      recommendations.push("Практикуйте скороговорки для улучшения артикуляции");
    } else if (score < 160) {
      recommendations.push("Продолжайте работать над чистотой речи");
      recommendations.push("Развивайте навыки сторителлинга для вовлечения аудитории");
    }

    return recommendations;
  }

  private generateEngagementRecommendations(score: number): string[] {
    const recommendations: string[] = [];

    if (score < 100) {
      recommendations.push("❗ Критично: Увеличьте энергичность подачи материала");
      recommendations.push("❗ Используйте больше интерактивных элементов (вопросы, задания)");
      recommendations.push("Начинайте урок с вовлекающего вопроса или истории");
      recommendations.push("Практикуйте активное перемещение по аудитории");
    } else if (score < 140) {
      recommendations.push("Увеличьте энергичность подачи материала");
      recommendations.push("Используйте больше интерактивных элементов");
      recommendations.push("Варьируйте тон голоса и темп речи");
      recommendations.push("Добавьте больше движений по аудитории");
      recommendations.push("Используйте риторические вопросы для вовлечения");
      recommendations.push("Добавляйте истории из реальной практики");
    } else if (score < 160) {
      recommendations.push("Развивайте харизматичность через практику");
      recommendations.push("Работайте над эмоциональной выразительностью");
      recommendations.push("Практикуйте 'присутствие в моменте' — будьте здесь и сейчас");
      recommendations.push("Используйте паузы для создания напряжения");
    } else if (score < 180) {
      recommendations.push("Продолжайте развивать своё сценическое присутствие");
      recommendations.push("Экспериментируйте с новыми форматами вовлечения");
    }

    return recommendations;
  }

  private generateMockTranscription(): string {
    return `Добро пожаловать на урок математики. Сегодня мы изучаем квадратные уравнения. 
    Квадратное уравнение имеет вид ax² + bx + c = 0, где a не равно нулю. 
    Для решения квадратных уравнений мы можем использовать несколько методов. 
    Первый метод - это факторизация. Второй метод - использование квадратной формулы. 
    Давайте рассмотрим примеры. Возьмем уравнение x² - 5x + 6 = 0. 
    Мы можем разложить это на множители: (x - 2)(x - 3) = 0. 
    Следовательно, x = 2 или x = 3. Это наши решения. 
    Теперь попробуйте решить следующее уравнение самостоятельно.`;
  }

  // Вспомогательные методы для расчета метрик
  private calculatePoseStability(poseData: any[]): number {
    if (poseData.length < 2) return 0.5;
    
    let totalMovement = 0;
    let validFrames = 0;
    for (let i = 1; i < poseData.length; i++) {
      const curr = poseData[i].landmarks[0]; // nose
      const prev = poseData[i-1].landmarks[0];
      if (curr && prev && typeof curr.x === 'number' && typeof curr.y === 'number' &&
          typeof prev.x === 'number' && typeof prev.y === 'number' &&
          !isNaN(curr.x) && !isNaN(curr.y) && !isNaN(prev.x) && !isNaN(prev.y)) {
        const movement = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
        if (!isNaN(movement)) {
          totalMovement += movement;
          validFrames++;
        }
      }
    }
    
    if (validFrames === 0) return 0.5;
    const avgMovement = totalMovement / validFrames;
    return isNaN(avgMovement) ? 0.5 : Math.max(0, 1 - (avgMovement * 50)); // Нормализация
  }

  private calculateEyeContactRatio(faceData: any[]): number {
    if (faceData.length === 0) return 0;
    
    let eyeContactCount = 0;
    faceData.forEach(frame => {
      if (frame.blendshapes && frame.blendshapes.categories) {
        const blendshapes = frame.blendshapes.categories;
        const lookingAway = blendshapes
          .filter((bs: any) => bs.categoryName.includes('eyeLook'))
          .reduce((sum: number, bs: any) => sum + bs.score, 0);
        
        if (lookingAway < 0.3) eyeContactCount++;
      }
    });
    
    return eyeContactCount / faceData.length;
  }

  private calculateSpeechDynamics(audioData: any): number {
    // Упрощенный расчет динамики речи
    return 0.7; // Базовое значение, требует реального анализа аудио
  }

  private calculateMovementDynamics(poseData: any[]): number {
    if (poseData.length < 2) return 0.5;
    
    let totalMovement = 0;
    let validFrames = 0;
    for (let i = 1; i < poseData.length; i++) {
      const curr = poseData[i].landmarks[0];
      const prev = poseData[i-1].landmarks[0];
      if (curr && prev && typeof curr.x === 'number' && typeof curr.y === 'number' &&
          typeof prev.x === 'number' && typeof prev.y === 'number' &&
          !isNaN(curr.x) && !isNaN(curr.y) && !isNaN(prev.x) && !isNaN(prev.y)) {
        const movement = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
        if (!isNaN(movement)) {
          totalMovement += movement;
          validFrames++;
        }
      }
    }
    
    if (validFrames === 0) return 0.5;
    const avgMovement = totalMovement / validFrames;
    return isNaN(avgMovement) ? 0.5 : Math.min(1, avgMovement * 100); // Нормализация для динамики
  }

  private getFallbackAnalysis(): ComprehensiveAnalysis {
    return {
      totalScore: 500,
      percentage: 50,
      grade: 'C',
      metrics: {
        posture: {
          score: 100,
          maxScore: 200,
          spineAlignment: 50,
          shoulderSymmetry: 50,
          headPosition: 50,
          stability: 50,
          confidence: 50,
          issues: ["Невозможно проанализировать позу"],
          recommendations: ["Убедитесь, что видео корректно загружено"]
        },
        gesticulation: {
          score: 100,
          maxScore: 200,
          variety: 20,
          frequency: 20,
          appropriateness: 20,
          expressiveness: 20,
          coordination: 20,
          gestures: [],
          recommendations: ["Невозможно проанализировать жесты"]
        },
        facial: {
          score: 100,
          maxScore: 200,
          expressiveness: 50,
          eyeContact: 50,
          smileFrequency: 50,
          emotionalRange: 50,
          authenticity: 50,
          expressions: [],
          recommendations: ["Невозможно проанализировать мимику"]
        },
        speech: {
          score: 100,
          maxScore: 200,
          clarity: 50,
          pace: 50,
          volume: 50,
          fillerWords: 50,
          engagement: 50,
          transcription: "Анализ речи недоступен",
          recommendations: ["Невозможно проанализировать речь"]
        },
        engagement: {
          score: 100,
          maxScore: 200,
          overallEngagement: 50,
          attentionSpan: 50,
          interactionQuality: 50,
          energyLevel: 50,
          confidence: 50,
          recommendations: ["Невозможно оценить вовлеченность"]
        }
      },
      aiReport: {
        professionalReport: {
          executiveSummary: "Анализ невозможен из-за проблем с видео",
          detailedAnalysis: {
            strengths: [],
            areasForImprovement: ["Проверьте формат и качество видео"],
            keyInsights: []
          },
          recommendations: {
            immediate: ["Повторите загрузку видео"],
            shortTerm: [],
            longTerm: []
          },
          actionPlan: {
            week1: [],
            week2: [],
            week3: [],
            week4: []
          }
        },
        enhancedRecommendations: {
          posture: [],
          gesticulation: [],
          facial: [],
          speech: [],
          engagement: []
        },
        motivationalMessage: "Попробуйте загрузить другое видео",
        nextSteps: ["Проверьте видео на совместимость"]
      }
    };
  }
}

export const scoringService = new ScoringService();