import {
  loadBlock, sampleRUM,
} from '../../scripts/lib-franklin.js';
import {
  createElement,
} from '../../scripts/common.js';

const blockName = 'v2-event-notify';

let successText;
let errorText;
let socialsLinks;

const onSuccess = () => {
  sampleRUM('form:submit');
  const block = document.querySelector(`.${blockName}__container`);
  const addToEventButton = block.querySelector('.event-notify__add-event-button');

  block.innerHTML = '';
  const buttonWrapper = createElement('div', { classes: `${blockName}__button-wrapper` });
  addToEventButton.classList.remove('secondary');
  addToEventButton.classList.add('primary');

  const socialList = socialsLinks.querySelector('.cta-list');
  socialList.classList.remove('cta-list');
  socialList.classList.add(`${blockName}__social-list`);
  [...socialsLinks.querySelectorAll('ul a')].forEach((link) => {
    link.classList.remove('button', 'dark', 'primary');
    link.classList.add(`${blockName}__social-link`);
  });

  buttonWrapper.append(addToEventButton);
  block.append(successText, buttonWrapper, socialsLinks);
};

const onError = (error) => {
  // eslint-disable-next-line no-console
  console.error(error);

  const block = document.querySelector(`.${blockName}__container`);

  block.innerHTML = '';
  block.append(errorText);
};

window.logResult = function logResult(json) {
  if (json.result === 'success') {
    onSuccess();
  } else if (json.result === 'error') {
    onError();
  }
};

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  const contentData = rows.reduce((data, row) => {
    const [name, content] = row.querySelectorAll(':scope > div');
    const key = name.innerText.toLowerCase().trim();

    return { ...data, [key]: content };
  }, {});

  const formLink = contentData.link.innerText.trim();
  const beforeFormText = contentData['before form'];
  // const policyText = contentData.policy;
  socialsLinks = contentData.socials;
  socialsLinks.classList.add(`${blockName}__socials`);
  errorText = contentData['error message'];
  errorText.classList.add(`${blockName}__message-text`);
  successText = contentData['success message'];
  successText.classList.add(`${blockName}__message-text`);

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

    const headingSelector = 'h1, h2, h3, h4, h5, h6';
    const headings = [
      ...beforeFormText.querySelectorAll(headingSelector),
      ...errorText.querySelectorAll(headingSelector),
      ...successText.querySelectorAll(headingSelector),
    ];
    headings.forEach((heading) => heading.classList.add(`${blockName}__title`));
  }
  formContainer.append(...form.children);
  container.appendChild(formContainer);

  block.replaceWith(container);

  await loadBlock(formContainer.firstElementChild);
}
