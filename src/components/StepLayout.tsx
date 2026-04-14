import React from 'react';

export type Screen =
  | 'dashboard' | 'product' | 'positioning' | 'commercial'
  | 'differentials' | 'visual' | 'experience' | 'variations'
  | 'generate' | 'result';

const STEPS: { id: Screen; label: string; num: number }[] = [
  { id: 'product', label: 'Produto', num: 1 },
  { id: 'positioning', label: 'Estratégia', num: 2 },
  { id: 'commercial', label: 'Condição', num: 3 },
  { id: 'differentials', label: 'Diferenciais', num: 4 },
  { id: 'visual', label: 'Visual', num: 5 },
  { id: 'experience', label: 'UX', num: 6 },
  { id: 'variations', label: 'Variações', num: 7 },
  { id: 'generate', label: 'Gerar', num: 8 },
];

interface Props {
  title: string;
  subtitle?: string;
  currentStep: Screen;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  goTo: (s: Screen) => void;
}

export default function StepLayout({
  title, subtitle, currentStep, children,
  onBack, onNext, nextLabel = 'Continuar →', nextDisabled = false, goTo,
}: Props) {
  const currentNum = STEPS.find(s => s.id === currentStep)?.num ?? 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f1923' }}>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => goTo('dashboard')}
          style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Dashboard
        </button>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {STEPS.map((step) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: step.num < currentNum ? '#c9a84c' : step.num === currentNum ? '#fff' : 'rgba(255,255,255,0.08)',
                color: step.num <= currentNum ? '#0f1923' : 'rgba(255,255,255,0.25)',
                boxShadow: step.num === currentNum ? '0 0 0 3px rgba(255,255,255,0.15)' : 'none',
                transition: 'all 0.2s',
              }}>
                {step.num < currentNum ? '✓' : step.num}
              </div>
              {step.num < STEPS.length && (
                <div style={{ width: 20, height: 2, background: step.num < currentNum ? '#c9a84c' : 'rgba(255,255,255,0.08)', borderRadius: 2, transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{currentNum}/8</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 780, margin: '0 auto', width: '100%', padding: '40px 24px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#fff' }}>{title}</h1>
          {subtitle && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>}
        </div>

        <div style={{ flex: 1 }}>{children}</div>

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onBack}
            style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', background: 'none', fontSize: 13, cursor: 'pointer' }}
          >
            ← Voltar
          </button>
          <button
            onClick={onNext}
            disabled={nextDisabled}
            style={{
              padding: '12px 32px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: nextDisabled ? 'not-allowed' : 'pointer',
              background: nextDisabled ? 'rgba(255,255,255,0.06)' : '#c9a84c',
              color: nextDisabled ? 'rgba(255,255,255,0.2)' : '#0f1923',
              transition: 'all 0.2s',
            }}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
