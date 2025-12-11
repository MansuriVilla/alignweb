document.addEventListener("DOMContentLoaded", (event) => {
    gsap.registerPlugin(ScrollTrigger, SplitText)

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    initSmartStickyHeader();
    initSplitText();
    imageRevealInit();
    initRotateAnimation();
    initStaggerAnimation();
    initDirectionalScrub();
    initStagerItemAnimation();
    initProgressLineAnimation();

});

function initSmartStickyHeader() {
    const smartHeader = document.querySelector("[data-header='smart-sticky']");
    const simpleHeader = document.querySelector("[data-header='sticky']");
    if (!smartHeader && !simpleHeader) return;

    const header = smartHeader || simpleHeader;
    const isSmartMode = !!smartHeader;

    let headerHeight = header.offsetHeight;
    let isFixed = false;
    let lastY = window.scrollY;

    // Create placeholder only once
    if (!header.dataset.stickyInit) {
        const placeholder = document.createElement('div');
        placeholder.className = 'sticky-header-placeholder';
        placeholder.style.height = `${headerHeight}px`;
        header.parentNode.insertBefore(placeholder, header);
        placeholder.appendChild(header);
        header.dataset.stickyInit = 'true';
    }

    const placeholder = header.parentElement;

    // Start completely normal
    gsap.set(header, {
        position: 'static',
        top: 'auto',
        left: 'auto',
        right: 'auto',
        width: 'auto',
        y: 0,
        clearProps: 'transform'
    });

    function makeFixed() {
        if (isFixed) return;
        isFixed = true;
        gsap.set(header, {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 9999
        });
    }

    function makeStatic() {
        if (!isFixed) return;
        isFixed = false;
        gsap.set(header, {
            position: 'static',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            width: 'auto',
            y: 0,
            clearProps: 'transform'
        });
    }

    function update() {
        const scrollY = window.scrollY;

        // === RETURN TO STATIC WHEN AT TOP ===
        if (scrollY < 10) {  // small threshold for mobile bounce
            makeStatic();
            lastY = scrollY;
            return;
        }

        // === BECOME FIXED WHEN SCROLLED PAST HEADER ===
        if (scrollY >= headerHeight && !isFixed) {
            makeFixed();
        }

        // === SMART HIDE/SHOW (only when fixed) ===
        if (isFixed && isSmartMode) {
            if (scrollY > lastY && scrollY > headerHeight + 60) {
                gsap.to(header, { y: -headerHeight - 30, duration: 0.4, ease: "power2.out" });
            } else if (scrollY < lastY) {
                gsap.to(header, { y: 0, duration: 0.4, ease: "power2.out" });
            }
        }

        // Simple sticky mode: just stay fixed (no hiding)
        if (isFixed && !isSmartMode) {
            gsap.set(header, { y: 0 });
        }

        lastY = scrollY;
    }

    // Throttled scroll
    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                update();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize handler
    window.addEventListener('resize', () => {
        headerHeight = header.offsetHeight;
        placeholder.style.height = `${headerHeight}px`;
        if (!isFixed) {
            placeholder.style.height = `${headerHeight}px`;
        }
    });

    // Initial check
    update();
}



function initSplitText() {

    const splitElements = document.querySelectorAll("[data-split]:not(.about *)");

    splitElements.forEach((element) => {
        const type = element.getAttribute("data-split");
        let splitType = "lines, words, chars";
        let animationProps = {};

        if (type === "words") {
            splitType = "words";
            animationProps = {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.05,
                ease: "power2.out",
            };
        } else if (type === "lines") {
            splitType = "lines";
        } else if (type === "chars") {
            splitType = "chars";
            animationProps = {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.02,
                ease: "back.out(1.7)",
            };
        }

        const split = new SplitText(element, { type: splitType });
        const target =
            split[splitType] || split.chars || split.words || split.lines;

        if (type === "lines") {
            split.lines.forEach((line) => {
                const wrapper = document.createElement("div");
                wrapper.style.overflow = "hidden";
                wrapper.style.display = "block";

                line.parentNode.insertBefore(wrapper, line);
                wrapper.appendChild(line);
            });

            animationProps = {
                yPercent: 100,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out",
            };
        }

        const anim = gsap.from(target, {
            ...animationProps,
            paused: true,
        });

        ScrollTrigger.create({
            trigger: element,
            start: "top 90%",
            animation: anim,
        });
    });
}

function imageRevealInit() {
    const sections = document.querySelectorAll("[data-reveal-init]");

    sections.forEach((section) => {
        const images = section.querySelectorAll("[data-reveal]");

        if (images.length === 0) return;

        // Set initial hidden state
        images.forEach((img) => {
            gsap.set(img, {
                clipPath: "inset(0% 0% 100% 0%)",     // fully clipped from right
                scale: 1.3,                            // start slightly zoomed
                opacity: 0,
                transformOrigin: "center center"
            });
        });

        // Create ScrollTrigger for the whole section
        ScrollTrigger.create({
            trigger: section,
            start: "top 70%",        // start earlier for smoother feel
            once: false,              // animate only once
            onEnter: () => {
                images.forEach((img, i) => {
                    gsap.to(img, {
                        clipPath: "inset(0% 0% 0% 0%)",   // fully revealed
                        scale: 1,
                        opacity: 1,
                        duration: 1.6,
                        delay: i * 0.2 + Math.random() * 0.5,  // staggered + slight random
                        ease: "power3.out",
                        onStart: () => img.classList.add("reveal-active")
                    });
                });
            }
        });
    });
}



