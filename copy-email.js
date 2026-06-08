const CONTACT_EMAIL = "hello@feedmuchi.com";
const COPY_RESET_MS = 2200;
const WIDTH_RESET_DELAY_MS = 320;

function measureFaceWidth(face) {
  const previous = {
    visibility: face.style.visibility,
    position: face.style.position,
    display: face.style.display,
    opacity: face.style.opacity,
    transform: face.style.transform,
  };

  face.style.visibility = "hidden";
  face.style.position = "absolute";
  face.style.display = "block";
  face.style.opacity = "1";
  face.style.transform = "none";

  const width = face.offsetWidth;

  face.style.visibility = previous.visibility;
  face.style.position = previous.position;
  face.style.display = previous.display;
  face.style.opacity = previous.opacity;
  face.style.transform = previous.transform;

  return width;
}

function setupCopyEmailContact() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".site-footer-copy-contact").forEach((button) => {
    const label = button.querySelector(".site-footer-copy-label");
    const defaultFace = button.querySelector(".site-footer-copy-default");
    const successFace = button.querySelector(".site-footer-copy-success");
    if (!label || !defaultFace || !successFace) return;

    let resetTimer;
    let widthResetTimer;
    let contactWidth = measureFaceWidth(defaultFace);
    let copiedWidth = measureFaceWidth(successFace);

    const syncLabelWidth = (copied) => {
      label.style.width = `${copied ? copiedWidth : contactWidth}px`;
    };

    syncLabelWidth(false);

    const resetLabel = () => {
      button.classList.remove("is-copied");
      button.removeAttribute("aria-live");

      if (prefersReducedMotion) {
        syncLabelWidth(false);
        return;
      }

      clearTimeout(widthResetTimer);
      widthResetTimer = window.setTimeout(() => {
        syncLabelWidth(false);
      }, WIDTH_RESET_DELAY_MS);
    };

    const remeasureWidths = () => {
      contactWidth = measureFaceWidth(defaultFace);
      copiedWidth = measureFaceWidth(successFace);
      syncLabelWidth(button.classList.contains("is-copied"));
    };

    button.addEventListener("click", async () => {
      clearTimeout(resetTimer);
      clearTimeout(widthResetTimer);

      try {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
      } catch {
        const input = document.createElement("textarea");
        input.value = CONTACT_EMAIL;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }

      if (!prefersReducedMotion) {
        syncLabelWidth(true);
      }

      button.classList.add("is-copied");
      button.setAttribute("aria-live", "polite");

      resetTimer = window.setTimeout(resetLabel, COPY_RESET_MS);
    });

    window.addEventListener("resize", remeasureWidths);
  });
}

setupCopyEmailContact();
