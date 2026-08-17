const header = document.querySelector("[data-site-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-site-nav]");
const featureNav = document.querySelector("[data-feature-nav]");
const featureNavTrigger = document.querySelector("[data-feature-nav-trigger]");

const setFeatureNavigation = (open) => {
  featureNav?.classList.toggle("is-open", open);
  featureNavTrigger?.setAttribute("aria-expanded", String(open));
};

const dismissFeatureNavigation = () => {
  setFeatureNavigation(false);
  featureNav?.classList.add("is-dismissed");
};

const closeNavigation = () => {
  if (!navToggle || !nav) return;
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  setFeatureNavigation(false);
};

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("is-open", open);
});

featureNavTrigger?.addEventListener("click", () => {
  if (featureNav?.classList.contains("is-open")) {
    dismissFeatureNavigation();
    return;
  }
  featureNav?.classList.remove("is-dismissed");
  setFeatureNavigation(true);
});

featureNavTrigger?.addEventListener("pointerenter", () => {
  featureNav?.classList.remove("is-dismissed");
});

nav?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  if (link.closest("[data-feature-nav-panel]")) {
    dismissFeatureNavigation();
    link.blur();
  }
  closeNavigation();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-site-nav], [data-nav-toggle]")) {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  dismissFeatureNavigation();
  featureNavTrigger?.focus();
});

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("is-scrolled", window.scrollY > 8),
  { passive: true },
);
header?.classList.toggle("is-scrolled", window.scrollY > 8);

for (const year of document.querySelectorAll("[data-current-year]")) {
  year.textContent = String(new Date().getFullYear());
}

// Reveal-on-scroll for elements marked [data-reveal].
const revealTargets = [...document.querySelectorAll("[data-reveal]")];
if ("IntersectionObserver" in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -80px 0px", threshold: 0.08 },
  );
  for (const target of revealTargets) revealObserver.observe(target);
} else {
  for (const target of revealTargets) target.classList.add("is-visible");
}

// Only one FAQ entry open at a time.
const faqItems = [...document.querySelectorAll(".faq-item")];
for (const item of faqItems) {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    for (const other of faqItems) {
      if (other !== item) other.open = false;
    }
  });
}

// Fanned product-demo carousel ("deck"): cards arranged around an active
// slide, auto-advancing, with manual prev/next/play controls and click-to-jump.
const deck = document.querySelector("[data-deck]");
if (deck) {
  const cards = [...deck.querySelectorAll("[data-deck-card]")];
  const prevBtn = deck.querySelector("[data-deck-prev]");
  const nextBtn = deck.querySelector("[data-deck-next]");
  const playBtn = deck.querySelector("[data-deck-play]");
  const iconPause = deck.querySelector("[data-deck-icon-pause]");
  const iconPlay = deck.querySelector("[data-deck-icon-play]");
  const indexEl = deck.querySelector("[data-deck-index]");
  const captionEl = deck.querySelector("[data-deck-caption]");
  const total = cards.length;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const VISIBLE_SPAN = 2;
  const AUTOPLAY_MS = 3200;

  let active = 0;
  let playing = !prefersReducedMotion;
  let timer = null;

  const render = () => {
    cards.forEach((card, i) => {
      let rel = i - active;
      if (rel > total / 2) rel -= total;
      if (rel < -total / 2) rel += total;
      const abs = Math.abs(rel);
      card.style.setProperty("--rel", String(rel));
      card.style.setProperty("--abs", String(Math.min(abs, VISIBLE_SPAN + 1)));
      card.classList.toggle("is-hidden", abs > VISIBLE_SPAN);
      card.dataset.active = String(rel === 0);
      card.tabIndex = abs > VISIBLE_SPAN ? -1 : 0;
    });
    const activeCard = cards[active];
    if (indexEl) indexEl.textContent = String(active + 1).padStart(2, "0");
    if (captionEl) captionEl.textContent = activeCard?.dataset.deckLabel ?? "";
  };

  const goTo = (index) => {
    active = ((index % total) + total) % total;
    render();
  };

  const stopAutoplay = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    timer = setInterval(() => goTo(active + 1), AUTOPLAY_MS);
  };

  const setPlaying = (next) => {
    playing = next;
    playBtn?.setAttribute("aria-pressed", String(playing));
    playBtn?.setAttribute("aria-label", playing ? "Pause autoplay" : "Play autoplay");
    if (iconPause) iconPause.hidden = !playing;
    if (iconPlay) iconPlay.hidden = playing;
    if (playing) startAutoplay();
    else stopAutoplay();
  };

  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      goTo(i);
      setPlaying(false);
    });
  });
  prevBtn?.addEventListener("click", () => { goTo(active - 1); setPlaying(false); });
  nextBtn?.addEventListener("click", () => { goTo(active + 1); setPlaying(false); });
  playBtn?.addEventListener("click", () => setPlaying(!playing));

  render();
  setPlaying(playing);
}
