document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);


  initSmartStickyHeader();
  initHeaderDarkSectionHandler();
  if (document.fonts) {
    document.fonts.ready.then(() => {
      initSplitText();
    });
  }
  imageRevealInit();
  initRotateAnimation();
  initStaggerAnimation();
  initDirectionalScrub();
  initStagerItemAnimation();
  initProgressLineAnimation();


  // Handle window resize to fix text breaking
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initSplitText(true);
      ScrollTrigger.refresh();
    }, 250);
  });
});

const isMobile = window.innerWidth <= 1024;

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
    yPercent: 0,
  });

  function makeFixed() {
    if (isFixed) return;
    isFixed = true;
    gsap.set(header, {
      yPercent: -35,
      zIndex: 99,
    });
  }

  function makeStatic() {
    if (!isFixed) return;
    isFixed = false;
    gsap.set(header, {
      yPercent: 0,
    });
  }

  function update() {
    const scrollY = window.scrollY;

    // === RETURN TO STATIC WHEN AT TOP ===
    if (scrollY < 10) {
      // small threshold for mobile bounce
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
        gsap.to(header, {
          y: -headerHeight - 30,
          duration: 0.4,
          ease: "power2.out",
        });
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

  window.addEventListener("scroll", onScroll, { passive: true });

  // Resize handler
  window.addEventListener("resize", () => {
    headerHeight = header.offsetHeight;
    placeholder.style.height = `${headerHeight}px`;
    if (!isFixed) {
      placeholder.style.height = `${headerHeight}px`;
    }
  });

  // Initial check
  update();
}

let splitInstances = [];

function initSplitText(isResize = false) {
  if (isResize) {
    splitInstances.forEach(split => split.revert());
    splitInstances = [];
  }

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
    splitInstances.push(split);

    const target =
      split[splitType] || split.chars || split.words || split.lines;

    if (type === "lines") {
      split.lines.forEach((line) => {
        const wrapper = document.createElement("div");
        wrapper.style.overflow = "hidden";
        wrapper.style.display = "block";
        wrapper.style.padding = "0.05em 0"; // Prevent top/bottom of letters from being cut off

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
      start: "top 95%",
      end: "top 75%",
      scrub: 1,
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
        clipPath: "inset(0% 0% 100% 0%)", // fully clipped from right
        scale: 1.3, // start slightly zoomed
        opacity: 0,
        transformOrigin: "center center",
      });
    });

    // Create ScrollTrigger for the whole section
    ScrollTrigger.create({
      trigger: section,
      start: "top 70%", // start earlier for smoother feel
      once: false, // animate only once
      onEnter: () => {
        images.forEach((img, i) => {
          gsap.to(img, {
            clipPath: "inset(0% 0% 0% 0%)", // fully revealed
            scale: 1,
            opacity: 1,
            duration: 1.6,
            delay: i * 0.2 + Math.random() * 0.5, // staggered + slight random
            ease: "power3.out",
            onStart: () => img.classList.add("reveal-active"),
          });
        });
      },
    });
  });
}

function initRotateAnimation() {
  // Find ALL elements with data-rotate
  const elements = document.querySelectorAll("[data-rotate]");

  elements.forEach((el) => {
    // Each element gets its OWN ScrollTrigger
    gsap.fromTo(
      el,
      {
        yPercent: 10,
        rotation: -2,
        scale: 0.92,
        transformOrigin: "center center",
      },
      {
        yPercent: 0,
        rotation: 0,
        scale: 1,
        ease: "none", // required for scrub
        scrollTrigger: {
          trigger: el, // ← THIS is the key: each uses itself as trigger
          start: "top 85%",
          end: "top 25%",
          scrub: 1.2, // smooth lag
          // markers: true,      // remove in production
          invalidateOnRefresh: true,
        },
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
      start: "top 85%", // tweak as needed
      once: true, // remove if you want it to replay
      onEnter: () => {
        gsap.to(children, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "linear",
          stagger: {
            amount: 0.2, // total stagger duration
            ease: "power2.out",
          },
        });
      },
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
        ease: "power3.out",
      },
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
        transformOrigin: "center center",
      });

      // Animate to final position with stagger
      tl.to(
        card,
        {
          x: 0,
          y: 0,
          opacity: 1,
          ease: "back.out(1.4)",
        },
        i * 0.15
      ); // stagger by 0.15s
    });

    // ScrollTrigger — scrubbed to scroll speed
    ScrollTrigger.create({
      trigger: container,
      start: "top 85%",
      end: "top 20%",
      scrub: true, // 1.2 = smooth lag, feels premium
      animation: tl,
      markers: false, // remove in prod
      invalidateOnRefresh: true,
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
      markers: false,
      invalidateOnRefresh: true,
    });
  });
}

function initProgressLineAnimation() {
  const progressLine = document.querySelector("[data-scroll-line]");

  if (!progressLine) return;
  

  // Set initial state
  gsap.set(progressLine, {
    height: "180px",                 
    top: 0,
    transformOrigin: "top center"
  });

  const tl = gsap.to(progressLine, {
    height: isMobile ? "99.1%" : "98.70%",
    ease: "none",
    paused: true
  });

  ScrollTrigger.create({
    trigger: "section.overflow-hidden", 
    start: "top 40%",
    end: "bottom 40%",
    scrub: true,
    markers: false,
    animation: tl,
    onUpdate: (self) => {
      tl.progress(self.progress);
    }
  });
}

function initHeaderDarkSectionHandler() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const darkSections = document.querySelectorAll("[data-header-dark]");
  if (darkSections.length === 0) return;

  const headerTextElements = header.querySelectorAll(
    "[data-nav-link]"
  );
  const navLinks = header.querySelectorAll("[data-nav-link]");

  function checkHeaderPosition() {
    const headerRect = header.getBoundingClientRect();
    const headerCenter = headerRect.top + headerRect.height / 2;

    let isOverDarkSection = false;

    darkSections.forEach((section) => {
      const sectionRect = section.getBoundingClientRect();

      if (
        headerCenter >= sectionRect.top &&
        headerCenter <= sectionRect.bottom
      ) {
        isOverDarkSection = true;
      }
    });

    if (isOverDarkSection) {
      header.classList.add("header-light-mode");
      headerTextElements.forEach((el) => {
        el.classList.add("text-white");
      });
      navLinks.forEach((link) => {
        link.classList.remove("text-gray-500", "hover:text-gray-700");
        link.classList.add("text-white", "hover:text-gray-200");
      });
    } else {
      header.classList.remove("header-light-mode");
      headerTextElements.forEach((el) => {
        el.classList.remove("text-white");
      });
      navLinks.forEach((link) => {
        link.classList.remove("text-white", "hover:text-gray-200");
        link.classList.add("text-gray-500", "hover:text-gray-700");
      });
    }
  }

  window.addEventListener("scroll", checkHeaderPosition, { passive: true });

  window.addEventListener("resize", checkHeaderPosition, { passive: true });

  checkHeaderPosition();
}

