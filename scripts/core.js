

document.addEventListener("DOMContentLoaded", (event) => {

    highlightActiveLinks();
    initToggleVide();
    initFAQ();

});


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
        if (link.getAttribute('href') === '#' || link.getAttribute('href') === null || link.getAttribute('href') === '/' || link.getAttribute('href') === '' ) return;

        const linkUrl = link.href.split(/[?#]/)[0];
        if (linkUrl === currentUrl) {
            link.classList.add('current_page');
        }
    });
}