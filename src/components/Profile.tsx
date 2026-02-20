import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Download, FileText, Trash2, User, Award, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileProps {
  session: any;
}

interface Report {
  id: string;
  title: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  total_score: number;
  percentage: number;
  grade: string;
  created_at: string;
  user_id: string;
}

const Profile: React.FC<ProfileProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'reports'>('account');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadReports = async () => {
    if (hasLoadedReports) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: loadError } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (loadError) {
        console.error('Error loading reports:', loadError);
        setError('Ошибка при загрузке отчетов');
      } else {
        setReports(data || []);
        setHasLoadedReports(true);
      }
    } catch (err) {
      console.error('Exception loading reports:', err);
      setError('Ошибка при загрузке отчетов');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report: Report) => {
    try {
      setDownloadingId(report.id);
      const { data, error } = await supabase.storage
        .from('reports')
        .download(report.storage_path);

      if (error) {
        console.error('Error downloading file:', error);
        alert('❌ Ошибка при скачивании файла');
        return;
      }

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('❌ Ошибка при скачивании отчета');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (reportId: string, storagePath: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отчет?')) return;
    try {
      await supabase.storage.from('reports').remove([storagePath]);
      const { error } = await supabase.from('reports').delete().eq('id', reportId);
      if (error) {
        console.error('Error deleting report:', error);
        alert('❌ Ошибка при удалении отчета');
        return;
      }
      setReports(reports.filter(r => r.id !== reportId));
      alert('✅ Отчет успешно удален');
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('❌ Ошибка при удалении отчета');
    }
  };

  const switchTab = (tab: 'account' | 'reports') => {
    setActiveTab(tab);
    if (tab === 'reports') loadReports();
  };

  const userName = session.user?.user_metadata?.user_name || session.user?.email || 'Пользователь';

  return (
    <div className="w-full max-w-6xl mx-auto relative z-10 px-4 py-8">
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass p-2 mb-8"
      >
        <div className="flex gap-2">
          <button
            onClick={() => switchTab('account')}
            className={`flex-1 liquid-button py-3 flex items-center justify-center gap-2 ${
              activeTab === 'account' ? 'liquid-button-primary' : ''
            }`}
          >
            <User className="w-5 h-5" />
            <span>Мой профиль</span>
          </button>
          <button
            onClick={() => switchTab('reports')}
            className={`flex-1 liquid-button py-3 flex items-center justify-center gap-2 ${
              activeTab === 'reports' ? 'liquid-button-primary' : ''
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Мои отчеты</span>
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'account' ? (
        // Account Tab
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass p-8"
        >
          <h2 className="text-3xl font-700 text-[var(--text-primary)] mb-8">Твой профиль</h2>

          <div className="grid gap-6">
            {/* User Info Card */}
            <div className="liquid-glass p-6">
              <div className="mb-6">
                <label className="block text-xs font-700 uppercase text-[var(--text-secondary)] mb-2">Никнейм</label>
                <p className="text-xl font-600 text-[var(--text-primary)]">{userName}</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-700 uppercase text-[var(--text-secondary)] mb-2">ID пользователя</label>
                <p className="text-sm text-[var(--text-tertiary)] font-mono break-all">{session.user?.id}</p>
              </div>

              <div>
                <label className="block text-xs font-700 uppercase text-[var(--text-secondary)] mb-2">Email (Виртуальный)</label>
                <p className="text-sm text-[var(--text-tertiary)]">{session.user?.email}</p>
              </div>
            </div>

            {/* Account Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="liquid-glass p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="liquid-glass w-12 h-12 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div className="text-xs font-700 uppercase text-[var(--text-secondary)]">Всего анализов</div>
                </div>
                <div className="text-4xl font-700 text-gradient">{reports.length}</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="liquid-glass p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="liquid-glass w-12 h-12 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div className="text-xs font-700 uppercase text-[var(--text-secondary)]">Уровень</div>
                </div>
                <div className="text-4xl font-700 text-gradient">PRO</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : (
        // Reports Tab
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-700 text-[var(--text-primary)]">Мои отчеты</h2>
          </div>

          {error && (
            <div className="liquid-glass p-4 mb-6 border border-red-500/30 bg-red-500/10">
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[var(--text-secondary)]">Загрузка отчетов...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="liquid-glass p-12 text-center">
              <p className="text-xl font-600 text-[var(--text-primary)] mb-3">📭 У тебя еще нет отчетов</p>
              <p className="text-[var(--text-secondary)] mb-6">
                Загрузи первое видео для анализа и получи детальный отчет!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="liquid-glass p-6"
                >
                  <div className="flex gap-6">
                    {/* Left side - Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                          report.percentage >= 80 ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)]' :
                          report.percentage >= 60 ? 'bg-gradient-to-br from-[var(--accent-light)] to-[var(--orange)]' :
                          'bg-gradient-to-br from-gray-600 to-gray-700'
                        }`}>
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-700 text-[var(--text-primary)] mb-1">
                            {report.title || 'Отчет без названия'}
                          </h4>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {new Date(report.created_at).toLocaleDateString('ru-RU', {
                              year: 'numeric', month: 'long', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Score badges */}
                      <div className="flex gap-3">
                        <div className="liquid-glass px-4 py-2">
                          <span className="text-xs font-700 uppercase text-[var(--text-secondary)]">Оценка</span>
                          <div className={`text-xl font-700 ${
                            report.percentage >= 80 ? 'text-[var(--accent)]' :
                            report.percentage >= 60 ? 'text-[var(--orange)]' : 'text-gray-500'
                          }`}>
                            {report.grade}
                          </div>
                        </div>
                        <div className="liquid-glass px-4 py-2">
                          <span className="text-xs font-700 uppercase text-[var(--text-secondary)]">Результат</span>
                          <div className="text-xl font-700 text-gradient">{report.totalScore}/1000</div>
                        </div>
                        <div className="liquid-glass px-4 py-2">
                          <span className="text-xs font-700 uppercase text-[var(--text-secondary)]">Процент</span>
                          <div className="text-xl font-700 text-[var(--green)]">{report.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(report)}
                        disabled={downloadingId === report.id}
                        className="liquid-button liquid-button-primary px-4 py-2 text-sm flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>{downloadingId === report.id ? '...' : 'Скачать'}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDelete(report.id, report.storage_path)}
                        className="liquid-button px-4 py-2 text-sm flex items-center gap-2 text-red-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Удалить</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
