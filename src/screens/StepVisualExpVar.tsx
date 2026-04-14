import StepLayout, { Screen } from '../components/StepLayout';
import { FormData } from '../types';

interface Props { form: FormData; updateForm: (d: Partial<FormData>) => void; goTo: (s: Screen) => void; }

function CheckOpt({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', borderRadius: 12,
      border: `1px solid ${checked ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
      background: checked ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)',
      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
    }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`, background: checked ? '#c9a84c' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        {checked && <span style={{ color: '#0f1923', fontSize: 11, fontWeight: 800 }}>âœ“</span>}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: checked ? '#fff' : 'rgba(255,255,255,0.5)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{desc}</div>
      </div>
    </button>
  );
}

// â”€â”€â”€ VISUAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function StepVisual({ form, updateForm, goTo }: Props) {
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 };
  const inputStyle: React.CSSProperties = { flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'monospace' };

  return (
    <StepLayout title="Identidade Visual" subtitle="Paleta e estilo da landing page" currentStep="visual" goTo={goTo}
      onBack={() => goTo('differentials')} onNext={() => goTo('experience')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Cor Principal', key: 'primaryColor', value: form.primaryColor },
            { label: 'Cor SecundÃ¡ria / CTA', key: 'secondaryColor', value: form.secondaryColor },
          ].map(c => (
            <div key={c.key}>
              <label style={labelStyle}>{c.label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={c.value} onChange={e => updateForm({ [c.key]: e.target.value })}
                  style={{ width: 48, height: 48, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', cursor: 'pointer', padding: 2 }} />
                <input style={inputStyle} value={c.value} onChange={e => updateForm({ [c.key]: e.target.value })} />
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div style={{ borderRadius: 14, padding: 24, background: `linear-gradient(135deg, ${form.primaryColor}33, ${form.primaryColor}66)`, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Preview</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{form.name || 'Nome do Empreendimento'}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>{form.location || 'LocalizaÃ§Ã£o'}</div>
          <button style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: form.secondaryColor, color: '#0f1923', fontWeight: 700, fontSize: 13, cursor: 'default' }}>
            Receber tabela e condiÃ§Ãµes â†’
          </button>
        </div>

        {/* Estilo */}
        <div>
          <label style={labelStyle}>Estilo Visual</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { value: 'clean', label: 'âœ¦ Clean', desc: 'Minimalista, muito espaÃ§o, tipografia forte' },
              { value: 'sofisticado', label: 'â—ˆ Sofisticado', desc: 'Premium, elegante, gradientes sutis' },
              { value: 'moderno', label: 'â—‰ Moderno', desc: 'DinÃ¢mico, bold, elementos grÃ¡ficos' },
            ].map(opt => (
              <button key={opt.value} onClick={() => updateForm({ style: opt.value as FormData['style'] })} style={{
                padding: '16px', borderRadius: 12, border: `1px solid ${form.style === opt.value ? '#c9a84c' : 'rgba(255,255,255,0.08)'}`,
                background: form.style === opt.value ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                color: form.style === opt.value ? '#fff' : 'rgba(255,255,255,0.5)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{opt.label}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}

// â”€â”€â”€ EXPERIENCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function StepExperience({ form, updateForm, goTo }: Props) {
  const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 };

  return (
    <StepLayout title="ExperiÃªncia & UX" subtitle="Interatividade e elementos da LP" currentStep="experience" goTo={goTo}
      onBack={() => goTo('visual')} onNext={() => goTo('variations')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CheckOpt checked={form.animations} onChange={v => updateForm({ animations: v })} label="Ativar animaÃ§Ãµes" desc="Fade-in nos elementos durante o scroll, hover nos botÃµes" />
        <CheckOpt checked={form.arrows} onChange={v => updateForm({ arrows: v })} label="Usar setas direcionais" desc="Setas que guiam o olhar do usuÃ¡rio para os CTAs" />
        <CheckOpt checked={form.hasVideo} onChange={v => updateForm({ hasVideo: v })} label="Incluir vÃ­deo" desc="Embed YouTube/Vimeo â€” mantÃ©m a LP leve e rÃ¡pida" />

        {form.hasVideo && (
          <div style={{ marginLeft: 16, padding: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>URL do VÃ­deo (YouTube ou Vimeo)</label>
              <input style={inputStyle} placeholder="https://www.youtube.com/watch?v=..." value={form.videoUrl} onChange={e => updateForm({ videoUrl: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Tipo de VÃ­deo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['drone', 'institucional', 'lifestyle'].map(t => (
                  <button key={t} onClick={() => updateForm({ videoType: t as FormData['videoType'] })} style={{
                    padding: '10px', borderRadius: 8, border: `1px solid ${form.videoType === t ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                    background: form.videoType === t ? 'rgba(201,168,76,0.1)' : 'none',
                    color: form.videoType === t ? '#c9a84c' : 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}

// â”€â”€â”€ VARIATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function StepVariations({ form, updateForm, goTo }: Props) {
  return (
    <StepLayout title="VariaÃ§Ãµes EstratÃ©gicas" subtitle="Multiplique seus resultados com mÃºltiplas versÃµes da LP" currentStep="variations" goTo={goTo}
      onBack={() => goTo('experience')} onNext={() => goTo('generate')} nextLabel="Gerar LPs â†’">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: '14px 18px', fontSize: 12, color: '#c9a84c', marginBottom: 6 }}>
          ðŸ’¡ Cada variaÃ§Ã£o gera uma LP independente. Mais versÃµes = mais dados = menor CPL no Google Ads.
        </div>
        <CheckOpt checked={form.withPrice} onChange={v => updateForm({ withPrice: v })} label="LP com preÃ§o" desc="VersÃ£o padrÃ£o exibindo o valor â€” atrai leads mais qualificados" />
        <CheckOpt checked={form.withoutPrice} onChange={v => updateForm({ withoutPrice: v })} label="LP sem preÃ§o" desc="Esconde o preÃ§o â€” maior volume de leads para qualificar no atendimento" />
        <CheckOpt checked={form.investorVersion} onChange={v => updateForm({ investorVersion: v })} label="VersÃ£o Investidor" desc="Copy focada em retorno, valorizaÃ§Ã£o e oportunidade de mercado" />
        <CheckOpt checked={form.housingVersion} onChange={v => updateForm({ housingVersion: v })} label="VersÃ£o Moradia" desc="Copy focada em qualidade de vida, famÃ­lia e bem-estar" />
        <CheckOpt checked={form.headlineVariation} onChange={v => updateForm({ headlineVariation: v })} label="VariaÃ§Ã£o de headline (A/B)" desc="Gera 2 versÃµes do topo com headlines diferentes para teste" />
      </div>
    </StepLayout>
  );
}

