import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Download, FileText, Trash2 } from 'lucide-react';
import SilkSimple from './SilkSimple';

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
      
      // Получаем файл из хранилища
      const { data, error } = await supabase.storage
        .from('reports')
        .download(report.storage_path);

      if (error) {
        console.error('Error downloading file:', error);
        alert('❌ Ошибка при скачивании файла');
        return;
      }

      // Создаем ссылку для скачивания
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
      // Удаляем файл из хранилища
      await supabase.storage
        .from('reports')
        .remove([storagePath]);

      // Удаляем запись из базы
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error('Error deleting report:', error);
        alert('❌ Ошибка при удалении отчета');
        return;
      }

      // Обновляем список
      setReports(reports.filter(r => r.id !== reportId));
      alert('✅ Отчет успешно удален');
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('❌ Ошибка при удалении отчета');
    }
  };

  const switchTab = (tab: 'account' | 'reports') => {
    setActiveTab(tab);
    if (tab === 'reports') {
      loadReports();
    }
  };

  const userName = session.user?.user_metadata?.user_name || session.user?.email || 'Пользователь';

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
      {/* Silk Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.3 }}>
        <SilkSimple
          speed={2}
          scale={1.2}
          color="#682c2c"
          noiseIntensity={1.0}
          rotation={0}
        />
      </div>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '30px' }}>
        <button
          onClick={() => switchTab('account')}
          style={{
            flex: 1,
            padding: '16px 0',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'account' ? '#dc2626' : '#9ca3af',
            borderBottom: activeTab === 'account' ? '3px solid #dc2626' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          👤 Мой профиль
        </button>
        <button
          onClick={() => switchTab('reports')}
          style={{
            flex: 1,
            padding: '16px 0',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'reports' ? '#dc2626' : '#9ca3af',
            borderBottom: activeTab === 'reports' ? '3px solid #dc2626' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          📊 Мои отчеты
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'account' ? (
        // Account Tab
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px', color: '#1f2937' }}>
            Твой профиль
          </h2>

          <div style={{ display: 'grid', gap: '20px' }}>
            {/* User Info Card */}
            <div
              style={{
                padding: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Никнейм
                </label>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>{userName}</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ID пользователя
                </label>
                <p style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {session.user?.id}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email (Виртуальный)
                </label>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{session.user?.email}</p>
              </div>
            </div>

            {/* Account Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fee2e2',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Всего анализов
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>
                  {reports.length}
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Учительский уровень
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
                  PRO
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Reports Tab
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
              Мои отчеты
            </h2>
          </div>

          {error && (
            <div
              style={{
                padding: '12px',
                marginBottom: '15px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '6px',
                border: '1px solid #fecaca',
              }}
            >
              ❌ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>Загрузка отчетов...</p>
            </div>
          ) : reports.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '2px dashed #d1d5db',
              }}
            >
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '10px' }}>
                📭 У тебя еще нет отчетов
              </p>
              <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
                Загрузи первое видео для анализа и получи детальный отчет!
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
              >
                + Загрузить видео
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {reports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px' }}>
                    {/* Left side - Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: report.percentage >= 80 ? '#dc2626' : report.percentage >= 60 ? '#f59e0b' : '#6b7280',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                            {report.title || 'Отчет без названия'}
                          </h4>
                          <p style={{ color: '#6b7280', fontSize: '13px' }}>
                            {new Date(report.created_at).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Score badges */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <div style={{
                          padding: '6px 12px',
                          backgroundColor: report.percentage >= 80 ? '#fef2f2' : report.percentage >= 60 ? '#fffbeb' : '#f3f4f6',
                          borderRadius: '6px',
                          border: `1px solid ${report.percentage >= 80 ? '#fecaca' : report.percentage >= 60 ? '#fde68a' : '#e5e7eb'}`
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Оценка</span>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: report.percentage >= 80 ? '#dc2626' : report.percentage >= 60 ? '#d97706' : '#6b7280' }}>
                            {report.grade}
                          </div>
                        </div>
                        <div style={{
                          padding: '6px 12px',
                          backgroundColor: '#eff6ff',
                          borderRadius: '6px',
                          border: '1px solid #bfdbfe'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Результат</span>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
                            {report.totalScore}/1000
                          </div>
                        </div>
                        <div style={{
                          padding: '6px 12px',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '6px',
                          border: '1px solid #bbf7d0'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Процент</span>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a' }}>
                            {report.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={downloadingId === report.id}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: downloadingId === report.id ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.3s ease',
                          opacity: downloadingId === report.id ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          if (downloadingId !== report.id) e.currentTarget.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          if (downloadingId !== report.id) e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                      >
                        <Download style={{ width: '16px', height: '16px' }} />
                        {downloadingId === report.id ? 'Загрузка...' : 'Скачать PDF'}
                      </button>
                      <button
                        onClick={() => handleDelete(report.id, report.storage_path)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.borderColor = '#fecaca';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.color = '#6b7280';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
