

document.addEventListener("DOMContentLoaded", (event) => {

    highlightActiveLinks();
    initToggleVide();
    initFAQ();
    initTimer();

});

function initTimer() {
    const timerContainer = document.getElementById('countdown-timer');
    if (!timerContainer) return;

    const daysEl = timerContainer.querySelector('.timer-days');
    const hoursEl = timerContainer.querySelector('.timer-hours');
    const minutesEl = timerContainer.querySelector('.timer-minutes');
    const secondsEl = timerContainer.querySelector('.timer-seconds');

    const duration = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

    function updateTimer() {
        const now = Date.now();
        // Calculate remaining time in the current 48-hour cycle based on Unix Epoch
        // This creates a global loop without needing local storage
        const remaining = duration - (now % duration);

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    // Initial call to avoid delay
    updateTimer();
    setInterval(updateTimer, 1000);
}


function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        const answer = item.querySelector('.faq-answer');
        
        // Initial state: First item open, others closed
        if (index === 0) {
            gsap.set(answer, { height: 'auto', autoAlpha: 1 });
            item.classList.add('active'); // Optional: for styling active state if needed
        } else {
            gsap.set(answer, { height: 0, autoAlpha: 0 });
        }
        
        item.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            // Close all items first (accordion behavior)
            faqItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    gsap.to(otherAnswer, { height: 0, autoAlpha: 0, duration: 0.3, ease: 'power2.out' });
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle clicked item
            if (!isOpen) {
                gsap.to(answer, { height: 'auto', autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
                item.classList.add('active');
            } else {
                // Determine if we want to allow closing the active item or enforce one always open.
                // User said "first one will be open", implying standard accordion. Usually valid to close all.
                gsap.to(answer, { height: 0, autoAlpha: 0, duration: 0.3, ease: 'power2.out' });
                item.classList.remove('active');
            }
        });
    });
}


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
        if (link.getAttribute('href') === '#' || link.getAttribute('href') === null || link.getAttribute('href') === '/' || link.getAttribute('href') === '/index.html' || link.getAttribute('href') === ''  ) return;

        const linkUrl = link.href.split(/[?#]/)[0];
        if (linkUrl === currentUrl) {
            link.classList.add('current_page');
        }
    });
}