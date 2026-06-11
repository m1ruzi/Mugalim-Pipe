import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Video, Brain, BarChart3 } from 'lucide-react';

interface LandingProps {
  onLoginClick: () => void;
}

export default function Landing({ onLoginClick }: LandingProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-12 sm:py-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto w-full"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="liquid-badge inline-flex">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--accent)]" />
              <span className="text-[10px] sm:text-xs font-700 uppercase tracking-wide text-[var(--text-primary)]">ENACTUS MARGULAN</span>
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--accent)]" />
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-800 tracking-tight mb-4 sm:mb-6 text-gradient"
            style={{ textShadow: '0 0 80px rgba(128, 0, 32, 0.5)' }}
          >
            MugalimPipe
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={itemVariants}
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-700 tracking-tight text-[var(--text-primary)] mb-6 sm:mb-8 px-2"
          >
            Оцените свои <span className="text-gradient">педагогические навыки</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Инновационная платформа с использованием AI для детального анализа ваших уроков.
            Получите персональные рекомендации для профессионального роста.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(255, 45, 85, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onLoginClick}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 liquid-button liquid-button-primary text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3"
            >
              Начать анализ
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Features */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 px-3 sm:px-0">
            {[
              {
                icon: Video,
                title: 'Загрузи видео',
                description: 'Отправь запись своего урока или выступления в любом формате',
                gradient: 'from-[var(--accent)] to-[var(--accent-light)]'
              },
              {
                icon: Brain,
                title: 'AI Анализ',
                description: 'Получи детальный анализ позы, жестов, мимики и речи',
                gradient: 'from-[var(--accent)] to-[var(--purple)]'
              },
              {
                icon: BarChart3,
                title: 'Рекомендации',
                description: 'Персональные советы для улучшения навыков преподавания',
                gradient: 'from-[var(--accent-dark)] to-[var(--accent)]'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="liquid-glass p-5 sm:p-8"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg`}>
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-600 text-[var(--text-primary)] mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
