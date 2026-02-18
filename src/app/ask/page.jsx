'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PaymentButton from '@/components/PaymentButton';
import LoadingScreen from '@/components/LoadingScreen';
import { getKundli, savePurchase } from '@/lib/storage';
import { PRICING } from '@/lib/constants';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AskPage() {
  const { t, lang } = useLanguage();
  const [kundli, setKundli] = useState(null);
  const [question, setQuestion] = useState('');
  const [step, setStep] = useState('form'); // form | pay | loading | answer
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const EXAMPLE_QUESTIONS = [
    t('ask.example1'),
    t('ask.example2'),
    t('ask.example3'),
    t('ask.example4'),
    t('ask.example5'),
    t('ask.example6'),
  ];

  useEffect(() => {
    setKundli(getKundli());
  }, []);

  const handlePaymentSuccess = async (paymentId) => {
    savePurchase(`question_${Date.now()}`, paymentId);
    setStep('loading');
    setError('');

    try {
      const res = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, kundliData: kundli, lang }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAnswer(data);
      setHistory((prev) => [...prev, { question, answer: data }]);
      setStep('answer');
    } catch {
      setError(t('common.error'));
      setStep('pay');
    }
  };

  const handleNewQuestion = () => {
    setQuestion('');
    setAnswer(null);
    setStep('form');
    setError('');
  };

  // No kundli
  if (!kundli) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-6">❓</span>
        <h1 className="text-3xl font-heading font-bold mb-4">
          {t('ask.generateFirst')}
        </h1>
        <p className="text-text-secondary mb-8">
          {t('ask.noKundliDesc')}
        </p>
        <Link href="/kundli" className="btn-gold no-underline inline-block">
          {t('reports.generateFree')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          {t('ask.title').split(' ').slice(0, -1).join(' ')}{' '}
          <span className="text-gold-gradient">{t('ask.title').split(' ').slice(-1)[0]}</span>
        </h1>
        <p className="text-text-secondary">
          {t('ask.subtitle')}
        </p>
        <p className="text-gold-light text-sm mt-1">₹{PRICING.question.price} {t('ask.perQuestion')}</p>
      </div>

      {/* Form */}
      {step === 'form' && (
        <div className="animate-fade-in">
          <div className="card-mystical">
            <label className="block text-text-secondary text-sm mb-2">
              {t('ask.yourQuestion')}
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('ask.placeholder')}
              rows={4}
              className="input-mystical resize-none"
            />

            {/* Example Chips */}
            <div className="mt-4">
              <p className="text-text-secondary text-xs mb-2">{t('ask.tryThese')}</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuestion(q)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      question === q
                        ? 'border-gold-primary bg-gold-primary/10 text-gold-primary'
                        : 'border-border-custom text-text-secondary hover:border-gold-primary/50'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('pay')}
              disabled={!question.trim()}
              className="btn-gold w-full mt-6"
            >
              {t('ask.getAnswer')}
            </button>
          </div>

          {/* Previous Questions */}
          {history.length > 0 && (
            <div className="mt-10">
              <h2 className="font-heading text-lg font-bold text-gold-primary mb-4">
                {t('ask.previousQuestions')}
              </h2>
              <div className="space-y-4">
                {history.map((item, i) => (
                  <div key={i} className="card-mystical">
                    <p className="text-gold-light font-medium text-sm mb-2">
                      Q: {item.question}
                    </p>
                    <p className="text-text-secondary text-xs line-clamp-3">
                      {item.answer?.answer?.substring(0, 200)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment */}
      {step === 'pay' && (
        <div className="max-w-lg mx-auto text-center animate-fade-in">
          <div className="card-mystical">
            <span className="text-5xl block mb-4">❓</span>
            <h2 className="font-heading text-xl font-bold mb-4">{t('ask.yourQuestion')}</h2>
            <p className="text-gold-light text-sm italic mb-6">
              &ldquo;{question}&rdquo;
            </p>
            <p className="text-text-secondary text-sm mb-6">
              {t('ask.questionDesc')}
            </p>
            {error && <p className="text-accent-red text-sm mb-4">{error}</p>}
            <PaymentButton
              amount={PRICING.question.price}
              reportType="question"
              reportName="Ask a Question"
              onPaymentSuccess={handlePaymentSuccess}
            />
            <button
              onClick={() => setStep('form')}
              className="text-gold-primary text-sm mt-4 hover:underline block mx-auto"
            >
              {t('ask.editQuestion')}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {step === 'loading' && (
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingScreen message={t('ask.consulting')} />
        </div>
      )}

      {/* Answer */}
      {step === 'answer' && answer && (
        <div className="animate-fade-in">
          {/* Question */}
          <div className="highlight-box mb-6">
            <p className="text-text-secondary text-xs mb-1">{t('ask.yourQuestion')}</p>
            <p className="text-gold-light font-medium">&ldquo;{answer.question || question}&rdquo;</p>
          </div>

          {/* Chart Context */}
          {answer.chartContext && (
            <div className="card-mystical mb-6">
              <p className="text-text-secondary text-xs mb-1">{t('ask.chartContext')}</p>
              <p className="text-gold-primary text-sm italic">{answer.chartContext}</p>
            </div>
          )}

          {/* Answer */}
          <div className="report-section">
            <h3>{t('ask.detailedAnswer')}</h3>
            <div className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              {answer.answer}
            </div>
          </div>

          {/* Relevant Factors */}
          {answer.relevantFactors && answer.relevantFactors.length > 0 && (
            <div className="card-mystical mb-6">
              <h3 className="font-heading text-base font-bold text-gold-primary mb-3">{t('ask.keyFactors')}</h3>
              <ul className="space-y-1.5">
                {answer.relevantFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-gold-primary mt-0.5">✦</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advice */}
          {answer.advice && (
            <div className="highlight-box mb-6">
              <h3 className="font-heading text-base font-bold text-gold-primary mb-2">{t('ask.practicalAdvice')}</h3>
              <p className="text-text-primary text-sm">{answer.advice}</p>
            </div>
          )}

          {/* Remedy */}
          {answer.remedy && (
            <div className="card-mystical mb-6">
              <h3 className="font-heading text-base font-bold text-gold-primary mb-2">{t('ask.remedy')}</h3>
              <p className="text-text-primary text-sm">{answer.remedy}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 no-print">
            <button onClick={handleNewQuestion} className="btn-gold">
              {t('ask.askAnother')}
            </button>
            <button onClick={() => window.print()} className="btn-outline-gold">
              {t('common.downloadPdf')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
