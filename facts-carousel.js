const FACTS_VEG_POP_MS = 220;

function shuffle(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function setupFactsCarousel(onVisible) {
  const section = document.getElementById("factsCarousel");
  if (!section) return;

  section.classList.add("is-js");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vegImages = [...section.querySelectorAll(".facts-veg")];

  const popVegetables = () => {
    if (section.dataset.vegPlayed === "true") return;
    section.dataset.vegPlayed = "true";

    const order = shuffle(vegImages);

    if (prefersReducedMotion) {
      order.forEach((veg) => veg.classList.add("is-popped"));
      return;
    }

    order.forEach((veg, index) => {
      window.setTimeout(() => {
        veg.classList.add("is-popped");
      }, index * FACTS_VEG_POP_MS);
    });
  };

  const revealSection = () => {
    if (section.dataset.revealed === "true") return;
    section.dataset.revealed = "true";
    section.classList.add("is-visible");
    popVegetables();

    try {
      onVisible?.();
    } catch (error) {
      console.error("Facts headline animation failed", error);
    }
  };

  const isSectionInView = () => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < viewportHeight * 0.9 && rect.bottom > viewportHeight * 0.1;
  };

  const syncReveal = () => {
    if (isSectionInView()) {
      revealSection();
    }
  };

  if (!("IntersectionObserver" in window)) {
    revealSection();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealSection();
        observer.disconnect();
      });
    },
    { threshold: 0.08 }
  );

  observer.observe(section);
  window.addEventListener("scroll", syncReveal, { passive: true });
  window.addEventListener("resize", syncReveal);
  window.addEventListener("load", syncReveal, { once: true });
  requestAnimationFrame(syncReveal);
}

window.setupFactsCarousel = setupFactsCarousel;
