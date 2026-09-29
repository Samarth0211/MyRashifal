'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';
import ChatTimer from '@/components/ChatTimer';
import StarRating from '@/components/StarRating';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChatPage() {
  const { t } = useLanguage();
  const { sessionId } = useParams();
  const { data: session } = useSession();
  const [chatSession, setChatSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/chat/messages?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setChatSession({
          status: data.sessionStatus,
          startedAt: data.startedAt,
          duration: data.duration,
        });
        if (data.sessionStatus === 'completed') {
          setExpired(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleExpire = useCallback(async () => {
    setExpired(true);
    try {
      await fetch('/api/chat/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      setChatSession((prev) => prev ? { ...prev, status: 'completed' } : prev);
    } catch {
      // Silent
    }
  }, [sessionId]);

  const handleRate = async () => {
    if (!rating) return;
    try {
      const res = await fetch('/api/chat/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, rating }),
      });
      if (res.ok) setRatingSubmitted(true);
    } catch {
      // Silent
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-gold-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-text-secondary mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-text-secondary">{t('chat.sessionNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
        <div>
          <h1 className="font-heading font-bold text-lg">{t('chat.title')}</h1>
          <p className="text-text-secondary text-xs">
            {chatSession.status === 'active' ? t('chat.sessionActive') :
             chatSession.status === 'completed' ? t('chat.sessionEnded') :
             t('chat.waitingPayment')}
          </p>
        </div>
        {chatSession.status === 'active' && chatSession.startedAt && (
          <ChatTimer
            startedAt={chatSession.startedAt}
            duration={chatSession.duration || 120}
            onExpire={handleExpire}
          />
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 min-h-0 card-mystical overflow-hidden flex flex-col">
        <ChatWindow
          sessionId={sessionId}
          sessionStatus={expired ? 'completed' : chatSession.status}
          startedAt={chatSession.startedAt}
        />
      </div>

      {/* Rating (after session ends) */}
      {expired && !ratingSubmitted && (
        <div className="mt-4 card-mystical p-5 text-center animate-fade-in">
          <p className="text-text-primary font-semibold mb-3">{t('chat.rateExperience')}</p>
          <StarRating value={rating} onChange={setRating} size="text-3xl" />
          {rating > 0 && (
            <button onClick={handleRate} className="btn-gold mt-4">
              {t('chat.submitRating')}
            </button>
          )}
        </div>
      )}

      {ratingSubmitted && (
        <div className="mt-4 text-center text-text-secondary text-sm animate-fade-in">
          {t('chat.ratingThanks')}
        </div>
      )}
    </div>
  );
}
