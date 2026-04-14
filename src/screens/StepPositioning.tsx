import StepLayout, { Screen } from '../components/StepLayout';
import { FormData } from '../types';

interface Props { form: FormData; updateForm: (d: Partial<FormData>) => void; goTo: (s: Screen) => void; }

function SelectCard({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <button onClick={onClick} style={{
      padding: '16px', borderRadius: 12, border: `1px solid ${active ? '#c9a84c' : 'rgba(255,255,255,0.08)'}`,
      background: active ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
      color: active ? '#fff' : 'rgba(255,255,255,0.5)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%',
    }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, opacity: 0.6 }}>{desc}</div>
    </button>
  );
}

const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'block' };

export default function StepPositioning({ form, updateForm, goTo }: Props) {
  return (
    <StepLayout title="Posicionamento Estratégico" subtitle="Essas escolhas definem 80% do copy gerado pela IA" currentStep="positioning" goTo={goTo}
      onBack={() => goTo('product')} onNext={() => goTo('commercial')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <span style={sectionLabel}>Tipo de Landing Page</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <SelectCard active={form.lpType === 'moradia'} onClick={() => updateForm({ lpType: 'moradia' })} label="🏠 Moradia" desc="Qualidade de vida, família, conforto" />
            <SelectCard active={form.lpType === 'investimento'} onClick={() => updateForm({ lpType: 'investimento' })} label="💰 Investimento" desc="Valorização, retorno, oportunidade" />
            <SelectCard active={form.lpType === 'neutra'} onClick={() => updateForm({ lpType: 'neutra' })} label="⚖️ Neutra" desc="Equilibra moradia e investimento" />
          </div>
        </div>
        <div>
          <span style={sectionLabel}>Público-alvo Principal</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <SelectCard active={form.audience === 'moradia'} onClick={() => updateForm({ audience: 'moradia' })} label="👨‍👩‍👧 Moradia" desc="Famílias, primeiro imóvel" />
            <SelectCard active={form.audience === 'investidor'} onClick={() => updateForm({ audience: 'investidor' })} label="📈 Investidor" desc="Renda, valorização, portfólio" />
            <SelectCard active={form.audience === 'misto'} onClick={() => updateForm({ audience: 'misto' })} label="🎯 Misto" desc="Ambos os perfis" />
          </div>
        </div>
        <div>
          <span style={sectionLabel}>Principal Gatilho do Produto</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <SelectCard active={form.mainTrigger === 'preco'} onClick={() => updateForm({ mainTrigger: 'preco' })} label="💲 Preço" desc="Condição única de mercado" />
            <SelectCard active={form.mainTrigger === 'localizacao'} onClick={() => updateForm({ mainTrigger: 'localizacao' })} label="📍 Localização" desc="Endereço premium" />
            <SelectCard active={form.mainTrigger === 'vista'} onClick={() => updateForm({ mainTrigger: 'vista' })} label="🌊 Vista" desc="Mar, lagoa, natureza" />
            <SelectCard active={form.mainTrigger === 'condicao'} onClick={() => updateForm({ mainTrigger: 'condicao' })} label="📋 Condição" desc="Entrada e parcelas facilitadas" />
          </div>
        </div>
        <div>
          <span style={sectionLabel}>Nível de Agressividade do Copy</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <SelectCard active={form.aggressiveness === 'baixo'} onClick={() => updateForm({ aggressiveness: 'baixo' })} label="🏛️ Institucional" desc="Tom elegante, sem urgência explícita" />
            <SelectCard active={form.aggressiveness === 'medio'} onClick={() => updateForm({ aggressiveness: 'medio' })} label="⚡ Equilibrado" desc="Persuasivo com leve escassez" />
            <SelectCard active={form.aggressiveness === 'alto'} onClick={() => updateForm({ aggressiveness: 'alto' })} label="🔥 Alta Conversão" desc="Escassez forte, urgência máxima" />
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
