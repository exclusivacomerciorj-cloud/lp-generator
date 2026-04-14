import { useEffect, useState } from 'react';
import { Screen } from '../components/StepLayout';
import { FormData, GeneratedLP } from '../types';
import { generateLP } from '../lib/lpGenerator';

interface Props {
  form: FormData;
  updateForm: (d: Partial<FormData>) => void;
  goTo: (s: Screen) => void;
  generatedLPs: GeneratedLP[];
  setGeneratedLPs: (lps: GeneratedLP[]) => void;
}

interface VariantDef {
  key: string;
  label: string;
  type: FormData['lpType'];
  variant: string;
  showPrice: boolean;
  headlineVariant: 'A' | 'B';
  overrideType?: FormData['lpType'];
}

function getVariants(form: FormData): VariantDef[] {
  const variants: VariantDef[] = [];
  if (form.withPrice) variants.push({ key: 'base-price', label: `${form.name} — Com Preco`, type: form.lpType, variant: 'Com Preco', showPrice: true, headlineVariant: 'A' });
  if (form.withoutPrice) variants.push({ key: 'base-noprice', label: `${form.name} — Sem Preco`, type: form.lpType, variant: 'Sem Preco', showPrice: false, headlineVariant: 'A' });
  if (form.investorVersion) variants.push({ key: 'investor', label: `${form.name} — Investidor`, type: 'investimento', variant: 'Investidor', showPrice: form.withPrice, headlineVariant: 'A', overrideType: 'investimento' });
  if (form.housingVersion) variants.push({ key: 'housing', label: `${form.name} — Moradia`, type: 'moradia', variant: 'Moradia', showPrice: form.withPrice, headlineVariant: 'A', overrideType: 'moradia' });
  if (form.headlineVariation && variants.length > 0) {
    const base = variants[0];
    variants.push({ ...base, key: base.key + '-b', label: base.label + ' (Headline B)', variant: base.variant + ' — Headline B', headlineVariant: 'B' });
  }
  if (variants.length === 0) variants.push({ key: 'base', label: form.name, type: form.lpType, variant: 'Principal', showPrice: true, headlineVariant: 'A' });
  return variants;
}

type Status = 'pending' | 'generating' | 'done' | 'error';

export default function StepGenerate({ form, goTo, setGeneratedLPs }: Props) {
  const [progress, setProgress] = useState<{ key: string; label: string; status: Status }[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const variants = getVariants(form);

  useEffect(() => { if (!started) { setStarted(true); run(); } }, []);

  async function run() {
    setError('');
    const results: GeneratedLP[] = [];
    setProgress(variants.map(v => ({ key: v.key, label: v.label, status: 'pending' })));
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      setProgress(prev => prev.map(p => p.key === v.key ? { ...p, status: 'generating' } : p));
      try {
        const html = await generateLP(form, { showPrice: v.showPrice, variant: v.variant, headlineVariant: v.headlineVariant, overrideType: v.overrideType ?? v.type });
        results.push({ id: `${Date.now()}-${i}`, name: form.name, type: v.type, variant: v.variant, html, createdAt: new Date().toLocaleDateString('pt-BR'), formData: form });
        setProgress(prev => prev.map(p => p.key === v.key ? { ...p, status: 'done' } : p));
      } catch (err: unknown) {
        setProgress(prev => prev.map(p => p.key === v.key ? { ...p, status: 'error' } : p));
        setError(String(err));
      }
    }
    setGeneratedLPs(results);
    setAllDone(true);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1923', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 24px' }}>
        <button onClick={() => goTo('variations')} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>&#8592; Voltar</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', maxWidth: 540, margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 18 }}>&#128640;</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Gerando suas Landing Pages</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 30px' }}>A IA esta criando copy personalizado para cada versao</p>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {progress.map(p => (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '13px 16px', textAlign: 'left' }}>
              <div style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {p.status === 'pending' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)' }} />}
                {p.status === 'generating' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #c9a84c', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />}
                {p.status === 'done' && <span style={{ color: '#c9a84c', fontSize: 16, fontWeight: 700 }}>&#10003;</span>}
                {p.status === 'error' && <span style={{ color: '#ef4444', fontSize: 14 }}>&#10005;</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: p.status === 'done' ? '#fff' : p.status === 'generating' ? '#c9a84c' : 'rgba(255,255,255,0.35)' }}>{p.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 2, textTransform: 'capitalize' }}>
                  {p.status === 'generating' ? 'Gerando com IA...' : p.status === 'done' ? 'Concluido' : p.status === 'error' ? 'Erro' : 'Aguardando...'}
                </div>
              </div>
            </div>
          ))}
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#f87171', marginBottom: 18, textAlign: 'left', width: '100%' }}>&#9888; {error}</div>}
        {allDone && <button onClick={() => goTo('result')} style={{ padding: '14px 40px', background: '#c9a84c', color: '#0f1923', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Ver Resultado &#8594;</button>}
      </div>
    </div>
  );
}
