const FACTS_VEG_POP_MS = 220;

const FACTS = [
  {
    title: "Every 7g of extra fibre you eat daily reduces bowel cancer risk by 8%",
    sourceLabel: "Aune et al., BMJ — Imperial College London meta-analysis, 2011",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/22074852/",
    banner: "Every meal you log shows your fibre total, so you can see exactly how close you are to that extra 7g.",
    bannerTilt: -4.98,
  },
  {
    title:
      "Eating 30 different plants a week is linked to a more diverse gut microbiome, the strongest marker of gut health.",
    sourceLabel: "McDonald et al. — American Gut Project, mSystems, 2018",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/29795809/",
    banner: "Tracks every different plant you eat automatically, so you can see your variety at a glance",
    bannerTilt: 2.64,
  },
  {
    title:
      "A diverse, well-fed gut microbiome is linked to better mood, energy, and immune function.",
    sourceLabel: "Cryan et al. — Physiological Reviews, 2019",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/31460832/",
    banner: "Muchi's mood reflects how well you're feeding your gut, meal by meal",
    bannerTilt: -1.17,
  },
];

function shuffle(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function setupFactsCarousel(onFirstVisible) {
  const section = document.getElementById("factsCarousel");
  if (!section) return;

  section.classList.add("is-js");

  const title = document.getElementById("factsTitle");
  const sourceLink = document.getElementById("factsSourceLink");
  const bannerText = document.getElementById("factsBannerText");
  const bannerTilt = document.getElementById("factsBannerTilt");
  const hitTargets = [...section.querySelectorAll(".facts-hit")];
  const vegImages = [...section.querySelectorAll(".facts-veg")];

  let currentIndex = 0;
  let firstRevealDone = false;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const popVegetables = () => {
    section.dataset.vegPlayed = "false";
    vegImages.forEach((veg) => veg.classList.remove("is-popped"));

    const order = shuffle(vegImages);

    if (prefersReducedMotion) {
      order.forEach((veg) => veg.classList.add("is-popped"));
      section.dataset.vegPlayed = "true";
      return;
    }

    section.dataset.vegPlayed = "true";
    order.forEach((veg, index) => {
      window.setTimeout(() => {
        veg.classList.add("is-popped");
      }, index * FACTS_VEG_POP_MS);
    });
  };

  const applyFact = (index, { animateTitle = true } = {}) => {
    const fact = FACTS[index];
    currentIndex = index;

    section.dataset.factIndex = String(index);
    bannerTilt.style.setProperty("--facts-banner-tilt", `${fact.bannerTilt}deg`);
    bannerText.textContent = fact.banner;
    sourceLink.textContent = fact.sourceLabel;
    sourceLink.href = fact.sourceUrl;

    if (animateTitle && window.updateFactsHeadline) {
      window.updateFactsHeadline(fact.title);
    } else if (title) {
      title.textContent = fact.title;
    }

    popVegetables();
  };

  const showNextFact = () => {
    const nextIndex = (currentIndex + 1) % FACTS.length;
    applyFact(nextIndex, { animateTitle: true });
  };

  const revealSection = () => {
    if (section.dataset.revealed === "true") return;
    section.dataset.revealed = "true";
    section.classList.add("is-visible");

    if (!firstRevealDone) {
      firstRevealDone = true;
      bannerTilt.style.setProperty("--facts-banner-tilt", `${FACTS[currentIndex].bannerTilt}deg`);
      popVegetables();

      try {
        onFirstVisible?.();
      } catch (error) {
        console.error("Facts headline animation failed", error);
      }
    }
  };

  hitTargets.forEach((target) => {
    target.addEventListener("click", (event) => {
      if (event.target.closest("#factsSourceLink")) return;
      showNextFact();
    });
  });

  sourceLink?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

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
  } else {
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
}

window.setupFactsCarousel = setupFactsCarousel;
