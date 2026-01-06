document.addEventListener("DOMContentLoaded", (event) => {
  highlightActiveLinks();
  initFAQ();
  initTimer();
  initAuthCarousel();
  initCalendar();
  handleVideoPreview();
  initMobileMenu();
  updateCopyrightYear();
  initCountryPicker();
});

function initAuthCarousel() {
  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".carousel-dot");

  if (slides.length === 0 || dots.length === 0) return;

  let currentIndex = 0;
  const intervalTime = 5000; // 5 seconds
  let carouselInterval;

  function showSlide(index) {
    // Reset all
    slides.forEach((slide) => {
      slide.style.opacity = "0";
      slide.style.zIndex = "0";
    });
    dots.forEach((dot) => {
      dot.classList.remove("w-10", "bg-cocoa");
      dot.classList.add("w-10", "bg-white");
    });

    // Activate current
    slides[index].style.opacity = "1";
    slides[index].style.zIndex = "10";

    dots[index].classList.remove("w-10", "bg-white");
    dots[index].classList.add("w-10", "bg-cocoa");

    currentIndex = index;
  }

  function nextSlide() {
    let nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  // Event Listeners for Dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      clearInterval(carouselInterval);
      showSlide(index);
      startAutoPlay();
    });
  });

  function startAutoPlay() {
    carouselInterval = setInterval(nextSlide, intervalTime);
  }

  // Initialize
  showSlide(0);
  startAutoPlay();
}

function initTimer() {
  const timerContainer = document.getElementById("countdown-timer");
  if (!timerContainer) return;

  const daysEl = timerContainer.querySelector(".timer-days");
  const hoursEl = timerContainer.querySelector(".timer-hours");
  const minutesEl = timerContainer.querySelector(".timer-minutes");
  const secondsEl = timerContainer.querySelector(".timer-seconds");

  const duration = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

  function updateTimer() {
    const now = Date.now();
    // Calculate remaining time in the current 48-hour cycle based on Unix Epoch
    // This creates a global loop without needing local storage
    const remaining = duration - (now % duration);

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  // Initial call to avoid delay
  updateTimer();
  setInterval(updateTimer, 1000);
}

function initFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item, index) => {
    const answer = item.querySelector(".faq-answer");

    // Initial state: First item open, others closed
    if (index === 0) {
      gsap.set(answer, { height: "auto", autoAlpha: 1 });
      item.classList.add("active"); // Optional: for styling active state if needed
    } else {
      gsap.set(answer, { height: 0, autoAlpha: 0 });
    }

    item.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Close all items first (accordion behavior)
      faqItems.forEach((otherItem) => {
        const otherAnswer = otherItem.querySelector(".faq-answer");
        if (otherItem !== item && otherItem.classList.contains("active")) {
          gsap.to(otherAnswer, {
            height: 0,
            autoAlpha: 0,
            duration: 0.3,
            ease: "power2.out",
          });
          otherItem.classList.remove("active");
        }
      });

      // Toggle clicked item
      if (!isOpen) {
        gsap.to(answer, {
          height: "auto",
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
        });
        item.classList.add("active");
      } else {
        // Determine if we want to allow closing the active item or enforce one always open.
        // User said "first one will be open", implying standard accordion. Usually valid to close all.
        gsap.to(answer, {
          height: 0,
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.out",
        });
        item.classList.remove("active");
      }
    });
  });
}

