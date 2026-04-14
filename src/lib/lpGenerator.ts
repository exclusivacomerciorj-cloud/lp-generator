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
  return `VÍDEO (tipo: ${type}): Embed responsivo 16:9 com src="${embedUrl}" posicionado após os diferenciais.`;
}

export function getApiKey(): string {
  return localStorage.getItem('anthropic_api_key') ?? '';
}

export function setApiKey(key: string) {
  localStorage.setItem('anthropic_api_key', key);
}

export async function generateLP(form: FormData, opts: GenerateOptions): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key não configurada. Acesse as configurações no dashboard.');
  const lpType = opts.overrideType ?? form.lpType;

  const triggerMap: Record<string, string> = {
    preco: 'preço/condição comercial excepcional',
    localizacao: 'localização privilegiada',
    vista: 'vista para o mar/natureza',
    condicao: 'condições de pagamento facilitadas',
  };

  const typeInstructions: Record<string, string> = {
    moradia: 'FOCO MORADIA: qualidade de vida, família, conforto. CTA: "Quero conhecer" / "Agendar visita". Evite linguagem de investimento.',
    investimento: 'FOCO INVESTIMENTO: valorização, retorno, oportunidade. Mencione potencial de valorização ~30% em 30 meses. CTA: "Ver análise de rentabilidade". Mencione renda passiva.',
    neutra: 'FOCO NEUTRO: equilibre moradia e investimento. CTA: "Receber tabela e condições".',
  };

  const aggressivenessMap: Record<string, string> = {
    baixo: 'Tom institucional e elegante. Sem urgência explícita. Foco em credibilidade e sofisticação.',
    medio: 'Tom persuasivo com leve escassez. Use "Últimas unidades disponíveis" com moderação.',
    alto: 'Tom agressivo: escassez explícita "Restam poucas unidades", urgência "Condição por tempo limitado", repetir CTA em vários blocos, microcopy de pressão.',
  };

  const priceSection = opts.showPrice && (form.price || form.entry || form.installments)
    ? `EXIBIR PREÇOS: Preço a partir de ${form.price || 'a consultar'} | Entrada a partir de ${form.entry} | Parcelas a partir de ${form.installments} durante a obra`
    : 'NÃO exibir preços — capturar lead para revelar condição. Usar "Receba a tabela de condições" como CTA.';

  const videoInstructions = form.hasVideo && form.videoUrl
    ? buildVideoEmbed(form.videoUrl, form.videoType)
    : 'Sem vídeo.';

  const imagesInfo = form.images.length > 0
    ? form.images.slice(0, 6).map((img, i) => `Imagem ${i + 1}: label="${img.label}" — use o placeholder __IMG${i}__ como src, será substituído pelo base64 real`).join('\n')
    : 'Nenhuma imagem. Use fundos com gradiente.';

  const hasHeroImage = form.images.length > 0;
  const galleryImages = form.images.slice(0, 6);

  const userPrompt = `Você é especialista em landing pages de alta conversão para o mercado imobiliário brasileiro.
Gere uma landing page HTML completa, self-contained, mobile-first, para o empreendimento abaixo.
RESPONDA APENAS COM O HTML. Sem explicações, sem markdown, sem blocos de código. Apenas o HTML bruto começando com <!DOCTYPE html>.

=== PRODUTO ===
Nome: ${form.name}
Localização: ${form.location}
Tipologia: ${form.typology || 'Apartamentos'}
Metragem: ${form.area || 'A consultar'}
Vagas: ${form.parking || 'A consultar'}
Diferenciais: ${form.differentials}

=== ESTRATÉGIA ===
Tipo de LP: ${lpType} | ${typeInstructions[lpType]}
Público: ${form.audience}
Gatilho principal: ${triggerMap[form.mainTrigger]}
Agressividade: ${aggressivenessMap[form.aggressiveness]}
Variante: ${opts.variant} | Headline versão ${opts.headlineVariant}${opts.headlineVariant === 'B' ? ' (mais criativa e diferente da A)' : ' (direta com nome e diferencial)'}

=== CONDIÇÃO COMERCIAL ===
${priceSection}
${form.highlightConditionTop && (form.entry || form.installments) ? 'DESTAQUE NO TOPO: Mostrar entrada e parcelas em caixa destacada no hero.' : ''}

=== PONTOS FORTES ===
${form.strongPoints.length > 0 ? form.strongPoints.map(p => `• ${p}`).join('\n') : '• Localização premium\n• Lazer completo\n• Construtora sólida'}

=== TÉCNICO ===
WhatsApp: ${form.whatsapp}
Email FormSubmit: ${form.formEmail}
Meta Pixel ID: ${form.pixelId}
Cor principal: ${form.primaryColor}
Cor CTA: ${form.secondaryColor}
Estilo: ${form.style}
Animações CSS: ${form.animations ? 'SIM — fadeInUp com IntersectionObserver' : 'NÃO'}
Setas direcionais: ${form.arrows ? 'SIM' : 'NÃO'}
Vídeo: ${videoInstructions}

=== IMAGENS ===
${imagesInfo}

=== HTML REQUIREMENTS ===
1. Google Fonts: Playfair Display (títulos) + Inter (corpo) via @import no <style>
2. Meta Pixel no <head> com PageView + ViewContent no load + Lead no submit
3. Hero section com fundo: ${hasHeroImage ? `background-image: url('__IMG0__') com overlay escuro rgba(0,0,0,0.55)` : `gradiente linear de ${form.primaryColor} para #0a0a1a`}
4. Estrutura obrigatória (em ordem):
   a) HERO: headline impactante, subheadline, 3 bullets rápidos, CTA button grande${form.arrows ? ', seta ↓' : ''}${form.highlightConditionTop ? ', caixa de condição destacada' : ''}
   b) BLOCO RÁPIDO: grid 4 colunas com ícones SVG inline (localização, tipologia, metragem, vagas${opts.showPrice && form.price ? ', preço' : ''})
   c) GALERIA: ${galleryImages.length > 0 ? `${galleryImages.length} imagens com src __IMG0__, __IMG1__, __IMG2__... e legendas` : '3 cards com gradiente e ícone'}
   d) DIFERENCIAIS: lista visual com ícones SVG inline, máximo 6 itens
   e) CONDIÇÃO COMERCIAL: ${opts.showPrice ? '3 cards: Entrada | Parcelas | Financiamento com microcopy de escassez' : 'CTA para receber condições + microcopy de escassez'}
   f) BLOCO INVESTIMENTO: ${lpType === 'moradia' ? 'versão suave — "além de morar bem, seu patrimônio valoriza"' : 'completo — valorização, demanda da região, retorno estimado'}
   g) LOCALIZAÇÃO: texto sobre a região + principais proximidades baseadas em "${form.location}"
   ${form.hasVideo && form.videoUrl ? 'h) VÍDEO: iframe responsivo 16:9\n   i) FORMULÁRIO' : 'h) FORMULÁRIO'}
   ${form.hasVideo && form.videoUrl ? 'i' : 'h'}) FORMULÁRIO: headline "Garanta sua oportunidade!", campos Nome + WhatsApp (APENAS ESSES DOIS), FormSubmit AJAX com fetch(), mensagem de sucesso inline sem redirect, botão CTA grande, microcopy de escassez
   ${form.hasVideo && form.videoUrl ? 'j' : 'i'}) FOOTER: "Exclusiva Imobiliária Rio | CRECI-RJ"
5. Botão flutuante WhatsApp canto inferior direito: https://wa.me/${form.whatsapp}?text=Olá,%20tenho%20interesse%20no%20${encodeURIComponent(form.name)}
6. CSS responsivo mobile-first com max-width 1200px centralizado
7. Botões: background ${form.secondaryColor}, font-weight bold, box-shadow, hover com transform: translateY(-2px)
8. Cores de fundo alternar: branco e #f8f9fa para separar seções visualmente
${form.animations ? '9. IntersectionObserver JS para classe "visible" com @keyframes fadeInUp nos elementos .animate-on-scroll' : ''}
10. FormSubmit AJAX:
fetch("https://formsubmit.co/ajax/${form.formEmail}", {method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"}, body: JSON.stringify({nome, whatsapp, _subject: "Novo lead - ${form.name}"})})
.then(r=>r.json()).then(()=>{ mostrar div#sucesso, esconder form })

Gere APENAS o HTML, começando com <!DOCTYPE html>. Sem explicações:`;

  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json() as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `HTTP ${response.status}`);
  }

  const data = await response.json() as { content?: { text?: string }[] };
  const rawHtml = data.content?.[0]?.text ?? '';

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
