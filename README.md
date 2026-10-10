# Institutional Web

[![Testes](https://github.com/wagnerglongo/Institutional_web_example/actions/workflows/test.yml/badge.svg)](https://github.com/wagnerglongo/Institutional_web_example/actions/workflows/test.yml)

Gerador de sites institucionais estáticos. Os dados da empresa (nome, serviços, cores, perguntas frequentes, contato) ficam em **um arquivo JSON**, e um script em Node monta o site pronto em `dist/`, com SEO, dados estruturados e tema nas cores da marca.

Nasceu da rotina de criar sites para pequenos negócios: a estrutura se repete e o que muda é o conteúdo.

**🔗 Exemplo no ar:** https://institutional-web-example.vercel.app (empresa fictícia)

<p align="center">
  <img src="docs/preview.png" alt="Site de exemplo de um escritório de contabilidade" width="72%">
  <img src="docs/preview-mobile.png" alt="O mesmo site no celular" width="22%">
</p>

## Mesma base, outra empresa

Trocando só o JSON (`config/exemplos/oficina.json`), o gerador produz o site de uma oficina mecânica, com outras cores e conteúdo:

<p align="center"><img src="docs/exemplo-oficina.png" alt="Site gerado para uma oficina mecânica" width="72%"></p>

```bash
npm run build -- config/exemplos/oficina.json
```

## Como funciona

```
config/site.json ──► validação ──► templates (html``) ──► dist/
                                                          ├── index.html
                                                          ├── assets/ (CSS, JS, fontes)
                                                          ├── favicon.svg (gerado com a inicial e as cores)
                                                          ├── robots.txt
                                                          └── sitemap.xml
```

1. **Validação** (`src/lib/config.js`): confere campos obrigatórios, formato das cores, e-mail, telefone e serviços. Se algo estiver errado, o build para e lista **todos** os problemas de uma vez.
2. **Templates** (`src/templates/page.js`): cada seção é uma função que recebe a configuração e devolve HTML. Seções sem conteúdo (por exemplo, sem perguntas frequentes) simplesmente não aparecem.
3. **Tema:** as cores da marca viram variáveis CSS. A cor do texto dos botões é escolhida automaticamente (branco ou quase preto) pelo contraste WCAG, então qualquer cor de marca fica legível.

## Decisões técnicas

| Tema | O que foi feito |
|---|---|
| Segurança | Os templates usam uma *tagged template* `html``…`` que **escapa todo valor por padrão**. Para inserir HTML é preciso marcar o trecho com `raw()` de propósito. Links passam por `safeUrl()`, que bloqueia `javascript:` e `data:`. O JSON-LD escapa `<` para não fechar a tag `<script>`. Tudo isso tem teste. |
| SEO | `title`, `description`, Open Graph, `canonical`, dados estruturados schema.org (`AccountingService`), `robots.txt` e `sitemap.xml` gerados a partir da configuração. |
| Sem dependências | O gerador usa só a biblioteca padrão do Node. O site final é HTML e CSS com 1 KB de JavaScript (menu do celular). Fontes hospedadas no próprio site. |
| Acessibilidade | HTML semântico, menu com `aria-expanded` e fechamento com Esc, perguntas frequentes com `<details>` nativo, foco visível, `prefers-reduced-motion`. |
| Testes e CI | 9 testes com `node --test` (escape, URLs, validação, contraste, página gerada e tentativa de XSS pela configuração), rodando no GitHub Actions. A Vercel faz o build com `vercel.json`. |

## Rodando localmente

```bash
git clone https://github.com/wagnerglongo/Institutional_web_example.git
cd Institutional_web_example
npm run dev    # gera o site e abre em http://localhost:3000
npm test       # Node 20+
```

## Estrutura

```
├── config/
│   ├── site.json              # exemplo principal (contabilidade)
│   └── exemplos/oficina.json  # segundo exemplo
├── scripts/build.mjs          # gera dist/
├── src/
│   ├── lib/html.js            # html``, raw(), escapeHtml, safeUrl
│   ├── lib/config.js          # validação, contraste, WhatsApp
│   ├── templates/page.js      # seções da página
│   └── assets/                # CSS, JS e fontes copiados para dist/
├── tests/
└── vercel.json
```

---

Desenvolvido por [Wagner Longo](https://github.com/wagnerglongo).
