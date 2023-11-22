import { wrapImageWithVideoLink, selectVideoLink, isVideoLink } from '../../scripts/video-helper.js';
import { createElement } from '../../scripts/common.js';

const blockName = 'v2-resources-gallery';

export default function decorate(block) {
  const blockHeading = block.querySelector('div:first-child');
  blockHeading.classList.add(`${blockName}__heading`);

  const viewAllButton = createElement('button', {
    classes: [`${blockName}__toggle-resources`, 'tertiary'],
    props: {
      type: 'button', title: 'Toggle resources list',
    },
  });

  const documentRowsWrapper = createElement('div', {
    classes: `${blockName}__rows-wrapper`,
  });

  block.append(documentRowsWrapper);

  const viewAllIcon = createElement('i', {
    classes: `${blockName}__toggle-resources-icon`,
  });

  viewAllButton.innerText = 'view all';
  viewAllButton.setAttribute('aria-expanded', 'false');

  // Go through all rows
  [...block.children].forEach((row) => [...row.children].forEach((elem) => {
    // Add row and item classes accordingly
    row.classList.add(`${blockName}__row`);
    elem.classList.add(`${blockName}__item`);

    // give p containing the image a specific class
    const picture = elem.querySelector('picture');
    if (picture && picture.closest('p')) picture.closest('p').classList.add('image');

    const links = elem.querySelectorAll('a');
    const videos = [...links].filter((link) => isVideoLink(link));

    if (videos.length) {
      // display image as link with play icon
      const selectedLink = selectVideoLink(videos);
      row.classList.add(`${blockName}__row--has-video`);
      elem.classList.add(`${blockName}__item--has-video`);

      if (selectedLink) {
        picture.after(selectedLink);
        wrapImageWithVideoLink(selectedLink, picture);
      }

      // remove all the videos links and exclude the selected one
      videos.forEach((link) => link !== selectedLink && link.parentElement.remove());
    } else {
      row.classList.add(`${blockName}__row--has-documents`);
      elem.classList.add(`${blockName}__item--has-documents`);
      blockHeading.classList.remove(`${blockName}__row--has-documents`);
      blockHeading.firstElementChild.classList.remove(`${blockName}__item--has-documents`);
    }
  }));

  const allDocumentRows = block.querySelectorAll(`.${blockName}__row--has-documents`);
  const videoRows = [].slice.call(block.querySelectorAll(`.${blockName}__row--has-video`), 2);
  const documentRows = [].slice.call(block.querySelectorAll(`.${blockName}__row--has-documents`), 6);

  allDocumentRows.forEach((row) => {
    documentRowsWrapper.appendChild(row);
  });

  function toggleRows(rows) {
    rows.forEach((row) => {
      row.classList.add('hidden');

      function toggle() {
        row.classList.toggle('hidden');
      }

      viewAllButton.addEventListener('click', toggle);
    });
  }

  viewAllButton.addEventListener('click', () => {
    if (viewAllButton.ariaExpanded === 'true') {
      viewAllButton.ariaExpanded = 'false';
      viewAllButton.innerText = 'view all';
    } else {
      viewAllButton.ariaExpanded = 'true';
      viewAllButton.innerText = 'view less';
    }
  });

  toggleRows(videoRows);
  toggleRows(documentRows);

  const documentLink = block.querySelectorAll(`.${blockName}__item--has-documents > .button-container > .button`);

  documentLink.forEach((link) => {
    const downloadlinkIcon = document.createRange().createContextualFragment(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd"
        d="M4.5 2C4.22386 2 4 2.22386 4 2.5V21.5C4 21.7761 4.22386 22 4.5 22H19.5C19.7761 22 20 21.7761 20 21.5V9.5C20 9.36739 19.9473 9.24021 19.8536 9.14645L12.8536 2.14645C12.7598 2.05268 12.6326 2 12.5 2H4.5ZM5 21V3H12V9.5C12 9.77614 12.2239 10 12.5 10H19V21H5ZM18.2929 9L13 3.70711V9H18.2929Z"
        fill="var(--c-cta-blue-default)"/>
    </svg> `);

    link.classList.remove('primary');
    link.classList.add('tertiary');
    link.prepend(downloadlinkIcon);
  });

  blockHeading.append(viewAllIcon, viewAllButton);
}
