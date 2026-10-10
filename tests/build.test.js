import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { escapeHtml, html, raw, safeUrl } from "../src/lib/html.js";
import { ConfigError, readableTextOn, validateConfig, whatsappNumber } from "../src/lib/config.js";
import { renderPage } from "../src/templates/page.js";

const example = () => JSON.parse(readFileSync("config/site.json", "utf8"));

test("escapeHtml neutraliza os cinco caracteres especiais", () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
});

test("html`` escapa valores por padrão e aceita trechos confiáveis", () => {
  const name = "<script>alert(1)</script>";
  assert.equal(html`<p>${name}</p>`.toString(), "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  assert.equal(html`<p>${raw("<b>ok</b>")}</p>`.toString(), "<p><b>ok</b></p>");
  assert.equal(html`<ul>${["a", "<b>"].map((x) => html`<li>${x}</li>`)}</ul>`.toString(), "<ul><li>a</li><li>&lt;b&gt;</li></ul>");
  assert.equal(html`${null}${undefined}${false}`.toString(), "");
});

test("safeUrl bloqueia javascript: e outros esquemas", () => {
  assert.equal(safeUrl("javascript:alert(1)"), "#");
  assert.equal(safeUrl("data:text/html,oi"), "#");
  assert.equal(safeUrl("https://wa.me/55"), "https://wa.me/55");
  assert.equal(safeUrl("mailto:a@b.com"), "mailto:a@b.com");
});

test("a configuração de exemplo é válida", () => {
  assert.doesNotThrow(() => validateConfig(example()));
});

test("validateConfig lista todos os problemas de uma vez", () => {
  const config = example();
  delete config.business.name;
  config.theme.primary = "verde";
  config.business.email = "sem-arroba";
  config.services = [];
  try {
    validateConfig(config);
    assert.fail("deveria ter lançado ConfigError");
  } catch (error) {
    assert.ok(error instanceof ConfigError);
    assert.equal(error.problems.length, 4);
  }
});

test("whatsappNumber adiciona o 55 em números brasileiros", () => {
  assert.equal(whatsappNumber("(17) 90000-0000"), "5517900000000");
  assert.equal(whatsappNumber("+55 17 90000-0000"), "5517900000000");
});

test("readableTextOn escolhe texto legível para qualquer cor da marca", () => {
  assert.equal(readableTextOn("#1f4d43"), "#ffffff");
  assert.equal(readableTextOn("#e8b04b"), "#14181f");
  assert.equal(readableTextOn("#ffffff"), "#14181f");
});

test("a página gerada contém as seções e os dados estruturados", () => {
  const page = renderPage(example());
  for (const id of ["inicio", "servicos", "como-funciona", "duvidas", "contato"]) {
    assert.match(page, new RegExp(`id="${id}"`), id);
  }
  const ld = JSON.parse(page.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(ld["@type"], "AccountingService");
  assert.equal(ld.name, "Prumo Contabilidade");
});

test("conteúdo malicioso na configuração não vira código na página", () => {
  const config = example();
  config.business.name = `</script><script>alert("xss")</script>`;
  config.services[0].title = `<img src=x onerror=alert(1)>`;
  const page = renderPage(config);
  assert.doesNotMatch(page, /<script>alert/);
  assert.doesNotMatch(page, /<img src=x/);
  assert.match(page, /&lt;img src=x onerror=alert\(1\)&gt;/);
});
