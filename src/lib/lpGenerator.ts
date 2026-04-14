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

async function generateCopy(form: FormData, opts: GenerateOptions, apiKey: string): Promise<{
  headline1: string; headline2: string; subtitle: string;
  benefit1title: string; benefit1desc: string;
  benefit2title: string; benefit2desc: string;
  benefit3title: string; benefit3desc: string;
  diff1title: string; diff1desc: string;
  diff2title: string; diff2desc: string;
  diff3title: string; diff3desc: string;
  diff4title: string; diff4desc: string;
  escassez: string; formTitle: string; formSubtitle: string; ctaText: string;
}> {
  const lpType = opts.overrideType ?? form.lpType;
  const sp = form.strongPoints.length > 0 ? form.strongPoints : ['Lazer completo', 'Localizacao premium', 'Vista privilegiada', 'Construtora solida'];

  const prompt = `Voce e copywriter especialista em imoveis de alto padrao no Brasil.
Gere copy de alta conversao para esta landing page imobiliaria.
Retorne APENAS JSON valido sem markdown ou explicacoes.

Produto: ${form.name} | ${form.location} | ${form.typology} | ${form.area}
Tipo: ${lpType} | Agressividade: ${form.aggressiveness}
Pontos fortes: ${sp.join(', ')}
Diferenciais: ${form.differentials}

Retorne exatamente este JSON:
{
  "headline1": "primeira linha do headline em italico",
  "headline2": "segunda linha do headline",
  "subtitle": "subtitulo em italico (max 60 chars)",
  "benefit1title": "titulo beneficio 1",
  "benefit1desc": "descricao curta beneficio 1",
  "benefit2title": "titulo beneficio 2",
  "benefit2desc": "descricao curta beneficio 2",
  "benefit3title": "titulo beneficio 3",
  "benefit3desc": "descricao curta beneficio 3",
  "diff1title": "titulo diferencial 1",
  "diff1desc": "descricao diferencial 1",
  "diff2title": "titulo diferencial 2",
  "diff2desc": "descricao diferencial 2",
  "diff3title": "titulo diferencial 3",
  "diff3desc": "descricao diferencial 3",
  "diff4title": "titulo diferencial 4",
  "diff4desc": "descricao diferencial 4",
  "escassez": "frase de escassez",
  "formTitle": "titulo do formulario",
  "formSubtitle": "subtitulo do formulario",
  "ctaText": "texto do botao CTA"
}`;

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
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json() as { content?: { text?: string }[] };
  const text = data.content?.[0]?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Copy nao gerado');
  return JSON.parse(match[0]);
}

