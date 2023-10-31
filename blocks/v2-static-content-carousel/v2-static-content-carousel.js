import { createElement, adjustPretitle } from '../../scripts/common.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

const blockName = 'v2-static-content-carousel';

const listenScroll = (carousel) => {
  const elements = carousel.querySelectorAll(`.${blockName}__images-list-item > *`);
  let arrowControl;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      arrowControl?.classList.remove(`${blockName}__button--disabled`);
      arrowControl = null;

      if (entry.isIntersecting) {
        entry.target.classList.add('active');

        if (!entry.target.parentElement.previousElementSibling) {
          arrowControl = document.querySelector(`.${blockName}__button--prev`);
        } else if (!entry.target.parentElement.nextElementSibling) {
          arrowControl = document.querySelector(`.${blockName}__button--next`);
        }
        arrowControl?.classList.add(`${blockName}__button--disabled`);
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, {
    root: carousel,
    threshold: 1,
  });

  elements.forEach((el) => {
    io.observe(el);
  });
};

const createArrowControls = (ulItems) => {
  const arrowControls = createElement('ul', { classes: [`${blockName}__arrowcontrols`] });
  const arrows = document.createRange().createContextualFragment(`
    <li>
      <button aria-label="Previous" class="${blockName}__button v2-static-content-carousel__button--prev">
        <span class="icon icon-arrow-left" aria-hidden="true" />
      </button>
    </li>
    <li>
      <button aria-label="Next" class="${blockName}__button v2-static-content-carousel__button--next">
        <span class="icon icon-arrow-right" aria-hidden="true" />
      </button>
    </li>
  `);
  arrowControls.append(...arrows.children);
  decorateIcons(arrowControls);
  ulItems.append(arrowControls);
  return arrowControls;
};

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  rows.forEach((row) => { row.classList.add(`${blockName}__row`); });

  const cols = [...block.querySelectorAll(':scope > div > div')];
  cols.forEach((col) => {
    col.classList.add(`${blockName}__col`);
    adjustPretitle(col);
  });

  const pictureCol = block.querySelector('ul picture').closest(`.${blockName}__col`);
  pictureCol.classList.add(`${blockName}__images-list-col`);
  pictureCol.previousElementSibling?.classList.add(`${blockName}__text-col`);
  pictureCol.querySelector('ul').classList.add(`${blockName}__images-list`);
  [...pictureCol.querySelectorAll('ul > li')].forEach((el) => {
    el.classList.add(`${blockName}__images-list-item`);

    const figure = createElement('figure', { classes: `${blockName}__figure` });
    figure.append(...el.childNodes);
    el.append(figure);

    const figCaption = createElement('figcaption', { classes: `${blockName}__figure-text` });
    const lastItems = [...figure.childNodes].at(-1);
    if (lastItems.nodeType === Node.TEXT_NODE) {
      figCaption.append(lastItems);
      figure.append(figCaption);
    }
  });

  [...pictureCol.querySelectorAll('ul > li img')].forEach((el) => { el.classList.add(`${blockName}__image`); });

  block.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => el.classList.add(`${blockName}__heading`));

  block.querySelectorAll('p').forEach((el) => {
    el.classList.add(`${blockName}__text`);
  });

  createArrowControls(pictureCol);
  listenScroll(pictureCol.querySelector(`.${blockName}__images-list`));
}
