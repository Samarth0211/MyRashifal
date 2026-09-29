'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CHAT_POLL_INTERVAL } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChatWindow({ sessionId, sessionStatus, startedAt }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const lastTimestamp = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const url = `/api/chat/messages?sessionId=${sessionId}${
        lastTimestamp.current ? `&after=${lastTimestamp.current}` : ''
      }`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      if (data.messages?.length) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const newMsgs = data.messages.filter((m) => !existingIds.has(m._id));
          if (newMsgs.length === 0) return prev;
          return [...prev, ...newMsgs];
        });
        lastTimestamp.current = data.messages[data.messages.length - 1].createdAt;
      }
    } catch {
      // Silent poll failure
    }
  }, [sessionId]);

  // Poll for messages
  useEffect(() => {
    if (sessionStatus !== 'active') return;

    fetchMessages(); // immediate first fetch
    const interval = setInterval(fetchMessages, CHAT_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [sessionStatus, fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || sessionStatus !== 'active') return;

    setSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: input.trim() }),
      });

      if (res.ok) {
        setInput('');
        await fetchMessages();
      }
    } catch {
      // Silent
    } finally {
      setSending(false);
    }
  };

  const isActive = sessionStatus === 'active';

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && isActive && (
          <p className="text-center text-text-secondary text-sm py-8">
            {t('chat.startConversation')}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={msg._id || i}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-gold-primary/20 text-text-primary rounded-br-sm'
                  : 'bg-white/[0.06] text-text-primary rounded-bl-sm'
              }`}
            >
              <p className="break-words">{msg.message}</p>
              <p className="text-[10px] text-text-secondary mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isActive ? (
        <form onSubmit={handleSend} className="p-3 border-t border-white/[0.06] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.typePlaceholder')}
            className="flex-1 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-text-primary text-sm focus:outline-none focus:border-gold-primary/40"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-4 py-2 rounded-full bg-gold-primary text-bg-primary font-semibold text-sm disabled:opacity-40 hover:brightness-110 transition-all"
          >
            {t('chat.send')}
          </button>
        </form>
      ) : (
        <div className="p-4 text-center text-text-secondary text-sm border-t border-white/[0.06]">
          {sessionStatus === 'completed' ? t('chat.sessionEnded') : t('chat.waitingPayment')}
        </div>
      )}
    </div>
  );
}
