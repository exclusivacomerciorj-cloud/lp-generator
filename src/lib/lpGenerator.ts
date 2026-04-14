import { FormData } from '../types';

interface GenerateOptions {
  showPrice: boolean;
  variant: string;
  headlineVariant: 'A' | 'B';
  overrideType?: FormData['lpType'];
}

export function getApiKey(): string {
  return localStorage.getItem('anthropic_api_key') ?? '';
}

export function setApiKey(key: string) {
  localStorage.setItem('anthropic_api_key', key);
}

function buildVideoEmbed(url: string): string {
  let embedUrl = url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return embedUrl;
}

export async function generateLP(form: FormData, opts: GenerateOptions): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key nao configurada.');

  const lpType = opts.overrideType ?? form.lpType;
  const hasHeroImage = form.images.length > 0;
  const galleryImages = form.images.slice(0, 3);

  const ctaMap: Record<string, string> = {
    moradia: 'Quero Conhecer >>',
    investimento: 'Ver Analise de Rentabilidade >>',
    neutra: 'Receber tabela e condicoes >>',
  };

  const aggressivenessMap: Record<string, string> = {
    baixo: 'Tom elegante. Sem urgencia explicita.',
    medio: 'Tom persuasivo com escassez moderada.',
    alto: 'Tom agressivo: escassez forte, urgencia maxima.',
  };

  const priceBlock = opts.showPrice && (form.entry || form.installments)
    ? `Entrada a partir de ${form.entry} + Parcelas a partir de ${form.installments}`
    : '';

  const strongPointsList = form.strongPoints.length > 0
    ? form.strongPoints.slice(0, 6).join(', ')
    : 'Lazer completo, Localizacao premium, Construtora solida';

  const img0 = hasHeroImage ? form.images[0].base64 : '';
  const img1 = form.images[1]?.base64 ?? '';
  const img2 = form.images[2]?.base64 ?? '';

  const userPrompt = `Voce e especialista em landing pages imobiliarias de alta conversao.

Gere uma landing page HTML COMPLETA seguindo EXATAMENTE esta estrutura. Responda APENAS com HTML comecando com <!DOCTYPE html>. Sem explicacoes.

PRODUTO: ${form.name} | ${form.location} | ${form.typology} | ${form.area} | ${form.parking}
DIFERENCIAIS: ${form.differentials || strongPointsList}
PONTOS FORTES: ${strongPointsList}
CONDICAO: ${priceBlock || 'Solicite a tabela'}
TIPO: ${lpType} | ${aggressivenessMap[form.aggressiveness]}
CTA: "${ctaMap[lpType]}"
WHATSAPP: ${form.whatsapp}
EMAIL FORM: ${form.formEmail}
PIXEL: ${form.pixelId}
COR PRINCIPAL: ${form.primaryColor}
COR CTA: ${form.secondaryColor}

ESTRUTURA OBRIGATORIA (nesta ordem exata):

1. HEAD: meta charset UTF-8, viewport, Google Fonts Playfair Display + Inter, Meta Pixel ${form.pixelId} com PageView

2. HERO (100vh, mobile-first):
- Fundo: ${img0 ? `url base64 da imagem de fundo com overlay rgba(0,0,0,0.5)` : `gradiente ${form.primaryColor} para #0a1628`}
- Topo: logo/nome do empreendimento
- Headline 2 linhas: primeira em italico bold, segunda em bold normal
- ${priceBlock ? `Caixa destacada azul escuro semi-transparente: "${priceBlock}"` : ''}
- Subtitulo italico: "Aproveite condicoes especiais de lancamento!"
- Seta bounce animada
- Botao CTA dourado grande: "${ctaMap[lpType]}"

3. BARRA 3 BENEFICIOS (fundo branco, 3 colunas):
- Icone SVG + titulo bold + descricao
- Usar os 3 primeiros pontos fortes
- Separadores verticais entre itens

4. GALERIA (fundo #f0f4f8):
- Titulo: "Viva o melhor de ${form.location}"
- 3 imagens lado a lado ${galleryImages.length > 0 ? '(usar as imagens do produto)' : '(placeholders com gradiente)'}
- Legenda italica abaixo de cada foto
- Mobile: empilhar

5. GRID DIFERENCIAIS (fundo branco, 2 colunas, 4 itens):
- Icone SVG inline + titulo bold + descricao curta

6. BLOCO CONDICOES (fundo ${form.primaryColor}):
- Titulo "Condicoes Imperdiveis" centralizado
- 3 cards dourados ${form.secondaryColor} lado a lado:
  Card 1: Entrada / a partir de / ${form.entry || 'Consulte'}
  Card 2: Parcelas / ${form.installments || 'Consulte'} / Durante a Obra  
  Card 3: Financiamento / facilitado
- Texto escassez italico abaixo

7. FORMULARIO (fundo com overlay escuro):
- Titulo: "Garanta sua oportunidade!"
- Subtitulo: "Receba a tabela de precos e as condicoes especiais"
- Campos: Nome + WhatsApp (so esses dois)
- Botao CTA dourado
- FormSubmit AJAX fetch("https://formsubmit.co/ajax/${form.formEmail}") sucesso inline sem redirect
- Meta Pixel Lead event no submit

8. FOOTER: "Exclusiva Imobiliaria Rio | CRECI-RJ" fundo escuro

9. BOTAO WHATSAPP FLUTUANTE fixo canto inferior direito verde #25D366

CSS: mobile-first, max-width 1200px, Playfair Display titulos, Inter corpo, botoes com hover translateY(-2px)
${form.animations ? 'JS: IntersectionObserver fadeInUp nos elementos .fade-in' : ''}

Gere o HTML completo agora:`;

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
      max_tokens: 6000,
      stream: true,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    try {
      const err = JSON.parse(errText) as { error?: { message?: string } };
      throw new Error(err.error?.message ?? `HTTP ${response.status}`);
    } catch {
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
    }
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let rawHtml = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const evt = JSON.parse(data) as { type: string; delta?: { type: string; text?: string } };
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          rawHtml += evt.delta.text ?? '';
        }
      } catch { /* ignora */ }
    }
  }

  const match = rawHtml.match(/<!DOCTYPE html[\s\S]*/i) ?? rawHtml.match(/<html[\s\S]*/i);
  const stripped = rawHtml.replace(/^```html?\n?/i, '').replace(/```\s*$/i, '').trim();
  let finalHtml = match ? match[0] : stripped;

  if (img0) finalHtml = finalHtml.replace(/url\(['"]?__IMG0__['"]?\)/g, `url('${img0}')`);
  if (img1) finalHtml = finalHtml.replace(/url\(['"]?__IMG1__['"]?\)/g, `url('${img1}')`);
  if (img2) finalHtml = finalHtml.replace(/url\(['"]?__IMG2__['"]?\)/g, `url('${img2}')`);
  form.images.slice(0, 6).forEach((img, i) => {
    finalHtml = finalHtml.replace(new RegExp(`__IMG${i}__`, 'g'), img.base64);
  });

  return finalHtml;
}