

document.addEventListener("DOMContentLoaded", (event) => {

    highlightActiveLinks();
    initToggleVide();

});


function initToggleVide() {
    const video = document.querySelector('[data-media-play]');
    const overlay = document.querySelector('.video-overlay');
    const playButton = document.querySelector('.play-button');

    if (!video || !overlay || !playButton) return;

    // Function to toggle play/pause
    overlay.addEventListener('click', () => {
        if (video.paused || video.ended) {
            video.play();
            playButton.style.opacity = '0';
        } else {
            video.pause();
            playButton.style.opacity = '1';
        }
    });

    // Optional: make sure button shows again when video naturally ends
    video.addEventListener('ended', () => {
        playButton.style.opacity = '1';
    });
}

function highlightActiveLinks() {
    const currentUrl = window.location.href.split(/[?#]/)[0];
    const links = document.querySelectorAll('header nav a, footer a');

    links.forEach(link => {
        // Ignore placeholder links
        if (link.getAttribute('href') === '#' || link.getAttribute('href') === null || link.getAttribute('href') === '/' ) return;

        const linkUrl = link.href.split(/[?#]/)[0];
        if (linkUrl === currentUrl) {
            link.classList.add('current_page');
        }
    });
}