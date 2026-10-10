/**
 * Gera o site estático em dist/ a partir de config/site.json.
 * Uso: npm run build            (config padrão)
 *      npm run build -- outra.json
 */
import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import path from "node:path";
import { validateConfig, ConfigError } from "../src/lib/config.js";
import { renderPage } from "../src/templates/page.js";

const configPath = process.argv[2] ?? "config/site.json";
const OUT = "dist";

try {
  const config = validateConfig(JSON.parse(await readFile(configPath, "utf8")));

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await cp("src/assets", path.join(OUT, "assets"), { recursive: true });

  await writeFile(path.join(OUT, "index.html"), renderPage(config));
  await writeFile(path.join(OUT, "favicon.svg"), favicon(config));
  await writeFile(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${config.site.url}/sitemap.xml\n`);
  await writeFile(
    path.join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${config.site.url}/</loc></url></urlset>\n`,
  );

  console.log(`✔ ${config.business.name} gerado em ${OUT}/`);
} catch (error) {
  console.error(error instanceof ConfigError ? error.message : error);
  process.exit(1);
}

function favicon({ business, theme }) {
  const letter = business.name.trim()[0].toUpperCase().replace(/[<>&"]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${theme.primary}"/><text x="32" y="44" font-family="Georgia,serif" font-size="38" font-weight="700" text-anchor="middle" fill="${theme.accent}">${letter}</text></svg>\n`;
}
