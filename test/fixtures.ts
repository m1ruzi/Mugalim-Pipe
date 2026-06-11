// Тестовые данные, имитирующие то, что приходит от внешних API.

// --- 1. «Сырой» ответ Yandex SpeechKit v1 stt:recognize ---
// Именно такой объект возвращает axios.post в api/yandex-transcribe.ts
export const yandexRawResponse = {
  result: {
    alternatives: [
      {
        text: 'Здравствуйте ребята сегодня мы рассмотрим квадратные уравнения ну это очень важная тема значит откройте учебник',
        confidence: 0.92
      }
    ]
  }
};

// --- 2. Результат транскрипции (то, что отдаёт /api/yandex-transcribe фронтенду) ---
// Имитируем TranscriptionResult после обработки на сервере.
export const transcriptionResult = {
  text: 'Здравствуйте ребята сегодня мы рассмотрим квадратные уравнения ну это очень важная тема значит откройте учебник на странице сорок два',
  confidence: 0.9,
  words: [] as any[],
  duration: 120,
  detectedLanguages: [
    { languageCode: 'ru-RU', probability: 0.9, text: 'Здравствуйте ребята...' },
    { languageCode: 'kk-KZ', probability: 0.1, text: '...' }
  ],
  fillerWordsAnalysis: {
    totalFillerWords: 3,
    fillerWordsRatio: 3 / 22,
    commonFillers: [
      { word: 'ну', count: 1, timestamps: [12.3] },
      { word: 'это', count: 1, timestamps: [13.1] },
      { word: 'значит', count: 1, timestamps: [18.0] }
    ],
    fillerWordsByLanguage: { 'ru-RU': 3 }
  }
};

// --- 3. audioData в форме, которую AudioAnalysisService отдаёт ScoringService ---
// Построено на основе transcriptionResult (показываем происхождение данных).
const words = transcriptionResult.text.split(/\s+/).filter(Boolean);
export const audioData = {
  transcription: transcriptionResult.text,
  vocabulary: {
    wordCount: words.length,
    uniqueWordCount: new Set(words.map(w => w.toLowerCase())).size,
    speakingRate: 132, // слов/мин
    fillerWords: transcriptionResult.fillerWordsAnalysis.totalFillerWords,
    fillerWordsRatio: transcriptionResult.fillerWordsAnalysis.fillerWordsRatio,
    fillerWordsAnalysis: transcriptionResult.fillerWordsAnalysis
  },
  characteristics: {
    rms: 0.12,
    duration: 120,
    speechRatio: 0.7,
    qualityScore: 0.75
  },
  transcriptionMetadata: {
    source: 'yandex' as const,
    confidence: 0.9,
    detectedLanguages: transcriptionResult.detectedLanguages,
    isMultilingual: true,
    languageSwitches: 1,
    fillerWordsDetected: true,
    fillerWordsCount: 3
  }
};

export const videoDuration = 120;

// --- 4. Кадры MediaPipe (имитация результата analyzeVideo) ---
function jitter(base: number, amp: number) {
  return base + (Math.random() - 0.5) * amp;
}

export function makePoseData(frames = 120): any[] {
  const data: any[] = [];
  for (let i = 0; i < frames; i++) {
    const landmarks = new Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.9 }));
    landmarks[0] = { x: jitter(0.5, 0.02), y: jitter(0.25, 0.01), z: 0, visibility: 0.95 }; // нос
    landmarks[11] = { x: jitter(0.4, 0.01), y: jitter(0.4, 0.01), z: 0, visibility: 0.95 }; // левое плечо
    landmarks[12] = { x: jitter(0.6, 0.01), y: jitter(0.4, 0.01), z: 0, visibility: 0.95 }; // правое плечо
    landmarks[23] = { x: jitter(0.42, 0.01), y: jitter(0.7, 0.01), z: 0, visibility: 0.9 }; // левое бедро
    landmarks[24] = { x: jitter(0.58, 0.01), y: jitter(0.7, 0.01), z: 0, visibility: 0.9 }; // правое бедро
    data.push({ timestamp: i * 1000, landmarks, worldLandmarks: landmarks, confidence: 0.9 });
  }
  return data;
}

export function makeGestureData(frames = 80): any[] {
  const cats = ['Open_Palm', 'Pointing_Up', 'Thumb_Up', 'Victory'];
  const data: any[] = [];
  for (let i = 0; i < frames; i++) {
    const cat = cats[i % cats.length];
    data.push({
      timestamp: i * 1.5,
      gestures: [[{ categoryName: cat, score: 0.6 + Math.random() * 0.35 }]],
      handedness: [[{ categoryName: 'Right', score: 0.9 }]],
      landmarks: [],
      handCount: 1
    });
  }
  return data;
}

export function makeFaceData(frames = 120): any[] {
  const data: any[] = [];
  for (let i = 0; i < frames; i++) {
    data.push({
      timestamp: i * 1000,
      blendshapes: {
        categories: [
          { categoryName: 'mouthSmileLeft', score: jitter(0.4, 0.2) },
          { categoryName: 'mouthSmileRight', score: jitter(0.4, 0.2) },
          { categoryName: 'browInnerUp', score: jitter(0.3, 0.2) },
          { categoryName: 'eyeLookOutLeft', score: jitter(0.1, 0.1) },
          { categoryName: 'eyeLookDownLeft', score: jitter(0.1, 0.1) }
        ]
      },
      confidence: 0.9
    });
  }
  return data;
}
