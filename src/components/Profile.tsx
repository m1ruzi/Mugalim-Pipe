import React, { useState } from 'react';
import { supabase } from '../supabase';

interface ProfileProps {
  session: any;
}

interface Report {
  id: string;
  title: string;
  content: any;
  created_at: string;
  user_id: string;
}

const Profile: React.FC<ProfileProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'reports'>('account');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);

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

  const switchTab = (tab: 'account' | 'reports') => {
    setActiveTab(tab);
    if (tab === 'reports') {
      loadReports();
    }
  };

  const userName = session.user?.user_metadata?.user_name || session.user?.email || 'Пользователь';

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
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
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                        {report.title || 'Отчет без названия'}
                      </h4>
                      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                        {new Date(report.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <div
                        style={{
                          padding: '12px',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                          fontSize: '13px',
                          color: '#4b5563',
                          maxHeight: '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {typeof report.content === 'string'
                          ? report.content.substring(0, 200)
                          : JSON.stringify(report.content).substring(0, 200)}
                      </div>
                    </div>
                    <button
                      style={{
                        padding: '8px 16px',
                        marginLeft: '15px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                    >
                      Просмотр
                    </button>
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
