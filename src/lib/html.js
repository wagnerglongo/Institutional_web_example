/**
 * Template de HTML seguro por padrão.
 *
 * Tudo que entra em ${...} é escapado, a não ser que venha de html`` ou raw().
 * Assim, um texto na configuração como "<script>" vira texto na página
 * e nunca código executável.
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

/** Marca um trecho como confiável (use só para HTML gerado pelo próprio código). */
export const raw = (value) => new SafeHtml(String(value));

function serialize(value) {
  if (value === null || value === undefined || value === false) return "";
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(serialize).join("");
  return escapeHtml(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += serialize(value) + strings[i + 1];
  });
  return new SafeHtml(out);
}

/** Só deixa passar links http(s), mailto, tel e âncoras; o resto vira "#". */
export function safeUrl(url) {
  const value = String(url ?? "").trim();
  return /^(https?:|mailto:|tel:|#|\/)/i.test(value) ? value : "#";
}
