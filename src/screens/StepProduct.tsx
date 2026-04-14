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

async function fetchProductInfo(name: string, apiKey: string) {
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
      messages: [{ role: 'user', content: `Pesquise informacoes sobre o empreendimento imobiliario: "${name}". Retorne APENAS JSON valido sem markdown:\n{"found":true,"location":"","typology":"","area":"","parking":"","price":"","entry":"","installments":"","differentials":"","strongPoints":[""],"lpType":"neutra","mainTrigger":"localizacao","summary":""}` }],
    }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json() as { content?: { type: string; text?: string }[] };
  const textBlocks = (data.content ?? []).filter((b: { type: string }) => b.type === 'text' && (b as { text?: string }).text);
  const lastText = (textBlocks[textBlocks.length - 1] as { text?: string })?.text ?? '';
  const jsonMatch = lastText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { found: false };
  try { return JSON.parse(jsonMatch[0]); } catch { return { found: false }; }
}

export default function StepProduct({ form, updateForm, goTo }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle'|'searching'|'found'|'notfound'|'error'>('idle');
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
          isHero: false,
          inGallery: false,
        };
        updateForm({ images: [...form.images, img] });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateForm({ logoBase64: ev.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleHero = (id: string) => {
    updateForm({ images: form.images.map(img => ({ ...img, isHero: img.id === id })) });
  };

  const toggleGallery = (id: string) => {
    const img = form.images.find(i => i.id === id);
    if (!img) return;
    const galleryCount = form.images.filter(i => i.inGallery).length;
    if (!img.inGallery && galleryCount >= 3) return;
    updateForm({ images: form.images.map(i => i.id === id ? { ...i, inGallery: !i.inGallery } : i) });
  };

  const removeImage = (id: string) => updateForm({ images: form.images.filter(i => i.id !== id) });

  const handleAutoFill = async () => {
    if (!form.name.trim()) return;
    setSearching(true);
    setSearchStatus('searching');
    setSearchMsg('');
    setFilledFields([]);
    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error('API key nao configurada.');
      const result = await fetchProductInfo(form.name.trim(), apiKey);
      if (!result.found) { setSearchStatus('notfound'); setSearchMsg('Nao encontrei informacoes. Preencha manualmente.'); return; }
      const updates: Partial<FormData> = {};
      const filled: string[] = [];
      if (result.location) { updates.location = result.location; filled.push('Localizacao'); }
      if (result.typology) { updates.typology = result.typology; filled.push('Tipologia'); }
      if (result.area) { updates.area = result.area; filled.push('Metragem'); }
      if (result.parking) { updates.parking = result.parking; filled.push('Vagas'); }
      if (result.differentials) { updates.differentials = result.differentials; filled.push('Diferenciais'); }
      if (result.price) { updates.price = result.price; filled.push('Preco'); }
      if (result.entry) { updates.entry = result.entry; filled.push('Entrada'); }
      if (result.installments) { updates.installments = result.installments; filled.push('Parcelas'); }
      if (result.lpType) updates.lpType = result.lpType;
      if (result.mainTrigger) updates.mainTrigger = result.mainTrigger;
      if (result.strongPoints?.length) { updates.strongPoints = result.strongPoints; filled.push('Pontos fortes'); }
      updateForm(updates);
      setFilledFields(filled);
      setSearchStatus('found');
      setSearchMsg(result.summary ?? 'Informacoes preenchidas!');
    } catch (err) {
      setSearchStatus('error');
      setSearchMsg('Erro: ' + String(err));
    } finally {
      setSearching(false);
    }
  };

  const galleryCount = form.images.filter(i => i.inGallery).length;
  const heroSelected = form.images.find(i => i.isHero);

  return (
    <StepLayout title="Dados do Produto" subtitle="Informacoes basicas do empreendimento" currentStep="product" goTo={goTo}
      onBack={() => goTo('dashboard')} onNext={() => goTo('positioning')} nextDisabled={!form.name.trim() || !form.location.trim()}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div>
          <label style={labelStyle}>Nome do Empreendimento *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Ex: Breeze Inspire Residence"
              value={form.name} onChange={e => { updateForm({ name: e.target.value }); setSearchStatus('idle'); }}
              onKeyDown={e => e.key === 'Enter' && handleAutoFill()} />
            <button onClick={handleAutoFill} disabled={searching || !form.name.trim()} style={{
              padding: '0 20px', height: 46, borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 12,
              cursor: searching || !form.name.trim() ? 'not-allowed' : 'pointer',
              background: searching ? 'rgba(201,168,76,0.3)' : !form.name.trim() ? 'rgba(255,255,255,0.05)' : '#c9a84c',
              color: searching || !form.name.trim() ? 'rgba(255,255,255,0.25)' : '#0f1923',
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {searching ? <><div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Buscando...</> : <>&#128269; Buscar</>}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>Digite o nome e clique em buscar</div>
        </div>

        {searchStatus === 'searching' && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', fontSize: 12, color: '#c9a84c' }}>Pesquisando na web...</div>
        )}
        {(searchStatus === 'found' || searchStatus === 'notfound' || searchStatus === 'error') && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: searchStatus === 'found' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${searchStatus === 'found' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, fontSize: 12, color: searchStatus === 'found' ? '#4ade80' : '#f87171' }}>
            {searchMsg}
            {filledFields.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>{filledFields.map(f => <span key={f} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>&#10003; {f}</span>)}</div>}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Localizacao *" placeholder="Ex: Barra da Tijuca, Rio de Janeiro" value={form.location} onChange={v => updateForm({ location: v })} />
          <Field label="Tipologia" placeholder="Ex: 2 e 3 quartos" value={form.typology} onChange={v => updateForm({ typology: v })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <Field label="Metragem" placeholder="65m2 a 88m2" value={form.area} onChange={v => updateForm({ area: v })} />
          <Field label="Vagas" placeholder="1 a 2 vagas" value={form.parking} onChange={v => updateForm({ parking: v })} />
          <Field label="Preco (a partir de)" placeholder="R$ 800.000" value={form.price} onChange={v => updateForm({ price: v })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Entrada (a partir de)" placeholder="R$ 49.000" value={form.entry} onChange={v => updateForm({ entry: v })} />
          <Field label="Parcelas (a partir de)" placeholder="R$ 1.900/mes" value={form.installments} onChange={v => updateForm({ installments: v })} />
        </div>
        <Field label="Diferenciais" placeholder="Piscina, academia, varanda gourmet..." value={form.differentials} onChange={v => updateForm({ differentials: v })} textarea />

        <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <label style={labelStyle}>Logo do Empreendimento</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => updateForm({ logoType: 'text' })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${form.logoType === 'text' ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`, background: form.logoType === 'text' ? 'rgba(201,168,76,0.1)' : 'none', color: form.logoType === 'text' ? '#c9a84c' : 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>Texto (nome)</button>
            <button onClick={() => updateForm({ logoType: 'image' })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${form.logoType === 'image' ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`, background: form.logoType === 'image' ? 'rgba(201,168,76,0.1)' : 'none', color: form.logoType === 'image' ? '#c9a84c' : 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>Upload de logo</button>
            {form.logoType === 'image' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => logoRef.current?.click()} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                  {form.logoBase64 ? 'Trocar logo' : 'Selecionar logo'}
                </button>
                {form.logoBase64 && <img src={form.logoBase64} alt="logo" style={{ height: 36, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }} />}
                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
              </div>
            )}
          </div>
        </div>

        <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <label style={{ ...labelStyle, marginBottom: 14 }}>Configuracao Tecnica</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Field label="WhatsApp" placeholder="5521990975268" value={form.whatsapp} onChange={v => updateForm({ whatsapp: v })} />
            <Field label="Meta Pixel ID" placeholder="952987786056843" value={form.pixelId} onChange={v => updateForm({ pixelId: v })} />
            <Field label="E-mail Formulario" placeholder="seu@email.com" value={form.formEmail} onChange={v => updateForm({ formEmail: v })} />
          </div>
        </div>

        <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <label style={labelStyle}>Imagens do Empreendimento</label>
          <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>&#128247;</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Clique para fazer upload das imagens</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>Fachada, lazer, planta, area interna...</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImages} />

          {form.images.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11, color: 'rgba(255,255,255,0.35)', flexWrap: 'wrap' }}>
                <span>&#11088; Hero = imagem do topo da LP</span>
                <span>&#128247; Galeria = ate 3 fotos ({galleryCount}/3)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {form.images.map(img => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `2px solid ${img.isHero ? '#c9a84c' : img.inGallery ? '#4ade80' : 'rgba(255,255,255,0.1)'}` }}>
                    <img src={img.base64} alt={img.label} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                    {img.isHero && <div style={{ position: 'absolute', top: 4, left: 4, background: '#c9a84c', color: '#0f1923', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>HERO</div>}
                    {img.inGallery && <div style={{ position: 'absolute', top: 4, left: img.isHero ? 46 : 4, background: '#4ade80', color: '#0f1923', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>GALERIA</div>}
                    <div style={{ display: 'flex', gap: 4, padding: '6px', background: 'rgba(0,0,0,0.7)' }}>
                      <button onClick={() => toggleHero(img.id)} style={{ flex: 1, padding: '4px', borderRadius: 4, border: 'none', background: img.isHero ? '#c9a84c' : 'rgba(255,255,255,0.1)', color: img.isHero ? '#0f1923' : '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Hero</button>
                      <button onClick={() => toggleGallery(img.id)} disabled={!img.inGallery && galleryCount >= 3} style={{ flex: 1, padding: '4px', borderRadius: 4, border: 'none', background: img.inGallery ? '#4ade80' : 'rgba(255,255,255,0.1)', color: img.inGallery ? '#0f1923' : '#fff', fontSize: 11, cursor: !img.inGallery && galleryCount >= 3 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>Gal.</button>
                      <button onClick={() => removeImage(img.id)} style={{ padding: '4px 6px', borderRadius: 4, border: 'none', background: 'rgba(239,68,68,0.3)', color: '#f87171', fontSize: 11, cursor: 'pointer' }}>&#10005;</button>
                    </div>
                    <input style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '5px 8px', color: '#fff', fontSize: 10, outline: 'none' }}
                      value={img.label} onChange={e => updateForm({ images: form.images.map(i => i.id === img.id ? { ...i, label: e.target.value } : i) })} placeholder="Legenda" />
                  </div>
                ))}
              </div>
              {!heroSelected && form.images.length > 0 && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, fontSize: 11, color: '#fbbf24' }}>
                  &#9888; Selecione uma imagem como Hero
                </div>
              )}
              {galleryCount === 0 && form.images.length > 0 && (
                <div style={{ marginTop: 6, padding: '8px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, fontSize: 11, color: '#fbbf24' }}>
                  &#9888; Selecione ate 3 imagens para a galeria
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </StepLayout>
  );
}