function highlightActiveLinks() {
  const currentUrl = window.location.href.split(/[?#]/)[0];
  const links = document.querySelectorAll("header nav a, footer a");

  links.forEach((link) => {
    // Ignore placeholder links
    if (
      link.getAttribute("href") === "#" ||
      link.getAttribute("href") === null ||
      link.getAttribute("href") === "/" ||
      link.getAttribute("href") === "/" ||
      link.getAttribute("href") === ""
    )
      return;

    const linkUrl = link.href.split(/[?#]/)[0];
    if (linkUrl === currentUrl) {
      link.classList.add("current_page");
    }
  });
}

function initCalendar() {
  const calendarContainer = document.getElementById("calender");
  if (!calendarContainer) return;

  // Clear existing content
  calendarContainer.innerHTML = "";

  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday

  // Days of the week
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  // Calculate the start of the week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek);

  // Generate 7 days for the week
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    const dayOfWeek = daysOfWeek[i];
    const dayOfMonth = date.getDate();
    const isToday = i === currentDayOfWeek;
    const isFirstDay = i === 0;

    // Create card container
    const card = document.createElement("div");
    // Base classes for the card - rounded square, white bg
    // Using explicit width/height to match the 'square-ish' look from image
    card.className = `flex flex-col items-center justify-start pt-2 w-[68px] h-[66px] rounded-2xl border  relative transition-all duration-200 ${
      isToday
        ? "border-[#F197B7] shadow-sm z-10 bg-white"
        : "border-gray-200/60 "
    }`;

    // 1. Top Text (Day Letter or "Today")
    const topText = document.createElement("span");
    topText.className = "text-[11px] text-gray-400 font-light mb-0.5";
    topText.textContent = isToday ? "Today" : dayOfWeek;

    // 2. Date Number
    const dateNumberContainer = document.createElement("div");
    // Base styling for number
    dateNumberContainer.className = `flex items-center justify-center w-8 h-8 rounded-full text-[14px] ${
      isToday ? "font-bold text-black" : "font-light text-black"
    }`;

    // Add dashed border for first day (Sunday) around the number specifically, as per image
    if (isFirstDay) {
      dateNumberContainer.classList.add(
        "border",
        "border-dashed",
        "border-black"
      );
      dateNumberContainer.style.width = "28px"; // Slightly smaller to fit dashed border nicely? or kept same.
      dateNumberContainer.style.height = "28px";
    }

    dateNumberContainer.textContent = dayOfMonth;

    // Append Top Text and Date
    card.appendChild(topText);
    card.appendChild(dateNumberContainer);

    // 3. Pink Dot for Today (floating at bottom)
    if (isToday) {
      const dot = document.createElement("div");
      dot.className =
        "absolute -bottom-[6px] w-3 h-3 bg-[#F197B7]/40 rounded-full flex items-center justify-center";
      // Inner solid dot
      const innerDot = document.createElement("div");
      innerDot.className = "w-1.5 h-1.5 bg-[#F197B7] rounded-full";

      // To match the image exactly, it looks like a single larger transparent-ish pink circle or a solid one.
      // The image has a solid pink circle interrupting the border line.
      // Let's go with a solid circle sitting on the line.
      dot.className =
        "absolute -bottom-1.5 w-3 h-3 bg-[#EEBDCF] rounded-full border border-white";
      // Actually image shows a larger soft pink circle.
      dot.className =
        "absolute -bottom-2 w-4 h-4 bg-[#F197B7]/50 backdrop-blur-sm rounded-full flex items-center justify-center";
      const coreDot = document.createElement("div");
      coreDot.className = "w-full h-full bg-[#F197B7] rounded-full opacity-60";
      // Let's stick to a simple aesthetic dot
      dot.innerHTML = "";
      dot.className =
        "absolute -bottom-2 w-4 h-4 bg-[#F197B7] rounded-full border-[3px] border-white";

      card.appendChild(dot);
    }

    calendarContainer.appendChild(card);
  }
}

function handleVideoPreview() {
  const videoPreviews = document.querySelectorAll(".video-preview");
  const startTime = 0;
  const endTime = 5;

  // Store all video instances globally to manage playback
  const videoInstances = [];

  videoPreviews.forEach((preview, index) => {
    // Select all required elements
    const previewVideo = preview.querySelector(".preview-video");
    const playButton = preview.querySelector(".play-button");
    const loader = document.getElementById(`loader-${index + 1}`);

    // Validate required elements
    if (!previewVideo || !playButton || !loader) {
      console.error(
        `Missing required elements for video block ${index + 1}`,
        {
          previewVideo: !!previewVideo,
          playButton: !!playButton,
          loader: !!loader,
        }
      );
      return;
    }

    // Get popup elements
    const videoPopup = document.getElementById(`dialog-video__${index + 1}`);
    const popupContent = document.getElementById(
      `dialog-content__${index + 1}`
    );
    const fullVideo = document.getElementById(
      `dialog-full__video-${index + 1}`
    );
    const closeButton = document.getElementById(
      `dialog-close__btn-${index + 1}`
    );

    // Determine mode with proper attribute checking
    const hasPopupElements =
      videoPopup && popupContent && fullVideo && closeButton;
    const playInPlaceAttr = preview.dataset.playInPlace;

    // Logic:
    // - If data-play-in-place="true" -> play in place
    // - If data-play-in-place="false" -> force popup mode (even without popup elements)
    // - If no attribute and no popup elements -> play in place (fallback)
    // - If no attribute and has popup elements -> popup mode (default)
    let playInPlace;
    if (playInPlaceAttr === "true") {
      playInPlace = true;
    } else if (playInPlaceAttr === "false") {
      playInPlace = false;
      // Validate popup elements are available when forced to popup mode
      if (!hasPopupElements) {
        console.error(
          `Video block ${index + 1
          } has data-play-in-place="false" but missing popup elements`
        );
        return;
      }
    } else {
      // No attribute: use popup if elements exist, otherwise play in place
      playInPlace = !hasPopupElements;
    }

    // Get video URL and determine if it's an iframe (Vimeo/YouTube)
    const videoUrl = preview.dataset.videoUrl;
    const isIframe =
      videoUrl.includes("vimeo.com") || videoUrl.includes("youtube.com");

    // Set preview and full video sources
    if (isIframe) {
      previewVideo.src = videoUrl;
      if (!playInPlace && fullVideo) {
        fullVideo.src = videoUrl.replace("autoplay=1", "");
      }
    } else {
      previewVideo.src = videoUrl;
      if (!playInPlace && fullVideo) {
        fullVideo.src = videoUrl;
      }
    }

    // Function to hide loader
    const hideLoader = () => {
      loader.style.display = "none";
      preview.classList.add("dialog-video__loading");
    };

    // Track if we're in preview mode or full playback mode
    let isPreviewMode = true;
    let vimeoPlayer = null; // Store Vimeo player instance
    let isPlayingFull = false; // Track if this video is playing full

    // Store video instance info
    const videoInstance = {
      index: index + 1,
      previewVideo,
      playButton,
      isIframe,
      vimeoPlayer: null,
      playInPlace,
      stopFullPlayback: () => {
        if (isPlayingFull) {
          if (isIframe && videoUrl.includes("vimeo.com") && vimeoPlayer) {
            vimeoPlayer.pause();
            vimeoPlayer.setCurrentTime(startTime);
            vimeoPlayer.setLoop(true);
          } else {
            previewVideo.pause();
            previewVideo.currentTime = startTime;
            previewVideo.loop = true;
            previewVideo.muted = true;
          }
          playButton.style.opacity = "1";
          playButton.style.pointerEvents = "auto";
          isPreviewMode = true;
          isPlayingFull = false;

          // Resume preview playback
          if (isIframe && videoUrl.includes("vimeo.com") && vimeoPlayer) {
            vimeoPlayer.play();
          } else {
            previewVideo.play();
          }
        }
      },
    };
    videoInstances.push(videoInstance);

    // Handle preview video/iframe playback
    if (isIframe && videoUrl.includes("vimeo.com")) {
      vimeoPlayer = new Vimeo.Player(previewVideo);
      videoInstance.vimeoPlayer = vimeoPlayer;

      vimeoPlayer.on("loaded", () => {
        hideLoader();
        vimeoPlayer.setCurrentTime(startTime).then(() => {
          vimeoPlayer.play().catch((error) => {
            console.log(
              `Autoplay prevented for Vimeo video ${index + 1}:`,
              error
            );
            document.addEventListener(
              "click",
              () => {
                vimeoPlayer.play();
              },
              { once: true }
            );
          });
        });
      });
      vimeoPlayer.on("timeupdate", (data) => {
        // Only loop preview if in preview mode
        if (isPreviewMode && data.seconds >= endTime) {
          vimeoPlayer.setCurrentTime(startTime);
        }
      });
      vimeoPlayer.on("error", () => {
        console.error(`Error loading Vimeo video ${index + 1}`);
        hideLoader();
      });
    } else {
      previewVideo.addEventListener("loadedmetadata", () => {
        hideLoader();
        previewVideo.currentTime = startTime;
        previewVideo.play().catch((error) => {
          console.log(`Autoplay prevented for video ${index + 1}:`, error);
          document.addEventListener(
            "click",
            () => {
              previewVideo.play();
            },
            { once: true }
          );
        });
      });
      previewVideo.addEventListener("timeupdate", () => {
        // Only loop preview if in preview mode
        if (isPreviewMode && previewVideo.currentTime >= endTime) {
          previewVideo.currentTime = startTime;
        }
      });
      previewVideo.addEventListener("error", () => {
        console.error(`Error loading video ${index + 1}`);
        hideLoader();
      });
    }

    // Add click handler to video for play-in-place mode to stop playback
    if (playInPlace) {
      const handleVideoClick = (e) => {
        // Only handle click if video is playing in full mode and not clicking the play button
        if (isPlayingFull && !playButton.contains(e.target)) {
          e.stopPropagation();
          // Stop full playback and return to preview
          if (isIframe && videoUrl.includes("vimeo.com") && vimeoPlayer) {
            vimeoPlayer.pause();
            vimeoPlayer.setCurrentTime(startTime);
            vimeoPlayer.setLoop(true);
            vimeoPlayer.play();
          } else {
            previewVideo.pause();
            previewVideo.currentTime = startTime;
            previewVideo.loop = true;
            previewVideo.muted = true;
            previewVideo.play();
          }
          playButton.style.opacity = "1";
          playButton.style.pointerEvents = "auto";
          isPreviewMode = true;
          isPlayingFull = false;
        }
      };

      preview.addEventListener("click", handleVideoClick);
    }

    // Handle play button click
    playButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent video click handler from firing

      if (playInPlace) {
        // Stop all other videos that are playing in full
        videoInstances.forEach((instance) => {
          if (instance.index !== index + 1 && instance.playInPlace) {
            instance.stopFullPlayback();
          }
        });

        // Switch to full playback mode
        isPreviewMode = false;
        isPlayingFull = true;

        // Hide play button immediately
        playButton.style.opacity = "0";
        playButton.style.pointerEvents = "none";

        // Play in place: play full video in the same container
        if (isIframe && videoUrl.includes("vimeo.com") && vimeoPlayer) {
          vimeoPlayer
            .setCurrentTime(0)
            .then(() => {
              vimeoPlayer.setLoop(false);
              vimeoPlayer.play();
            })
            .catch((error) => {
              console.error(
                `Error playing full Vimeo video ${index + 1}:`,
                error
              );
              // Show play button again if there's an error
              playButton.style.opacity = "1";
              playButton.style.pointerEvents = "auto";
              isPreviewMode = true;
              isPlayingFull = false;
            });

          // Show play button again when video ends
          vimeoPlayer.on("ended", () => {
            playButton.style.opacity = "1";
            playButton.style.pointerEvents = "auto";
            isPreviewMode = true;
            isPlayingFull = false;
            vimeoPlayer.setCurrentTime(startTime);
            vimeoPlayer.setLoop(true);
            vimeoPlayer.play();
          });
        } else {
          // For HTML5 video
          previewVideo.currentTime = 0;
          previewVideo.loop = false;
          previewVideo.muted = false; // Unmute for full playback

          // Play the video
          const playPromise = previewVideo.play();

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error(`Error playing full video ${index + 1}:`, error);
              // Show play button again if there's an error
              playButton.style.opacity = "1";
              playButton.style.pointerEvents = "auto";
              isPreviewMode = true;
              isPlayingFull = false;
              previewVideo.muted = true;
            });
          }

          // Show play button again when video ends
          const handleVideoEnd = () => {
            playButton.style.opacity = "1";
            playButton.style.pointerEvents = "auto";
            isPreviewMode = true;
            isPlayingFull = false;
            previewVideo.currentTime = startTime;
            previewVideo.loop = true;
            previewVideo.muted = true; // Mute again for preview
            previewVideo.play();
            previewVideo.removeEventListener("ended", handleVideoEnd);
          };
          previewVideo.addEventListener("ended", handleVideoEnd);
        }
      } else {
        // Stop all other videos that are playing in full (play-in-place ones)
        videoInstances.forEach((instance) => {
          if (instance.playInPlace) {
            instance.stopFullPlayback();
          }
        });

        // Original popup behavior
        if (isIframe && videoUrl.includes("vimeo.com")) {
          const fullPlayer = new Vimeo.Player(fullVideo);
          if (previewVideo.tagName === "IFRAME") {
            if (vimeoPlayer) {
              vimeoPlayer.pause();
            }
          } else {
            previewVideo.pause();
          }
          document.body.classList.add("dialog-box__open");
          gsap.to(videoPopup, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
            onStart: () => {
              videoPopup.style.display = "flex";
              videoPopup.style.pointerEvents = "auto";
            },
          });
          gsap.to(popupContent, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.2,
            onComplete: () => {
              fullPlayer.play();
            },
          });
        } else {
          previewVideo.pause();
          document.body.classList.add("dialog-box__open");
          gsap.to(videoPopup, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
            onStart: () => {
              videoPopup.style.display = "flex";
              videoPopup.style.pointerEvents = "auto";
            },
          });
          gsap.to(popupContent, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.2,
            onComplete: () => {
              fullVideo.play();
            },
          });
        }
      }
    });

    // Close popup functionality (only for popup mode)
    if (!playInPlace && closeButton) {
      closeButton.addEventListener("click", () => {
        gsap.to(popupContent, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onStart: () => {
            if (isIframe && videoUrl.includes("vimeo.com")) {
              const fullPlayer = new Vimeo.Player(fullVideo);
              fullPlayer.pause();
              if (fullVideo.dataset.videoBehavior === "restart") {
                fullPlayer.setCurrentTime(0);
              }
              if (previewVideo.tagName === "IFRAME") {
                if (vimeoPlayer) {
                  vimeoPlayer.play();
                }
              } else {
                previewVideo.play();
              }
            } else {
              fullVideo.pause();
              if (fullVideo.dataset.videoBehavior === "restart") {
                fullVideo.currentTime = 0;
              }
              previewVideo.play();
            }
          },
        });
        gsap.to(videoPopup, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          delay: 0.5,
          onComplete: () => {
            videoPopup.style.display = "none";
            videoPopup.style.pointerEvents = "none";
            document.body.classList.remove("dialog-box__open");
          },
        });
      });

      // Close popup on ESC key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && videoPopup.style.display !== "none") {
          closeButton.click();
        }
      });
    }
  });
}

