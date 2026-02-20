import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Video, Brain, BarChart3, Users, Award, Shield } from 'lucide-react';

interface LandingProps {
  onLoginClick: () => void;
}

export default function Landing({ onLoginClick }: LandingProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="liquid-badge">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-xs font-700 uppercase tracking-wide text-[var(--text-primary)]">ENACTUS MARGULAN</span>
              <Zap className="w-4 h-4 text-[var(--accent)]" />
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-7xl sm:text-8xl md:text-9xl font-800 tracking-tight mb-6 text-gradient"
            style={{ textShadow: '0 0 80px rgba(128, 0, 32, 0.5)' }}
          >
            MugalimPipe
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-700 tracking-tight text-[var(--text-primary)] mb-8"
          >
            Оцените свои <span className="text-gradient">педагогические навыки</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Инновационная платформа с использованием AI для детального анализа ваших уроков.
            Получите персональные рекомендации для профессионального роста.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(255, 45, 85, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onLoginClick}
              className="group px-8 py-4 liquid-button liquid-button-primary text-lg flex items-center gap-3"
            >
              Начать анализ
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Features */}
          <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-6">
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
                className="liquid-glass p-8"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-600 text-[var(--text-primary)] mb-3">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
