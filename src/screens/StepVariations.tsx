import StepLayout, { Screen } from '../components/StepLayout';
import { FormData } from '../types';

interface Props { form: FormData; updateForm: (d: Partial<FormData>) => void; goTo: (s: Screen) => void; }

function CheckOpt({ checked, onChange, label, desc, tag }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string; tag?: string }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 10, border: `1px solid ${checked ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`, background: checked ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
      <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`, background: checked ? '#c9a84c' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        {checked && <span style={{ color: '#0f1923', fontSize: 10, fontWeight: 800 }}>&#10003;</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: checked ? '#fff' : 'rgba(255,255,255,0.5)' }}>{label}</span>
          {tag && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(201,168,76,0.15)', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: 1 }}>{tag}</span>}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{desc}</div>
      </div>
    </button>
  );
}

export default function StepVariations({ form, updateForm, goTo }: Props) {
  const selected = [form.withPrice, form.withoutPrice, form.investorVersion, form.housingVersion, form.headlineVariation].filter(Boolean).length;

  return (
    <StepLayout title="Variacoes Estrategicas" subtitle="Cada versao tem estrutura, copy e argumento diferentes — nao so texto trocado" currentStep="variations" goTo={goTo}
      onBack={() => goTo('experience')} onNext={() => goTo('generate')} nextLabel={`Gerar ${Math.max(1, selected)} LP${selected > 1 ? 's' : ''} →`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#c9a84c', marginBottom: 4 }}>
          &#128161; Cada variacao gera uma LP independente com estrutura propria. Mais versoes = mais dados = menor CPL no Google Ads.
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Versoes por preco</div>
        <CheckOpt checked={form.withPrice} onChange={v => updateForm({ withPrice: v })} label="LP com preco" desc="Exibe entrada e parcelas — atrai leads mais qualificados" tag="Com preco" />
        <CheckOpt checked={form.withoutPrice} onChange={v => updateForm({ withoutPrice: v })} label="LP sem preco" desc="Esconde o preco — maior volume de leads para qualificar no atendimento" tag="Sem preco" />

        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>Versoes por publico</div>
        <CheckOpt checked={form.investorVersion} onChange={v => updateForm({ investorVersion: v })} label="Versao Investidor" desc="Template escuro, copy racional, blocos de rentabilidade e simulacao — estrutura completamente diferente" tag="Template investidor" />
        <CheckOpt checked={form.housingVersion} onChange={v => updateForm({ housingVersion: v })} label="Versao Moradia" desc="Copy emocional, foco em qualidade de vida, familia e bem-estar" tag="Template padrao" />

        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>Teste A/B</div>
        <CheckOpt checked={form.headlineVariation} onChange={v => updateForm({ headlineVariation: v })} label="Variacao de headline A/B" desc="Gera 2 versoes do topo com headlines diferentes — headline B e mais criativa e inesperada" tag="A/B test" />
      </div>
    </StepLayout>
  );
}
