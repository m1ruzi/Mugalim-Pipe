interface LandingProps {
  onLoginClick: () => void;
}

export default function Landing({ onLoginClick }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-apple-gray-50 to-white flex flex-col items-center justify-center px-4">
      {/* Main Content */}
      <div className="text-center max-w-3xl mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/logo-book.png" 
            alt="MugalimPipe Logo" 
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-700 tracking-tight mb-6 bg-gradient-to-r from-carmine-600 to-carmine-700 bg-clip-text text-transparent">
          MugalimPipe
        </h1>

        {/* Subtitle */}
        <p className="text-2xl sm:text-4xl font-600 text-gray-900 mb-8 leading-tight">
          Оцени свои педагогические навыки
        </p>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
          Инновационная платформа для анализа и улучшения качества преподавания. 
          Используйте передовые технологии AI для получения детальной обратной связи по вашим педагогическим навыкам.
        </p>

        {/* CTA Button */}
        <button
          onClick={onLoginClick}
          className="px-8 py-4 bg-carmine-600 text-white text-lg font-600 rounded-2xl hover:bg-carmine-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          Начать анализ
        </button>

        {/* Features Preview */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-apple-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-carmine-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">📹</span>
            </div>
            <h3 className="font-600 text-gray-900 mb-2">Загрузи видео</h3>
            <p className="text-sm text-gray-500">Отправь запись своего урока или выступления</p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-apple-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-carmine-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="font-600 text-gray-900 mb-2">AI Анализ</h3>
            <p className="text-sm text-gray-500">Получи детальный анализ твоих навыков преподавания</p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-apple-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-carmine-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-600 text-gray-900 mb-2">Рекомендации</h3>
            <p className="text-sm text-gray-500">Получи рекомендации для улучшения качества преподавания</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-carmine-50 rounded-xl">
            <div className="text-4xl font-700 text-carmine-600 mb-2">1000+</div>
            <p className="text-gray-600">Учителей уже улучшили свои навыки</p>
          </div>
          <div className="p-6 bg-carmine-50 rounded-xl">
            <div className="text-4xl font-700 text-carmine-600 mb-2">95%</div>
            <p className="text-gray-600">Удовлетворены результатами анализа</p>
          </div>
        </div>
      </div>

      {/* Footer on Landing */}
      <div className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>© 2026 MugalimPipe. Платформа для развития педагогических навыков.</p>
      </div>
    </div>
  );
}
