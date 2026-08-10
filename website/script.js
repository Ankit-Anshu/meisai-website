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

for (const year of document.querySelectorAll("[data-current-year]")) {
  year.textContent = String(new Date().getFullYear());
}

const featureVideos = [...document.querySelectorAll("[data-feature-video]")];

const setVideoFallback = (video, visible) => {
  const button = video.closest("[data-video-shell]")?.querySelector("[data-video-play]");
  if (button) button.hidden = !visible;
};

const playVideo = async (video) => {
  video.muted = true;
  video.defaultMuted = true;
  try {
    await video.play();
    setVideoFallback(video, false);
  } catch {
    setVideoFallback(video, true);
  }
};

for (const video of featureVideos) {
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.addEventListener("playing", () => setVideoFallback(video, false));
  video.addEventListener("error", () => setVideoFallback(video, true));
  video.addEventListener("canplay", () => {
    const bounds = video.getBoundingClientRect();
    if (bounds.bottom >= -160 && bounds.top <= window.innerHeight + 160) {
      void playVideo(video);
    }
  });
  video.closest("[data-video-shell]")?.querySelector("[data-video-play]")?.addEventListener("click", () => {
    void playVideo(video);
  });
}

if ("IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (entry.isIntersecting) {
          void playVideo(video);
        } else {
          video.pause();
        }
      }
    },
    { rootMargin: "160px 0px", threshold: 0.12 },
  );

  for (const video of featureVideos) videoObserver.observe(video);
} else {
  for (const video of featureVideos) void playVideo(video);
}
