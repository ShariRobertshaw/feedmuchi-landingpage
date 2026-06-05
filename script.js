const intro = document.getElementById("intro");
const siteNav = document.querySelector(".site-nav");
const blinkGif = document.getElementById("blinkGif");
const wordmark = document.getElementById("wordmark");
const line1 = document.getElementById("line1");
const subtext = document.getElementById("subtext");
const ctaBtn = document.getElementById("ctaBtn");
const footnote = document.getElementById("footnote");
const hero = document.getElementById("hero");
const heroGreenScene = document.getElementById("heroGreenScene");
const muchi = document.getElementById("muchi");
const creatures = [...document.querySelectorAll(".creature")];
const howItWorks = document.getElementById("howItWorks");
const howScrollLayout = document.getElementById("howScrollLayout");
const howPhoneStep2 = document.querySelector('[data-how-image="2"]');
const howPhoneStep3 = document.querySelector('[data-how-image="3"]');

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const flipHeadlines = new Map();

function prepareFlipHeadline(element) {
  if (!element || flipHeadlines.has(element)) return flipHeadlines.get(element);

  const text = element.textContent || "";
  const letters = [];
  element.textContent = "";
  element.classList.add("flip-headline");
  if (!element.hasAttribute("aria-label")) {
    element.setAttribute("aria-label", text);
  }

  text.split(/(\s+)/).forEach((part) => {
    if (!part) return;

    if (/^\s+$/.test(part)) {
      element.appendChild(document.createTextNode(part));
      return;
    }

    const word = document.createElement("span");
    word.className = "flip-word";

    for (const char of part) {
      const span = document.createElement("span");
      span.className = "flip-letter";
      span.textContent = char;
      word.appendChild(span);
      letters.push(span);
    }

    element.appendChild(word);
  });

  const data = { letters };
  flipHeadlines.set(element, data);
  return data;
}

function revealFlipHeadline(element) {
  const data = prepareFlipHeadline(element);
  if (!data) return;

  element.dataset.flipPlayed = "true";
  data.letters.forEach((letter) => {
    letter.style.transition = "none";
    letter.style.opacity = "1";
    letter.style.transform = "rotateX(0deg)";
  });
}

function playFlipHeadline(element, options = {}) {
  const data = prepareFlipHeadline(element);
  if (!data) return;
  if (element.dataset.flipPlayed === "true" && !options.replay) return;

  const delay = options.delay ?? 0;
  const stagger = options.stagger ?? 30;
  const duration = options.duration ?? 300;
  element.dataset.flipPlayed = "true";

  if (prefersReducedMotion) {
    revealFlipHeadline(element);
    return;
  }

  data.letters.forEach((letter) => {
    letter.style.transition = "none";
    letter.style.opacity = "0";
    letter.style.transform = "rotateX(90deg)";
  });

  requestAnimationFrame(() => {
    data.letters.forEach((letter, index) => {
      const totalDelay = delay + index * stagger;
      letter.style.transition = `transform ${duration}ms ease-out ${totalDelay}ms, opacity ${duration}ms ease-out ${totalDelay}ms`;
      letter.style.opacity = "1";
      letter.style.transform = "rotateX(0deg)";
    });
  });
}

