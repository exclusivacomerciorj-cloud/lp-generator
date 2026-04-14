import { useState } from 'react';
import { Screen } from '../components/StepLayout';
import { FormData, GeneratedLP } from '../types';
import { getApiKey } from '../lib/lpGenerator';

interface Props {
  form: FormData;
  updateForm: (d: Partial<FormData>) => void;
  goTo: (s: Screen) => void;
  generatedLPs: GeneratedLP[];
  setGeneratedLPs: (lps: GeneratedLP[]) => void;
  onSave: (lps: GeneratedLP[]) => void;
  onBackToDashboard: () => void;
}

export default function StepResult({ form, goTo, generatedLPs, setGeneratedLPs, onSave, onBackToDashboard }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState('');
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop'|'mobile'>('desktop');
  const active = generatedLPs[activeIdx];

  const download = (lp: GeneratedLP) => {
    const blob = new Blob([lp.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lp.name.replace(/\s+/g,'-').toLowerCase()}-${lp.variant.replace(/[\s/]+/g,'-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refineLP = async () => {
    if (!refinePrompt.trim()) return;
    setRefining(true); setRefineError('');
    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error('API key nao configurada.');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 8000,
          messages: [{ role: 'user', content: `Voce e especialista em landing pages imobiliarias. Recebera um HTML completo e uma instrucao de ajuste. Responda APENAS com o HTML completo modificado. Sem explicacoes, sem markdown. Apenas HTML bruto comecando com <!DOCTYPE html>.\n\nHTML atual:\n${active.html}\n\nINSTRUCAO:\n${refinePrompt}\n\nGere o HTML completo atualizado:` }],
        }),
      });
      if (!response.ok) { const e = await response.json() as { error?: { message?: string } }; throw new Error(e.error?.message ?? `HTTP ${response.status}`); }
      const data = await response.json() as { content?: { text?: string }[] };
      const rawHtml = data.content?.[0]?.text ?? '';
      const match = rawHtml.match(/<!DOCTYPE html[\s\S]*/i) ?? rawHtml.match(/<html[\s\S]*/i);
      const newHtml = match ? match[0] : rawHtml.replace(/^```html?\n?/i,'').replace(/```\s*$/i,'').trim();
      setGeneratedLPs(generatedLPs.map((lp,i) => i === activeIdx ? { ...lp, html: newHtml } : lp));
      setRefinePrompt('');
    } catch (err: unknown) { setRefineError(String(err)); }
    finally { setRefining(false); }
  };

  if (!active) return <div style={{ minHeight: '100vh', background: '#0f1923', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Nenhuma LP gerada.</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0f1923', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => goTo('variations')} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>&#8592; Voltar</button>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{form.name}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>— {generatedLPs.length} versao{generatedLPs.length !== 1 ? 'es' : ''}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { onSave(generatedLPs); setSaved(true); }} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${saved ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`, background: saved ? 'rgba(34,197,94,0.1)' : 'none', color: saved ? '#4ade80' : 'rgba(255,255,255,0.6)' }}>
            {saved ? '&#10003; Salvo' : 'Salvar'}
          </button>
          <button onClick={onBackToDashboard} style={{ padding: '8px 16px', background: '#c9a84c', color: '#0f1923', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Dashboard &#8594;</button>
        </div>
      </div>

      {/* Tabs */}
      {generatedLPs.length > 1 && (
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 20px', display: 'flex', gap: 2, flexShrink: 0, overflowX: 'auto' }}>
          {generatedLPs.map((lp, i) => (
            <button key={lp.id} onClick={() => setActiveIdx(i)} style={{ padding: '12px 18px', fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: `2px solid ${i === activeIdx ? '#c9a84c' : 'transparent'}`, color: i === activeIdx ? '#c9a84c' : 'rgba(255,255,255,0.35)', transition: 'all 0.2s' }}>
              {lp.variant}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {['desktop','mobile'].map(m => (
          <button key={m} onClick={() => setPreviewMode(m as 'desktop'|'mobile')} style={{ padding: '5px 14px', borderRadius: 6, fontSize: 11, background: previewMode === m ? 'rgba(255,255,255,0.1)' : 'none', border: `1px solid ${previewMode === m ? 'rgba(255,255,255,0.2)' : 'transparent'}`, color: previewMode === m ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer', textTransform: 'capitalize' }}>
            {m === 'desktop' ? '&#128421; Desktop' : '&#128241; Mobile'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => download(active)} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 11, background: '#c9a84c', color: '#0f1923', border: 'none', fontWeight: 700, cursor: 'pointer' }}>&#8659; Baixar HTML</button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Preview */}
        <div style={{ flex: 1, background: '#1a1a2e', display: 'flex', alignItems: previewMode === 'mobile' ? 'flex-start' : 'stretch', justifyContent: 'center', padding: previewMode === 'mobile' ? '20px' : '0', overflowY: 'auto' }}>
          <iframe key={active.id + active.html.length} srcDoc={active.html}
            style={{ width: previewMode === 'mobile' ? '390px' : '100%', height: previewMode === 'mobile' ? '844px' : '100%', border: previewMode === 'mobile' ? '2px solid rgba(255,255,255,0.1)' : 'none', borderRadius: previewMode === 'mobile' ? 24 : 0, flexShrink: 0 }}
            title="Preview LP" sandbox="allow-scripts allow-same-origin allow-forms" />
        </div>

        {/* Sidebar */}
        <div style={{ width: 290, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', background: '#0f1923' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Detalhes</div>
            {[{ label: 'Tipo', value: active.type },{ label: 'Variante', value: active.variant },{ label: 'Criada em', value: active.createdAt }].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{row.label}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>{row.value}</span>
              </div>
            ))}
          </div>
          {generatedLPs.length > 1 && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => generatedLPs.forEach(lp => download(lp))} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}>
                Baixar todas ({generatedLPs.length})
              </button>
            </div>
          )}
          <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Refinar com IA</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 10px', lineHeight: 1.5 }}>Descreva o que quer ajustar. A IA atualiza mantendo a estrutura.</p>
            <textarea
              style={{ flex: 1, minHeight: 110, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px', color: '#fff', fontSize: 11, outline: 'none', resize: 'none', lineHeight: 1.5 }}
              placeholder={'Ex:\n- Mudar headline\n- Botoes mais chamativos\n- Mais urgencia'}
              value={refinePrompt} onChange={e => setRefinePrompt(e.target.value)} />
            {refineError && <div style={{ fontSize: 11, color: '#f87171', marginTop: 6 }}>{refineError}</div>}
            <button onClick={refineLP} disabled={refining || !refinePrompt.trim()} style={{ marginTop: 8, width: '100%', padding: '10px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: refining || !refinePrompt.trim() ? 'not-allowed' : 'pointer', background: refining || !refinePrompt.trim() ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: refining || !refinePrompt.trim() ? 'rgba(255,255,255,0.2)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {refining ? <><div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />Refinando...</> : '&#10022; Refinar esta versao'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
