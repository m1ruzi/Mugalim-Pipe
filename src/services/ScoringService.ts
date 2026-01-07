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
      
      // Enhance metrics with AI recommendations
      await this.enhanceMetricsWithAI(metrics, currentLanguage);
      
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
      priorityAreas: this.identifyPriorityAreas(metrics),
      strengths: this.identifyStrengths(metrics),
      improvementPlan: this.generateImprovementPlan(metrics),
      aiReport
    };
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
    if (percentage >= 85) {
      return "Превосходное педагогическое мастерство! Вы демонстрируете высокий уровень профессионализма во всех аспектах преподавания.";
    } else if (percentage >= 70) {
      return "Хорошие педагогические навыки с потенциалом для дальнейшего развития. Сосредоточьтесь на приоритетных областях для улучшения.";
    } else if (percentage >= 55) {
      return "Базовые педагогические навыки присутствуют, но требуется значительная работа над улучшением техники преподавания.";
    } else {
      return "Рекомендуется интенсивная работа над развитием педагогических навыков. Начните с основных аспектов: позы, речи и взаимодействия с аудиторией.";
    }
  }

  private identifyPriorityAreas(metrics: DetailedMetrics): string[] {
    const areas: { name: string; score: number }[] = [
      { name: "Поза и осанка", score: metrics.posture.score },
      { name: "Жестикуляция", score: metrics.gesticulation.score },
      { name: "Мимика и выражение лица", score: metrics.facial.score },
      { name: "Речь и дикция", score: metrics.speech.score },
      { name: "Вовлеченность аудитории", score: metrics.engagement.score }
    ];

    return areas
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(area => area.name);
  }

  private identifyStrengths(metrics: DetailedMetrics): string[] {
    const strengths: string[] = [];
    
    if (metrics.posture.score >= 160) strengths.push("Отличная осанка и уверенная поза");
    if (metrics.gesticulation.score >= 160) strengths.push("Выразительная и разнообразная жестикуляция");
    if (metrics.facial.score >= 160) strengths.push("Живая мимика и хороший зрительный контакт");
    if (metrics.speech.score >= 160) strengths.push("Четкая речь и богатый словарный запас");
    if (metrics.engagement.score >= 160) strengths.push("Высокий уровень вовлеченности аудитории");

    return strengths.length > 0 ? strengths : ["Базовые педагогические навыки"];
  }

  private generateImprovementPlan(metrics: DetailedMetrics): string[] {
    const plan: string[] = [];
    
    if (metrics.posture.score < 140) {
      plan.push("Неделя 1-2: Ежедневные упражнения для улучшения осанки (10 мин/день)");
    }
    if (metrics.speech.score < 140) {
      plan.push("Неделя 2-3: Практика дикции и работа над темпом речи (15 мин/день)");
    }
    if (metrics.gesticulation.score < 140) {
      plan.push("Неделя 3-4: Тренировка жестикуляции перед зеркалом (10 мин/день)");
    }
    if (metrics.facial.score < 140) {
      plan.push("Неделя 4-5: Упражнения для мимики и зрительного контакта");
    }
    if (metrics.engagement.score < 140) {
      plan.push("Неделя 5-6: Практика интерактивных техник преподавания");
    }

    plan.push("Еженедельно: Запись и анализ 10-минутных уроков для отслеживания прогресса");
    
    return plan;
  }

  // Вспомогательные методы
  private generatePostureRecommendations(issues: string[], score: number): string[] {
    const recommendations: string[] = [];
    
    if (issues.includes("Частые наклоны вперед")) {
      recommendations.push("Держите спину прямо, представьте нить, тянущую вас вверх");
      recommendations.push("Делайте паузы для проверки осанки каждые 5 минут");
    }
    if (issues.includes("Асимметрия плеч")) {
      recommendations.push("Выполняйте упражнения для выравнивания плеч");
      recommendations.push("Проверяйте симметрию в зеркале перед уроком");
    }
    if (score < 120) {
      recommendations.push("Практикуйте стояние у стены для правильной осанки");
      recommendations.push("Рассмотрите занятия йогой или пилатесом");
    }

    return recommendations;
  }

  private generateGestureRecommendations(variety: number, frequency: number, score: number): string[] {
    const recommendations: string[] = [];
    
    if (variety < 3) {
      recommendations.push("Изучите и практикуйте различные педагогические жесты");
      recommendations.push("Используйте указывающие жесты для акцентирования внимания");
    }
    if (frequency < 0.5) {
      recommendations.push("Увеличьте частоту жестикуляции для большей выразительности");
    }
    if (frequency > 2) {
      recommendations.push("Уменьшите частоту жестов, делайте их более осмысленными");
    }
    if (score < 120) {
      recommendations.push("Практикуйте жестикуляцию перед зеркалом");
      recommendations.push("Изучите язык тела успешных преподавателей");
    }

    return recommendations;
  }

  private generateFacialRecommendations(smileRatio: number, eyeContactRatio: number, score: number): string[] {
    const recommendations: string[] = [];
    
    if (smileRatio < 0.3) {
      recommendations.push("Чаще улыбайтесь для создания позитивной атмосферы");
      recommendations.push("Практикуйте естественную улыбку перед зеркалом");
    }
    if (eyeContactRatio < 0.6) {
      recommendations.push("Поддерживайте зрительный контакт с разными частями аудитории");
      recommendations.push("Используйте технику 'маяка' - фокусируйтесь на отдельных студентах");
    }
    if (score < 120) {
      recommendations.push("Работайте над выразительностью лица");
      recommendations.push("Записывайте себя для анализа мимики");
    }

    return recommendations;
  }

  private generateSpeechRecommendations(fillerRatio: number, wpm: number, vocabularyRichness: number, score: number): string[] {
    const recommendations: string[] = [];
    
    if (fillerRatio > 0.05) {
      recommendations.push("Работайте над устранением слов-паразитов");
      recommendations.push("Делайте паузы вместо использования 'эм' и 'ах'");
    }
    if (wpm < 120) {
      recommendations.push("Увеличьте темп речи для большей динамичности");
    }
    if (wpm > 180) {
      recommendations.push("Замедлите темп речи для лучшего понимания");
    }
    if (vocabularyRichness < 0.6) {
      recommendations.push("Расширяйте словарный запас, избегайте повторов");
    }
    if (score < 120) {
      recommendations.push("Практикуйте чтение вслух для улучшения дикции");
      recommendations.push("Записывайте свою речь для анализа");
    }

    return recommendations;
  }

  private generateEngagementRecommendations(score: number): string[] {
    const recommendations: string[] = [];
    
    if (score < 120) {
      recommendations.push("Увеличьте энергичность подачи материала");
      recommendations.push("Используйте больше интерактивных элементов");
      recommendations.push("Варьируйте тон голоса и темп речи");
      recommendations.push("Добавьте больше движений по аудитории");
    } else if (score < 160) {
      recommendations.push("Развивайте харизматичность через практику");
      recommendations.push("Работайте над эмоциональной выразительностью");
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