function initMobileMenu() {
  const hamburgerBtn = document.querySelector('[commandfor="mobile-menu"]');
  if (!hamburgerBtn) return;

  // Create mobile menu if it doesn't exist
  let mobileMenu = document.getElementById("mobile-menu");
  if (!mobileMenu) {
    mobileMenu = document.createElement("div");
    mobileMenu.id = "mobile-menu";
    mobileMenu.innerHTML = `
      <div class="menu-content" data-lenis-prevent>
        <div class="menu-header">
          <a href="/" class="menu-logo-container">
            <!-- Logo will be injected here -->
          </a>
          <button class="close-btn" aria-label="Close menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="menu-links"></div>
      </div>
    `;
    document.body.appendChild(mobileMenu);
  }

  const menuLinksContainer = mobileMenu.querySelector(".menu-links");
  const logoContainer = mobileMenu.querySelector(".menu-logo-container");
  const closeBtn = mobileMenu.querySelector(".close-btn");

  // Sync links and logo from desktop nav
  function syncMenu() {
    // Sync Logo
    const desktopLogo = document.querySelector('header .lg\\:flex-1 img');
    if (desktopLogo && logoContainer.children.length === 0) {
      const mobileLogo = desktopLogo.cloneNode(true);
      mobileLogo.classList.remove("max-w-[110px]", "h-[40px]");
      mobileLogo.style.maxWidth = "110px";
      mobileLogo.style.height = "auto";
      logoContainer.appendChild(mobileLogo);
      
      // Update link to home
      const desktopLogoLink = document.querySelector('header .lg\\:flex-1 a');
      if (desktopLogoLink) {
        logoContainer.href = desktopLogoLink.href;
      }
    }

    // Sync Links
    const desktopLinks = document.querySelectorAll('header nav div.lg\\:gap-x-12 a');
    menuLinksContainer.innerHTML = "";
    desktopLinks.forEach((link) => {
      const mobileLink = link.cloneNode(true);
      mobileLink.classList.add("menu-link");
      // Ensure we keep the exact href
      menuLinksContainer.appendChild(mobileLink);
    });

    // Also add the "Try Align Today" button
    const ctaBtn = document.querySelector('header nav div.flex-1.items-center.justify-end a');
    if (ctaBtn) {
      const mobileCta = ctaBtn.cloneNode(true);
      mobileCta.className = " rounded-full bg-primary px-6 py-2 text-sm text-center text-white font-semibold mt-8 text-lg";
      menuLinksContainer.appendChild(mobileCta);
    }
  }

  function toggleMenu() {
    mobileMenu.classList.toggle("active");
    document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : "";
    
    if (mobileMenu.classList.contains("active")) {
      // Small delay to ensure animations feel smooth
      gsap.from("#mobile-menu .menu-link", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out"
      });
      
      if (mobileMenu.querySelector(".bg-primary")) {
        gsap.from(mobileMenu.querySelector(".bg-primary"), {
          y: 20,
          opacity: 0,
          duration: 0.4,
          delay: 0.3,
          ease: "power2.out"
        });
      }
    }
  }

  hamburgerBtn.addEventListener("click", () => {
    syncMenu();
    toggleMenu();
  });

  closeBtn.addEventListener("click", toggleMenu);

  // Close menu on link click
  menuLinksContainer.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      toggleMenu();
    }
  });
}

