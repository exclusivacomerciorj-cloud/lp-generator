import { useState } from 'react';
import { Screen } from './components/StepLayout';
import { FormData, GeneratedLP } from './types';
import Dashboard from './screens/Dashboard';
import StepProduct from './screens/StepProduct';
import StepPositioning from './screens/StepPositioning';
import StepCommercial from './screens/StepCommercial';
import StepDifferentials from './screens/StepDifferentials';
import StepVisual from './screens/StepVisual';
import StepExperience from './screens/StepExperience';
import StepVariations from './screens/StepVariations';
import StepGenerate from './screens/StepGenerate';
import StepResult from './screens/StepResult';

const INITIAL: FormData = {
  name: '', location: '', typology: '', area: '', parking: '', differentials: '',
  lpType: 'neutra', audience: 'misto', mainTrigger: 'localizacao', aggressiveness: 'medio',
  price: '', entry: '', installments: '', highlightConditionTop: false, conditionAsMainArg: false,
  strongPoints: [],
  primaryColor: '#1a3a5c', secondaryColor: '#c9a84c', style: 'sofisticado',
  animations: true, arrows: true, hasVideo: false, videoUrl: '', videoType: 'drone',
  withPrice: true, withoutPrice: false, investorVersion: false, housingVersion: false, headlineVariation: false,
  whatsapp: '5521990975268', pixelId: '952987786056843', formEmail: 'vitortavares.lopesrio@gmail.com',
  images: [],
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [form, setForm] = useState<FormData>(INITIAL);
  const [generatedLPs, setGeneratedLPs] = useState<GeneratedLP[]>([]);
  const [savedLPs, setSavedLPs] = useState<GeneratedLP[]>([]);

  const updateForm = (data: Partial<FormData>) => setForm(prev => ({ ...prev, ...data }));
  const goTo = (s: Screen) => setScreen(s);

  const startNew = () => { setForm(INITIAL); setGeneratedLPs([]); goTo('product'); };

  const editLP = (lp: GeneratedLP) => {
    if (lp.formData) setForm(lp.formData);
    setGeneratedLPs([lp]);
    goTo('result');
  };

  const saveLP = (lps: GeneratedLP[]) => {
    setSavedLPs(prev => {
      const filtered = prev.filter(p => !lps.find(l => l.id === p.id));
      return [...filtered, ...lps];
    });
  };

  const deleteLP = (id: string) => setSavedLPs(prev => prev.filter(p => p.id !== id));

  const sharedProps = { form, updateForm, goTo, generatedLPs, setGeneratedLPs };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1923', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {screen === 'dashboard' && <Dashboard savedLPs={savedLPs} onNew={startNew} onEdit={editLP} onDelete={deleteLP} goTo={goTo} />}
      {screen === 'product' && <StepProduct {...sharedProps} />}
      {screen === 'positioning' && <StepPositioning {...sharedProps} />}
      {screen === 'commercial' && <StepCommercial {...sharedProps} />}
      {screen === 'differentials' && <StepDifferentials {...sharedProps} />}
      {screen === 'visual' && <StepVisual {...sharedProps} />}
      {screen === 'experience' && <StepExperience {...sharedProps} />}
      {screen === 'variations' && <StepVariations {...sharedProps} />}
      {screen === 'generate' && <StepGenerate {...sharedProps} />}
      {screen === 'result' && (
        <StepResult
          {...sharedProps}
          onSave={saveLP}
          onBackToDashboard={() => { saveLP(generatedLPs); goTo('dashboard'); }}
        />
      )}
    </div>
  );
}
