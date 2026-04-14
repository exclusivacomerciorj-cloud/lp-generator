import { useRef, useState } from 'react';
import StepLayout, { Screen } from '../components/StepLayout';
import { FormData, ImageFile } from '../types';
import { getApiKey } from '../lib/lpGenerator';

interface Props { form: FormData; updateForm: (d: Partial<FormData>) => void; goTo: (s: Screen) => void; }

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
};

function Field({ label, placeholder, value, onChange, textarea }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, height: 90, resize: 'none' }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

interface AutoFillResult {
  found: boolean;
  location?: string;
  typology?: string;
  area?: string;
  parking?: string;
  differentials?: string;
  price?: string;
  entry?: string;
  installments?: string;
  strongPoints?: string[];
  lpType?: 'moradia' | 'investimento' | 'neutra';
  mainTrigger?: 'preco' | 'localizacao' | 'vista' | 'condicao';
  summary?: string;
}

async function fetchProductInfo(name: string, apiKey: string): Promise<AutoFillResult> {
  const prompt = `Você é um assistente especialista em pesquisa de lançamentos imobiliários no Brasil.

Pesquise na web todas as informações disponíveis sobre o empreendimento imobiliário chamado: "${name}"

Após pesquisar, retorne APENAS um JSON válido com estas informações (deixe "" se nÁo encontrar):

{
  "found": true,
  "location": "Bairro, Cidade - UF",
  "typology": "ex: Apartamentos de 2 e 3 quartos",
  "area": "ex: 65mÂ² a 88mÂ²",
  "parking": "ex: 1 a 2 vagas",
  "price": "ex: R$ 800.000",
  "entry": "ex: R$ 49.000",
  "installments": "ex: R$ 1.900/mês durante a obra",
  "differentials": "DescriçÁo completa dos diferenciais: lazer, infraestrutura, localizaçÁo, sustentabilidade...",
  "strongPoints": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3", "Ponto forte 4", "Ponto forte 5"],
  "lpType": "moradia ou investimento ou neutra",
  "mainTrigger": "preco ou localizacao ou vista ou condicao",
  "summary": "Resumo de 1-2 frases sobre o empreendimento"
}

REGRAS:
- Retorne SOMENTE o JSON, sem texto antes ou depois, sem markdown
- Se nÁo encontrar, retorne {"found": false}
- strongPoints: tags curtas (ex: "Varanda gourmet", "Vista para o mar")
- lpType: studios/compactos = "investimento", 3+ quartos familiar = "moradia", misto = "neutra"
- mainTrigger: preço especial = "preco", localizaçÁo = "localizacao", vista = "vista", condiçÁo = "condicao"`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json() as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `HTTP ${response.status}`);
  }

  const data = await response.json() as { content?: { type: string; text?: string }[] };

  // Pega o Áºltimo bloco de texto â€” resposta final após a busca
  const textBlocks = (data.content ?? []).filter(b => b.type === 'text' && b.text);
  const lastText = textBlocks[textBlocks.length - 1]?.text ?? '';

  // Extrai JSON da resposta
  const jsonMatch = lastText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { found: false };

  try {
    return JSON.parse(jsonMatch[0]) as AutoFillResult;
  } catch {
    return { found: false };
  }
}

