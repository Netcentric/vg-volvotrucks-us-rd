import { loadScript, sampleRUM } from '../../scripts/lib-franklin.js';

const thankyouMessage = `<p class='pardot-forms-thanks-title'>Thank you</p>
<p class='pardot-forms-thanks-text'>Your information has been submitted. Someone will be in touch with you shortly.</p>
`;

const errorMessage = `<p class='pardot-forms-error-title'>There's an error</p>
<p class='pardot-forms-error-text'>Your information has not been submitted successfuly. Please try again later.</p>
`;

// Form Block identifies the submit endpoint via these rules and in order
// 1. action property on the submit button
// 2. SUBMIT_ACTION constant
// 3. the path of the spreadsheet
const SUBMIT_ACTION = '';

//callback
window.logResult= function(json) {
    debugger;
    if(json.result === "success"){
        submissionSuccess();
    } else if(json.result === "error") {
        submissionFailure();
    }
};

function generateUnique() {
  return new Date().valueOf() + Math.random();
}

function constructPayload(form) {
  const payload = { __id__: generateUnique() };
  [...form.elements].forEach((fe) => {
    if (fe.name) {
      if (fe.type === 'radio') {
        if (fe.checked) payload[fe.name] = fe.value;
      } else if (fe.type === 'checkbox') {
        if (fe.checked) payload[fe.name] = payload[fe.name] ? `${payload[fe.name]},${fe.value}` : fe.value;
      } else if (fe.type !== 'file') {
        payload[fe.name] = fe.value;
      }
    }
  });
  payload['callback'] = 'logResult';
  return { payload };
}

async function submissionSuccess(error, form) {
  sampleRUM('form:submit');
  const thankyouDiv = document.createElement('div');
  thankyouDiv.innerHTML = thankyouMessage;
  form.replaceWith(thankyouDiv);
}

async function submissionFailure(error, form) {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = errorMessage;
  form.replaceWith(errorDiv);
  form.setAttribute('data-submitting', 'false');
  form.querySelector('button[type="submit"]').disabled = false;
}

async function prepareRequest(form) {
  const { payload } = constructPayload(form);
  const body = JSON.stringify({ data: payload });
  const url = form.dataset.action;

  var serializedData = serialize(payload);
  loadScript(url + '?' + serializedData, { type: 'text/javascript', charset: 'UTF-8'});
}

function serialize(obj){
  let str = [];
  for(let p in obj){
      if(obj.hasOwnProperty(p)){
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
  }
  return str.join('&');
}

async function handleSubmit(form) {
  if (form.getAttribute('data-submitting') !== 'true') {
    form.setAttribute('data-submitting', 'true');
    await prepareRequest(form);
  }
}

function setPlaceholder(element, fd) {
  if (fd.Placeholder) {
    element.setAttribute('placeholder', fd.Placeholder);
  }
}

const constraintsDef = Object.entries({
  'email|text': [['Max', 'maxlength'], ['Min', 'minlength']],
  'number|range|date': ['Max', 'Min', 'Step'],
  file: ['Accept', 'Multiple'],
  fieldset: ['Max', 'Min'],
}).flatMap(([types, constraintDef]) => types.split('|')
  .map((type) => [type, constraintDef.map((cd) => (Array.isArray(cd) ? cd : [cd, cd]))]));

const constraintsObject = Object.fromEntries(constraintsDef);

function setConstraints(element, fd) {
  const constraints = constraintsObject[fd.Type];
  if (constraints) {
    constraints
      .filter(([nm]) => fd[nm])
      .forEach(([nm, htmlNm]) => {
        element.setAttribute(htmlNm, fd[nm]);
      });
  }
}

function createLabel(fd, tagName = 'label') {
  const label = document.createElement(tagName);
  label.setAttribute('for', fd.Id);
  label.className = 'field-label';
  label.textContent = fd.Label || '';
  if (fd.Tooltip) {
    label.title = fd.Tooltip;
  }
  return label;
}

function createHelpText(fd) {
  const div = document.createElement('div');
  div.className = 'field-description';
  div.setAttribute('aria-live', 'polite');
  div.innerText = fd.Description;
  div.id = `${fd.Id}-description`;
  return div;
}

function createFieldWrapper(fd, tagName = 'div') {
  const fieldWrapper = document.createElement(tagName);
  const nameStyle = fd.Name ? ` form-${fd.Name}` : '';
  const fieldId = `form-${fd.Type}-wrapper${nameStyle}`;
  fieldWrapper.className = fieldId;
  if (fd.Fieldset) {
    fieldWrapper.dataset.fieldset = fd.Fieldset;
  }
  if (fd.Mandatory.toLowerCase() === 'true') {
    fieldWrapper.dataset.required = '';
  }
  fieldWrapper.classList.add('field-wrapper');
  fieldWrapper.append(createLabel(fd));
  return fieldWrapper;
}

function createButton(fd) {
  const wrapper = createFieldWrapper(fd);
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.type = fd.Type;
  if (button.type === 'submit' && fd.Action) {
    button.formAction = fd.Action;
  }
  button.classList.add('button');
  button.dataset.redirect = fd.Extra || '';
  button.id = fd.Id;
  button.name = fd.Name;
  wrapper.replaceChildren(button);
  return wrapper;
}
function createSubmit(fd) {
  const wrapper = createButton(fd);
  return wrapper;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  setPlaceholder(input, fd);
  setConstraints(input, fd);
  return input;
}

const withFieldWrapper = (element) => (fd) => {
  const wrapper = createFieldWrapper(fd);
  wrapper.append(element(fd));
  return wrapper;
};

const createTextArea = withFieldWrapper((fd) => {
  const input = document.createElement('textarea');
  setPlaceholder(input, fd);
  return input;
});

const createSelect = withFieldWrapper((fd) => {
  const select = document.createElement('select');
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  fd.Options.split(',').forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  return select;
});

function createRadio(fd) {
  const wrapper = createFieldWrapper(fd);
  wrapper.insertAdjacentElement('afterbegin', createInput(fd));
  return wrapper;
}

const createOutput = withFieldWrapper((fd) => {
  const output = document.createElement('output');
  output.name = fd.Name;
  output.dataset.fieldset = fd.Fieldset ? fd.Fieldset : '';
  output.innerText = fd.Value;
  return output;
});

function createHidden(fd) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.id = fd.Id;
  input.name = fd.Name;
  input.value = fd.Value;
  return input;
}

