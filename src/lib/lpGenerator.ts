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

export function getGithubToken(): string {
  return localStorage.getItem('github_token') ?? '';
}
export function setGithubToken(key: string) {
  localStorage.setItem('github_token', key);
}
export function getVercelToken(): string {
  return localStorage.getItem('vercel_token') ?? '';
}
export function setVercelToken(key: string) {
  localStorage.setItem('vercel_token', key);
}

function toSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function generateCopy(form: FormData, opts: GenerateOptions, apiKey: string) {
  const lpType = opts.overrideType ?? form.lpType;
  const sp = form.strongPoints.length > 0 ? form.strongPoints : ['Lazer completo', 'Localizacao premium', 'Vista privilegiada', 'Construtora solida'];

  const toneMap: Record<string, string> = {
    moradia: 'emocional, acolhedor, aspiracional. Foco em viver bem, familia, qualidade de vida, rotina, conforto, pertencimento. EVITAR linguagem financeira.',
    investimento: 'racional, direto, estrategico. Foco em oportunidade, valorizacao, retorno, timing, escassez. EVITAR linguagem emocional familiar.',
    neutra: 'equilibrado entre emocao e logica. Unir moradia e investimento. Tom comercial e pratico.',
  };

  const audienceMap: Record<string, string> = {
    moradia: 'familias e primeiros compradores. Simplificar linguagem, reforcar seguranca e praticidade.',
    investidor: 'investidores. Incluir logica de ganho, usar: valorizacao, oportunidade, timing, retorno.',
    misto: 'publico misto. Equilibrar sem aprofundar demais em nenhum lado.',
  };

  const triggerMap: Record<string, string> = {
    preco: 'PRECO — destacar acessibilidade, usar "a partir de", condicoes facilitadas.',
    localizacao: 'LOCALIZACAO — destacar a regiao, proximidades, valorizacao da area.',
    vista: 'VISTA — explorar emocao, exclusividade, raridade da vista.',
    condicao: 'CONDICAO — destacar entrada e parcelas, foco em facilidade de pagamento.',
  };

  const aggressMap: Record<string, string> = {
    baixo: 'Tom institucional e elegante. SEM urgencia ou escassez. Mais sofisticado.',
    medio: 'Tom persuasivo com leve escassez. Moderadamente comercial.',
    alto: 'Tom agressivo: urgencia clara, escassez forte, chamadas diretas. Exemplos: "ultimas unidades", "condicao por tempo limitado".',
  };

  const ctaMap: Record<string, string> = {
    moradia: 'Quero conhecer o meu apartamento',
    investimento: 'Quero receber a analise agora',
    neutra: 'Receber tabela e condicoes',
  };

  const formTitleMap: Record<string, string> = {
    moradia: 'Seu proximo lar esta aqui',
    investimento: 'Essa oportunidade nao vai esperar',
    neutra: 'Garanta sua oportunidade',
  };

  const formSubMap: Record<string, string> = {
    moradia: 'Preencha agora e receba condicoes exclusivas antes do lancamento oficial',
    investimento: 'Receba a analise completa de rentabilidade e as condicoes do lancamento',
    neutra: 'Receba a tabela de precos e condicoes especiais agora',
  };

  const formMicroMap: Record<string, string> = {
    moradia: 'Atendimento personalizado — sem pressao, sem enrolacao',
    investimento: 'Vagas limitadas para atendimento prioritario',
    neutra: 'Condicoes especiais de lancamento — por tempo limitado',
  };

  const whatsappTriggerMap: Record<string, string> = {
    moradia: 'Quer saber se esse apartamento e para voce?',
    investimento: 'Qual o retorno real desse imovel?',
    neutra: 'Ficou com duvida? A gente resolve em 2 minutos',
  };

  const whatsappCtaMap: Record<string, string> = {
    moradia: 'Falar com um especialista agora',
    investimento: 'Quero a analise completa',
    neutra: 'Falar no WhatsApp',
  };

  const prompt = `Voce e copywriter senior especialista em imoveis de alto padrao no Brasil.
Gere copy de alta conversao para esta landing page imobiliaria.
Retorne APENAS JSON valido sem markdown, sem explicacoes, sem tags.

TOM: ${toneMap[lpType]}
PUBLICO: ${audienceMap[form.audience]}
GATILHO PRINCIPAL: ${triggerMap[form.mainTrigger]}
AGRESSIVIDADE: ${aggressMap[form.aggressiveness]}

Produto: ${form.name} | ${form.location} | ${form.typology} | ${form.area}
Pontos fortes: ${sp.join(', ')}
Diferenciais: ${form.differentials}
${form.description ? `Descricao existente (use como base): ${form.description}` : ''}

REGRAS CRITICAS:
- NUNCA inventar numeros, unidades ou dados
- NUNCA usar asteriscos (*texto*) — italico via HTML ja sera aplicado
- Usar APENAS dados informados acima
- Headlines devem ser diferentes entre versao A e B
- Headline versao ${opts.headlineVariant === 'B' ? 'B: criativa, inesperada, diferente da convencional' : 'A: direta, clara, focada no principal gatilho'}

Retorne exatamente este JSON:
{
  "headline1": "primeira parte do headline (parte em italico)",
  "headline2": "segunda parte do headline (parte em bold normal)",
  "subtitle": "subtitulo curto max 60 chars",
  "benefit1title": "titulo beneficio 1 baseado em: ${sp[0] ?? 'Lazer completo'}",
  "benefit1desc": "descricao curta",
  "benefit2title": "titulo beneficio 2 baseado em: ${sp[1] ?? 'Localizacao premium'}",
  "benefit2desc": "descricao curta",
  "benefit3title": "titulo beneficio 3 baseado em: ${sp[2] ?? 'Vista privilegiada'}",
  "benefit3desc": "descricao curta",
  "descricaoBloco": "${form.description || `paragrafo de 2-3 linhas sobre o empreendimento com tom ${lpType}`}",
  "diff1title": "diferencial 1 baseado nos dados",
  "diff1desc": "descricao 1 frase",
  "diff2title": "diferencial 2",
  "diff2desc": "descricao",
  "diff3title": "diferencial 3",
  "diff3desc": "descricao",
  "diff4title": "diferencial 4",
  "diff4desc": "descricao",
  "whatsappTrigger": "${whatsappTriggerMap[lpType]}",
  "whatsappCta": "${whatsappCtaMap[lpType]}",
  "escassez": "frase de escassez baseada APENAS nos dados reais informados",
  "formTitle": "${formTitleMap[lpType]}",
  "formSubtitle": "${formSubMap[lpType]}",
  "formMicro": "${formMicroMap[lpType]}",
  "ctaText": "${ctaMap[lpType]}"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json() as { content?: { text?: string }[] };
  const text = data.content?.[0]?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Copy nao gerado');
  return JSON.parse(match[0]);
}

function buildTemplateDefault(form: FormData, opts: { showPrice: boolean }, copy: Record<string, string>): string {
  const pc = form.primaryColor || '#1a3a5c';
  const sc = form.secondaryColor || '#c9a84c';
  const heroImg = form.images.find(i => i.isHero);
  const galleryImgs = form.images.filter(i => i.inGallery).slice(0, 3);
  const formBgImg = galleryImgs[0] ?? heroImg;
  const heroBg = heroImg ? `url('${heroImg.base64}') center center/cover no-repeat` : `linear-gradient(135deg, ${pc} 0%, #0a1628 100%)`;
  const formBg = formBgImg ? `url('${formBgImg.base64}') center center/cover no-repeat` : `linear-gradient(135deg, ${pc} 0%, #0a1628 100%)`;
  const logoHtml = form.logoType === 'image' && form.logoBase64
    ? `<img src="${form.logoBase64}" alt="${form.name}" style="height:80px;object-fit:contain;">`
    : `<span style="font-family:'Playfair Display',serif;font-size:clamp(14px,2.5vw,20px);color:${sc};letter-spacing:3px;font-weight:700;text-transform:uppercase;">✦ ${form.name} ✦</span>`;

  const conditionBox = opts.showPrice && (form.entry || form.installments) ? `
    <div class="hero-cond">
      <div class="cond-lbl">Condicoes Especiais de Lancamento</div>
      <div class="cond-val">
        ${form.entry ? `Entrada a partir de <span>${form.entry}</span><br>` : ''}
        ${form.installments ? `+ Parcelas a partir de <span>${form.installments}</span>` : ''}
      </div>
    </div>` : '';

  const galleryHtml = galleryImgs.length > 0
    ? galleryImgs.map(img => `<figure class="gal-item"><img src="${img.base64}" alt="${img.label}" loading="lazy"><figcaption>${img.label}</figcaption></figure>`).join('')
    : `<figure class="gal-item"><div class="gal-ph" style="background:linear-gradient(135deg,${pc}44,${pc}88)"></div><figcaption>Lazer completo</figcaption></figure>
       <figure class="gal-item"><div class="gal-ph" style="background:linear-gradient(135deg,${pc}33,${pc}66)"></div><figcaption>Localizacao privilegiada</figcaption></figure>
       <figure class="gal-item"><div class="gal-ph" style="background:linear-gradient(135deg,${pc}55,${pc}99)"></div><figcaption>Ambientes modernos</figcaption></figure>`;

  const condCards = (() => {
    const cards = [];
    if (form.entry) cards.push(`<div class="cond-card"><div class="cc-lbl">Entrada</div><div class="cc-sub">a partir de</div><div class="cc-val">${form.entry}</div></div>`);
    if (form.installments) cards.push(`<div class="cond-card"><div class="cc-lbl">Parcelas</div><div class="cc-val">${form.installments}</div><div class="cc-sub">Durante a Obra</div></div>`);
    cards.push(`<div class="cond-card"><div class="cc-lbl">Financiamento</div><div class="cc-val" style="font-size:clamp(16px,2vw,20px)">facilitado</div><div class="cc-sub">Caixa Economica</div></div>`);
    return cards.join('');
  })();

  const svgHome = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  const svgStar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const svgPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const svgDiamond = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.7 10.3a2.41 2.41 0 000 3.41l7.59 7.59a2.41 2.41 0 003.41 0l7.59-7.59a2.41 2.41 0 000-3.41l-7.59-7.59a2.41 2.41 0 00-3.41 0z"/></svg>`;
  const svgWa = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${form.name} | ${form.location}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${form.pixelId}');fbq('track','PageView');fbq('track','ViewContent');</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:'Inter',sans-serif;color:#222;overflow-x:hidden}
.hero{min-height:100vh;background:${heroBg};display:flex;flex-direction:column;position:relative;}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0.28) 50%,rgba(0,0,0,0.58) 100%);}
.hero-logo{position:absolute;top:20px;left:24px;z-index:3;}
.hero-wa-top{display:none;}
.hero-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:80px 20px 60px;text-align:center;}
.hero-headline{font-family:'Playfair Display',serif;font-size:clamp(28px,5vw,54px);color:#fff;line-height:1.25;margin-bottom:22px;}
.hero-headline em{font-style:italic;}
.hero-cond{background:rgba(10,30,70,0.84);border:1px solid rgba(201,168,76,0.5);border-radius:6px;padding:12px 24px;margin-bottom:14px;}
.cond-lbl{font-size:10px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;}
.cond-val{font-size:clamp(15px,2.5vw,22px);font-weight:800;color:#fff;line-height:1.5;}
.cond-val span{color:${sc};}
.hero-sub{font-family:'Playfair Display',serif;font-style:italic;color:rgba(255,255,255,0.82);font-size:clamp(13px,1.8vw,16px);margin-bottom:20px;}
.hero-arrow{font-size:28px;color:${sc};animation:bounce 1.5s infinite;margin-bottom:16px;display:block;}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
.btn-cta{display:inline-block;background:linear-gradient(135deg,${sc},${sc}cc);color:#0a1628;font-weight:800;font-size:clamp(13px,1.8vw,16px);padding:14px 34px;border-radius:3px;text-decoration:none;border:none;cursor:pointer;transition:all 0.3s;font-family:'Inter',sans-serif;letter-spacing:0.5px;}
.btn-cta:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,0.35);}
.benefits{background:#fff;padding:26px 20px;box-shadow:0 4px 16px rgba(0,0,0,0.07);position:relative;z-index:3;}
.ben-grid{display:flex;max-width:900px;margin:0 auto;justify-content:space-around;align-items:center;gap:16px;flex-wrap:wrap;}
.ben-item{display:flex;align-items:center;gap:12px;flex:1;min-width:180px;}
.ben-icon{width:44px;height:44px;flex-shrink:0;color:${sc};}
.ben-icon svg{width:100%;height:100%;}
.ben-text strong{display:block;font-size:13px;font-weight:700;color:${pc};}
.ben-text span{font-size:11px;color:#666;}
.ben-sep{width:1px;height:52px;background:#e8e8e8;flex-shrink:0;}
.desc-block{background:#fff;padding:40px 20px 0;}
.desc-inner{max-width:720px;margin:0 auto;font-size:15px;color:#444;line-height:1.8;font-family:'Playfair Display',serif;font-style:italic;border-left:3px solid ${sc};padding-left:20px;}
.gallery{background:#f0f4f8;padding:56px 20px;}
.sec-title{font-family:'Playfair Display',serif;font-size:clamp(20px,3.5vw,30px);color:${pc};text-align:center;margin-bottom:10px;}
.sec-div{display:flex;align-items:center;gap:14px;max-width:280px;margin:0 auto 34px;}
.sec-div::before,.sec-div::after{content:'';flex:1;height:1px;background:${sc};}
.gal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:1100px;margin:0 auto;}
.gal-item img{width:100%;height:220px;object-fit:cover;border-radius:3px;display:block;}
.gal-ph{width:100%;height:220px;border-radius:3px;}
.gal-item figcaption{font-family:'Playfair Display',serif;font-style:italic;font-size:12px;color:#666;text-align:center;margin-top:7px;}
.wa-mid{background:#f8f9fb;padding:32px 20px;text-align:center;border-top:1px solid #eee;display:flex;flex-direction:column;align-items:center;}
.wa-trigger{font-family:'Playfair Display',serif;font-size:clamp(16px,2.5vw,22px);color:${pc};margin-bottom:16px;font-style:italic;}
.wa-btn-mid{display:inline-flex;align-items:center;gap:10px;background:#25D366;color:#fff;padding:13px 28px;border-radius:3px;text-decoration:none;font-weight:700;font-size:14px;transition:all 0.3s;}
.wa-btn-mid:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(37,211,102,0.4);}
.wa-btn-mid svg{width:20px;height:20px;fill:#fff;}
.features{background:#fff;padding:56px 20px;}
.feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:900px;margin:0 auto;}
.feat-item{display:flex;align-items:flex-start;gap:14px;padding:16px;border-radius:6px;background:#f8f9fb;}
.feat-icon{width:40px;height:40px;flex-shrink:0;background:linear-gradient(135deg,${pc},${pc}cc);border-radius:6px;display:flex;align-items:center;justify-content:center;color:${sc};padding:8px;}
.feat-icon svg{width:100%;height:100%;}
.feat-text strong{display:block;font-size:13px;font-weight:700;color:${pc};margin-bottom:3px;}
.feat-text span{font-size:11px;color:#666;line-height:1.5;}
.conditions{background:${pc};padding:56px 20px;}
.conditions .sec-title{color:#fff;}
.conditions .sec-div::before,.conditions .sec-div::after{background:rgba(201,168,76,0.4);}
.cond-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:840px;margin:0 auto 14px;}
.cond-card{background:linear-gradient(135deg,${sc},${sc}cc);border-radius:4px;padding:22px 14px;text-align:center;color:#0a1628;}
.cc-lbl{font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:700;opacity:0.75;margin-bottom:3px;}
.cc-sub{font-size:9px;opacity:0.65;margin-top:3px;}
.cc-val{font-size:clamp(18px,2.8vw,26px);font-weight:900;line-height:1.2;}
.cond-esc{text-align:center;font-family:'Playfair Display',serif;font-style:italic;color:rgba(255,255,255,0.65);font-size:13px;margin-top:14px;}
.form-sec{background:${formBg};position:relative;padding:72px 20px;}
.form-ov{position:absolute;inset:0;background:rgba(10,22,40,0.84);}
.form-cnt{position:relative;z-index:2;max-width:500px;margin:0 auto;text-align:center;}
.form-title{font-family:'Playfair Display',serif;font-size:clamp(22px,3.5vw,34px);color:#fff;margin-bottom:8px;}
.form-sub{color:rgba(255,255,255,0.6);font-size:13px;margin-bottom:26px;}
.form-box{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:24px;}
.form-box input{width:100%;padding:13px 15px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.07);color:#fff;font-size:13px;border-radius:3px;font-family:'Inter',sans-serif;outline:none;transition:border 0.3s;}
.form-box input::placeholder{color:rgba(255,255,255,0.35);}
.form-box input:focus{border-color:${sc};}
.form-box button{width:100%;padding:14px;background:linear-gradient(135deg,${sc},${sc}cc);color:#0a1628;font-weight:800;font-size:14px;border:none;border-radius:3px;cursor:pointer;transition:all 0.3s;font-family:'Inter',sans-serif;}
.form-box button:hover{transform:translateY(-2px);}
.form-ok{display:none;padding:16px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:4px;color:#4ade80;font-size:14px;margin-top:12px;}
.form-micro{font-family:'Playfair Display',serif;font-style:italic;color:rgba(255,255,255,0.45);font-size:11px;margin-top:10px;}
footer{background:#060d1a;padding:16px 20px;text-align:center;color:rgba(255,255,255,0.3);font-size:11px;}
.wa-float{position:fixed;bottom:22px;right:22px;z-index:999;width:52px;height:52px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,0.45);transition:all 0.3s;text-decoration:none;}
.wa-float:hover{transform:scale(1.1);}
.wa-float svg{width:26px;height:26px;fill:#fff;}
.fade-in{opacity:0;transform:translateY(22px);transition:opacity 0.6s ease,transform 0.6s ease;}
.fade-in.visible{opacity:1;transform:translateY(0);}
@media(max-width:768px){
  .ben-sep{display:none;}.ben-grid{flex-direction:column;align-items:flex-start;}
  .gal-grid{grid-template-columns:1fr;}.feat-grid{grid-template-columns:1fr;}
  .cond-grid{grid-template-columns:1fr;}
  .hero-content{padding:120px 16px 80px;}
  .hero-logo{top:60px;left:50%;transform:translateX(-50%);}
  .hero-wa-top{display:flex;position:fixed;top:0;left:0;right:0;z-index:999;background:#25D366;color:#fff;font-weight:600;font-size:13px;padding:10px 16px;align-items:center;justify-content:center;gap:8px;text-decoration:none;}
  .hero-wa-top svg{width:16px;height:16px;fill:#fff;flex-shrink:0;}
  .gallery,.features,.conditions{padding:40px 16px;}
  .form-sec{padding:48px 16px;}.form-box{padding:18px 14px;}
}
</style>
</head>
<body>
<section class="hero">
  <div class="hero-overlay"></div>
  <div class="hero-logo">${logoHtml}</div>
  <div class="hero-content">
    <h1 class="hero-headline"><em>${copy.headline1}</em><br>${copy.headline2}</h1>
    ${conditionBox}
    <p class="hero-sub">${copy.subtitle}</p>
    <span class="hero-arrow">&#8595;</span>
    <a href="#formulario" class="btn-cta">${copy.ctaText}</a>
  </div>
  <a href="https://wa.me/${form.whatsapp}?text=${encodeURIComponent(copy.whatsappCta + ' - ' + form.name)}" class="hero-wa-top" target="_blank">${svgWa} ${copy.whatsappCta}</a>
</section>
<section class="benefits fade-in">
  <div class="ben-grid">
    <div class="ben-item"><div class="ben-icon">${svgHome}</div><div class="ben-text"><strong>${copy.benefit1title}</strong><span>${copy.benefit1desc}</span></div></div>
    <div class="ben-sep"></div>
    <div class="ben-item"><div class="ben-icon">${svgStar}</div><div class="ben-text"><strong>${copy.benefit2title}</strong><span>${copy.benefit2desc}</span></div></div>
    <div class="ben-sep"></div>
    <div class="ben-item"><div class="ben-icon">${svgPin}</div><div class="ben-text"><strong>${copy.benefit3title}</strong><span>${copy.benefit3desc}</span></div></div>
  </div>
</section>
<section class="desc-block fade-in"><div class="desc-inner">${copy.descricaoBloco}</div></section>
<section class="gallery fade-in">
  <h2 class="sec-title">Viva o melhor de ${form.location}</h2>
  <div class="sec-div"></div>
  <div class="gal-grid">${galleryHtml}</div>
</section>
<section class="wa-mid fade-in">
  <p class="wa-trigger">${copy.whatsappTrigger}</p>
  <a href="https://wa.me/${form.whatsapp}?text=${encodeURIComponent(copy.whatsappCta + ' - ' + form.name)}" class="wa-btn-mid" target="_blank">${svgWa} ${copy.whatsappCta}</a>
</section>
<section class="features fade-in">
  <h2 class="sec-title">Por que escolher o ${form.name}?</h2>
  <div class="sec-div"></div>
  <div class="feat-grid">
    <div class="feat-item"><div class="feat-icon">${svgHome}</div><div class="feat-text"><strong>${copy.diff1title}</strong><span>${copy.diff1desc}</span></div></div>
    <div class="feat-item"><div class="feat-icon">${svgStar}</div><div class="feat-text"><strong>${copy.diff2title}</strong><span>${copy.diff2desc}</span></div></div>
    <div class="feat-item"><div class="feat-icon">${svgPin}</div><div class="feat-text"><strong>${copy.diff3title}</strong><span>${copy.diff3desc}</span></div></div>
    <div class="feat-item"><div class="feat-icon">${svgDiamond}</div><div class="feat-text"><strong>${copy.diff4title}</strong><span>${copy.diff4desc}</span></div></div>
  </div>
</section>
<section class="conditions fade-in">
  <h2 class="sec-title">Condicoes Imperdiveis</h2>
  <div class="sec-div"></div>
  <div class="cond-grid">${condCards}</div>
  <p class="cond-esc">${copy.escassez}</p>
</section>
<section class="form-sec" id="formulario">
  <div class="form-ov"></div>
  <div class="form-cnt fade-in">
    <h2 class="form-title">${copy.formTitle}</h2>
    <p class="form-sub">${copy.formSubtitle}</p>
    <div class="form-box">
      <form id="lead-form">
        <input type="text" name="nome" placeholder="Nome completo" required>
        <input type="tel" name="whatsapp" placeholder="WhatsApp com DDD" required>
        <input type="hidden" name="_subject" value="Novo lead - ${form.name}">
        <button type="submit">${copy.ctaText}</button>
      </form>
      <div class="form-ok" id="form-ok">&#10003; Recebemos! Em breve nossa equipe entrara em contato.</div>
      <p class="form-micro">${copy.formMicro}</p>
    </div>
  </div>
</section>
<footer><p>Exclusiva Imobiliaria Rio | CRECI-RJ | &copy; ${new Date().getFullYear()}</p></footer>
<a href="https://wa.me/${form.whatsapp}?text=Ola,%20tenho%20interesse%20no%20${encodeURIComponent(form.name)}" class="wa-float" target="_blank">${svgWa}</a>
<script>
document.getElementById('lead-form').addEventListener('submit',async function(e){
  e.preventDefault();
  const btn=this.querySelector('button');btn.textContent='Enviando...';btn.disabled=true;
  try{
    await fetch('https://formsubmit.co/ajax/${form.formEmail}',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({nome:this.nome.value,whatsapp:this.whatsapp.value,_subject:'Novo lead - ${form.name}'})});
    if(typeof fbq!=='undefined')fbq('track','Lead');
    this.style.display='none';document.getElementById('form-ok').style.display='block';
  }catch(err){btn.textContent='${copy.ctaText}';btn.disabled=false;}
});
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.1});
document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));
document.querySelector('.btn-cta').addEventListener('click',function(e){e.preventDefault();document.getElementById('formulario').scrollIntoView({behavior:'smooth'});});
</script>
</body>
</html>`;
}

function buildTemplateInvestor(form: FormData, opts: { showPrice: boolean }, copy: Record<string, string>): string {
  const sc = '#c9a84c';
  const heroImg = form.images.find(i => i.isHero);
  const galleryImgs = form.images.filter(i => i.inGallery).slice(0, 3);
  const formBgImg = galleryImgs[0] ?? heroImg;
  const heroBg = heroImg ? `url('${heroImg.base64}') center center/cover no-repeat` : `linear-gradient(160deg, #060f1e 0%, #0d1f3c 50%, #142a4a 100%)`;
  const formBg = formBgImg ? `url('${formBgImg.base64}') center center/cover no-repeat` : `linear-gradient(135deg, #060f1e 0%, #0a1628 100%)`;
  const logoHtml = form.logoType === 'image' && form.logoBase64
    ? `<img src="${form.logoBase64}" alt="${form.name}" style="height:80px;object-fit:contain;">`
    : `<span style="font-family:'Playfair Display',serif;font-size:clamp(13px,2vw,18px);color:${sc};letter-spacing:3px;font-weight:700;text-transform:uppercase;">✦ ${form.name} ✦</span>`;

  const conditionBox = opts.showPrice && (form.entry || form.installments) ? `
    <div class="hero-cond">
      <div class="cond-lbl">Condicoes Especiais de Lancamento</div>
      <div class="cond-val">
        ${form.entry ? `Entrada a partir de <span>${form.entry}</span><br>` : ''}
        ${form.installments ? `+ Parcelas a partir de <span>${form.installments}</span>` : ''}
      </div>
    </div>` : '';

  const rentCards = [
    form.rentAnual ? `<div class="rent-card"><div class="rc-lbl">Retorno anual</div><div class="rc-val">${form.rentAnual}</div><div class="rc-sub">estimado</div></div>` : '',
    `<div class="rent-card"><div class="rc-lbl">Valorizacao</div><div class="rc-val">Alta</div><div class="rc-sub">potencial na obra</div></div>`,
    `<div class="rent-card"><div class="rc-lbl">Demanda</div><div class="rc-val">Alta</div><div class="rc-sub">${form.location}</div></div>`,
  ].filter(Boolean).join('');

  const galleryHtml = galleryImgs.length > 0
    ? galleryImgs.map(img => `<figure class="gal-item"><img src="${img.base64}" alt="${img.label}" loading="lazy"><figcaption>${img.label}</figcaption></figure>`).join('')
    : `<figure class="gal-item"><div class="gal-ph"></div><figcaption>Lazer completo</figcaption></figure>
       <figure class="gal-item"><div class="gal-ph"></div><figcaption>Localizacao privilegiada</figcaption></figure>
       <figure class="gal-item"><div class="gal-ph"></div><figcaption>Ambientes modernos</figcaption></figure>`;

  const specsHtml = [
    form.typology ? `<div class="spec-item"><div class="spec-dot"></div><span>${form.typology}</span></div>` : '',
    form.area ? `<div class="spec-item"><div class="spec-dot"></div><span>${form.area}</span></div>` : '',
    form.parking ? `<div class="spec-item"><div class="spec-dot"></div><span>${form.parking}</span></div>` : '',
    form.strongPoints[0] ? `<div class="spec-item"><div class="spec-dot"></div><span>${form.strongPoints[0]}</span></div>` : '',
    form.strongPoints[1] ? `<div class="spec-item"><div class="spec-dot"></div><span>${form.strongPoints[1]}</span></div>` : '',
    form.strongPoints[2] ? `<div class="spec-item"><div class="spec-dot"></div><span>${form.strongPoints[2]}</span></div>` : '',
  ].filter(Boolean).join('');

  const condCards = (() => {
    const cards = [];
    if (form.entry) cards.push(`<div class="cond-card"><div class="cc-lbl">Entrada</div><div class="cc-sub">a partir de</div><div class="cc-val">${form.entry}</div></div>`);
    if (form.installments) cards.push(`<div class="cond-card"><div class="cc-lbl">Parcelas</div><div class="cc-val">${form.installments}</div><div class="cc-sub">Durante a Obra</div></div>`);
    cards.push(`<div class="cond-card"><div class="cc-lbl">Financiamento</div><div class="cc-val" style="font-size:clamp(14px,2vw,18px)">facilitado</div><div class="cc-sub">Caixa FGTS</div></div>`);
    return cards.join('');
  })();

  const svgWa = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${form.name} | Oportunidade de Investimento | ${form.location}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${form.pixelId}');fbq('track','PageView');fbq('track','ViewContent');</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:'Inter',sans-serif;color:#fff;overflow-x:hidden;background:#060f1e;}
.hero{min-height:100vh;background:${heroBg};display:flex;flex-direction:column;position:relative;}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(6,15,30,0.55) 0%,rgba(6,15,30,0.38) 45%,rgba(6,15,30,0.82) 100%);}
.hero-logo{position:absolute;top:20px;left:24px;z-index:3;}
.hero-wa-top{display:none;}
.hero-badge{position:absolute;top:20px;right:20px;z-index:3;font-size:9px;color:${sc};background:rgba(201,168,76,0.12);border:0.5px solid rgba(201,168,76,0.35);padding:4px 10px;border-radius:3px;text-transform:uppercase;letter-spacing:1px;}
.hero-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:90px 20px 60px;text-align:center;}
.hero-headline{font-family:'Playfair Display',serif;font-size:clamp(26px,5vw,52px);color:#fff;line-height:1.25;margin-bottom:20px;}
.hero-headline em{font-style:italic;color:${sc};}
.hero-cond{background:rgba(6,15,30,0.84);border:0.5px solid rgba(201,168,76,0.5);border-radius:5px;padding:12px 22px;margin-bottom:14px;}
.cond-lbl{font-size:9px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:2px;margin-bottom:5px;}
.cond-val{font-size:clamp(14px,2.5vw,20px);font-weight:800;color:#fff;line-height:1.5;}
.cond-val span{color:${sc};}
.hero-sub{font-family:'Playfair Display',serif;font-style:italic;color:rgba(255,255,255,0.72);font-size:clamp(12px,1.8vw,15px);margin-bottom:18px;}
.hero-arrow{font-size:24px;color:${sc};animation:bounce 1.5s infinite;margin-bottom:14px;display:block;}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
.btn-cta{display:inline-block;background:linear-gradient(135deg,${sc},#b8943d);color:#060f1e;font-weight:800;font-size:clamp(12px,1.8vw,15px);padding:13px 32px;border-radius:3px;text-decoration:none;border:none;cursor:pointer;transition:all 0.3s;font-family:'Inter',sans-serif;letter-spacing:0.5px;}
.btn-cta:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(0,0,0,0.4);}
.rent-sec{background:#0d1a2e;padding:40px 20px;}
.sec-title{font-family:'Playfair Display',serif;font-size:clamp(18px,3vw,26px);color:${sc};text-align:center;margin-bottom:8px;}
.sec-div{display:flex;align-items:center;gap:12px;max-width:240px;margin:0 auto 28px;}
.sec-div::before,.sec-div::after{content:'';flex:1;height:0.5px;background:rgba(201,168,76,0.5);}
.rent-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:800px;margin:0 auto 14px;}
.rent-card{background:rgba(201,168,76,0.07);border:0.5px solid rgba(201,168,76,0.2);border-radius:5px;padding:16px 10px;text-align:center;}
.rc-lbl{font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;}
.rc-val{font-size:clamp(20px,3vw,28px);font-weight:700;color:${sc};line-height:1;}
.rc-sub{font-size:9px;color:rgba(255,255,255,0.25);margin-top:4px;}
.rent-desc{max-width:700px;margin:0 auto;text-align:center;font-size:12px;color:rgba(255,255,255,0.35);font-style:italic;}
.empreend{background:#0a1423;padding:40px 20px;}
.empreend .sec-title{color:#fff;}
.gal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:1000px;margin:0 auto 16px;}
.gal-item img{width:100%;height:180px;object-fit:cover;border-radius:3px;display:block;}
.gal-ph{width:100%;height:180px;border-radius:3px;background:linear-gradient(135deg,#1a2a3a,#0d1a2e);}
.gal-item figcaption{font-family:'Playfair Display',serif;font-style:italic;font-size:11px;color:rgba(255,255,255,0.3);text-align:center;margin-top:5px;}
.specs-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:700px;margin:0 auto;}
.spec-item{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.07);border-radius:3px;padding:8px 12px;}
.spec-dot{width:5px;height:5px;background:${sc};border-radius:50%;flex-shrink:0;}
.spec-item span{font-size:11px;color:rgba(255,255,255,0.5);}
.simul{background:#060f1e;padding:40px 20px;border-top:0.5px solid rgba(201,168,76,0.12);}
.simul .sec-title{color:#fff;}
.simul-inner{display:flex;gap:24px;align-items:flex-end;max-width:700px;margin:0 auto;}
.simul-list{flex:1;}
.simul-item{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.simul-dot{width:5px;height:5px;background:${sc};border-radius:50%;flex-shrink:0;}
.simul-item span{font-size:12px;color:rgba(255,255,255,0.6);}
.simul-item strong{color:#fff;font-weight:500;}
.simul-chart{flex-shrink:0;display:flex;align-items:flex-end;gap:4px;height:70px;}
.bar{width:12px;background:rgba(201,168,76,0.3);border-radius:2px 2px 0 0;}
.simul-cta{border:0.5px solid rgba(201,168,76,0.3);border-radius:3px;padding:10px;font-size:11px;color:${sc};text-align:center;cursor:pointer;text-decoration:none;display:block;max-width:700px;margin:16px auto 0;}
.simul-cta:hover{background:rgba(201,168,76,0.08);}
.why{background:#0d1a2e;padding:40px 20px;border-top:0.5px solid rgba(201,168,76,0.12);}
.why .sec-title{color:#fff;}
.why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:800px;margin:0 auto;}
.why-item{text-align:center;}
.why-icon{width:38px;height:38px;border-radius:50%;background:rgba(201,168,76,0.1);border:0.5px solid rgba(201,168,76,0.3);margin:0 auto 8px;display:flex;align-items:center;justify-content:center;}
.why-icon svg{width:16px;height:16px;fill:none;stroke:${sc};stroke-width:2;}
.why-title{font-size:11px;font-weight:600;color:${sc};margin-bottom:4px;}
.why-desc{font-size:10px;color:rgba(255,255,255,0.3);line-height:1.5;}
.cond-sec{background:#060f1e;padding:40px 20px;border-top:0.5px solid rgba(201,168,76,0.12);}
.cond-sec .sec-title{color:#fff;}
.cond-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:800px;margin:0 auto 12px;}
.cond-card{background:linear-gradient(135deg,${sc},#b8943d);border-radius:4px;padding:18px 12px;text-align:center;color:#060f1e;}
.cc-lbl{font-size:9px;text-transform:uppercase;letter-spacing:2px;font-weight:700;opacity:0.75;margin-bottom:3px;}
.cc-sub{font-size:9px;opacity:0.65;margin-top:3px;}
.cc-val{font-size:clamp(16px,2.5vw,22px);font-weight:900;line-height:1.2;}
.cond-esc{text-align:center;font-family:'Playfair Display',serif;font-style:italic;color:rgba(255,255,255,0.4);font-size:12px;margin-top:12px;}
.form-sec{background:${formBg};position:relative;padding:64px 20px;}
.form-ov{position:absolute;inset:0;background:rgba(6,15,30,0.86);}
.form-cnt{position:relative;z-index:2;max-width:480px;margin:0 auto;text-align:center;}
.form-title{font-family:'Playfair Display',serif;font-size:clamp(20px,3vw,30px);color:#fff;margin-bottom:6px;}
.form-sub{color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:22px;}
.form-box{background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.1);border-radius:5px;padding:20px;}
.form-box input{width:100%;padding:12px 14px;margin-bottom:10px;border:0.5px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:12px;border-radius:3px;font-family:'Inter',sans-serif;outline:none;transition:border 0.3s;}
.form-box input::placeholder{color:rgba(255,255,255,0.3);}
.form-box input:focus{border-color:${sc};}
.form-box button{width:100%;padding:13px;background:linear-gradient(135deg,${sc},#b8943d);color:#060f1e;font-weight:800;font-size:13px;border:none;border-radius:3px;cursor:pointer;transition:all 0.3s;font-family:'Inter',sans-serif;text-transform:uppercase;letter-spacing:0.5px;}
.form-box button:hover{transform:translateY(-2px);}
.form-ok{display:none;padding:14px;background:rgba(34,197,94,0.1);border:0.5px solid rgba(34,197,94,0.3);border-radius:3px;color:#4ade80;font-size:13px;margin-top:10px;}
.form-micro{font-family:'Playfair Display',serif;font-style:italic;color:rgba(255,255,255,0.3);font-size:10px;margin-top:8px;}
footer{background:#030810;padding:14px 20px;text-align:center;color:rgba(255,255,255,0.2);font-size:10px;}
.wa-float{position:fixed;bottom:22px;right:22px;z-index:999;width:50px;height:50px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,0.4);transition:all 0.3s;text-decoration:none;}
.wa-float:hover{transform:scale(1.1);}
.wa-float svg{width:24px;height:24px;fill:#fff;}
.fade-in{opacity:0;transform:translateY(20px);transition:opacity 0.6s ease,transform 0.6s ease;}
.fade-in.visible{opacity:1;transform:translateY(0);}
@media(max-width:768px){
  .rent-grid,.why-grid,.cond-grid,.gal-grid,.specs-grid{grid-template-columns:1fr;}
  .simul-chart{display:none;}
  .hero-content{padding:120px 16px 80px;}
  .hero-logo{top:60px;left:50%;transform:translateX(-50%);}
  .hero-wa-top{display:flex;position:fixed;top:0;left:0;right:0;z-index:999;background:#25D366;color:#fff;font-weight:600;font-size:13px;padding:10px 16px;align-items:center;justify-content:center;gap:8px;text-decoration:none;}
  .hero-wa-top svg{width:16px;height:16px;fill:#fff;flex-shrink:0;}
  .rent-sec,.empreend,.simul,.why,.cond-sec{padding:32px 16px;}
  .form-sec{padding:40px 16px;}.form-box{padding:16px 12px;}
}
</style>
</head>
<body>
<section class="hero">
  <div class="hero-overlay"></div>
  <div class="hero-logo">${logoHtml}</div>
  <div class="hero-badge">Investimento</div>
  <div class="hero-content">
    <h1 class="hero-headline"><em>${copy.headline1}</em><br>${copy.headline2}</h1>
    ${conditionBox}
    <p class="hero-sub">${copy.subtitle}</p>
    <span class="hero-arrow">&#8595;</span>
    <a href="#formulario" class="btn-cta">${copy.ctaText}</a>
  </div>
  <a href="https://wa.me/${form.whatsapp}?text=${encodeURIComponent(copy.whatsappCta + ' - ' + form.name)}" class="hero-wa-top" target="_blank">${svgWa} ${copy.whatsappCta}</a>
</section>
<section class="rent-sec fade-in">
  <h2 class="sec-title">Potencial de Retorno</h2>
  <div class="sec-div"></div>
  <div class="rent-grid">${rentCards}</div>
  <p class="rent-desc">${copy.descricaoBloco}</p>
</section>
<section class="empreend fade-in">
  <h2 class="sec-title">O Empreendimento</h2>
  <div class="sec-div"></div>
  <div class="gal-grid">${galleryHtml}</div>
  <div class="specs-grid">${specsHtml}</div>
</section>
<section class="simul fade-in">
  <h2 class="sec-title">Simulacao de Cenario</h2>
  <div class="sec-div"></div>
  <div class="simul-inner">
    <div class="simul-list">
      ${form.entry ? `<div class="simul-item"><div class="simul-dot"></div><span>Entrada a partir de <strong>${form.entry}</strong></span></div>` : ''}
      <div class="simul-item"><div class="simul-dot"></div><span>Valorizacao potencial ao longo da obra</span></div>
      <div class="simul-item"><div class="simul-dot"></div><span>Possivel revenda com alto ganho</span></div>
      ${form.prazoObra ? `<div class="simul-item"><div class="simul-dot"></div><span>Prazo da obra: <strong>${form.prazoObra}</strong></span></div>` : ''}
      ${form.perfilAluguel ? `<div class="simul-item"><div class="simul-dot"></div><span>Perfil: <strong>${form.perfilAluguel}</strong></span></div>` : ''}
    </div>
    <div class="simul-chart">
      <div class="bar" style="height:20%"></div>
      <div class="bar" style="height:36%"></div>
      <div class="bar" style="height:52%"></div>
      <div class="bar" style="height:68%"></div>
      <div class="bar" style="height:84%"></div>
      <div class="bar" style="height:100%;background:${sc};"></div>
    </div>
  </div>
  <a href="https://wa.me/${form.whatsapp}?text=${encodeURIComponent('Quero receber a simulacao de rendimento - ' + form.name)}" class="simul-cta" target="_blank">${copy.whatsappTrigger} → ${copy.whatsappCta}</a>
</section>
<section class="why fade-in">
  <h2 class="sec-title">Por que investir aqui?</h2>
  <div class="sec-div"></div>
  <div class="why-grid">
    <div class="why-item">
      <div class="why-icon"><svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
      <div class="why-title">${copy.diff1title}</div>
      <div class="why-desc">${copy.diff1desc}</div>
    </div>
    <div class="why-item">
      <div class="why-icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
      <div class="why-title">${copy.diff2title}</div>
      <div class="why-desc">${copy.diff2desc}</div>
    </div>
    <div class="why-item">
      <div class="why-icon"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
      <div class="why-title">${copy.diff3title}</div>
      <div class="why-desc">${copy.diff3desc}</div>
    </div>
  </div>
</section>
<section class="cond-sec fade-in">
  <h2 class="sec-title">Condicoes Imperdiveis</h2>
  <div class="sec-div"></div>
  <div class="cond-grid">${condCards}</div>
  <p class="cond-esc">${copy.escassez}</p>
</section>
<section class="form-sec" id="formulario">
  <div class="form-ov"></div>
  <div class="form-cnt fade-in">
    <h2 class="form-title">${copy.formTitle}</h2>
    <p class="form-sub">${copy.formSubtitle}</p>
    <div class="form-box">
      <form id="lead-form">
        <input type="text" name="nome" placeholder="Nome completo" required>
        <input type="tel" name="whatsapp" placeholder="WhatsApp com DDD" required>
        <input type="hidden" name="_subject" value="Novo lead investidor - ${form.name}">
        <button type="submit">${copy.ctaText}</button>
      </form>
      <div class="form-ok" id="form-ok">&#10003; Recebemos! Em breve nossa equipe entrara em contato.</div>
      <p class="form-micro">${copy.formMicro}</p>
    </div>
  </div>
</section>
<footer><p>Exclusiva Imobiliaria Rio | CRECI-RJ | &copy; ${new Date().getFullYear()}</p></footer>
<a href="https://wa.me/${form.whatsapp}?text=Ola,%20tenho%20interesse%20em%20investir%20no%20${encodeURIComponent(form.name)}" class="wa-float" target="_blank">${svgWa}</a>
<script>
document.getElementById('lead-form').addEventListener('submit',async function(e){
  e.preventDefault();
  const btn=this.querySelector('button');btn.textContent='Enviando...';btn.disabled=true;
  try{
    await fetch('https://formsubmit.co/ajax/${form.formEmail}',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({nome:this.nome.value,whatsapp:this.whatsapp.value,_subject:'Novo lead investidor - ${form.name}'})});
    if(typeof fbq!=='undefined')fbq('track','Lead');
    this.style.display='none';document.getElementById('form-ok').style.display='block';
  }catch(err){btn.textContent='${copy.ctaText}';btn.disabled=false;}
});
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.1});
document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));
document.querySelector('.btn-cta').addEventListener('click',function(e){e.preventDefault();document.getElementById('formulario').scrollIntoView({behavior:'smooth'});});
</script>
</body>
</html>`;
}

export async function generateLP(form: FormData, opts: GenerateOptions): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key nao configurada.');
  const lpType = opts.overrideType ?? form.lpType;
  const copy = await generateCopy({ ...form, lpType }, opts, apiKey);
  if (lpType === 'investimento') {
    return buildTemplateInvestor(form, { showPrice: opts.showPrice }, copy);
  }
  return buildTemplateDefault(form, { showPrice: opts.showPrice }, copy);
}

export async function publishLP(name: string, html: string): Promise<string> {
  const githubToken = getGithubToken();
  const vercelToken = getVercelToken();
  if (!githubToken) throw new Error('Token do GitHub nao configurado.');
  if (!vercelToken) throw new Error('Token do Vercel nao configurado.');

  const slug = toSlug(name);
  const repoOwner = 'exclusivacomerciorj-cloud';
  const repoName = 'exclusiva-lps';
  const filePath = `${slug}/index.html`;
  const content = btoa(unescape(encodeURIComponent(html)));

  let sha = '';
  try {
    const fileRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      headers: { 'Authorization': `token ${githubToken}` },
    });
    if (fileRes.ok) {
      const fileData = await fileRes.json() as { sha: string };
      sha = fileData.sha;
    }
  } catch { /* arquivo nao existe ainda */ }

  const commitRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
    method: 'PUT',
    headers: { 'Authorization': `token ${githubToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `deploy: ${name}`,
      content,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!commitRes.ok) {
    const err = await commitRes.json() as { message?: string };
    throw new Error(err.message ?? 'Erro ao fazer commit no GitHub');
  }

  const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: repoName,
      gitSource: {
        type: 'github',
        org: repoOwner,
        repo: repoName,
        ref: 'main',
      },
      projectSettings: { framework: null },
    }),
  });

  if (!deployRes.ok) {
    const err = await deployRes.json() as { error?: { message?: string } };
    throw new Error(err.error?.message ?? 'Erro no deploy Vercel');
  }

  const deployData = await deployRes.json() as { url: string };
  return `https://${deployData.url}/${slug}`;
}