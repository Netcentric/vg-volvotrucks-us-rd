const formName = 'event-notify';
const formContent = `
  <div class="${formName}__wrapper">
    <div class="${formName}__field-wrapper">
      <label for="${formName}-name">First name*</label>
      <input type="text" id="${formName}-name" name="name" autocomplete="off" placeholder="" required />
    </div>
    <div class="${formName}__field-wrapper">
      <label for="${formName}-last-name">Last name*</label>
      <input type="text" id="${formName}-last-name" name="last-name" autocomplete="off" placeholder="" required />
    </div>
    <div class="${formName}__field-wrapper">
      <label for="${formName}-zip">ZIP*</label>
      <input type="text" id="${formName}-zip" name="zip" autocomplete="off" placeholder="" required />
    </div>
    <div class="${formName}__field-wrapper">
      <label for="${formName}-email">Email*</label>
      <input type="email" id="${formName}-email" name="email" autocomplete="off" placeholder="" required />
    </div>
  </div>
  <div class="${formName}__agrement-section">
    <div class="checkbox-with-label">
      <input type="checkbox" id="${formName}-agreement" name="agreement" required/>
      <label for="${formName}-agreement">
        I agree to receive email updates from Volvo Trucks North America
      </label>
    </div>
    <p>
      <a href="/" target="__blank">Policy</a>
    </p>
  </div>

  <div class="${formName}__buttons">
    <button class="button primary" type="submit">Notify me</button>
    <a class="button secondary">Add event to calendar</a>
  </div>
`;

export default formContent;
