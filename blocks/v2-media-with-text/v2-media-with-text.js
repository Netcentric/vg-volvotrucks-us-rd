import {
  addVideoToSection,
  createElement,
  createNewSection,
  unwrapDivs,
  variantsClassesToBEM,
} from '../../scripts/common.js';

const blockName = 'v2-media-with-text';
const variantClasses = ['text-centered', 'full-width', 'media-left', 'media-left', 'media-right', 'media-vertical', 'media-gallery'];
export default async function decorate(block) {
  variantsClassesToBEM(block.classList, variantClasses, blockName);

  const isFullWidthBlock = block.className.includes('full-width');
  if (isFullWidthBlock) block.parentElement.classList.add('full-width');

  const cells = block.querySelectorAll(':scope > div > div');
  let contentSection; let mediaSection; let subTextSection; let
    containerSection;

  cells.forEach((cell, index) => {
    // First cell for content, second for media and last for the subtext
    const isLastCell = index % 2 === 0 && index === cells.length - 1;
    const isCellNumberEven = index % 2 === 0;
    const isTotalCellsEven = cells.length % 2 === 0;

    if (isLastCell) subTextSection = createNewSection(blockName, 'sub-text', cell); else if (isCellNumberEven) {
      contentSection = createNewSection(blockName, 'content', cell);
      const headings = [...cell.querySelectorAll(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])];
      headings.forEach((heading) => heading.classList.add(`${blockName}__heading`));
    } else {
      mediaSection = createNewSection(blockName, 'media', cell);
      const link = mediaSection.querySelector('a');
      mediaSection = addVideoToSection(blockName, mediaSection, link);
    }

    // If cell number is odd(i.e. a 'media' cell) and not the last cell
    if (!isLastCell && !isCellNumberEven) {
      // Wrap with a row if the number of cells is more than 2.
      if (cells.length > 2) {
        containerSection = createElement('div', { classes: `${blockName}__container` });
        containerSection.append(mediaSection, contentSection);
        block.append(containerSection);
      } else {
        // Append the media and content sections directly to the block.
        block.append(mediaSection, contentSection);
      }
    }
    // For an odd number of cells, append the remaining subTextSection.
    if (!isTotalCellsEven) {
      if (subTextSection) block.append(subTextSection);
    }
  });
  unwrapDivs(block);
}
