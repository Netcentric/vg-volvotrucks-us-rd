import {
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  createElement,
} from '../../scripts/common.js';

const blockName = 'v2-event-notify';

export default async function decorate(block) {
  const formLink = block.firstElementChild.innerText.trim();
  const beforeFormText = block.children[1]?.children[0];

  const container = createElement('div', { classes: `${blockName}__container` });
  const formContainer = createElement('div', { classes: `${blockName}__form-container` });
  const form = document.createRange().createContextualFragment(`
    <div class="v2-forms block" data-block-name="v2-forms" data-block-status="">
      <div>
        <div>event-notify</div>
      </div>
      <div>
        <div>${formLink}</div>
      </div>
    </div>`);

  if (beforeFormText) {
    container.append(beforeFormText);
    beforeFormText.classList.add(`${blockName}__text-wrapper`);

    const headings = beforeFormText.querySelectorAll('h1, h2, h3, h4, h5, h6');
    [...headings].forEach((heading) => heading.classList.add(`${blockName}__title`));
  }
  formContainer.append(...form.children);
  container.appendChild(formContainer);

  block.replaceWith(container);
  await loadBlock(formContainer.firstElementChild);
}