export default function StepProduct({ form, updateForm, goTo }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'notfound' | 'error'>('idle');
  const [searchMsg, setSearchMsg] = useState('');
  const [filledFields, setFilledFields] = useState<string[]>([]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img: ImageFile = {
          id: Date.now() + Math.random() + '',
          name: file.name,
          base64: ev.target?.result as string,
          label: file.name.replace(/\.[^.]+$/, ''),
        };
        updateForm({ images: [...form.images, img] });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAutoFill = async () => {
    if (!form.name.trim()) return;
    setSearching(true);
    setSearchStatus('searching');
    setSearchMsg('');
    setFilledFields([]);

    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error('API key nÁo configurada. Volte ao dashboard e configure.');
      const result = await fetchProductInfo(form.name.trim(), apiKey);

      if (!result.found) {
        setSearchStatus('notfound');
        setSearchMsg('NÁo encontrei informações sobre esse empreendimento na web. Preencha os campos manualmente.');
        return;
      }

      const updates: Partial<FormData> = {};
      const filled: string[] = [];

      if (result.location)     { updates.location     = result.location;     filled.push('LocalizaçÁo'); }
      if (result.typology)     { updates.typology     = result.typology;     filled.push('Tipologia'); }
      if (result.area)         { updates.area         = result.area;         filled.push('Metragem'); }
      if (result.parking)      { updates.parking      = result.parking;      filled.push('Vagas'); }
      if (result.differentials){ updates.differentials= result.differentials; filled.push('Diferenciais'); }
      if (result.price)        { updates.price        = result.price;        filled.push('Preço'); }
      if (result.entry)        { updates.entry        = result.entry;        filled.push('Entrada'); }
      if (result.installments) { updates.installments = result.installments; filled.push('Parcelas'); }
      if (result.lpType)       { updates.lpType       = result.lpType;       filled.push('Tipo de LP'); }
      if (result.mainTrigger)  { updates.mainTrigger  = result.mainTrigger;  filled.push('Gatilho principal'); }
      if (result.strongPoints && result.strongPoints.length > 0) {
        updates.strongPoints = result.strongPoints;
        filled.push('Pontos fortes');
      }

      updateForm(updates);
      setFilledFields(filled);
      setSearchStatus('found');
      setSearchMsg(result.summary ?? 'Informações preenchidas. Confira e ajuste se necessário.');
    } catch (err: unknown) {
      setSearchStatus('error');
      setSearchMsg('Erro ao buscar: ' + String(err));
    } finally {
      setSearching(false);
    }
  };

  const statusStyle = {
    found:    { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',   color: '#4ade80', icon: 'âœ“' },
    notfound: { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  color: '#fbbf24', icon: 'âš ï¸' },
    error:    { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   color: '#f87171', icon: '✕' },
  };

  return (
    <StepLayout
      title="Dados do Produto"
      subtitle="Informações básicas do empreendimento"
      currentStep="product"
      goTo={goTo}
      onBack={() => goTo('dashboard')}
      onNext={() => goTo('positioning')}
      nextDisabled={!form.name.trim() || !form.location.trim()}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Nome + botÁo busca */}
        <div>
          <label style={labelStyle}>Nome do Empreendimento *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Ex: Breeze Inspire Residence"
              value={form.name}
              onChange={e => {
                updateForm({ name: e.target.value });
                if (searchStatus !== 'idle') { setSearchStatus('idle'); setSearchMsg(''); setFilledFields([]); }
              }}
              onKeyDown={e => { if (e.key === 'Enter' && form.name.trim()) handleAutoFill(); }}
            />
            <button
              onClick={handleAutoFill}
              disabled={searching || !form.name.trim()}
              style={{
                padding: '0 20px', height: 46, borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 12,
                cursor: searching || !form.name.trim() ? 'not-allowed' : 'pointer',
                background: searching
                  ? 'rgba(201,168,76,0.25)'
                  : !form.name.trim()
                    ? 'rgba(255,255,255,0.05)'
                    : '#c9a84c',
                color: searching || !form.name.trim() ? 'rgba(255,255,255,0.25)' : '#0f1923',
                display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              {searching ? (
                <>
                  <div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.7)', animation: 'lp-spin 0.7s linear infinite' }} />
                  Buscando...
                </>
              ) : <>ðŸ” Buscar informações</>}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>
            Digite o nome e clique em buscar â€” a IA pesquisa na web e preenche os campos automaticamente
          </div>
        </div>

        {/* Banner de busca em andamento */}
        {searchStatus === 'searching' && (
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(201,168,76,0.3)', borderTopColor: '#c9a84c', animation: 'lp-spin 0.7s linear infinite', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, color: '#c9a84c', fontWeight: 600 }}>Pesquisando na web...</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Buscando localizaçÁo, tipologia, metragem, preços e diferenciais</div>
            </div>
          </div>
        )}

        {/* Banner resultado */}
        {(searchStatus === 'found' || searchStatus === 'notfound' || searchStatus === 'error') && (
          <div style={{
            padding: '14px 18px', borderRadius: 12,
            background: statusStyle[searchStatus]?.bg,
            border: `1px solid ${statusStyle[searchStatus]?.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 15, lineHeight: '1.4', flexShrink: 0 }}>{statusStyle[searchStatus]?.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: statusStyle[searchStatus]?.color, fontWeight: 600 }}>{searchMsg}</div>
                {filledFields.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {filledFields.map(f => (
                      <span key={f} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                        âœ“ {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Campos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="LocalizaçÁo *" placeholder="Ex: Barra da Tijuca, Rio de Janeiro" value={form.location} onChange={v => updateForm({ location: v })} />
          <Field label="Tipologia" placeholder="Ex: Apartamentos de 2 e 3 quartos" value={form.typology} onChange={v => updateForm({ typology: v })} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <Field label="Metragem" placeholder="Ex: 65mÂ² a 88mÂ²" value={form.area} onChange={v => updateForm({ area: v })} />
          <Field label="Vagas" placeholder="Ex: 1 a 2 vagas" value={form.parking} onChange={v => updateForm({ parking: v })} />
          <Field label="Preço (a partir de)" placeholder="Ex: R$ 800.000" value={form.price} onChange={v => updateForm({ price: v })} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Entrada (a partir de)" placeholder="Ex: R$ 49.000" value={form.entry} onChange={v => updateForm({ entry: v })} />
          <Field label="Parcelas (a partir de)" placeholder="Ex: R$ 1.900/mês" value={form.installments} onChange={v => updateForm({ installments: v })} />
        </div>

        <Field
          label="Diferenciais"
          placeholder="Ex: Piscina com vista para o mar, academia completa, coworking, pet place..."
          value={form.differentials}
          onChange={v => updateForm({ differentials: v })}
          textarea
        />

        {/* Preview pontos fortes preenchidos */}
        {form.strongPoints.length > 0 && (
          <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Pontos fortes identificados â€” editáveis na etapa 4
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {form.strongPoints.map(pt => (
                <span key={pt} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 99, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c' }}>
                  {pt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Config técnica */}
        <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ ...labelStyle, marginBottom: 14 }}>ConfiguraçÁo Técnica</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Field label="WhatsApp" placeholder="5521990975268" value={form.whatsapp} onChange={v => updateForm({ whatsapp: v })} />
            <Field label="Meta Pixel ID" placeholder="952987786056843" value={form.pixelId} onChange={v => updateForm({ pixelId: v })} />
            <Field label="E-mail Formulário" placeholder="seu@email.com" value={form.formEmail} onChange={v => updateForm({ formEmail: v })} />
          </div>
        </div>

        {/* Upload imagens */}
        <div>
          <label style={labelStyle}>Imagens do Empreendimento</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>ðŸ“¸</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Clique para fazer upload das imagens</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>Fachada, lazer, planta, área interna...</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImages} />

          {form.images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 12 }}>
              {form.images.map(img => (
                <div key={img.id} style={{ position: 'relative' }}>
                  <img src={img.base64} alt={img.label} style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                  <input
                    style={{ ...inputStyle, marginTop: 4, padding: '5px 8px', fontSize: 10, borderRadius: 6 }}
                    value={img.label}
                    onChange={e => updateForm({ images: form.images.map(i => i.id === img.id ? { ...i, label: e.target.value } : i) })}
                    placeholder="Legenda"
                  />
                  <button
                    onClick={() => updateForm({ images: form.images.filter(i => i.id !== img.id) })}
                    style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes lp-spin { to { transform: rotate(360deg); } }`}</style>
    </StepLayout>
  );
}




