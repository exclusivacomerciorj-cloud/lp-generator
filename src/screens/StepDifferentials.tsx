import { useState } from 'react';
import StepLayout, { Screen } from '../components/StepLayout';
import { FormData } from '../types';

interface Props { form: FormData; updateForm: (d: Partial<FormData>) => void; goTo: (s: Screen) => void; }

const SUGGESTIONS = ['Entrada facilitada','Vista livre','Localização premium','Alto potencial de valorização','Lazer completo','Varanda gourmet','Próximo à praia','Construtora sólida','Financiamento Caixa','Studios inteligentes','Retorno acima de 1% a.m.','Condomínio fechado','Área kids','Piscina adulto e infantil','Salão de festas'];

export default function StepDifferentials({ form, updateForm, goTo }: Props) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (!v || form.strongPoints.includes(v)) return;
    updateForm({ strongPoints: [...form.strongPoints, v] });
    setInput('');
  };

  const remove = (item: string) => updateForm({ strongPoints: form.strongPoints.filter(s => s !== item) });

  return (
    <StepLayout title="Pontos Fortes" subtitle="Selecione ou adicione os destaques do produto" currentStep="differentials" goTo={goTo}
      onBack={() => goTo('commercial')} onNext={() => goTo('visual')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 13, outline: 'none' }}
            placeholder="Digite um ponto forte e pressione Enter"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <button onClick={add} style={{ padding: '12px 20px', background: '#c9a84c', color: '#0f1923', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            + Adicionar
          </button>
        </div>

        {form.strongPoints.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.strongPoints.map(pt => (
              <span key={pt} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.35)', color: '#c9a84c', padding: '7px 14px', borderRadius: 99, fontSize: 12 }}>
                {pt}
                <button onClick={() => remove(pt)} style={{ background: 'none', border: 'none', color: 'rgba(201,168,76,0.6)', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
              </span>
            ))}
          </div>
        )}

        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Sugestões rápidas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.filter(s => !form.strongPoints.includes(s)).map(s => (
              <button key={s} onClick={() => updateForm({ strongPoints: [...form.strongPoints, s] })}
                style={{ padding: '7px 14px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'none', borderRadius: 99, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >+ {s}</button>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
