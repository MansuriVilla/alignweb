document.addEventListener("DOMContentLoaded", (event) => {
  highlightActiveLinks();
  initToggleVide();
  initFAQ();
  initTimer();
  initAuthCarousel();
  initCalendar();
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

function initToggleVide() {
  const video = document.querySelector("[data-media-play]");
  const overlay = document.querySelector(".video-overlay");
  const playButton = document.querySelector(".play-button");

  if (!video || !overlay || !playButton) return;

  // Function to toggle play/pause
  overlay.addEventListener("click", () => {
    if (video.paused || video.ended) {
      video.play();
      playButton.style.opacity = "0";
    } else {
      video.pause();
      playButton.style.opacity = "1";
    }
  });

  // Optional: make sure button shows again when video naturally ends
  video.addEventListener("ended", () => {
    playButton.style.opacity = "1";
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
      link.getAttribute("href") === "/index.html" ||
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
