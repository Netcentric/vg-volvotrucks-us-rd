import {
  isVideoLink,
  createVideo,
} from '../../scripts/video-helper.js';
import {
  createElement,
  removeEmptyTags,
  variantsClassesToBEM,
} from '../../scripts/common.js';

const variantClasses = ['centered', 'left', 'bottom', 'dark'];
let intervalId = null;
const blockName = 'v2-hero';

function updateCountdown(eventTime, block) {
  const now = new Date();
  const diff = eventTime - now;

  // Check if the event time has passed
  if (diff <= 0) {
    block.querySelector(`.${blockName}__countdown-wrapper`).remove()
    clearInterval(intervalId);
    return;
  }

  // Calculate time left
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Format labels
  const dayLabel = days > 1 ? "days" : "day";
  const hourLabel = hours > 1 ? "hours" : "hour";
  const minuteLabel = minutes > 1 ? "minutes" : "minute";
  const secondLabel = seconds > 1 ? "seconds" : "second";

  block.querySelector('#days').textContent = days.toString().padStart(2, '0');
  block.querySelector('#hours').textContent = hours.toString().padStart(2, '0');
  block.querySelector('#minutes').textContent = minutes.toString().padStart(2, '0');
  block.querySelector('#seconds').textContent = seconds.toString().padStart(2, '0');

  block.querySelector(':scope #days').parentElement.querySelector(`.${blockName}__countdown-label`).textContent = dayLabel
  block.querySelector(':scope #hours').parentElement.querySelector(`.${blockName}__countdown-label`).textContent = hourLabel
  block.querySelector(':scope #minutes').parentElement.querySelector(`.${blockName}__countdown-label`).textContent = minuteLabel
  block.querySelector(':scope #seconds').parentElement.querySelector(`.${blockName}__countdown-label`).textContent = secondLabel
}

export default async function decorate(block) {

  // add Hero variant classnames
  variantsClassesToBEM(block.classList, variantClasses, blockName);

  const picture = block.querySelector('picture');
  const link = block.querySelector('a');
  const isVideo = link ? isVideoLink(link) : false;
  if (isVideo) {
    const video = createVideo(link.getAttribute('href'), `${blockName}__video`, {
      muted: true,
      autoplay: true,
      loop: true,
      playsinline: true,
    });
    block.prepend(video);
    link.remove();
  }

  if (picture) {
    const img = picture.querySelector('img');
    img.classList.add(`${blockName}__image`);
    if (picture.parentElement.tagName === 'P') {
      picture.parentElement.remove();
    }
    block.prepend(picture);
  }

  const contentWrapper = block.querySelector(':scope > div');
  contentWrapper.classList.add(`${blockName}__content-wrapper`);

  const content = block.querySelector(':scope > div > div');
  content.classList.add(`${blockName}__content`);

  // Countdown timer
  const blockSection = block.parentElement?.parentElement;
  if (blockSection && blockSection.dataset?.countdownDate) {
    const countDownWrapper = createElement('div', {classes: `${blockName}__countdown-wrapper`});
    countDownWrapper.innerHTML = `<div class="${blockName}__countdown">
  <div class="${blockName}__countdown-segment">
    <div id="days" class="${blockName}__countdown-number">00</div>
    <div class="${blockName}__countdown-label">Days</div>
  </div>
  <div class="${blockName}__countdown-colon">:</div>
  <div class="${blockName}__countdown-segment">
    <div id="hours" class="${blockName}__countdown-number">00</div>
    <div class="${blockName}__countdown-label">Hours</div>
  </div>
  <div class="${blockName}__countdown-colon">:</div>
  <div class="${blockName}__countdown-segment">
    <div id="minutes" class="${blockName}__countdown-number">00</div>
    <div class="${blockName}__countdown-label">Minutes</div>
  </div>
  <div class="${blockName}__countdown-colon">:</div>
  <div class="${blockName}__countdown-segment">
    <div id="seconds" class="${blockName}__countdown-number">00</div>
    <div class="${blockName}__countdown-label">Seconds</div>
  </div>
</div>`;
    content.prepend(countDownWrapper);

    const eventTimeIso = blockSection.dataset.countdownDate;
    const eventTime = new Date(eventTimeIso);
    updateCountdown(eventTime, block)
    intervalId = setInterval(function () {
      updateCountdown(eventTime, block);
    }, 1000);
  }

  // convert all headings to h1
  const headings = [...content.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  headings.forEach((heading) => {
    if (heading.tagName !== 'H1') {
      const h1 = createElement('h1', { classes: `${blockName}__title` });
      h1.setAttribute('id', heading.getAttribute('id'));
      h1.innerHTML = heading.innerHTML;
      heading.parentNode.replaceChild(h1, heading);
    } else {
      heading.classList.add(`${blockName}__title`);
    }
  });

  // render all paragraph as H6 with the class
  const paragraphs = [...content.querySelectorAll('p')];
  paragraphs.forEach((paragraph) => paragraph.classList.add(`h6`));
  

  const buttonsWrapper = createElement('div', {classes: `${blockName}__buttons-wrapper`});
  const ctaButtons = content.querySelectorAll('.button-container > a');
  [...ctaButtons].forEach((b, i) => {
    if (i > 0) { // change next buttons to be secondary
      b.classList.add('secondary');
      b.classList.remove('primary');
    }

    if (block.classList.contains(`${blockName}--dark`)) {
      b.classList.add('dark');
    }

    b.parentElement.remove();
    buttonsWrapper.appendChild(b);
  });
  content.appendChild(buttonsWrapper);

  const scrollIcon = createElement('div', { classes: `${blockName}__scroll-icon` });
  block.append(scrollIcon);

  removeEmptyTags(content);

  block.parentElement.classList.add('full-width');
}
