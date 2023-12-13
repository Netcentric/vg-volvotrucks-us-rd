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

const onSuccess = async () => {
  sampleRUM('form:submit');
  const block = document.querySelector(`.${blockName}__container`);
  const addToEventButton = block.querySelector('.event-notify__add-event-button');

  block.innerHTML = '';
  const buttonWrapper = createElement('div', { classes: `${blockName}__button-wrapper` });
  addToEventButton.classList.remove('secondary');
  addToEventButton.classList.add('primary');

  const socialsLinksBlock = document.createRange().createContextualFragment(`
    <div class="v2-social-block v2-social-block--gray block" data-block-name="v2-social-block" data-block-status="">
      <div>
        <div></div>
      </div>
    </div>`);

  const socialLinkBlockEl = socialsLinksBlock.children[0];
  socialLinkBlockEl.querySelector(':scope > div > div').innerHTML = socialsLinks.innerHTML;

  await loadBlock(socialLinkBlockEl);

  buttonWrapper.append(addToEventButton);
  block.append(successText, buttonWrapper, socialLinkBlockEl);
};

const onError = (error) => {
  // eslint-disable-next-line no-console
  console.error(error);

  const block = document.querySelector(`.${blockName}__container`);

  block.innerHTML = '';
  block.append(errorText);
};

// Convert date to ICS format (e.g., 20231210T120000Z)
function formatDateToICS(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Generate UID (e.g., 20231210T120000Z-sdfijk@exmaple.com)
function generateUID() {
  const timestamp = formatDateToICS(new Date());
  const uniqueString = Math.random().toString(36).substr(2, 6);
  const domain = window.location.hostname;
  return `${timestamp}-${uniqueString}@${domain}`;
}

function generateICS(event) {
  if (!event.summary || !event.startDate || !event.endDate || !event.description) {
    throw new Error('Missing required event details');
  }
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Volvo Trucks//Volvo Trucks US website//EN',
    `UID:${generateUID()}`,
    'BEGIN:VEVENT',
    `SUMMARY:${event.summary}`,
    `DTSTART:${formatDateToICS(event.startDate)}`,
    `DTEND:${formatDateToICS(event.endDate)}`,
    `DESCRIPTION:${event.description}`,
    'LOCATION:online',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return icsData;
}

function downloadICSFile(icsData, filename) {
  const blob = new Blob([icsData], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

window.logResult = function logResult(json) {
  if (json.result === 'success') {
    onSuccess();
  } else if (json.result === 'error') {
    onError(json.log);
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
  const policyText = contentData.policy;
  socialsLinks = contentData.socials;
  socialsLinks.classList.add(`${blockName}__socials`);
  errorText = contentData['error message'];
  errorText.classList.add(`${blockName}__message-text`);
  successText = contentData['success message'];
  successText.classList.add(`${blockName}__message-text`);

  // Calendar event meta data
  const blockSection = block.parentElement?.parentElement;
  const calendarEventData = {
    summary: blockSection?.dataset.eventSummary,
    startDate: new Date(blockSection?.dataset.eventStartDate),
    endDate: new Date(blockSection?.dataset.eventEndDate),
    description: blockSection?.dataset.eventDescription,
  };

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

  // we can inject the policy content when form content loaded
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const formRef = [...mutation.addedNodes];
      const formContainerEl = formRef.find((el) => el instanceof Element && el.classList.contains('v2-forms__container'));

      if (!formContainerEl) {
        return;
      }

      if (formContainerEl.getAttribute('data-initialized') === 'true') {
        observer.disconnect();
        formContainerEl.querySelector('form')?.reset();

        return;
      }

      const policyEl = formContainerEl.querySelector('.event-notify__policy');
      const calendarButtonEl = formContainerEl.querySelector('.event-notify__add-event-button');

      policyEl.append(policyText);
      calendarButtonEl.addEventListener('click', () => {
        const icsFileContent = generateICS(calendarEventData);
        downloadICSFile(icsFileContent, 'event.ics');
      });

      observer.disconnect();
      formContainerEl.setAttribute('data-initialized', 'true');
    });
  });

  observer.observe(container, {
    childList: true,
    attributes: false,
    subtree: true,
  });

  await loadBlock(formContainer.firstElementChild);
}
