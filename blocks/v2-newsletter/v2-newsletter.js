import {
  loadBlock, sampleRUM,
} from '../../scripts/lib-franklin.js';
import { getTextLabel, createElement } from '../../scripts/common.js';

const blockName = 'v2-newsletter';

const thankyouMessage = `<p class='pardot-forms-thanks-title'>${getTextLabel('Successful submission title')}</p>
<p class='pardot-forms-thanks-text'>${getTextLabel('Successful submission text')}</p>`;

const errorMessage = `<p class='pardot-forms-error-title'>${getTextLabel('Error submission title')}</p>
<p class='pardot-forms-error-text'>${getTextLabel('Error submission text')}</p>`;

async function submissionSuccess() {
  sampleRUM('form:submit');
  const thankyouDiv = document.createElement('div');
  thankyouDiv.innerHTML = thankyouMessage;
  const form = document.querySelector('form');
  form.replaceWith(thankyouDiv);
}

async function submissionFailure() {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = errorMessage;
  const form = document.querySelector('form');
  form.setAttribute('data-submitting', 'false');
  form.querySelector('button[type="submit"]').disabled = false;
  form.replaceWith(errorDiv);
}

// eslint-disable-next-line func-names
window.logResult = function (json) {
  if (json.result === 'success') {
    submissionSuccess();
  } else if (json.result === 'error') {
    submissionFailure();
  }
};
export default async function decorate(block) {
  const formLimk = block.firstElementChild.innerText.trim();
  const html = block.firstElementChild.nextElementSibling.firstElementChild.innerHTML;

  const container = createElement('div', { classes: `${blockName}__container` });

  const textContainer = createElement('div', { classes: `${blockName}__text` });
  textContainer.innerHTML = html;

  const headings = textContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
  [...headings].forEach((heading) => heading.classList.add(`${blockName}__title`));

  const formContainer = createElement('div', { classes: `${blockName}__form-container` });
  const form = document.createRange().createContextualFragment(`
    <div class="v2-forms block" data-block-name="v2-forms" data-block-status="">
      <div>
        <div>subscribe</div>
      </div>
      <div>
        <div>${formLimk}</div>
      </div>
    </div>`);

  formContainer.append(...form.children);
  container.appendChild(textContainer);
  container.appendChild(formContainer);

  block.replaceWith(container);

  await loadBlock(formContainer.firstElementChild);
}

// Same form in page is not working.
