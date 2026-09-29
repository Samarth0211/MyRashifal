'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminAstrologersPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [astrologers, setAstrologers] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchAstrologers(tab);
  }, [tab]);

  const fetchAstrologers = async (filter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/astrologers?filter=${filter}`);
      const data = await res.json();
      if (res.ok) {
        setAstrologers(data.astrologers || []);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (astrologerId, status) => {
    setUpdating(astrologerId);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ astrologerId, status }),
      });
      if (res.ok) {
        setAstrologers((prev) =>
          prev.map((a) =>
            a._id === astrologerId ? { ...a, status } : a
          )
        );
      }
    } catch {
      // Silent
    } finally {
      setUpdating(null);
    }
  };

  // Check admin access
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email.toLowerCase());

  if (!isAdmin && session?.user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold text-red-400 mb-4">{t('admin.unauthorized')}</h1>
        <p className="text-text-secondary">{t('admin.adminOnly')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-8">
        {t('admin.manageAstrologers')}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setTab(f)}
            className={`px-5 py-2 rounded-full text-sm transition-all ${
              tab === f
                ? 'bg-gold-primary text-bg-primary font-semibold'
                : 'bg-white/[0.06] text-text-secondary hover:bg-white/[0.1]'
            }`}
          >
            {f === 'pending' ? t('admin.pending') : t('admin.allAstrologers')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-gold-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : astrologers.length === 0 ? (
        <p className="text-text-secondary text-center py-12">{t('admin.noAstrologers')}</p>
      ) : (
        <div className="space-y-4">
          {astrologers.map((a) => (
            <div key={a._id} className="card-mystical p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-text-primary text-lg">{a.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      a.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                      a.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    {a.email} | {a.phone}
                    {a.phoneVerified && <span className="text-green-400 text-xs ml-1" title="Phone verified">✓</span>}
                  </p>
                  <p className="text-text-secondary text-xs mt-1">
                    {a.experience} yrs | ₹{a.pricePerSession}/session |{' '}
                    {a.specializations?.join(', ')}
                  </p>
                  {a.bio && (
                    <p className="text-text-secondary text-xs mt-1 line-clamp-2">{a.bio}</p>
                  )}
                  <p className="text-text-secondary text-xs mt-1">
                    Registered: {new Date(a.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {a.status !== 'approved' && (
                    <button
                      onClick={() => handleAction(a._id, 'approved')}
                      disabled={updating === a._id}
                      className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-semibold hover:bg-green-500/30 transition-all disabled:opacity-40"
                    >
                      {t('admin.approve')}
                    </button>
                  )}
                  {a.status !== 'rejected' && (
                    <button
                      onClick={() => handleAction(a._id, 'rejected')}
                      disabled={updating === a._id}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all disabled:opacity-40"
                    >
                      {t('admin.reject')}
                    </button>
                  )}
                  {a.status === 'approved' && (
                    <button
                      onClick={() => handleAction(a._id, 'suspended')}
                      disabled={updating === a._id}
                      className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-semibold hover:bg-orange-500/30 transition-all disabled:opacity-40"
                    >
                      {t('admin.suspend')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