function updateCopyrightYear() {
  const currentYear = new Date().getFullYear();
  const copyrightYear = document.querySelector('[data-current-year]');
  if (copyrightYear) {
    copyrightYear.textContent = currentYear;
  }
}

const countries = [
  { name: "United States", code: "+1", iso: "us" },
  { name: "United Kingdom", code: "+44", iso: "gb" },
  { name: "Canada", code: "+1", iso: "ca" },
  { name: "Australia", code: "+61", iso: "au" },
  { name: "Germany", code: "+49", iso: "de" },
  { name: "France", code: "+33", iso: "fr" },
  { name: "India", code: "+91", iso: "in" },
  { name: "United Arab Emirates", code: "+971", iso: "ae" },
  { name: "Saudi Arabia", code: "+966", iso: "sa" },
  { name: "Singapore", code: "+65", iso: "sg" },
  { name: "Japan", code: "+81", iso: "jp" },
  { name: "China", code: "+86", iso: "cn" },
  { name: "Brazil", code: "+55", iso: "br" },
  { name: "Mexico", code: "+52", iso: "mx" },
  { name: "Italy", code: "+39", iso: "it" },
  { name: "Spain", code: "+34", iso: "es" },
  { name: "Netherlands", code: "+31", iso: "nl" },
  { name: "Switzerland", code: "+41", iso: "ch" },
  { name: "Sweden", code: "+46", iso: "se" },
  { name: "Norway", code: "+47", iso: "no" },
];

