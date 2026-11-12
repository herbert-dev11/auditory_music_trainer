// Ajudante para montar elementos sem innerHTML (texto sempre como nó de texto, nunca HTML).

type Propriedades<K extends keyof HTMLElementTagNameMap> = Partial<HTMLElementTagNameMap[K]> & {
  role?: string
}

export function criar<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  propriedades: Propriedades<K> = {},
  filhos: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag)
  const { role, ...resto } = propriedades
  Object.assign(elemento, resto)
  if (role) elemento.setAttribute('role', role)
  elemento.append(...filhos)
  return elemento
}

const SVG = 'http://www.w3.org/2000/svg'

/** Elemento SVG com atributos (números viram texto). */
export function criarSvg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  atributos: Record<string, string | number> = {},
  filhos: (Node | string)[] = [],
): SVGElementTagNameMap[K] {
  const elemento = document.createElementNS(SVG, tag)
  for (const [nome, valor] of Object.entries(atributos)) elemento.setAttribute(nome, String(valor))
  elemento.append(...filhos)
  return elemento
}
