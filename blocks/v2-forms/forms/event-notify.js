const formName = 'event-notify';
const formContent = `
  <div class="${formName}__wrapper">
    <div class="${formName}__field-wrapper">
      <label for="${formName}-name">First name*</label>
      <input type="text" id="${formName}-name" name="first_name" autocomplete="off" placeholder="" required />
      <span class="${formName}__error-message ${formName}__error-message--hidden"></span>
    </div>
    <div class="${formName}__field-wrapper">
      <label for="${formName}-last-name">Last name*</label>
      <input type="text" id="${formName}-last-name" name="last_name" autocomplete="off" placeholder="" required />
      <span class="${formName}__error-message ${formName}__error-message--hidden"></span>
    </div>
    <div class="${formName}__field-wrapper">
      <label for="${formName}-zip">ZIP*</label>
      <input type="text" id="${formName}-zip" name="zip" autocomplete="off" placeholder="" required />
      <span class="${formName}__error-message ${formName}__error-message--hidden"></span>
    </div>
    <div class="${formName}__field-wrapper">
      <label for="${formName}-email">Email*</label>
      <input type="email" id="${formName}-email" name="email" autocomplete="off" placeholder="" required />
      <span class="${formName}__error-message ${formName}__error-message--hidden"></span>
    </div>
  </div>
  <div class="${formName}__agrement-section">
    <div class="checkbox-with-label">
      <input type="checkbox" id="${formName}-agreement" name="marketing_consent" required/>
      <label for="${formName}-agreement">
        I agree to receive email updates from Volvo Trucks North America
      </label>
      <span class="${formName}__error-message ${formName}__error-message--hidden"></span>
    </div>
    <div class="${formName}__policy">
    </div>
  </div>

  <div class="${formName}__buttons">
    <button class="button primary" type="submit">Notify me</button>
    <a class="button secondary ${formName}__add-event-button">Add event to calendar</a>
  </div>
`;

const checkFieldValidity = (field) => {
  const errorMessageEl = field.parentElement.querySelector(`:scope > .${formName}__error-message`);

  if (errorMessageEl) {
    const isUserInvalid = field.parentElement.querySelector(':scope:user-invalid') === field;
    errorMessageEl.innerText = isUserInvalid ? '' : field.validationMessage;
    errorMessageEl.classList[isUserInvalid ? 'add' : 'remove'](`${formName}__error-message--hidden`);
  }
};

export const postLoad = (form) => {
  form.setAttribute('novalidate', 'novalidate');

  const fields = [...form.querySelectorAll('input')];

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      checkFieldValidity(field);
    });
  });
};

export const onSubmit = async (form, handleSubmit) => {
  const fields = [...form.querySelectorAll('input')];

  fields.forEach(checkFieldValidity);

  if (form.checkValidity()) {
    await handleSubmit(form);
  }
};

export default formContent;
