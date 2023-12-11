import { createElement, variantsClassesToBEM } from '../../scripts/common.js';

export default async function decorate(block) {
  const link = block.querySelector('a')?.getAttribute('href') || block.textContent.trim();
  const iframe = createElement('iframe', { props: { src: link, frameborder: 0 } });
  const fixedHeightClass = [...block.classList].find((el) => /[0-9]+px/.test(el));

  variantsClassesToBEM(block.classList, ['full-viewport'], 'v2-iframe');

  if (fixedHeightClass) {
    iframe.height = fixedHeightClass;
  }

  block.replaceChildren(iframe);
}