function setupFlipHeadlines() {
  const manuallyTimed = new Set([
    line1,
    document.getElementById("howTitle"),
    document.getElementById("fibreHappyTitle"),
    ...document.querySelectorAll(".how-step-title")
  ].filter(Boolean));

  const headings = [...document.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main h6")]
    .filter((heading) => heading.children.length === 0 && !heading.closest(".science-scene"));

  const targets = new Set([
    ...manuallyTimed,
    ...headings,
    ...document.querySelectorAll(".flip-headline")
  ]);

  targets.forEach(prepareFlipHeadline);

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      playFlipHeadline(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  targets.forEach((target) => {
    if (!manuallyTimed.has(target)) {
      observer.observe(target);
    }
  });
}

function playHowHeadlines() {
  if (!howItWorks || howItWorks.dataset.headlinesPlayed === "true") return;

  howItWorks.dataset.headlinesPlayed = "true";
  howItWorks.classList.add("is-visible");

  playFlipHeadline(document.getElementById("howTitle"));
}

function getRangeProgress(value, start, end) {
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

function setPhoneClip(layer, progress) {
  if (!layer) return;
  const hidden = 100 - progress * 100;
  layer.style.clipPath = `inset(${hidden}% 0 0 0)`;
}

function getHowItWorksProgress() {
  if (!howItWorks) return 0;

  const rect = howItWorks.getBoundingClientRect();
  const scrollable = Math.max(howItWorks.offsetHeight - window.innerHeight, 1);
  const sectionScrolled = Math.min(Math.max(-rect.top, 0), scrollable);
  return sectionScrolled / scrollable;
}

function updateHowPhoneReveal() {
  if (!howItWorks || !howScrollLayout) return;

  if (window.innerWidth <= 768 || prefersReducedMotion) {
    setPhoneClip(howPhoneStep2, 1);
    setPhoneClip(howPhoneStep3, 1);
    return;
  }

  const progress = getHowItWorksProgress();

  setPhoneClip(howPhoneStep2, getRangeProgress(progress, 0.33, 0.5));
  setPhoneClip(howPhoneStep3, getRangeProgress(progress, 0.66, 0.83));

  document.querySelectorAll(".how-step-title").forEach((title, index) => {
    const trigger = [0.18, 0.44, 0.72][index] ?? 0.18;
    if (progress >= trigger) {
      playFlipHeadline(title);
    }
  });
}

function revealStaticState() {
  intro.style.display = "none";
  siteNav?.classList.add("is-visible");
  flipHeadlines.forEach((_, element) => revealFlipHeadline(element));
  const fibreMuchi = document.getElementById("fibreHappyMuchi");
  if (fibreMuchi) {
    setFibreHappyMuchiFrame(fibreMuchi, 2);
  }
  howItWorks?.classList.add("is-visible");
  subtext.style.opacity = "0.8";
  subtext.style.transform = "translateY(0)";
  ctaBtn.style.opacity = "1";
  footnote.style.opacity = "1";
  muchi.style.opacity = "1";
  muchi.style.transform = "translate(0,0)";
  creatures.forEach((node) => {
    node.style.opacity = "1";
    node.style.transform = "scale(1)";
  });
}

function scheduleGuaranteedOverlayExit() {
  setTimeout(() => {
    blinkGif.style.display = "none";
    intro.classList.add("is-sliding");
  }, 2000);

  setTimeout(() => {
    intro.style.display = "none";
    siteNav?.classList.add("is-visible");
  }, 2700);
}

function waapiAnimate(target, keyframes, options) {
  if (!target || !target.animate) return;
  target.animate(keyframes, { fill: "forwards", ...options });
}

async function runSequence() {
  if (prefersReducedMotion) {
    revealStaticState();
    return;
  }

  scheduleGuaranteedOverlayExit();

  try {
    const motion = await import("https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm");
    const { animate, spring } = motion;

    playFlipHeadline(line1, { delay: 2200 });
    animate(subtext, { opacity: [0, 0.8], y: [20, 0] }, { duration: 0.5, easing: "ease-out", delay: 3.05 });
    animate(ctaBtn, { opacity: [0, 1] }, { duration: 0.4, easing: "ease-out", delay: 3.2 });
    animate(footnote, { opacity: [0, 1] }, { duration: 0.4, delay: 3.35 });

    animate(
      muchi,
      { opacity: [0, 1], x: [28, 0] },
      {
        opacity: { duration: 0.6, delay: 2.3 },
        x: { ...spring({ stiffness: 200, damping: 22 }), delay: 2.3 }
      }
    );

    animate(
      muchi,
      { x: [0, 7, -5, 0], y: [0, -14, -6, 0], rotate: [0, 1.2, -0.8, 0] },
      { duration: 6.2, repeat: Infinity, easing: "ease-in-out", delay: 3.0 }
    );

    const floatDurations = [4.0, 3.2, 4.6, 3.8];
    const floatDelays = [3.1, 3.3, 3.2, 3.4];
    const floatX = [
      [0, 4, -3, 0],
      [0, -5, 3, 0],
      [0, 3, -4, 0],
      [0, -4, 2, 0]
    ];
    const floatY = [
      [0, -8, 0],
      [0, -6, 0],
      [0, -9, 0],
      [0, -7, 0]
    ];
    const floatRotate = [
      [0, 3, -2, 0],
      [0, -2, 2, 0],
      [0, 2.5, -2, 0],
      [0, -3, 2, 0]
    ];
    creatures.forEach((node, index) => {
      animate(node, { opacity: [0, 1], scale: [0.7, 1] }, { ...spring({ stiffness: 300, damping: 15 }), delay: 2.45 + index * 0.08 });
      animate(
        node,
        { x: floatX[index], y: floatY[index], rotate: floatRotate[index] },
        { duration: floatDurations[index], repeat: Infinity, easing: "ease-in-out", delay: floatDelays[index] }
      );
    });
  } catch (error) {
    // Fallback for offline/CDN failures: keep timing and reveal behavior.
    playFlipHeadline(line1, { delay: 2200 });
    waapiAnimate(subtext, [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 0.8, transform: "translateY(0)" }], { duration: 500, delay: 3050, easing: "ease-out" });
    waapiAnimate(ctaBtn, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 3200, easing: "ease-out" });
    waapiAnimate(footnote, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 3350, easing: "linear" });
    waapiAnimate(muchi, [{ opacity: 0, transform: "translateX(28px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 600, delay: 2300, easing: "ease-out" });
    waapiAnimate(muchi, [{ transform: "translate(0,0) rotate(0deg)" }, { transform: "translate(7px,-14px) rotate(1.2deg)" }, { transform: "translate(-5px,-6px) rotate(-0.8deg)" }, { transform: "translate(0,0) rotate(0deg)" }], { duration: 6200, delay: 3000, easing: "ease-in-out", iterations: Infinity });
    const waapiFloats = [
      ["translate(0,0) rotate(0deg)", "translate(4px,-8px) rotate(3deg)", "translate(-3px,0px) rotate(-2deg)", "translate(0,0) rotate(0deg)", 4000, 3100],
      ["translate(0,0) rotate(0deg)", "translate(-5px,-6px) rotate(-2deg)", "translate(3px,0px) rotate(2deg)", "translate(0,0) rotate(0deg)", 3200, 3300],
      ["translate(0,0) rotate(0deg)", "translate(3px,-9px) rotate(2.5deg)", "translate(-4px,0px) rotate(-2deg)", "translate(0,0) rotate(0deg)", 4600, 3200],
      ["translate(0,0) rotate(0deg)", "translate(-4px,-7px) rotate(-3deg)", "translate(2px,0px) rotate(2deg)", "translate(0,0) rotate(0deg)", 3800, 3400]
    ];
    creatures.forEach((node, index) => {
      waapiAnimate(node, [{ opacity: 0, transform: "scale(0.7)" }, { opacity: 1, transform: "scale(1)" }], { duration: 520, delay: 2450 + index * 80, easing: "ease-out" });
      waapiAnimate(node, waapiFloats[index].slice(0, 4).map((transform) => ({ transform })), { duration: waapiFloats[index][4], delay: waapiFloats[index][5], easing: "ease-in-out", iterations: Infinity });
    });
  }
}

function syncHeadlineWrapping() {
  const line = document.getElementById("line1");
  const copy = document.querySelector(".hero-copy");
  if (!line || !copy) return;

  line.classList.add("nowrap");
  const fits = line.scrollWidth <= copy.clientWidth;
  if (!fits) line.classList.remove("nowrap");
}

function setupHowItWorksMotion() {
  if (!howItWorks || !hero || !heroGreenScene) return;

  const syncCoveringState = () => {
    if (window.innerWidth <= 760) {
      howItWorks.style.transform = "translateY(0)";
      hero.style.filter = "none";
      const rect = howItWorks.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.75) {
        playHowHeadlines();
      }
      return;
    }

    const sceneRect = heroGreenScene.getBoundingClientRect();
    const sceneScrollable = window.innerHeight * 1.45;
    const sceneScrolled = Math.min(Math.max(-sceneRect.top, 0), sceneScrollable);
    const progress = sceneScrolled / sceneScrollable;

    const translateViewport = (1 - progress) * 100;
    howItWorks.style.transform = `translateY(${translateViewport}vh)`;
    hero.style.filter = "none";

    if (progress > 0.24) {
      playHowHeadlines();
    }

    updateHowPhoneReveal();
  };

  if (prefersReducedMotion) {
    howItWorks.style.transform = "translateY(0)";
    hero.style.filter = "none";
    playHowHeadlines();
    updateHowPhoneReveal();
    return;
  }
  window.addEventListener("scroll", syncCoveringState, { passive: true });
  window.addEventListener("resize", syncCoveringState);
  syncCoveringState();
}

const FIBRE_HAPPY_MUCHI_FRAMES = [
  "images/blinking-purple.gif",
  "images/blinking-orange.gif",
  "images/green-happy.png"
];

function setFibreHappyMuchiFrame(muchi, frameIndex) {
  muchi.src = FIBRE_HAPPY_MUCHI_FRAMES[frameIndex];
  muchi.classList.toggle("is-happy", frameIndex === 2);
}

function setupFibreHappySection() {
  const section = document.getElementById("fibreHappy");
  const muchi = document.getElementById("fibreHappyMuchi");
  const title = document.getElementById("fibreHappyTitle");
  if (!section || !muchi) return;

  FIBRE_HAPPY_MUCHI_FRAMES.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  let started = false;
  let timers = [];

  const startSequence = () => {
    if (started) return;
    started = true;

    if (title) {
      playFlipHeadline(title);
    }

    if (prefersReducedMotion) {
      setFibreHappyMuchiFrame(muchi, 2);
      return;
    }

    setFibreHappyMuchiFrame(muchi, 0);
    timers.push(
      setTimeout(() => {
        setFibreHappyMuchiFrame(muchi, 1);
      }, 3000)
    );
    timers.push(
      setTimeout(() => {
        setFibreHappyMuchiFrame(muchi, 2);
      }, 6000)
    );
  };

  if (!("IntersectionObserver" in window)) {
    startSequence();
    return () => timers.forEach(clearTimeout);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      startSequence();
      observer.disconnect();
    },
    { threshold: 0.35 }
  );

  observer.observe(section);
}

function setupHowPhoneReveal() {
  if (!howItWorks) return;

  const syncPhoneReveal = () => updateHowPhoneReveal();

  window.addEventListener("scroll", syncPhoneReveal, { passive: true });
  window.addEventListener("resize", syncPhoneReveal);
  syncPhoneReveal();
}

function setupHowStepImageCursor() {
  const cursor = document.getElementById("howStepCursor");
  const steps = [...document.querySelectorAll(".how-step[data-cursor-image]")];
  if (!cursor || steps.length === 0 || prefersReducedMotion) return;

  const hideCursor = () => {
    cursor.classList.remove("is-active");
  };

  steps.forEach((step) => {
    step.classList.add("has-image-cursor");

    step.addEventListener("mouseenter", () => {
      const src = step.getAttribute("data-cursor-image");
      if (!src) return;
      cursor.src = src;
      cursor.style.width = `${step.getAttribute("data-cursor-width") || "240"}px`;
      cursor.classList.add("is-active");
    });

    step.addEventListener("mousemove", (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });

    step.addEventListener("mouseleave", hideCursor);
  });

  window.addEventListener("scroll", hideCursor, { passive: true });
}

setupFlipHeadlines();
syncHeadlineWrapping();
window.addEventListener("resize", syncHeadlineWrapping);
setupHowItWorksMotion();
setupHowPhoneReveal();
setupFibreHappySection();
setupHowStepImageCursor();
window.initScienceScroll?.();
runSequence();
