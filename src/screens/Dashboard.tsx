import { useState, useEffect } from 'react';
import { Screen } from '../components/StepLayout';
import { GeneratedLP } from '../types';
import { getApiKey, setApiKey, getGithubToken, setGithubToken, getVercelToken, setVercelToken } from '../lib/lpGenerator';

interface Props {
  savedLPs: GeneratedLP[];
  onNew: () => void;
  onEdit: (lp: GeneratedLP) => void;
  onDelete: (id: string) => void;
  goTo: (s: Screen) => void;
}

const typeEmoji: Record<string, string> = { moradia: 'ðŸ ', investimento: 'ðŸ’°', neutra: 'âš–ï¸' };
const typeLabel: Record<string, string> = { moradia: 'Moradia', investimento: 'Investimento', neutra: 'Neutra' };

export default function Dashboard({ savedLPs, onNew, onEdit, onDelete }: Props) {
  const [apiKey, setApiKeyState] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [showApiPanel, setShowApiPanel] = useState(false);
  const [githubToken, setGithubTokenState] = useState(getGithubToken());
  const [vercelToken, setVercelTokenState] = useState(getVercelToken());
  const [tokensSaved, setTokensSaved] = useState(false);

  useEffect(() => {
    const stored = getApiKey();
    if (stored) setApiKeyState(stored);
    else setShowApiPanel(true);
  }, []);

  const saveKey = () => {
    setApiKey(apiKey.trim());
    setKeySaved(true);
    setShowApiPanel(false);
    setTimeout(() => setKeySaved(false), 3000);
  };

  const hasKey = !!getApiKey();

  return (
    <div style={{ minHeight: '100vh', background: '#0f1923' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#0f1923' }}>E</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Exclusiva Imobiliaria Rio</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Gerador de Landing Pages</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setShowApiPanel(!showApiPanel)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: hasKey ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(239,68,68,0.4)', background: hasKey ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', color: hasKey ? '#4ade80' : '#f87171' }}>
            {hasKey ? 'ðŸ”‘ API Key âœ“' : 'âš ï¸ Configurar API Key'}
          </button>
          <button onClick={onNew} style={{ background: '#c9a84c', color: '#0f1923', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            + Nova Landing Page
          </button>
        </div>
      </div>

      {showApiPanel && (
        <div style={{ background: 'rgba(201,168,76,0.06)', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '20px 32px' }}>
          <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c9a84c' }}>ðŸ”‘ Configure sua API Key da Anthropic</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Acesse <strong style={{ color: 'rgba(255,255,255,0.7)' }}>console.anthropic.com â†’ API Keys</strong> para gerar sua chave. Salva apenas no seu browser, nunca enviada a servidores externos.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="sk-ant-api03-..."
                  value={apiKey}
                  onChange={e => setApiKeyState(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveKey()}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '11px 44px 11px 14px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                />
                <button onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>
                  {showKey ? 'ðŸ™ˆ' : 'ðŸ‘'}
                </button>
              </div>
              <button onClick={saveKey} disabled={!apiKey.trim()} style={{ padding: '11px 24px', background: apiKey.trim() ? '#c9a84c' : 'rgba(255,255,255,0.06)', color: apiKey.trim() ? '#0f1923' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: apiKey.trim() ? 'pointer' : 'not-allowed' }}>
                {keySaved ? 'âœ“ Salvo!' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'LPs criadas', value: savedLPs.length, color: '#fff' },
            { label: 'Versoes Investidor', value: savedLPs.filter(l => l.type === 'investimento').length, color: '#c9a84c' },
            { label: 'Versoes Moradia', value: savedLPs.filter(l => l.type === 'moradia').length, color: 'rgba(255,255,255,0.5)' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

      {/* Tokens GitHub + Vercel */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 32px" }}>
        <div style={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>&#128279; Tokens de Publicacao</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>GitHub Token</div>
              <input type="password" placeholder="ghp_..." value={githubToken}
                onChange={e => setGithubTokenState(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 12, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>Vercel Token</div>
              <input type="password" placeholder="..." value={vercelToken}
                onChange={e => setVercelTokenState(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 12, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
            </div>
          </div>
          <button onClick={() => { setGithubToken(githubToken); setVercelToken(vercelToken); setTokensSaved(true); setTimeout(() => setTokensSaved(false), 2000); }}
            style={{ alignSelf: "flex-start", padding: "8px 20px", background: githubToken && vercelToken ? "#c9a84c" : "rgba(255,255,255,0.06)", color: githubToken && vercelToken ? "#0f1923" : "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {tokensSaved ? "&#10003; Salvo!" : "Salvar tokens"}
          </button>
        </div>
      </div>

      {savedLPs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>ðŸ—ï¸</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Nenhuma LP ainda</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
              {!hasKey ? 'Configure sua API Key acima e crie sua primeira LP' : 'Crie sua primeira landing page em menos de 10 minutos'}
            </div>
            <button onClick={hasKey ? onNew : () => setShowApiPanel(true)} style={{ background: '#c9a84c', color: '#0f1923', border: 'none', borderRadius: 10, padding: '14px 32px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {hasKey ? '+ Criar primeira LP' : 'âš™ï¸ Configurar API Key'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Landing Pages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {savedLPs.map(lp => (
                <div key={lp.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{typeEmoji[lp.type] ?? 'ðŸ“„'}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{lp.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{typeLabel[lp.type] ?? lp.type} Â· {lp.variant} Â· {lp.createdAt}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onEdit(lp)} style={{ padding: '8px 16px', fontSize: 12, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, background: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Ver / Editar</button>
                    <button onClick={() => onDelete(lp.id)} style={{ padding: '8px 12px', fontSize: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, background: 'none', color: 'rgba(239,68,68,0.5)', cursor: 'pointer' }}>âœ•</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






