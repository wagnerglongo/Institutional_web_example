/**
 * Validação da configuração do site e funções derivadas (cores, telefone).
 * Erros de configuração param o build com uma mensagem clara.
 */

const HEX = /^#[0-9a-f]{6}$/i;

export class ConfigError extends Error {
  constructor(problems) {
    super(`Configuração inválida:\n- ${problems.join("\n- ")}`);
    this.problems = problems;
  }
}

const get = (obj, path) => path.split(".").reduce((acc, key) => acc?.[key], obj);

const REQUIRED = [
  "business.name",
  "business.tagline",
  "business.description",
  "business.city",
  "business.whatsapp",
  "business.email",
  "site.url",
  "theme.primary",
  "theme.accent",
  "hero.title",
  "hero.subtitle",
];

export function validateConfig(config) {
  const problems = [];

  for (const path of REQUIRED) {
    const value = get(config, path);
    if (typeof value !== "string" || !value.trim()) problems.push(`"${path}" é obrigatório.`);
  }

  for (const path of ["theme.primary", "theme.accent"]) {
    const value = get(config, path);
    if (value && !HEX.test(value)) problems.push(`"${path}" precisa ser uma cor no formato #rrggbb.`);
  }

  const email = get(config, "business.email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push(`"business.email" não é um e-mail válido.`);

  const phone = get(config, "business.whatsapp");
  if (phone && digits(phone).length < 10) problems.push(`"business.whatsapp" precisa ter DDD.`);

  if (!Array.isArray(config.services) || config.services.length === 0) {
    problems.push(`"services" precisa ter pelo menos um serviço.`);
  } else {
    config.services.forEach((s, i) => {
      if (!s?.title || !s?.description) problems.push(`"services[${i}]" precisa de title e description.`);
    });
  }

  if (problems.length) throw new ConfigError(problems);
  return config;
}

export const digits = (value = "") => String(value).replace(/\D/g, "");

/** Telefone brasileiro → formato do wa.me (55 + DDD + número). */
export function whatsappNumber(value) {
  const n = digits(value);
  return n.length === 10 || n.length === 11 ? `55${n}` : n;
}

/** Luminância relativa (WCAG) de uma cor #rrggbb. */
export function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Escolhe a cor de texto (quase preto ou branco) com mais contraste sobre o fundo.
 * Garante botões legíveis seja qual for a cor da marca escolhida.
 */
export function readableTextOn(hex) {
  const l = luminance(hex);
  const onWhite = 1.05 / (l + 0.05);
  const onDark = (l + 0.05) / (luminance("#14181f") + 0.05);
  return onWhite >= onDark ? "#ffffff" : "#14181f";
}
