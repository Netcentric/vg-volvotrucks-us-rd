import { variantsClassesToBEM } from '../../scripts/common.js';

export default async function decorate(block) {
  const iframe = document.createElement('iframe');
  const link = block.querySelector('a')?.getAttribute('href') || block.textContent.trim();
  const fixedHeightClass = [...block.classList].find((el) => /[0-9]+px/.test(el));

  variantsClassesToBEM(block.classList, ['full-viewport'], 'v2-iframe');

  if (fixedHeightClass) {
    iframe.height = fixedHeightClass;
  }

  iframe.src = link;
  iframe.setAttribute('frameborder', 0);
  block.replaceChildren(iframe);
}
