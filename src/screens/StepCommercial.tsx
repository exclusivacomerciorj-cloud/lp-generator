import StepLayout, { Screen } from '../components/StepLayout';
import { FormData } from '../types';

interface Props { form: FormData; updateForm: (d: Partial<FormData>) => void; goTo: (s: Screen) => void; }

const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 };

function CheckOpt({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', borderRadius: 12,
      border: `1px solid ${checked ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
      background: checked ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)',
      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
    }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? '#c9a84c' : 'rgba(255,255,255,0.2)'}`, background: checked ? '#c9a84c' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        {checked && <span style={{ color: '#0f1923', fontSize: 11, fontWeight: 800 }}>✓</span>}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: checked ? '#fff' : 'rgba(255,255,255,0.5)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{desc}</div>
      </div>
    </button>
  );
}

export default function StepCommercial({ form, updateForm, goTo }: Props) {
  return (
    <StepLayout title="Condição Comercial" subtitle="Valores e condições de pagamento" currentStep="commercial" goTo={goTo}
      onBack={() => goTo('positioning')} onNext={() => goTo('differentials')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {[
            { label: 'Preço (a partir de)', ph: 'R$ 800.000', key: 'price' },
            { label: 'Entrada (a partir de)', ph: 'R$ 49.000', key: 'entry' },
            { label: 'Parcelas (a partir de)', ph: 'R$ 1.900/mês', key: 'installments' },
          ].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input style={inputStyle} placeholder={f.ph} value={form[f.key as keyof FormData] as string} onChange={e => updateForm({ [f.key]: e.target.value })} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
          <CheckOpt checked={form.highlightConditionTop} onChange={v => updateForm({ highlightConditionTop: v })} label="Destacar condição no topo da LP" desc="A condição vira destaque visual no hero — aparece logo abaixo do headline" />
          <CheckOpt checked={form.conditionAsMainArg} onChange={v => updateForm({ conditionAsMainArg: v })} label="Usar condição como argumento principal" desc="Muda toda a estrutura da LP para girar em torno da condição comercial" />
        </div>
      </div>
    </StepLayout>
  );
}
