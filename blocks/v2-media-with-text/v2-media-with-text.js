import { variantsClassesToBEM, removeEmptyTags, unwrapDivs } from '../../scripts/common.js';
import {
  isVideoLink, createVideo, setPlaybackControls, wrapImageWithVideoLink,
  selectVideoLink,
} from '../../scripts/video-helper.js';

const blockName = 'v2-media-with-text';

export function getDynamicVideoHeight(video, playbackControls) {
  // Get the element's height(use requestAnimationFrame to get actual height instead of 0)
  requestAnimationFrame(() => {
    const height = video.offsetHeight - 60;
    playbackControls.style.top = `${height.toString()}px`;
  });

  // Get the element's height on resize
  const getVideoHeight = (entries) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of entries) {
      const height = entry.target.offsetHeight - 60;
      playbackControls.style.top = `${height.toString()}px`;
    }
  };

  const resizeObserver = new ResizeObserver(getVideoHeight);
  resizeObserver.observe(video);
}

const variantClasses = ['single-image-1', 'single-video-autoplay-1', 'single-video-modal-1', 'single-image-2-left', 'single-image-2-right', 'double-image-1', 'double-image-2'];

const blockClasses = {
  singleImage1: `.${blockName}--single-image-1`,
  singleVideoAutoplay: `.${blockName}--single-video-autoplay-1`,
  singleVideoModal: `.${blockName}--single-video-modal-1`,
  singleImage2Left: `.${blockName}--single-image-2-left`,
  singleImage2Right: `.${blockName}--single-image-2-right`,
  doubleImage1: `.${blockName}--double-image-1`,
  doubleImage2: `.${blockName}--double-image-2`,
};
export default async function decorate(block) {
  variantsClassesToBEM(block.classList, variantClasses, blockName);

  const pictures = block.querySelectorAll('picture');
  pictures.forEach((picture) => picture.classList.add(`${blockName}__picture`));

  const headings = block.querySelectorAll('h4');
  headings.forEach((heading) => heading.classList.add(`${blockName}__heading`));

  const paragraphs = block.querySelectorAll('p:not(:has(picture))');
  paragraphs.forEach((paragraph) => paragraph.classList.add(`${blockName}__paragraph`));

  const picture = block.querySelector('picture');
  const link = block.querySelector('a');
  const isVideo = link ? isVideoLink(link) : false;
  if (isVideo && block.classList.contains(`${blockName}--single-video-autoplay-1`)) {
    const video = createVideo(link.getAttribute('href'), `${blockName}__video`, {
      muted: true,
      autoplay: true,
      loop: true,
      playsinline: true,
    });
    block.prepend(video);

    const playbackControls = video.querySelector('button');
    getDynamicVideoHeight(video, playbackControls);
    setPlaybackControls();

    link.remove();
  }

  const links = block.querySelectorAll('a');
  const videos = [...links].filter((singleLink) => isVideoLink(singleLink));

  if (videos.length) {
    // display image as link with play icon
    const selectedLink = selectVideoLink(videos);

    if (selectedLink) {
      picture.after(selectedLink);
      wrapImageWithVideoLink(selectedLink, picture);
    }

    // removing all the videos links excluding the selected one
    // eslint-disable-next-line max-len
    videos.forEach((singleLink) => singleLink !== selectedLink && singleLink.parentElement.remove());
  }

  removeEmptyTags(block);
  const blocksCollection = document.querySelectorAll(`${blockClasses.singleImage1}, 
        ${blockClasses.singleVideoAutoplay}, ${blockClasses.singleVideoModal}, ${blockClasses.doubleImage2}`);

  blocksCollection.forEach((element) => {
    unwrapDivs(element);
  });
}
