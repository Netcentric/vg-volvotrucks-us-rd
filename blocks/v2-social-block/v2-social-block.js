import { getTextLabel, unwrapDivs } from '../../scripts/common.js';

const blockName = 'v2-social-block';

export default async function decorate(block) {
  const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6');
  [...headings].forEach((heading) => heading.classList.add(`${blockName}__title`));

  const socialWrapper = block.querySelector(':scope > div');
  socialWrapper.classList.add(`${blockName}__list-wrapper`);

  const list = socialWrapper.querySelector('ul');
  list.classList.add(`${blockName}__list`);
  list.classList.remove('cta-list');

  [...list.children].forEach((item) => {
    item.className = '';

    const anchor = item.querySelector('a');
    if (anchor) {
      anchor.className = `${blockName}__button`;
    }

    const copyLink = item.querySelector('.icon-link');
    if (copyLink) {
      anchor.dataset.tooltip = getTextLabel('Copy to clipboard');

      anchor.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(`${anchor.href}`);
        } catch (err) {
          /* eslint-disable-next-line no-console */
          console.error('Failed to copy: ', err);
        }
      });
      anchor.classList.add(`${blockName}__tooltip`);
    }
  });
  unwrapDivs(block);
}
