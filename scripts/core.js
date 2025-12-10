

document.addEventListener("DOMContentLoaded", (event) => {

    initToggleVide();

});


function initToggleVide() {
    const video = document.querySelector('[data-media-play]');
    const overlay = document.querySelector('.video-overlay');
    const playButton = document.querySelector('.play-button');

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