function initRotateAnimation() {
    // Find ALL elements with data-rotate
    const elements = document.querySelectorAll("[data-rotate]");

    elements.forEach((el) => {
        // Each element gets its OWN ScrollTrigger
        gsap.fromTo(el,
            {
                yPercent: 10,
                rotation: -2,
                scale: 0.92,
                transformOrigin: "center center"
            },
            {
                yPercent: 0,
                rotation: 0,
                scale: 1,
                ease: "none", // required for scrub
                scrollTrigger: {
                    trigger: el,           // ← THIS is the key: each uses itself as trigger
                    start: "top 85%",
                    end: "top 25%",
                    scrub: 1.2,            // smooth lag
                    // markers: true,      // remove in production
                    invalidateOnRefresh: true
                }
            }
        );
    });
}


function initStaggerAnimation() {
    const containers = document.querySelectorAll("[data-stagger]");

    containers.forEach((container) => {
        // Grab ANY direct children (or use container.children for everything)
        const children = container.querySelectorAll(":scope > *");
        // Or if you want deeper control: container.querySelectorAll(".stagger-item")

        if (children.length === 0) return;

        // Initial hidden state — works on any element
        gsap.set(children, {
            y: 20,
            opacity: 0,
        });

        // ScrollTrigger + staggered animation
        ScrollTrigger.create({
            trigger: container,
            start: "top 85%",      // tweak as needed
            once: true,            // remove if you want it to replay
            onEnter: () => {
                gsap.to(children, {
                    y: 0,
                    opacity: 1,
                    duration: 0.4,
                    ease: "linear",
                    stagger: {
                        amount: 0.2,           // total stagger duration
                        ease: "power2.out"
                    }
                });
            }
        });
    });
}


function initDirectionalScrub() {
    const containers = document.querySelectorAll("[data-directional]");

    containers.forEach((container) => {
        const cards = container.querySelectorAll(":scope > *");
        if (cards.length === 0) return;

        // We'll create one shared timeline, scrubbed by scroll
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 1,
                ease: "power3.out"
            }
        });

        cards.forEach((card, i) => {
            // Get card's position in viewport (left / center / right)
            const rect = card.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const relativeX = rect.left - containerRect.left;
            const centerX = containerRect.width / 2;
            const isLeft = relativeX < centerX - 100;
            const isRight = relativeX > centerX + 100;

            // Decide direction
            let fromX = 0;
            if (isLeft) fromX = -300;
            else if (isRight) fromX = 300;
            else fromX = 0; // center → from bottom

            // Initial state
            gsap.set(card, {
                x: fromX,
                y: isLeft || isRight ? 100 : 200,
                opacity: 0,
                transformOrigin: "center center"
            });

            // Animate to final position with stagger
            tl.to(card, {
                x: 0,
                y: 0,
                opacity: 1,
                ease: "back.out(1.4)"
            }, i * 0.15); // stagger by 0.15s
        });

        // ScrollTrigger — scrubbed to scroll speed
        ScrollTrigger.create({
            trigger: container,
            start: "top 85%",
            end: "top 20%",
            scrub: true,                    // 1.2 = smooth lag, feels premium
            animation: tl,
            markers: false,           // remove in prod
            invalidateOnRefresh: true
        });
    });
}



function initStagerItemAnimation() {
    // with scroll trigger for each item with it's own start end

    const staggerItems = document.querySelectorAll("[data-stagger-item]");
    staggerItems.forEach((item) => {
        ScrollTrigger.create({
            trigger: item,
            start: "50% 85%",
            end: "50% 70%",
            scrub: true,
            animation: gsap.from(item, {
                opacity: 0,
                y: 100,
                scale: 0.6,
                filter: "blur(50px)",
                duration: 1,
                ease: "power2.out",
            }),
            markers: true,
            invalidateOnRefresh: true
        });
    });
}



function initProgressLineAnimation() {
    const progressLine = document.querySelector("[data-scroll-line]");

    gsap.set(progressLine, {
        height: "180px",
        top: 0,
        transformOrigin: "top center"
    });

    ScrollTrigger.create({
        trigger: ".space-y-\\[100px\\]",
        start: "top 40%",
        end: "bottom 40%",
        scrub: true,
        markers: false,

        // This is the magic: animate from current height (180px) to 100%
        animation: gsap.to(progressLine, {
            height: "100%",
            ease: "none",
            paused: true
        }),

        onUpdate: (self) => {
            // self.progress = 0   → playhead at start → stays 180px
            // self.progress = 1   → playhead at end   → 100%
            self.animation.progress(self.progress);
        }
    });
}