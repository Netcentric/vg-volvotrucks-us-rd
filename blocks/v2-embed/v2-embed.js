import { createElement } from '../../scripts/common.js';

const emebdOnPage = (block) => {
  const scripts = [
    '/blocks/v2-embed/runtime~app.fc549bea.bundle.js',
    '/blocks/v2-embed/345.fc549bea.bundle.js',
    '/blocks/v2-embed/app.fc549bea.bundle.js',
  ];

  const styles = [
    '/blocks/v2-embed/345.fc549bea741b7e9d7142.css',
    '/blocks/v2-embed/app.fc549bea741b7e9d7142.css',
  ];

  block.innerHTML = '<div id="configurator"></div>';

  scripts.forEach(async (script) => {
    let waitForLoad = Promise.resolve();
    const newScript = createElement('script');

    newScript.setAttribute('type', 'text/javascript');
    newScript.setAttribute('src', script);

    waitForLoad = new Promise((resolve) => {
      newScript.addEventListener('load', resolve);
    });

    document.body.append(newScript);

    // eslint-disable-next-line no-await-in-loop
    await waitForLoad;
  });

  styles.forEach(async (style) => {
    const styleEl = createElement('link');

    styleEl.setAttribute('rel', 'stylesheet');
    styleEl.setAttribute('href', style);

    document.body.append(styleEl);
  });

  const configuratorEl = document.querySelector('#configurator');

  document.querySelector('main').addEventListener('click', () => {
    const navHeight = parseInt(getComputedStyle(document.body).getPropertyValue('--nav-height'), 10);

    window.scrollBy({ top: navHeight, behavior: 'smooth' });
    configuratorEl.classList.add('configurator--full-viewport');
    document.body.classList.add('disable-scroll');
  });
};

const embedWithIframe = (block) => {
  const iframe = createElement('iframe');

  // instead of the setting `src` attribute we can use:
  // iframe.document.open();
  // iframe.document.write('CONTENT FROM index.html + extra script for handling the post messages');
  // iframe.document.close();
  //
  // `srcdoc` is probably not working on the mobile iOS - MDN has not data about it
  iframe.setAttribute('src', '/blocks/v2-embed/index.html');
  iframe.setAttribute('title', 'Volvo Trucks North America - Configurator');

  block.appendChild(iframe);

  window.addEventListener('message', () => {
    iframe.scrollIntoView({ behavior: 'smooth' });
    iframe.classList.add('iframe--full-viewport');
    document.body.classList.add('disable-scroll');
  });
};

export default async function decorate(block) {
  const loadAsIframe = block.classList.contains('iframe');

  if (loadAsIframe) {
    embedWithIframe(block);
  } else {
    emebdOnPage(block);
  }

  // hidding footer
  document.body.classList.add('hidden-footer');
}
