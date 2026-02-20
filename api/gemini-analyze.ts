import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const createCorsResponse = (res: VercelResponse, statusCode: number, body: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  return res.status(statusCode).json(body);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return createCorsResponse(res, 200, {});
  }

  if (req.method !== 'POST') {
    return createCorsResponse(res, 405, { error: 'Method not allowed' });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return createCorsResponse(res, 500, {
        error: 'Gemini API key not configured',
        configured: false
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    });

    const { action, analysisData, metricType, metricData, language = 'ru' } = req.body;

    switch (action) {
      case 'generate-professional-report':
        return await handleProfessionalReport(res, model, analysisData, language);

      case 'generate-enhanced-recommendations':
        return await handleEnhancedRecommendations(res, model, metricType, metricData, language);

      case 'test-connection':
        return await handleConnectionTest(res, model);

      default:
        return createCorsResponse(res, 400, { error: 'Unknown action' });
    }
  } catch (error: any) {
    console.error('Gemini AI error:', error);
    return createCorsResponse(res, 500, {
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function handleProfessionalReport(res: VercelResponse, model: any, analysisData: any, language: string) {
  try {
    const isKazakh = language === 'kk';
    const isRussian = language === 'ru';

    // Улучшенный промпт с фокусом на КОНКРЕТНЫЙ анализ речи
    const systemPrompt = isRussian ? `
Вы профессиональный эксперт по анализу педагогического мастерства с 20-летним опытом.

ВАЖНО: АНАЛИЗИРУЙТЕ КОНКРЕТНУЮ ТРАНСКРИПЦИЮ РЕЧИ УЧИТЕЛЯ!
- Цитируйте конкретные фразы из транскрипции
- Указывайте на конкретные слова-паразиты которые использует учитель
- Анализируйте конкретные формулировки и термины
- Давайте рекомендации основанные на РЕАЛЬНЫХ словах учителя

НЕ ИСПОЛЬЗУЙТЕ шаблонные фразы! Каждая рекомендация должна быть основана на конкретных словах из транскрипции.

ПРИМЕР ПРАВИЛЬНОГО АНАЛИЗА:
❌ ПЛОХО: "Работать над словами-паразитами"
✅ ХОРОШО: "Вы использовали слова-паразиты 'ну', 'короче', 'типа' 15 раз. Замените 'ну' на паузу, 'короче' на 'итак', 'типа' на 'например'"

❌ ПЛОХО: "Улучшить структуру урока"
✅ ХОРОШО: "Начало урока было хорошим ('Здравствуйте, садитесь'), но не было обозначено цели урока. Добавьте: 'Сегодня мы изучим...' после приветствия"

ФОРМАТ ОТВЕТА - СТРОГО JSON:
{
  "executiveSummary": "2-3 предложения с ОБЯЗАТЕЛЬНЫМ упоминанием конкретных моментов из речи",
  "detailedAnalysis": {
    "strengths": ["конкретная цитата или фраза которая была хорошей + почему", "еще одна конкретная сильная сторона", "третья сильная сторона", "четвертая сильная сторона"],
    "areasForImprovement": ["конкретная цитата проблемы + КАК исправить", "конкретная проблема + решение", "третья зона роста + рекомендация", "четвертая зона роста + совет"],
    "keyInsights": ["инсайт основанный на анализе речи", "инсайт про стиль преподавания", "инсайт про взаимодействие"]
  },
  "recommendations": {
    "immediate": ["что сказать на следующем уроке вместо...", "какую фразу изменить на..."],
    "shortTerm": ["какие упражнения делать", "какие слова заменить на..."],
    "longTerm": ["стратегические цели", "какие фразы-клише выучить"]
  },
  "actionPlan": {
    "week1": ["конкретная задача с примером фразы", "задача 2", "задача 3"],
    "week2": ["задача 1", "задача 2", "задача 3"],
    "week3": ["задача 1", "задача 2", "задача 3"],
    "week4": ["задача 1", "задача 2", "задача 3"]
  },
  "motivationalMessage": "вдохновляющее сообщение с упоминанием конкретного успеха учителя",
  "nextSteps": ["шаг 1", "шаг 2", "шаг 3"]
}
` : `
Сіз 20 жылдық тәжірибесі бар педагогикалық шеберлікті талдау жөніндегі кәсіби сарапшысыз.

МАҢЫЗДЫ: МҰҒАЛІМНІҢ НАҚТЫ СӨЙЛЕГЕН СӨЗДЕРІН ТАЛДАҢЫЗ!
- Транскрипциядан нақты сөздерді келтіріңіз
- Мұғалім қолданған нақты паразит сөздерді көрсетіңіз
- Нақты сөздер мен терминдерді талдаңыз
- Мұғалімнің НАҚТЫ сөздеріне негізделген ұсыныстар беріңіз

ЖАУАП ФОРМАТЫ - ҚАТАҢ JSON:
{
  "executiveSummary": "2-3 сөйлем, сөйлеуден нақты мысалдармен",
  "detailedAnalysis": {
    "strengths": ["нақты жақсы сөйлем немесе сөз + неге жақсы", "екінші нақты күшті жақ", "үшінші", "төртінші"],
    "areasForImprovement": ["нақты проблема + ҚАЛАЙ түзету", "екінші проблема + шешім", "үшінші", "төртінші"],
    "keyInsights": ["сөйлеу талдауына негізделген инсайт", "оқыту стилі туралы инсайт", "өзара әрекеттесу туралы инсайт"]
  },
  "recommendations": {
    "immediate": ["келесі сабақта не айту керек", "қай сөзді өзгерту керек"],
    "shortTerm": ["қандай жаттығулар жасау", "қай сөздерді неге ауыстыру"],
    "longTerm": ["стратегиялық мақсаттар", "қандай сөз тіркестерін жаттау"]
  },
  "actionPlan": {
    "week1": ["сөз мысалымен нақты тапсырма", "тапсырма 2", "тапсырма 3"],
    "week2": ["тапсырма 1", "тапсырма 2", "тапсырма 3"],
    "week3": ["тапсырма 1", "тапсырма 2", "тапсырма 3"],
    "week4": ["тапсырма 1", "тапсырма 2", "тапсырма 3"]
  },
  "motivationalMessage": "мұғалімнің нақты жетістігін атап өтетін шабыттандыратын хабарлама",
  "nextSteps": ["1-қадам", "2-қадам", "3-қадам"]
}
`;

    // Извлекаем конкретные слова-паразиты из транскрипции
    const transcription = analysisData.transcription || '';
    const fillerWordsFound = findFillerWords(transcription);
    const keyPhrases = extractKeyPhrases(transcription);
    const greetingAnalysis = analyzeGreeting(transcription);
    const instructionsAnalysis = analyzeInstructions(transcription);

    const dataSection = `
=== ДЕТАЛЬНЫЙ АНАЛИЗ ТРАНСКРИПЦИИ ===

ПОЛНАЯ ТРАНСКРИПЦИЯ РЕЧИ УЧИТЕЛЯ:
"${transcription}"

=== АНАЛИЗ КОНКРЕТНЫХ СЛОВ ===

НАЙДЕНЫ СЛОВА-ПАРАЗИТЫ (конкретные примеры):
${fillerWordsFound.length > 0 ? fillerWordsFound.map(fw => `- "${fw.word}" использовано ${fw.count} раз(а) - ЗАМЕНИТЬ НА: ${fw.replacement}`).join('\n') : 'Слова-паразиты не найдены'}

КЛЮЧЕВЫЕ ФРАЗЫ КОТОРЫЕ ИСПОЛЬЗОВАЛ УЧИТЕЛЬ:
${keyPhrases.length > 0 ? keyPhrases.map(kp => `- "${kp}"`).join('\n') : 'Нет данных'}

АНАЛИЗ ПРИВЕТСТВИЯ:
${greetingAnalysis.found ? `✅ Найдено: "${greetingAnalysis.text}"` : '❌ Приветствие не найдено - ДОБАВИТЬ: "Здравствуйте, садитесь!"'}

АНАЛИЗ ИНСТРУКЦИЙ:
${instructionsAnalysis.hasClearInstructions ? `✅ Инструкции даны четко` : '❌ Инструкции нечеткие - ИСПОЛЬЗОВАТЬ: "Откройте учебник на странице...", "Запишите в тетрадь..."'}

=== ЧИСЛОВЫЕ МЕТРИКИ ===

МЕТРИКИ ПОЗЫ И ОСАНКИ:
- Общий балл: ${analysisData.scoringResults.metrics.posture.score}/200
- Выравнивание позвоночника: ${analysisData.scoringResults.metrics.posture.spineAlignment}/40
- Симметрия плеч: ${analysisData.scoringResults.metrics.posture.shoulderSymmetry}/40
- Положение головы: ${analysisData.scoringResults.metrics.posture.headPosition}/40
- Стабильность: ${analysisData.scoringResults.metrics.posture.stability}/40
- Уверенность: ${analysisData.scoringResults.metrics.posture.confidence}/40
- Проблемы: ${(analysisData.scoringResults.metrics.posture.issues || []).join(', ') || 'Не выявлено'}

МЕТРИКИ ЖЕСТИКУЛЯЦИИ:
- Общий балл: ${analysisData.scoringResults.metrics.gesticulation.score}/200
- Разнообразие жестов: ${analysisData.scoringResults.metrics.gesticulation.variety}/40
- Частота: ${analysisData.scoringResults.metrics.gesticulation.frequency}/40
- Уместность: ${analysisData.scoringResults.metrics.gesticulation.appropriateness}/40
- Выразительность: ${analysisData.scoringResults.metrics.gesticulation.expressiveness}/40
- Координация: ${analysisData.scoringResults.metrics.gesticulation.coordination}/40
- Типы жестов: ${(analysisData.scoringResults.metrics.gesticulation.gestures || []).join(', ') || 'Не определено'}

МЕТРИКИ МИМИКИ:
- Общий балл: ${analysisData.scoringResults.metrics.facial.score}/200
- Выразительность: ${analysisData.scoringResults.metrics.facial.expressiveness}/40
- Зрительный контакт: ${analysisData.scoringResults.metrics.facial.eyeContact}/40
- Частота улыбок: ${analysisData.scoringResults.metrics.facial.smileFrequency}/40
- Эмоциональный диапазон: ${analysisData.scoringResults.metrics.facial.emotionalRange}/40
- Аутентичность: ${analysisData.scoringResults.metrics.facial.authenticity}/40

МЕТРИКИ РЕЧИ:
- Общий балл: ${analysisData.scoringResults.metrics.speech.score}/200
- Ясность: ${analysisData.scoringResults.metrics.speech.clarity}/40
- Темп: ${analysisData.scoringResults.metrics.speech.pace}/40
- Громкость: ${analysisData.scoringResults.metrics.speech.volume}/40
- Словарный запас: ${analysisData.scoringResults.metrics.speech.vocabulary}/40
- Грамматика: ${analysisData.scoringResults.metrics.speech.grammar}/40
- Слова-паразиты (из анализа): ${analysisData.scoringResults.metrics.speech.fillerWords || 0}
- Слов в минуту: ${analysisData.audioAnalysis?.vocabulary?.speakingRate || 'Н/Д'}

МЕТРИКИ ВОВЛЕЧЕННОСТИ:
- Общий балл: ${analysisData.scoringResults.metrics.engagement.score}/200
- Внимание: ${analysisData.scoringResults.metrics.engagement.attention}/40
- Взаимодействие: ${analysisData.scoringResults.metrics.engagement.interaction}/40
- Энергия: ${analysisData.scoringResults.metrics.engagement.energy}/40
- Присутствие: ${analysisData.scoringResults.metrics.engagement.presence}/40
- Харизма: ${analysisData.scoringResults.metrics.engagement.charisma}/40

ОБЩИЙ РЕЗУЛЬТАТ:
- Балл: ${analysisData.scoringResults.totalScore}/1000
- Процент: ${analysisData.scoringResults.percentage.toFixed(1)}%
- Оценка: ${analysisData.scoringResults.grade}

=== ЗАДАНИЕ ДЛЯ AI ===
ПРОАНАЛИЗИРУЙТЕ КОНКРЕТНЫЕ СЛОВА УЧИТЕЛЯ ИЗ ТРАНСКРИПЦИИ ВЫШЕ!
ДАЙТЕ РЕКОМЕНДАЦИИ ОСНОВАННЫЕ НА РЕАЛЬНЫХ ФРАЗАХ КОТОРЫЕ ОН ИСПОЛЬЗОВАЛ!
`;

    const fullPrompt = systemPrompt + '\n\n' + dataSection;

    console.log('🤖 Generating AI report with concrete speech analysis...');
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Извлекаем JSON из ответа
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedResponse;
    
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON, using fallback');
        parsedResponse = createFallbackReport(analysisData, language, transcription, fillerWordsFound);
      }
    } else {
      parsedResponse = createFallbackReport(analysisData, language, transcription, fillerWordsFound);
    }

    return createCorsResponse(res, 200, {
      success: true,
      result: parsedResponse
    });
  } catch (error: any) {
    console.error('Professional report generation failed:', error);
    return createCorsResponse(res, 500, {
      success: false,
      error: error.message
    });
  }
}

// Функция для поиска слов-паразитов в транскрипции
function findFillerWords(transcription: string): Array<{word: string, count: number, replacement: string}> {
  const fillerWordsMap: Record<string, string> = {
    'ну': 'пауза',
    'эм': 'пауза',
    'ах': 'пауза',
    'короче': 'итак',
    'типа': 'например',
    'как бы': 'пауза',
    'вот': 'пауза',
    'значит': 'итак',
    'собственно': 'пауза',
    'вроде': 'пауза'
  };

  const result: Array<{word: string, count: number, replacement: string}> = [];
  const lowerTranscription = transcription.toLowerCase();

  Object.entries(fillerWordsMap).forEach(([word, replacement]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerTranscription.match(regex);
    if (matches && matches.length > 0) {
      result.push({ word, count: matches.length, replacement });
    }
  });

  return result.sort((a, b) => b.count - a.count);
}

// Функция для извлечения ключевых фраз
function extractKeyPhrases(transcription: string): string[] {
  const phrases: string[] = [];
  
  // Ищем приветствия
  const greetingMatch = transcription.match(/^(здравствуйте|привет|добрый день|доброе утро)/i);
  if (greetingMatch) phrases.push(greetingMatch[0]);

  // Ищем инструкции
  const instructionPatterns = [
    /откройте (учебник|тетрадь|страницу)/i,
    /запишите (в тетрадь|себе)/i,
    /посмотрите на/i,
    /давайте (начнем|рассмотрим)/i,
    /сегодня мы (изучим|рассмотрим|узнаем)/i
  ];

  instructionPatterns.forEach(pattern => {
    const match = transcription.match(pattern);
    if (match) phrases.push(match[0]);
  });

  return phrases;
}

// Анализ приветствия
function analyzeGreeting(transcription: string): {found: boolean, text: string} {
  const greetingMatch = transcription.match(/^(здравствуйте|привет|добрый день|доброе утро)[,!.\s]{0,10}([а-яё\s,]{0,30})/i);
  if (greetingMatch) {
    return { found: true, text: greetingMatch[0].trim() };
  }
  return { found: false, text: '' };
}

// Анализ инструкций
function analyzeInstructions(transcription: string): {hasClearInstructions: boolean, examples: string[]} {
  const instructionPatterns = [
    /откройте (учебник|тетрадь|страницу)/i,
    /запишите (в тетрадь|себе)/i,
    /посмотрите на/i
  ];

  const examples: string[] = [];
  let hasClearInstructions = false;

  instructionPatterns.forEach(pattern => {
    const match = transcription.match(pattern);
    if (match) {
      hasClearInstructions = true;
      examples.push(match[0]);
    }
  });

  return { hasClearInstructions, examples };
}

function createFallbackReport(analysisData: any, language: string) {
  const isRussian = language === 'ru';
  
  const score = analysisData.scoringResults.totalScore;
  const percentage = analysisData.scoringResults.percentage;
  
  let strengths = [];
  let areasForImprovement = [];
  let motivationalMessage = '';

  if (score >= 800) {
    strengths = isRussian ? [
      'Отличная структура урока',
      'Уверенная поза и осанка',
      'Выразительная жестикуляция',
      'Хороший зрительный контакт с аудиторией'
    ] : [
      'Сабақтың тамаша құрылымы',
      'Сенімді дене бітімі',
      'Мәнерлі ым-ишара',
      'Аудиториямен жақсы көз байланысы'
    ];
    areasForImprovement = isRussian ? [
      'Можно добавить больше интерактивных элементов',
      'Следить за темпом речи в ключевых моментах'
    ] : [
      'Интерактивті элементтерді көбірек қосу',
      'Негізгі сәттерде сөйлеу қарқынын бақылау'
    ];
    motivationalMessage = isRussian 
      ? 'Превосходная работа! Ваш профессионализм на высоком уровне. Продолжайте совершенствоваться!'
      : 'Керемет жұмыс! Сіздің кәсібилігіңіз жоғары деңгейде. Жетілдіруді жалғастырыңыз!';
  } else if (score >= 600) {
    strengths = isRussian ? [
      'Хорошая базовая структура урока',
      'Стабильная поза во время урока',
      'Использование жестов для акцентов',
      'Достаточный зрительный контакт'
    ] : [
      'Сабақтың жақсы негізгі құрылымы',
      'Сабақ кезінде тұрақты дене бітімі',
      'Екпін қою үшін ым-ишараны қолдану',
      'Жеткілікті көз байланысы'
    ];
    areasForImprovement = isRussian ? [
      'Разнообразить жестикуляцию для большей выразительности',
      'Уменьшить количество слов-паразитов',
      'Добавить больше эмоциональной выразительности',
      'Работать над стабильностью позы'
    ] : [
      'Мәнерлілік үшін ым-ишараны әртараптандыру',
      'Паразит сөздерді азайту',
      'Эмоционалды өрнектеуді көбейту',
      'Дене бітімінің тұрақтылығымен жұмыс'
    ];
    motivationalMessage = isRussian
      ? 'Хороший результат! У вас solid база для дальнейшего роста. Сфокусируйтесь на рекомендациях!'
      : 'Жақсы нәтиже! Сізде одан әрі өсу үшін мықты негіз бар. Ұсыныстарға назар аударыңыз!';
  } else {
    strengths = isRussian ? [
      'Понимание материала урока',
      'Попытки использовать жесты',
      'Стремление к зрительному контакту'
    ] : [
      'Сабақ материалын түсіну',
      'Ым-ишараны қолдану әрекеттері',
      'Көз байланысына ұмтылыс'
    ];
    areasForImprovement = isRussian ? [
      'Работать над осанкой - держать спину прямо',
      'Развивать выразительность жестов',
      'Уменьшить слова-паразиты в речи',
      'Добавить больше энергии и вовлеченности',
      'Практиковать зрительный контакт со всеми учениками'
    ] : [
      'Дене бітімімен жұмыс - арқаны тік ұстау',
      'Ым-ишара мәнерлілігін дамыту',
      'Сөйлеудегі паразит сөздерді азайту',
      'Көбірек энергия мен белсенділік қосу',
      'Барлық оқушылармен көз байланысын жаттығу'
    ];
    motivationalMessage = isRussian
      ? 'Каждый эксперт начинал с чего-то! Используйте эти рекомендации как план развития. У вас всё получится!'
      : 'Әр сарапшы қайдан да бастаған! Бұл ұсыныстарды даму жоспары ретінде қолданыңыз. Сіз бәрін істей аласыз!';
  }

  return {
    professionalReport: {
      executiveSummary: isRussian 
        ? `Результат ${score}/1000 (${percentage.toFixed(1)}%). ${score >= 600 ? 'Хороший уровень с потенциалом роста.' : 'Есть зоны для улучшения.'}`
        : `Нәтиже ${score}/1000 (${percentage.toFixed(1)}%). ${score >= 600 ? 'Өсу әлеуеті бар жақсы деңгей.' : 'Жақсарту аймақтары бар.'}`,
      detailedAnalysis: {
        strengths,
        areasForImprovement,
        keyInsights: isRussian ? [
          'Наибольший потенциал в развитии жестикуляции',
          'Речь требует работы над чистотой',
          'Вовлеченность можно улучшить через энергию'
        ] : [
          'Ым-ишараны дамытуда үлкен әлеует',
          'Сөйлеу тазалығымен жұмыс қажет',
          'Белсенділік арқылы қатысуды жақсартуға болады'
        ]
      },
      recommendations: {
        immediate: isRussian ? [
          'Записывать себя на видео для самоанализа',
          'Практиковать позу у стены 5 минут в день',
          'Следить за словами-паразитами'
        ] : [
          'Өзін-өзі талдау үшін бейнеге түсіру',
          'Күніне 5 минут қабырға жанында дене бітімін жаттығу',
          'Паразит сөздерді бақылау'
        ],
        shortTerm: isRussian ? [
          'Курс по ораторскому мастерству',
          'Упражнения на выразительность жестов',
          'Практика осознанной речи'
        ] : [
          'Шешендік өнер курсы',
          'Ым-ишара мәнерлілігіне жаттығулар',
          'Саналы сөйлеуді жаттығу'
        ],
        longTerm: isRussian ? [
          'Профессиональное развитие педагогических навыков',
          'Участие в мастер-классах',
          'Работа с ментором'
        ] : [
          'Педагогикалық дағдыларды кәсіби дамыту',
          'Шеберлік сыныптарына қатысу',
          'Ментормен жұмыс'
        ]
      },
      actionPlan: {
        week1: isRussian ? ['Контроль осанки', 'Запись на видео', 'Анализ слов-паразитов'] : ['Дене бітімін бақылау', 'Бейнеге жазу', 'Паразит сөздерді талдау'],
        week2: isRussian ? ['Упражнения для жестов', 'Практика улыбки', 'Темп речи'] : ['Ым-ишара жаттығулары', 'Күлкіні жаттығу', 'Сөйлеу қарқыны'],
        week3: isRussian ? ['Зрительный контакт', 'Эмоциональность', 'Структура урока'] : ['Көз байланысы', 'Эмоционалдылық', 'Сабақ құрылымы'],
        week4: isRussian ? ['Анализ прогресса', 'План развития', 'Новые цели'] : ['Прогресті талдау', 'Даму жоспары', 'Жаңа мақсаттар']
      }
    },
    enhancedRecommendations: {
      posture: isRussian ? ['Держать спину прямо', 'Расправить плечи', 'Контролировать положение головы'] : ['Арқаны тік ұстау', 'Иықты жазу', 'Бас позициясын бақылау'],
      gesticulation: isRussian ? ['Использовать открытые жесты', 'Избегать скрещенных рук', 'Жестикулировать естественно'] : ['Ашық ым-ишараны қолдану', 'Қолды айқастырмау', 'Табиғи ым-ишара жасау'],
      facial: isRussian ? ['Чаще улыбаться', 'Поддерживать зрительный контакт', 'Показывать эмоции'] : ['Көбірек күлу', 'Көз байланысын ұстау', 'Эмоция көрсету'],
      speech: isRussian ? ['Говорить четче', 'Контролировать темп', 'Уменьшать слова-паразиты'] : ['Анық сөйлеу', 'Қарқынды бақылау', 'Паразит сөздерді азайту'],
      engagement: isRussian ? ['Добавлять энергию', 'Взаимодействовать с аудиторией', 'Показывать энтузиазм'] : ['Энергия қосу', 'Аудиториямен қарым-қатынас', 'Ынта-ықылас көрсету']
    },
    motivationalMessage,
    nextSteps: isRussian ? [
      'Изучить рекомендации',
      'Составить план действий',
      'Начать с малых шагов'
    ] : [
      'Ұсыныстарды зерттеу',
      'Іс-қимыл жоспарын құру',
      'Кішігірім қадамдардан бастау'
    ]
  };
}

async function handleEnhancedRecommendations(res: VercelResponse, model: any, metricType: string, metricData: any, language: string) {
  try {
    const percentage = (metricData.currentScore / metricData.maxScore) * 100;

    const prompts = {
      posture: {
        ru: `Вы эксперт по телесному языку педагога. Дайте 5 конкретных рекомендаций для улучшения осанки и позы учителя. Текущий результат: ${percentage.toFixed(0)}%.`,
        kk: `Сіз педагогтың дене тілі бойынша сарапшысыз. Мұғалімнің дене бітімін жақсарту үшін 5 нақты ұсыныс беріңіз. Ағымдағы нәтиже: ${percentage.toFixed(0)}%.`
      },
      gesticulation: {
        ru: `Вы эксперт по жестикуляции. Дайте 5 конкретных рекомендаций для развития выразительности жестов учителя. Текущий результат: ${percentage.toFixed(0)}%.`,
        kk: `Сіз ым-ишара бойынша сарапшысыз. Мұғалімнің ым-ишара мәнерлілігін дамыту үшін 5 нақты ұсыныс беріңіз. Ағымдағы нәтиже: ${percentage.toFixed(0)}%.`
      },
      facial: {
        ru: `Вы эксперт по мимике и зрительному контакту. Дайте 5 конкретных рекомендаций для улучшения выразительности лица учителя. Текущий результат: ${percentage.toFixed(0)}%.`,
        kk: `Сіз мимика және көз байланысы бойынша сарапшысыз. Мұғалімнің бет әлпетінің мәнерлілігін жақсарту үшін 5 нақты ұсыныс беріңіз. Ағымдағы нәтиже: ${percentage.toFixed(0)}%.`
      },
      speech: {
        ru: `Вы эксперт по речи и дикции. Дайте 5 конкретных рекомендаций для улучшения качества речи учителя. Текущий результат: ${percentage.toFixed(0)}%.`,
        kk: `Сіз сөйлеу және дикция бойынша сарапшысыз. Мұғалімнің сөйлеу сапасын жақсарту үшін 5 нақты ұсыныс беріңіз. Ағымдағы нәтиже: ${percentage.toFixed(0)}%.`
      },
      engagement: {
        ru: `Вы эксперт по вовлеченности и харизме. Дайте 5 конкретных рекомендаций для развития педагогической харизмы. Текущий результат: ${percentage.toFixed(0)}%.`,
        kk: `Сіз белсенділік және харизма бойынша сарапшысыз. Педагогикалық харизманы дамыту үшін 5 нақты ұсыныс беріңіз. Ағымдағы нәтиже: ${percentage.toFixed(0)}%.`
      }
    };

    const prompt = prompts[metricType as keyof typeof prompts]?.[language === 'kk' ? 'kk' : 'ru'] || prompts.posture.ru;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const recommendations = text.split('\n')
      .filter(line => line.trim().length > 10 && !line.includes('*'))
      .map(line => line.replace(/^[\d\.\-\*]+\s*/, '').trim())
      .slice(0, 7);

    return createCorsResponse(res, 200, {
      success: true,
      result: recommendations
    });
  } catch (error: any) {
    console.error('Enhanced recommendations generation failed:', error);
    return createCorsResponse(res, 500, {
      success: false,
      error: error.message
    });
  }
}

async function handleConnectionTest(res: VercelResponse, model: any) {
  try {
    const result = await model.generateContent("Ответьте 'OK' если вы работаете корректно.");
    const response = await result.response;
    const text = response.text();

    return createCorsResponse(res, 200, {
      success: true,
      message: 'Gemini AI connection successful',
      response: text.trim()
    });
  } catch (error: any) {
    console.error('Gemini connection test failed:', error);
    return createCorsResponse(res, 200, {
      success: false,
      message: `Connection failed: ${error.message}`
    });
  }
}
