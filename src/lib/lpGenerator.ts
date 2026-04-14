import { FormData } from '../types';

interface GenerateOptions {
  showPrice: boolean;
  variant: string;
  headlineVariant: 'A' | 'B';
  overrideType?: FormData['lpType'];
}

function buildVideoEmbed(url: string, type: string): string {
  let embedUrl = url;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return `VÃDEO (tipo: ${type}): Embed responsivo 16:9 com src="${embedUrl}" posicionado apÃ³s os diferenciais.`;
}

export function getApiKey(): string {
  return localStorage.getItem('anthropic_api_key') ?? '';
}

export function setApiKey(key: string) {
  localStorage.setItem('anthropic_api_key', key);
}

export async function generateLP(form: FormData, opts: GenerateOptions): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key nÃ£o configurada. Acesse as configuraÃ§Ãµes no dashboard.');
  const lpType = opts.overrideType ?? form.lpType;

  const triggerMap: Record<string, string> = {
    preco: 'preÃ§o/condiÃ§Ã£o comercial excepcional',
    localizacao: 'localizaÃ§Ã£o privilegiada',
    vista: 'vista para o mar/natureza',
    condicao: 'condiÃ§Ãµes de pagamento facilitadas',
  };

  const typeInstructions: Record<string, string> = {
    moradia: 'FOCO MORADIA: qualidade de vida, famÃ­lia, conforto. CTA: "Quero conhecer" / "Agendar visita". Evite linguagem de investimento.',
    investimento: 'FOCO INVESTIMENTO: valorizaÃ§Ã£o, retorno, oportunidade. Mencione potencial de valorizaÃ§Ã£o ~30% em 30 meses. CTA: "Ver anÃ¡lise de rentabilidade". Mencione renda passiva.',
    neutra: 'FOCO NEUTRO: equilibre moradia e investimento. CTA: "Receber tabela e condiÃ§Ãµes".',
  };

  const aggressivenessMap: Record<string, string> = {
    baixo: 'Tom institucional e elegante. Sem urgÃªncia explÃ­cita. Foco em credibilidade e sofisticaÃ§Ã£o.',
    medio: 'Tom persuasivo com leve escassez. Use "Ãšltimas unidades disponÃ­veis" com moderaÃ§Ã£o.',
    alto: 'Tom agressivo: escassez explÃ­cita "Restam poucas unidades", urgÃªncia "CondiÃ§Ã£o por tempo limitado", repetir CTA em vÃ¡rios blocos, microcopy de pressÃ£o.',
  };

  const priceSection = opts.showPrice && (form.price || form.entry || form.installments)
    ? `EXIBIR PREÃ‡OS: PreÃ§o a partir de ${form.price || 'a consultar'} | Entrada a partir de ${form.entry} | Parcelas a partir de ${form.installments} durante a obra`
    : 'NÃƒO exibir preÃ§os â€” capturar lead para revelar condiÃ§Ã£o. Usar "Receba a tabela de condiÃ§Ãµes" como CTA.';

  const videoInstructions = form.hasVideo && form.videoUrl
    ? buildVideoEmbed(form.videoUrl, form.videoType)
    : 'Sem vÃ­deo.';

  const imagesInfo = form.images.length > 0
    ? form.images.slice(0, 6).map((img, i) => `Imagem ${i + 1}: label="${img.label}" â€” use o placeholder __IMG${i}__ como src, serÃ¡ substituÃ­do pelo base64 real`).join('\n')
    : 'Nenhuma imagem. Use fundos com gradiente.';

  const hasHeroImage = form.images.length > 0;
  const galleryImages = form.images.slice(0, 6);

  const userPrompt = `VocÃª Ã© especialista em landing pages de alta conversÃ£o para o mercado imobiliÃ¡rio brasileiro.
Gere uma landing page HTML completa, self-contained, mobile-first, para o empreendimento abaixo.
RESPONDA APENAS COM O HTML. Sem explicaÃ§Ãµes, sem markdown, sem blocos de cÃ³digo. Apenas o HTML bruto comeÃ§ando com <!DOCTYPE html>.

=== PRODUTO ===
Nome: ${form.name}
LocalizaÃ§Ã£o: ${form.location}
Tipologia: ${form.typology || 'Apartamentos'}
Metragem: ${form.area || 'A consultar'}
Vagas: ${form.parking || 'A consultar'}
Diferenciais: ${form.differentials}

=== ESTRATÃ‰GIA ===
Tipo de LP: ${lpType} | ${typeInstructions[lpType]}
PÃºblico: ${form.audience}
Gatilho principal: ${triggerMap[form.mainTrigger]}
Agressividade: ${aggressivenessMap[form.aggressiveness]}
Variante: ${opts.variant} | Headline versÃ£o ${opts.headlineVariant}${opts.headlineVariant === 'B' ? ' (mais criativa e diferente da A)' : ' (direta com nome e diferencial)'}

=== CONDIÃ‡ÃƒO COMERCIAL ===
${priceSection}
${form.highlightConditionTop && (form.entry || form.installments) ? 'DESTAQUE NO TOPO: Mostrar entrada e parcelas em caixa destacada no hero.' : ''}

=== PONTOS FORTES ===
${form.strongPoints.length > 0 ? form.strongPoints.map(p => `â€¢ ${p}`).join('\n') : 'â€¢ LocalizaÃ§Ã£o premium\nâ€¢ Lazer completo\nâ€¢ Construtora sÃ³lida'}

=== TÃ‰CNICO ===
WhatsApp: ${form.whatsapp}
Email FormSubmit: ${form.formEmail}
Meta Pixel ID: ${form.pixelId}
Cor principal: ${form.primaryColor}
Cor CTA: ${form.secondaryColor}
Estilo: ${form.style}
AnimaÃ§Ãµes CSS: ${form.animations ? 'SIM â€” fadeInUp com IntersectionObserver' : 'NÃƒO'}
Setas direcionais: ${form.arrows ? 'SIM' : 'NÃƒO'}
VÃ­deo: ${videoInstructions}

=== IMAGENS ===
${imagesInfo}

=== HTML REQUIREMENTS ===
1. Google Fonts: Playfair Display (tÃ­tulos) + Inter (corpo) via @import no <style>
2. Meta Pixel no <head> com PageView + ViewContent no load + Lead no submit
3. Hero section com fundo: ${hasHeroImage ? `background-image: url('__IMG0__') com overlay escuro rgba(0,0,0,0.55)` : `gradiente linear de ${form.primaryColor} para #0a0a1a`}
4. Estrutura obrigatÃ³ria (em ordem):
   a) HERO: headline impactante, subheadline, 3 bullets rÃ¡pidos, CTA button grande${form.arrows ? ', seta â†“' : ''}${form.highlightConditionTop ? ', caixa de condiÃ§Ã£o destacada' : ''}
   b) BLOCO RÃPIDO: grid 4 colunas com Ã­cones SVG inline (localizaÃ§Ã£o, tipologia, metragem, vagas${opts.showPrice && form.price ? ', preÃ§o' : ''})
   c) GALERIA: ${galleryImages.length > 0 ? `${galleryImages.length} imagens com src __IMG0__, __IMG1__, __IMG2__... e legendas` : '3 cards com gradiente e Ã­cone'}
   d) DIFERENCIAIS: lista visual com Ã­cones SVG inline, mÃ¡ximo 6 itens
   e) CONDIÃ‡ÃƒO COMERCIAL: ${opts.showPrice ? '3 cards: Entrada | Parcelas | Financiamento com microcopy de escassez' : 'CTA para receber condiÃ§Ãµes + microcopy de escassez'}
   f) BLOCO INVESTIMENTO: ${lpType === 'moradia' ? 'versÃ£o suave â€” "alÃ©m de morar bem, seu patrimÃ´nio valoriza"' : 'completo â€” valorizaÃ§Ã£o, demanda da regiÃ£o, retorno estimado'}
   g) LOCALIZAÃ‡ÃƒO: texto sobre a regiÃ£o + principais proximidades baseadas em "${form.location}"
   ${form.hasVideo && form.videoUrl ? 'h) VÃDEO: iframe responsivo 16:9\n   i) FORMULÃRIO' : 'h) FORMULÃRIO'}
   ${form.hasVideo && form.videoUrl ? 'i' : 'h'}) FORMULÃRIO: headline "Garanta sua oportunidade!", campos Nome + WhatsApp (APENAS ESSES DOIS), FormSubmit AJAX com fetch(), mensagem de sucesso inline sem redirect, botÃ£o CTA grande, microcopy de escassez
   ${form.hasVideo && form.videoUrl ? 'j' : 'i'}) FOOTER: "Exclusiva ImobiliÃ¡ria Rio | CRECI-RJ"
