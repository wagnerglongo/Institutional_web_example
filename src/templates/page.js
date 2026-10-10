import { html, raw, safeUrl } from "../lib/html.js";
import { readableTextOn, whatsappNumber } from "../lib/config.js";

const whatsappLink = (config, text) =>
  `https://wa.me/${whatsappNumber(config.business.whatsapp)}?text=${encodeURIComponent(text)}`;

/** Dados estruturados para o Google (schema.org/AccountingService → LocalBusiness). */
function jsonLd({ business, site }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: business.name,
    description: business.description,
    url: site.url,
    email: business.email,
    telephone: business.whatsapp,
    address: { "@type": "PostalAddress", streetAddress: business.address, addressLocality: business.city, addressCountry: "BR" },
    openingHours: business.hours,
  };
  // "<" escapado impede que um valor feche a tag <script> antes da hora
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const header = ({ business }, cta) => html`
  <header class="site-header">
    <a class="brand" href="#inicio">${business.name}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    <nav id="menu" class="menu" aria-label="Principal">
      <a href="#servicos">Serviços</a>
      <a href="#como-funciona">Como funciona</a>
      <a href="#duvidas">Dúvidas</a>
      <a href="#contato">Contato</a>
      <a class="button button--small" href="${safeUrl(cta)}">Falar no WhatsApp</a>
    </nav>
  </header>`;

const hero = ({ hero }, cta) => html`
  <section class="hero" id="inicio">
    <div class="hero__text">
      <h1>${hero.title}</h1>
      <p class="hero__lead">${hero.subtitle}</p>
      <a class="button" href="${safeUrl(cta)}">${hero.cta ?? "Fale conosco"}</a>
    </div>
    ${hero.facts?.length
      ? html`<dl class="facts">
          ${hero.facts.map((f) => html`<div class="facts__item"><dt>${f.label}</dt><dd>${f.value}</dd></div>`)}
        </dl>`
      : ""}
  </section>`;

const services = ({ services }) => html`
  <section class="section" id="servicos" aria-labelledby="servicos-titulo">
    <h2 id="servicos-titulo">Serviços</h2>
    <ul class="services" role="list">
      ${services.map((s) => html`<li class="service"><h3>${s.title}</h3><p>${s.description}</p></li>`)}
    </ul>
  </section>`;

const steps = ({ steps }) =>
  steps?.length
    ? html`
  <section class="section section--tint" id="como-funciona" aria-labelledby="passos-titulo">
    <h2 id="passos-titulo">Como funciona</h2>
    <ol class="steps">
      ${steps.map((s) => html`<li class="step"><h3>${s.title}</h3><p>${s.description}</p></li>`)}
    </ol>
  </section>`
    : "";

const faq = ({ faq }) =>
  faq?.length
    ? html`
  <section class="section section--narrow" id="duvidas" aria-labelledby="duvidas-titulo">
    <h2 id="duvidas-titulo">Dúvidas frequentes</h2>
    ${faq.map((item) => html`<details class="faq"><summary>${item.question}</summary><p>${item.answer}</p></details>`)}
  </section>`
    : "";

const contact = ({ business }, cta) => html`
  <section class="section contact" id="contato" aria-labelledby="contato-titulo">
    <div>
      <h2 id="contato-titulo">Vamos conversar</h2>
      <p>${business.description}</p>
      <div class="contact__actions">
        <a class="button" href="${safeUrl(cta)}">Falar no WhatsApp</a>
        <a class="button button--outline" href="${safeUrl(`mailto:${business.email}`)}">${business.email}</a>
      </div>
    </div>
    <dl class="contact__info">
      ${business.address ? html`<div><dt>Endereço</dt><dd>${business.address}<br>${business.city}</dd></div>` : ""}
      ${business.hours?.length ? html`<div><dt>Horário</dt><dd>${business.hours.map((h, i) => html`${i ? raw("<br>") : ""}${h}`)}</dd></div>` : ""}
      <div><dt>WhatsApp</dt><dd>${business.whatsapp}</dd></div>
    </dl>
  </section>`;

export function renderPage(config) {
  const { business, site, theme } = config;
  const cta = whatsappLink(config, `Olá! Vim pelo site da ${business.name} e quero um orçamento.`);
  const title = `${business.name} · ${business.tagline}`;
  const year = new Date().getFullYear();

  return html`<!DOCTYPE html>
<html lang="${site.lang ?? "pt-BR"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${business.description}">
  <meta name="theme-color" content="${theme.primary}">
  <link rel="canonical" href="${site.url}/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${business.description}">
  <meta property="og:url" content="${site.url}/">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/newsreader-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/styles.css">
  <style>:root{--primary:${theme.primary};--on-primary:${readableTextOn(theme.primary)};--accent:${theme.accent};--on-accent:${readableTextOn(theme.accent)}}</style>
  <script type="application/ld+json">${raw(jsonLd(config))}</script>
  <script src="assets/main.js" type="module"></script>
</head>
<body>
  ${site.demo ? html`<p class="demo-bar">Site de demonstração. ${business.name} é uma empresa fictícia.</p>` : ""}
  ${header(config, cta)}
  <main>
    ${hero(config, cta)}
    ${services(config)}
    ${steps(config)}
    ${faq(config)}
    ${contact(config, cta)}
  </main>
  <footer class="site-footer">
    <p>© ${year} ${business.name}</p>
    <p>Gerado com <a href="https://github.com/wagnerglongo/Institutional_web_example">Institutional Web</a></p>
  </footer>
</body>
</html>
`.toString();
}
