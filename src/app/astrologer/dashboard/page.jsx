'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AstrologerDashboardPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return;

    Promise.all([
      fetch('/api/astrologer/profile').then((r) => r.json()),
      fetch('/api/astrologer/sessions').then((r) => r.json()),
    ])
      .then(([profileData, sessionData]) => {
        if (profileData.error) {
          router.push('/astrologer/register');
          return;
        }
        setProfile(profileData);
        setSessions(sessionData.sessions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      const res = await fetch('/api/astrologer/toggle-online', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setProfile((p) => ({ ...p, isOnline: data.isOnline }));
      }
    } catch {
      // Silent
    } finally {
      setToggling(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-gold-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-text-secondary mb-4">{t('astrologer.loginFirst')}</p>
        <button onClick={() => signIn('google')} className="btn-gold">
          {t('common.signInGoogle')}
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalEarnings = completedSessions.reduce((sum, s) => sum + (s.astrologerPayout || 0), 0);
  const activeSessions = sessions.filter((s) => s.status === 'active');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-8">
        {t('astrologer.dashboard')}
      </h1>

      {/* Status Banner */}
      {profile.status === 'pending' && (
        <div className="card-mystical p-4 mb-6 border-l-4 border-yellow-500">
          <p className="text-yellow-300 font-semibold">{t('astrologer.statusPending')}</p>
          <p className="text-text-secondary text-sm">{t('astrologer.pendingApproval')}</p>
        </div>
      )}
      {profile.status === 'rejected' && (
        <div className="card-mystical p-4 mb-6 border-l-4 border-red-500">
          <p className="text-red-400 font-semibold">{t('astrologer.statusRejected')}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card-mystical p-4 text-center">
          <p className="text-text-secondary text-xs">{t('astrologer.status')}</p>
          <p className={`font-bold text-lg capitalize ${
            profile.status === 'approved' ? 'text-green-400' :
            profile.status === 'pending' ? 'text-yellow-300' : 'text-red-400'
          }`}>
            {profile.status}
          </p>
        </div>
        <div className="card-mystical p-4 text-center">
          <p className="text-text-secondary text-xs">{t('astrologer.rating')}</p>
          <p className="text-gold-light font-bold text-lg">
            {profile.rating?.average || 0} <span className="text-gold-primary text-sm">★</span>
          </p>
        </div>
        <div className="card-mystical p-4 text-center">
          <p className="text-text-secondary text-xs">{t('astrologer.totalSessions')}</p>
          <p className="text-text-primary font-bold text-lg">{completedSessions.length}</p>
        </div>
        <div className="card-mystical p-4 text-center">
          <p className="text-text-secondary text-xs">{t('astrologer.earnings')}</p>
          <p className="text-green-400 font-bold text-lg">₹{(totalEarnings / 100).toFixed(0)}</p>
        </div>
      </div>

      {/* Online Toggle */}
      {profile.status === 'approved' && (
        <div className="card-mystical p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold text-text-primary">{t('astrologer.availability')}</p>
            <p className="text-text-secondary text-sm">
              {profile.isOnline ? t('astrologer.onlineDesc') : t('astrologer.offlineDesc')}
            </p>
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={toggling}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
              profile.isOnline
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            {profile.isOnline ? t('astrologer.online') : t('astrologer.offline')}
          </button>
        </div>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-lg font-bold mb-4 text-gold-primary">
            {t('astrologer.activeSessions')}
          </h2>
          {activeSessions.map((s) => (
            <div key={s.sessionId} className="card-mystical p-4 mb-3 flex items-center justify-between">
              <div>
                <p className="text-text-primary font-semibold">{s.userName}</p>
                <p className="text-text-secondary text-xs">
                  {new Date(s.startedAt).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => router.push(`/chat/${s.sessionId}`)}
                className="btn-gold text-sm"
              >
                {t('astrologer.joinChat')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Session History */}
      <h2 className="font-heading text-lg font-bold mb-4">{t('astrologer.sessionHistory')}</h2>
      {completedSessions.length === 0 ? (
        <p className="text-text-secondary text-sm">{t('astrologer.noSessions')}</p>
      ) : (
        <div className="space-y-3">
          {completedSessions.slice(0, 20).map((s) => (
            <div key={s.sessionId} className="card-mystical p-4 flex items-center justify-between">
              <div>
                <p className="text-text-primary text-sm">{s.userName}</p>
                <p className="text-text-secondary text-xs">
                  {new Date(s.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-semibold">
                  ₹{((s.astrologerPayout || 0) / 100).toFixed(0)}
                </p>
                {s.userRating && (
                  <p className="text-gold-primary text-xs">
                    {'★'.repeat(s.userRating)}{'☆'.repeat(5 - s.userRating)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
