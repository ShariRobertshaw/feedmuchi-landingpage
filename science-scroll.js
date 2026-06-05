const SENTENCES = [
  "Not another calorie counter",
  "Fibre and plants only, no guilt",
  "Built on real gut health science, worn lightly"
];

const ENTER_END = 0.12;
const EXIT_START = 0.72;
const ENTER_STAGGER = 0.03;
const EXIT_STAGGER = ENTER_STAGGER;
const LETTER_ENTER_DUR = 0.3;
const LETTER_EXIT_DUR = LETTER_ENTER_DUR;
const SEGMENT = 1 / SENTENCES.length;
const ENTER_SPAN = SEGMENT * 0.18;
const EXIT_SPAN = ENTER_SPAN;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t) {
  return t * t * t;
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function buildSentenceElement(text) {
  const sentence = document.createElement("p");
  sentence.className = "science-sentence";
  sentence.setAttribute("aria-hidden", "true");

  const letters = [];

  text.split(/(\s+)/).forEach((part) => {
    if (!part) return;

    if (/^\s+$/.test(part)) {
      const space = document.createElement("span");
      space.className = "science-letter science-space";
      space.textContent = "\u00a0";
      space.style.transform = "rotateX(90deg)";
      space.style.opacity = "0";
      sentence.appendChild(space);
      letters.push(space);
      return;
    }

    const word = document.createElement("span");
    word.className = "science-word";

    for (const char of part) {
      const span = document.createElement("span");
      span.className = "science-letter";
      span.textContent = char;
      span.style.transform = "rotateX(90deg)";
      span.style.opacity = "0";
      word.appendChild(span);
      letters.push(span);
    }

    sentence.appendChild(word);
  });

  return { sentence, letters };
}

function setLetterState(letter, rotateX, opacity) {
  letter.style.transform = `rotateX(${rotateX}deg)`;
  letter.style.opacity = String(opacity);
}

function updateLettersEnter(letters, local) {
  const n = letters.length;
  const totalSpan = Math.max((n - 1) * ENTER_STAGGER + LETTER_ENTER_DUR, 0.0001);
  const localEnter = local / ENTER_END;

  letters.forEach((letter, i) => {
    const start = (i * ENTER_STAGGER) / totalSpan;
    const end = (i * ENTER_STAGGER + LETTER_ENTER_DUR) / totalSpan;
    const t = clamp01((localEnter - start) / Math.max(end - start, 0.0001));
    const eased = easeOutCubic(t);
    setLetterState(letter, 90 * (1 - eased), eased);
  });
}

function updateLettersHold(letters) {
  letters.forEach((letter) => setLetterState(letter, 0, 1));
}

function updateLettersExit(letters, local) {
  const n = letters.length;
  const totalSpan = Math.max((n - 1) * EXIT_STAGGER + LETTER_EXIT_DUR, 0.0001);
  const localExit = (local - EXIT_START) / (1 - EXIT_START);

  letters.forEach((letter, i) => {
    const reverseIndex = n - 1 - i;
    const start = (reverseIndex * EXIT_STAGGER) / totalSpan;
    const end = (reverseIndex * EXIT_STAGGER + LETTER_EXIT_DUR) / totalSpan;
    const t = clamp01((localExit - start) / Math.max(end - start, 0.0001));
    const eased = easeInCubic(t);
    setLetterState(letter, -90 * eased, 1 - eased);
  });
}

function updateLettersHiddenIn(letters) {
  letters.forEach((letter) => setLetterState(letter, 90, 0));
}

function updateLettersHiddenOut(letters) {
  letters.forEach((letter) => setLetterState(letter, -90, 0));
}

function updateScienceScene(globalProgress, sentenceEls) {
  sentenceEls.forEach((data, index) => {
    const enterStart = index * SEGMENT;
    const enterEnd = enterStart + ENTER_SPAN;
    const exitEnd = (index + 1) * SEGMENT;
    const exitStart = exitEnd - EXIT_SPAN;
    const isActive = globalProgress >= enterStart && globalProgress < exitEnd;

    if (globalProgress < enterStart) {
      updateLettersHiddenIn(data.letters);
    } else if (globalProgress < enterEnd) {
      const enterT = (globalProgress - enterStart) / ENTER_SPAN;
      updateLettersEnter(data.letters, enterT * ENTER_END);
    } else if (globalProgress < exitStart) {
      updateLettersHold(data.letters);
    } else if (globalProgress <= exitEnd) {
      const exitT = (globalProgress - exitStart) / EXIT_SPAN;
      updateLettersExit(data.letters, EXIT_START + exitT * (1 - EXIT_START));
    } else {
      updateLettersHiddenOut(data.letters);
    }

    data.sentence.style.visibility = isActive ? "visible" : "hidden";
    data.sentence.style.pointerEvents = isActive ? "auto" : "none";
    data.sentence.setAttribute("aria-hidden", isActive ? "false" : "true");
  });
}

function setupReducedMotion(stage, sentenceEls) {
  sentenceEls.forEach((data, i) => {
    data.sentence.style.visibility = i === 0 ? "visible" : "hidden";
    updateLettersHold(data.letters);
  });
}

async function initScienceScroll() {
  const scene = document.getElementById("scienceScene");
  const stage = document.getElementById("scienceStage");
  if (!scene || !stage) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sentenceEls = SENTENCES.map((text) => {
    const built = buildSentenceElement(text);
    stage.appendChild(built.sentence);
    return built;
  });

  if (prefersReducedMotion) {
    setupReducedMotion(stage, sentenceEls);
    return;
  }

  let frame = null;

  const sync = () => {
    frame = null;
    const rect = scene.getBoundingClientRect();
    const scrollable = Math.max(scene.offsetHeight - window.innerHeight, 1);
    const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
    updateScienceScene(scrolled / scrollable, sentenceEls);
  };

  const requestSync = () => {
    if (frame !== null) return;
    frame = requestAnimationFrame(sync);
  };

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  sync();
}

window.initScienceScroll = initScienceScroll;
