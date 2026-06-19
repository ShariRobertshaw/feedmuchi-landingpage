const CONTACT_EMAIL = "hello@feedmuchi.com";
const COPY_RESET_MS = 2200;
const WIDTH_RESET_DELAY_MS = 320;

function measureFaceWidth(face) {
  const probe = document.createElement("span");
  const styles = getComputedStyle(face);
  probe.textContent = face.textContent;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "nowrap";
  probe.style.left = "-9999px";
  probe.style.font = styles.font;
  probe.style.letterSpacing = styles.letterSpacing;

  face.parentElement.appendChild(probe);
  const width = probe.offsetWidth;
  probe.remove();

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
    let contactWidth = 0;
    let copiedWidth = 0;

    const measureWidths = () => {
      contactWidth = measureFaceWidth(defaultFace);
      copiedWidth = measureFaceWidth(successFace);
    };

    const syncLabelWidth = (copied) => {
      const width = copied ? copiedWidth : contactWidth;
      if (width > 0) {
        label.style.width = `${width}px`;
      } else {
        label.style.removeProperty("width");
      }
    };

    const init = () => {
      measureWidths();
      syncLabelWidth(false);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }

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
      measureWidths();
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

      measureWidths();

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