5. BotÃ£o flutuante WhatsApp canto inferior direito: https://wa.me/${form.whatsapp}?text=OlÃ¡,%20tenho%20interesse%20no%20${encodeURIComponent(form.name)}
6. CSS responsivo mobile-first com max-width 1200px centralizado
7. BotÃµes: background ${form.secondaryColor}, font-weight bold, box-shadow, hover com transform: translateY(-2px)
8. Cores de fundo alternar: branco e #f8f9fa para separar seÃ§Ãµes visualmente
${form.animations ? '9. IntersectionObserver JS para classe "visible" com @keyframes fadeInUp nos elementos .animate-on-scroll' : ''}
10. FormSubmit AJAX:
fetch("https://formsubmit.co/ajax/${form.formEmail}", {method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"}, body: JSON.stringify({nome, whatsapp, _subject: "Novo lead - ${form.name}"})})
.then(r=>r.json()).then(()=>{ mostrar div#sucesso, esconder form })

Gere APENAS o HTML, comeÃ§ando com <!DOCTYPE html>. Sem explicaÃ§Ãµes:`;

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

  // LÃª o stream SSE e acumula o texto completo
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let rawHtml = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Processa eventos SSE linha a linha
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const evt = JSON.parse(data) as {
          type: string;
          delta?: { type: string; text?: string };
        };
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          rawHtml += evt.delta.text ?? '';
        }
      } catch {
        // ignora linhas nÃ£o-JSON
      }
    }
  }

  // Limpa qualquer markdown que a IA possa ter colocado
  const match = rawHtml.match(/<!DOCTYPE html[\s\S]*/i) ?? rawHtml.match(/<html[\s\S]*/i);
  const stripped = rawHtml.replace(/^```html?\n?/i, '').replace(/```\s*$/i, '').trim();
  let finalHtml = match ? match[0] : stripped;

  // Substituir placeholders __IMG0__, __IMG1__... pelos base64 reais
  form.images.slice(0, 6).forEach((img, i) => {
    const placeholder = new RegExp(`__IMG${i}__`, 'g');
    finalHtml = finalHtml.replace(placeholder, img.base64);
  });

  return finalHtml;
}