function createLegend(fd) {
  return createLabel(fd, 'legend');
}

function createFieldSet(fd) {
  const wrapper = createFieldWrapper(fd, 'fieldset');
  wrapper.name = fd.Name;
  wrapper.replaceChildren(createLegend(fd));
  if (fd.Repeatable && fd.Repeatable.toLowerCase() === 'true') {
    setConstraints(wrapper, fd);
    wrapper.dataset.repeatable = 'true';
  }
  return wrapper;
}

function groupFieldsByFieldSet(form) {
  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets?.forEach((fieldset) => {
    const fields = form.querySelectorAll(`[data-fieldset="${fieldset.name}"`);
    fields?.forEach((field) => {
      fieldset.append(field);
    });
  });
}

function createPlainText(fd) {
  const paragraph = document.createElement('p');
  const nameStyle = fd.Name ? `form-${fd.Name}` : '';
  paragraph.className = nameStyle;
  paragraph.dataset.fieldset = fd.Fieldset ? fd.Fieldset : '';
  paragraph.textContent = fd.Label;
  return paragraph;
}

const getId = (function getId() {
  const ids = {};
  return (name) => {
    ids[name] = ids[name] || 0;
    const idSuffix = ids[name] ? `-${ids[name]}` : '';
    ids[name] += 1;
    return `${name}${idSuffix}`;
  };
}());

const fieldRenderers = {
  radio: createRadio,
  checkbox: createRadio,
  textarea: createTextArea,
  select: createSelect,
  button: createButton,
  submit: createSubmit,
  output: createOutput,
  hidden: createHidden,
  fieldset: createFieldSet,
  plaintext: createPlainText,
};

function renderField(fd) {
  const renderer = fieldRenderers[fd.Type];
  let field;
  if (typeof renderer === 'function') {
    field = renderer(fd);
  } else {
    field = createFieldWrapper(fd);
    field.append(createInput(fd));
  }
  if (fd.Description) {
    field.append(createHelpText(fd));
  }
  return field;
}

async function fetchData(url) {
  const resp = await fetch(url);
  const json = await resp.json();
  return json.data.map((fd) => ({
    ...fd,
    Id: fd.Id || getId(fd.Name),
    Value: fd.Value || '',
  }));
}

async function fetchForm(pathname) {
  // get the main form
  const jsonData = await fetchData(pathname);
  return jsonData;
}

function showError(evnt) {
  const field = evnt.target;
  const fieldWrapper = field.parentNode;
  fieldWrapper.classList.add('invalid');
  let errorSpan = fieldWrapper.querySelector('span.error');
  if (!errorSpan) {
    errorSpan = document.createElement('span');
    errorSpan.classList.add('error');
    fieldWrapper.append(errorSpan);
  }
  errorSpan.innerText = field.validationMessage;
  // eslint-disable-next-line no-use-before-define
  field.addEventListener('blur', hideError);
}

function hideError(evnt) {
  const field = evnt.target;
  const fieldWrapper = field.parentNode;
  // to avoid showing error messages on blur
  if (field.checkValidity()) {
    fieldWrapper.classList.remove('invalid');
  } else {
    fieldWrapper.classList.add('invalid');
  }
}

function decorateValidation(form) {
  form.setAttribute('novalidate', '');
  form.querySelectorAll('input,textarea,select').forEach((el) => {
    el.addEventListener('invalid', showError);
  });
}


async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const data = await fetchForm(pathname);
  const form = document.createElement('form');
  data.forEach((fd) => {
    const el = renderField(fd);
    const input = el.querySelector('input,textarea,select');
    if (fd.Mandatory && fd.Mandatory.toLowerCase() === 'true') {
      input.setAttribute('required', 'required');
    }
    if (input) {
      input.id = fd.Id;
      input.name = fd.Name;
      input.value = fd.Value;
      if (fd.Description) {
        input.setAttribute('aria-describedby', `${fd.Id}-description`);
      }
    }
    form.append(el);
  });
  groupFieldsByFieldSet(form);
  // eslint-disable-next-line prefer-destructuring
  form.addEventListener('submit', (e) => {
    let isValid = true;
    if (form.hasAttribute('novalidate')) {
      isValid = form.checkValidity();
    }
    e.preventDefault();
    if (isValid) {
      e.submitter.setAttribute('disabled', '');
      form.dataset.action = e.submitter.formAction || SUBMIT_ACTION || pathname.split('.json')[0];
      handleSubmit(form);
    }
  });
  decorateValidation(form);
  return form;
}

export default async function decorate(block) {
  const formLink = block.querySelector('a[href$=".json"]');
  if (formLink) {
    const form = await createForm(formLink.href);
    formLink.replaceWith(form);
  }
}
