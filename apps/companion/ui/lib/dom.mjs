import {makeTerm} from '../glossary.mjs';

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'style' || key === 'innerHTML') throw new TypeError(`Renderer attribute not allowed: ${key}`);
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value !== false && value !== undefined && value !== null) node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child !== null && child !== undefined) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export const own = (text, tag = 'span', extra = {}) => el(tag, {...extra, 'data-content': 'person', text});
export const term = onOpen => makeTerm(el, onOpen);
export function icon(name, className = '') {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  const use = document.createElementNS(namespace, 'use');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  if (className) svg.setAttribute('class', className);
  use.setAttribute('href', `./icons.svg#icon-${name}`);
  svg.append(use);
  return svg;
}