function initCountryPicker() {
  const pickers = document.querySelectorAll('[data-country-picker]');
  if (pickers.length === 0) return;

  pickers.forEach(picker => {
    const btn = picker.querySelector('.country-select-btn');
    const dropdown = picker.querySelector('.country-dropdown');
    const searchInput = picker.querySelector('.country-search-input');
    const list = picker.querySelector('.country-list');
    const flagImg = btn.querySelector('img');
    const codeSpan = btn.querySelector('.selected-code');
    const hiddenInput = picker.querySelector('input[type="hidden"]');

    // Initial render
    renderCountries(countries);

    function renderCountries(data) {
      if (data.length === 0) {
        list.innerHTML = `
          <div class="country-not-found">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>No countries found</p>
          </div>
        `;
        return;
      }
      list.innerHTML = data.map(c => `
        <div class="country-item" data-code="${c.code}" data-iso="${c.iso}" data-name="${c.name}">
          <img src="https://flagcdn.com/w40/${c.iso}.webp" alt="${c.name}">
          <span class="country-name">${c.name}</span>
          <span class="country-code">${c.code}</span>
        </div>
      `).join('');
    }

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      if (dropdown.classList.contains('active')) {
        searchInput.focus();
      }
    });

    // Search
    searchInput.addEventListener('input', (e) => {
      e.stopPropagation();
      const term = e.target.value.toLowerCase();
      const filtered = countries.filter(c => 
        c.name.toLowerCase().includes(term) || c.code.includes(term)
      );
      renderCountries(filtered);
    });

    // Selection
    list.addEventListener('click', (e) => {
      const item = e.target.closest('.country-item');
      if (!item) return;

      const code = item.dataset.code;
      const iso = item.dataset.iso;
      const name = item.dataset.name;

      flagImg.src = `https://flagcdn.com/w40/${iso}.png`;
      flagImg.alt = name;
      codeSpan.textContent = code;
      
      if (hiddenInput) hiddenInput.value = code;

      dropdown.classList.remove('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  });
}
