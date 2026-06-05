const CONTACT_EMAIL = "hello@feedmuchi.com";

function setupCopyEmailContact() {
  document.querySelectorAll(".site-footer-copy-contact").forEach((button) => {
    const label = button.querySelector(".site-footer-copy-label");
    if (!label) return;

    let resetTimer;

    const resetLabel = () => {
      button.classList.remove("is-copied");
      button.removeAttribute("aria-live");
    };

    button.addEventListener("click", async () => {
      clearTimeout(resetTimer);

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

      button.classList.add("is-copied");
      button.setAttribute("aria-live", "polite");

      resetTimer = window.setTimeout(resetLabel, 2200);
    });
  });
}

setupCopyEmailContact();