export async function generateLP(form: FormData, opts: GenerateOptions): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key nao configurada.');

  const copy = await generateCopy(form, opts, apiKey);
  const lpType = opts.overrideType ?? form.lpType;
  const pc = form.primaryColor || '#0a1628';
  const sc = form.secondaryColor || '#c9a84c';

  const heroImg = form.images.find(i => i.isHero);
  const galleryImgs = form.images.filter(i => i.inGallery).slice(0, 3);
  const formBgImg = galleryImgs[0] ?? heroImg;

  const heroBg = heroImg
    ? `url('${heroImg.base64}') center center/cover no-repeat`
    : `linear-gradient(135deg, ${pc} 0%, #0a1628 100%)`;

  const formBg = formBgImg
    ? `url('${formBgImg.base64}') center center/cover no-repeat`
    : `linear-gradient(135deg, ${pc} 0%, #0a1628 100%)`;

  const logoHtml = form.logoType === 'image' && form.logoBase64
    ? `<img src="${form.logoBase64}" alt="${form.name}" style="height:48px;object-fit:contain;">`
    : `<span style="font-family:'Playfair Display',serif;font-size:clamp(16px,3vw,22px);color:${sc};letter-spacing:4px;font-weight:700;text-transform:uppercase;">✦ ${form.name} ✦</span>`;

  const conditionBox = opts.showPrice && (form.entry || form.installments) ? `
    <div class="hero-condition-box">
      <div class="condition-label">Condicoes Especiais de Lancamento</div>
      <div class="condition-value">
        ${form.entry ? `Entrada a partir de <span>${form.entry}</span><br>` : ''}
        ${form.installments ? `+ Parcelas a partir de <span>${form.installments}</span>` : ''}
      </div>
    </div>` : '';

  const gallerySection = galleryImgs.length > 0 ? galleryImgs.map(img => `
    <figure class="gallery-item">
      <img src="${img.base64}" alt="${img.label}" loading="lazy">
      <figcaption>${img.label}</figcaption>
    </figure>`).join('') : `
    <figure class="gallery-item"><div class="gallery-placeholder" style="background:linear-gradient(135deg,${pc}44,${pc}88);height:220px;border-radius:4px;"></div><figcaption>Lazer completo</figcaption></figure>
    <figure class="gallery-item"><div class="gallery-placeholder" style="background:linear-gradient(135deg,${pc}33,${pc}66);height:220px;border-radius:4px;"></div><figcaption>Localizacao privilegiada</figcaption></figure>
    <figure class="gallery-item"><div class="gallery-placeholder" style="background:linear-gradient(135deg,${pc}55,${pc}99);height:220px;border-radius:4px;"></div><figcaption>Ambientes modernos</figcaption></figure>`;

  const condCards = (() => {
    const cards = [];
    if (form.entry) cards.push(`<div class="cond-card"><div class="cond-label">Entrada</div><div class="cond-sublabel">a partir de</div><div class="cond-value">${form.entry}</div></div>`);
    if (form.installments) cards.push(`<div class="cond-card"><div class="cond-label">Parcelas</div><div class="cond-value">${form.installments}</div><div class="cond-sublabel">Durante a Obra</div></div>`);
    cards.push(`<div class="cond-card"><div class="cond-label">Financiamento</div><div class="cond-value" style="font-size:clamp(18px,2.5vw,22px)">facilitado</div><div class="cond-sublabel">Caixa Economica</div></div>`);
    return cards.join('');
  })();

  const svgHome = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  const svgStar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const svgPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const svgDiamond = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.7 10.3a2.41 2.41 0 000 3.41l7.59 7.59a2.41 2.41 0 003.41 0l7.59-7.59a2.41 2.41 0 000-3.41l-7.59-7.59a2.41 2.41 0 00-3.41 0z"/></svg>`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${form.name} | ${form.location}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${form.pixelId}');fbq('track','PageView');fbq('track','ViewContent');
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;color:#222;overflow-x:hidden}
.hero{min-height:100vh;background:${heroBg};display:flex;flex-direction:column;position:relative;}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0.28) 50%,rgba(0,0,0,0.55) 100%);}
.hero-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:40px 20px 60px;text-align:center;}
.hero-logo{margin-bottom:20px;}
.hero-headline{font-family:'Playfair Display',serif;font-size:clamp(26px,5vw,52px);color:#fff;line-height:1.25;margin-bottom:24px;}
.hero-headline em{font-style:italic;}
.hero-condition-box{background:rgba(10,30,70,0.82);border:1px solid rgba(201,168,76,0.5);border-radius:8px;padding:14px 28px;margin-bottom:14px;}
.condition-label{font-size:11px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;}
.condition-value{font-size:clamp(16px,3vw,24px);font-weight:800;color:#fff;line-height:1.4;}
.condition-value span{color:${sc};}
.hero-subtitle{font-family:'Playfair Display',serif;font-style:italic;color:rgba(255,255,255,0.8);font-size:clamp(13px,2vw,16px);margin-bottom:24px;}
.hero-arrow{font-size:26px;color:${sc};animation:bounce 1.5s infinite;margin-bottom:18px;display:block;}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
.btn-cta{display:inline-block;background:linear-gradient(135deg,${sc},${sc}dd);color:#0a1628;font-weight:800;font-size:clamp(13px,2vw,16px);padding:15px 36px;border-radius:4px;text-decoration:none;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:all 0.3s;text-transform:uppercase;letter-spacing:1px;font-family:'Inter',sans-serif;}
.btn-cta:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.4);}
.benefits{background:#fff;padding:28px 20px;box-shadow:0 4px 16px rgba(0,0,0,0.07);position:relative;z-index:3;}
.benefits-grid{display:flex;max-width:900px;margin:0 auto;justify-content:space-around;align-items:center;gap:16px;flex-wrap:wrap;}
.benefit-item{display:flex;align-items:center;gap:12px;flex:1;min-width:180px;}
.benefit-icon{width:44px;height:44px;flex-shrink:0;color:${sc};}
.benefit-icon svg{width:100%;height:100%;}
.benefit-text strong{display:block;font-size:13px;font-weight:700;color:${pc};}
.benefit-text span{font-size:11px;color:#666;}
.benefit-sep{width:1px;height:56px;background:#e8e8e8;flex-shrink:0;}
.gallery{background:#f0f4f8;padding:56px 20px;}
.section-title{font-family:'Playfair Display',serif;font-size:clamp(20px,4vw,30px);color:${pc};text-align:center;margin-bottom:10px;}
.section-divider{display:flex;align-items:center;gap:14px;max-width:320px;margin:0 auto 36px;}
.section-divider::before,.section-divider::after{content:'';flex:1;height:1px;background:${sc};}
.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:1100px;margin:0 auto;}
.gallery-item img{width:100%;height:220px;object-fit:cover;border-radius:4px;display:block;}
.gallery-item figcaption{font-family:'Playfair Display',serif;font-style:italic;font-size:12px;color:#666;text-align:center;margin-top:7px;}
.features{background:#fff;padding:56px 20px;}
.features-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:900px;margin:0 auto;}
.feature-item{display:flex;align-items:flex-start;gap:14px;padding:18px;border-radius:8px;background:#f8f9fb;}
.feature-icon{width:42px;height:42px;flex-shrink:0;background:linear-gradient(135deg,${pc},${pc}cc);border-radius:8px;display:flex;align-items:center;justify-content:center;color:${sc};padding:8px;}
.feature-icon svg{width:100%;height:100%;}
.feature-text strong{display:block;font-size:13px;font-weight:700;color:${pc};margin-bottom:3px;}
.feature-text span{font-size:11px;color:#666;line-height:1.5;}
.conditions{background:${pc};padding:56px 20px;}
.conditions .section-title{color:#fff;}
.conditions .section-divider::before,.conditions .section-divider::after{background:rgba(201,168,76,0.4);}
.cond-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:860px;margin:0 auto 16px;}
.cond-card{background:linear-gradient(135deg,${sc},${sc}cc);border-radius:6px;padding:24px 16px;text-align:center;color:#0a1628;}
.cond-label{font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;opacity:0.8;margin-bottom:4px;}
.cond-sublabel{font-size:10px;opacity:0.7;margin-top:4px;}
.cond-value{font-size:clamp(20px,3vw,28px);font-weight:900;line-height:1.2;}
.cond-escassez{text-align:center;font-family:'Playfair Display',serif;font-style:italic;color:rgba(255,255,255,0.7);font-size:14px;margin-top:16px;}
.form-section{background:${formBg};position:relative;padding:72px 20px;}
.form-overlay{position:absolute;inset:0;background:rgba(10,22,40,0.83);}
.form-content{position:relative;z-index:2;max-width:520px;margin:0 auto;text-align:center;}
.form-title{font-family:'Playfair Display',serif;font-size:clamp(24px,4vw,36px);color:#fff;margin-bottom:8px;}
.form-subtitle{color:rgba(255,255,255,0.65);font-size:13px;margin-bottom:28px;}
.form-box{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:28px;}
.form-box input{width:100%;padding:13px 15px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.07);color:#fff;font-size:13px;border-radius:4px;font-family:'Inter',sans-serif;outline:none;transition:border 0.3s;}
.form-box input::placeholder{color:rgba(255,255,255,0.38);}
.form-box input:focus{border-color:${sc};}
.form-box button{width:100%;padding:15px;background:linear-gradient(135deg,${sc},${sc}dd);color:#0a1628;font-weight:800;font-size:14px;border:none;border-radius:4px;cursor:pointer;text-transform:uppercase;letter-spacing:1px;transition:all 0.3s;font-family:'Inter',sans-serif;}
.form-box button:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.3);}
.form-success{display:none;padding:18px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.35);border-radius:6px;color:#4ade80;font-size:14px;margin-top:14px;}
.form-escassez{font-family:'Playfair Display',serif;font-style:italic;color:rgba(255,255,255,0.55);font-size:12px;margin-top:12px;}
footer{background:#060d1a;padding:18px 20px;text-align:center;color:rgba(255,255,255,0.35);font-size:11px;}
.wa-btn{position:fixed;bottom:22px;right:22px;z-index:999;width:54px;height:54px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(37,211,102,0.45);transition:all 0.3s;text-decoration:none;}
.wa-btn:hover{transform:scale(1.1);}
.wa-btn svg{width:28px;height:28px;fill:#fff;}
.fade-in{opacity:0;transform:translateY(24px);transition:opacity 0.6s ease,transform 0.6s ease;}
.fade-in.visible{opacity:1;transform:translateY(0);}
@media(max-width:768px){
  .benefit-sep{display:none;}
  .benefits-grid{flex-direction:column;align-items:flex-start;}
  .gallery-grid{grid-template-columns:1fr;}
  .features-grid{grid-template-columns:1fr;}
  .cond-grid{grid-template-columns:1fr;}
  .hero-content{padding:32px 16px 48px;}
  .gallery,.features,.conditions{padding:40px 16px;}
  .form-section{padding:48px 16px;}
  .form-box{padding:20px 16px;}
}
</style>
</head>
<body>
<section class="hero">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-logo">${logoHtml}</div>
    <h1 class="hero-headline"><em>${copy.headline1}</em><br>${copy.headline2}</h1>
    ${conditionBox}
    <p class="hero-subtitle">${copy.subtitle}</p>
    <span class="hero-arrow">&#8595;</span>
    <a href="#formulario" class="btn-cta">${copy.ctaText}</a>
  </div>
</section>
<section class="benefits fade-in">
  <div class="benefits-grid">
    <div class="benefit-item"><div class="benefit-icon">${svgHome}</div><div class="benefit-text"><strong>${copy.benefit1title}</strong><span>${copy.benefit1desc}</span></div></div>
    <div class="benefit-sep"></div>
    <div class="benefit-item"><div class="benefit-icon">${svgStar}</div><div class="benefit-text"><strong>${copy.benefit2title}</strong><span>${copy.benefit2desc}</span></div></div>
    <div class="benefit-sep"></div>
    <div class="benefit-item"><div class="benefit-icon">${svgPin}</div><div class="benefit-text"><strong>${copy.benefit3title}</strong><span>${copy.benefit3desc}</span></div></div>
  </div>
</section>
<section class="gallery fade-in">
  <h2 class="section-title">Viva o melhor de ${form.location}</h2>
  <div class="section-divider"></div>
  <div class="gallery-grid">${gallerySection}</div>
</section>
<section class="features fade-in">
  <h2 class="section-title">Por que escolher o ${form.name}?</h2>
  <div class="section-divider"></div>
  <div class="features-grid">
    <div class="feature-item"><div class="feature-icon">${svgHome}</div><div class="feature-text"><strong>${copy.diff1title}</strong><span>${copy.diff1desc}</span></div></div>
    <div class="feature-item"><div class="feature-icon">${svgStar}</div><div class="feature-text"><strong>${copy.diff2title}</strong><span>${copy.diff2desc}</span></div></div>
    <div class="feature-item"><div class="feature-icon">${svgPin}</div><div class="feature-text"><strong>${copy.diff3title}</strong><span>${copy.diff3desc}</span></div></div>
    <div class="feature-item"><div class="feature-icon">${svgDiamond}</div><div class="feature-text"><strong>${copy.diff4title}</strong><span>${copy.diff4desc}</span></div></div>
  </div>
</section>
<section class="conditions fade-in">
  <h2 class="section-title">Condicoes Imperdiveis</h2>
  <div class="section-divider"></div>
  <div class="cond-grid">${condCards}</div>
  <p class="cond-escassez">${copy.escassez}</p>
</section>
<section class="form-section" id="formulario">
  <div class="form-overlay"></div>
  <div class="form-content fade-in">
    <h2 class="form-title">${copy.formTitle}</h2>
    <p class="form-subtitle">${copy.formSubtitle}</p>
    <div class="form-box">
      <form id="lead-form">
        <input type="text" name="nome" placeholder="Nome completo" required>
        <input type="tel" name="whatsapp" placeholder="WhatsApp com DDD" required>
        <input type="hidden" name="_subject" value="Novo lead - ${form.name}">
        <button type="submit">${copy.ctaText}</button>
      </form>
      <div class="form-success" id="form-success">&#10003; Recebemos seu contato! Em breve entraremos em contato.</div>
      <p class="form-escassez">${copy.escassez}</p>
    </div>
  </div>
</section>
<footer><p>Exclusiva Imobiliaria Rio | CRECI-RJ | &copy; 2025</p></footer>
<a href="https://wa.me/${form.whatsapp}?text=Ola,%20tenho%20interesse%20no%20${encodeURIComponent(form.name)}" class="wa-btn" target="_blank" rel="noopener">
  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
<script>
document.getElementById('lead-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = this.querySelector('button');
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  try {
    await fetch('https://formsubmit.co/ajax/${form.formEmail}', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({nome: this.nome.value, whatsapp: this.whatsapp.value}),
    });
    if(typeof fbq!=='undefined') fbq('track','Lead');
    this.style.display='none';
    document.getElementById('form-success').style.display='block';
  } catch(err) {
    btn.textContent='${copy.ctaText}';
    btn.disabled=false;
  }
});
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.1});
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
document.querySelector('.btn-cta').addEventListener('click',function(e){
  e.preventDefault();
  document.getElementById('formulario').scrollIntoView({behavior:'smooth'});
});
</script>
</body>
</html>`;

  return html;
}
