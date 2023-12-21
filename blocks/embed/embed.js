import { createElement, getTextLabel, isExternalVideoAllowed } from '../../scripts/common.js';
import {
  selectVideoLink, addPlayIcon, showVideoModal, isLowResolutionVideoUrl,
  createLowResolutionBanner, createIframe,
} from '../../scripts/video-helper.js';

export default function decorate(block) {
  const isAutoplay = block.classList.contains('autoplay');
  const isSingleVideo = block.classList.contains('single-video');
  const isLoopedVideo = block.classList.contains('loop');
  const isFullWidth = block.classList.contains('full-width');
  const hideLowResolutionBanner = block.classList.contains('no-banner');
  const videoWrapper = document.createElement('div');
  // removing classes to avoid collision with other css
  block.classList.remove('loop', 'autoplay', 'full-width');
  videoWrapper.classList.add('embed-video');

  const preferredType = (() => {
    if (isSingleVideo) return 'singleVideo';
    if (isFullWidth) return 'local';
    return 'auto';
  })();

  const links = block.querySelectorAll('a');
  const selectedLink = selectVideoLink(links, preferredType);
  const video = document.createElement('video');
  const source = document.createElement('source');

  if (isSingleVideo && !isExternalVideoAllowed()) {
    const img = block.querySelector('picture img');
    block.innerHTML = '';

    const cookieMsgConatiner = createElement('div', {
      classes: 'cookie-message',
    });
    cookieMsgConatiner.style.background = `linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.80) 100%), url(${img.src}) 100% center / cover no-repeat`;

    const cookieMessage = document.createRange().createContextualFragment(`
      <h3 class="cookie-message__title">${getTextLabel('single video message title')}</h3>
      <p class="cookie-message__text">${getTextLabel('single video message text')}</p>
      <div class="cookie-message__button-container">
        <button class="primary dark">${getTextLabel('single video message button')}</button>
        <button class="secondary dark">${getTextLabel('single video message button deny')}</button>
      </div>
    `);

    cookieMsgConatiner.append(cookieMessage);
    block.append(cookieMsgConatiner);

    block.querySelector('.cookie-message__button-container .primary')?.addEventListener('click', () => {
      document.cookie = 'isSingleVideo=true';
    });

    return;
  }

  if (!selectedLink) {
    block.innerHTML = '';
    /* eslint-disable-next-line no-console */
    console.warn('Embed block: There is no video link. Please check if the fallback video link is provided.');
    return;
  }

  const isLowResolutionVideo = isLowResolutionVideoUrl(selectedLink.getAttribute('href'));
  const showControls = isLowResolutionVideo && !isFullWidth;

  video.appendChild(source);
  block.innerHTML = '';
  block.appendChild(videoWrapper);

  const loadEmbed = () => {
    if (video.classList.contains('embed-video-loaded') || !selectedLink) {
      return;
    }

    if (isAutoplay) {
      video.autoplay = true;
      // autoplay requires the video to be muted otherwise the autoplay
      // can be block by the browser
      // https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
      video.muted = true;
    }

    if (isLoopedVideo) {
      video.loop = true;
    }

    video.playsInline = true;
    video.controls = showControls;
    video.classList.add('embed-video-element', 'embed-video-loaded');
    source.setAttribute('src', selectedLink.getAttribute('href'));
    source.setAttribute('type', 'video/mp4');
    videoWrapper.appendChild(video);

    if (isFullWidth) {
      const link = document.createElement('a');
      link.setAttribute('href', selectVideoLink(links).getAttribute('href'));
      block.classList.add('embed-full-width');
      addPlayIcon(block);

      video.addEventListener('click', () => {
        showVideoModal(selectVideoLink(links).getAttribute('href'));
      });
    }

    if (!isFullWidth && !hideLowResolutionBanner) {
      const banner = createLowResolutionBanner();
      videoWrapper.prepend(banner);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      if (isLowResolutionVideo) {
        loadEmbed();
      } else {
        createIframe(selectedLink.getAttribute('href'), { parentEl: videoWrapper, classes: 'embed-video-element' });
      }
    }
  });
  observer.observe(block);
}
