const header = document.querySelector("[data-site-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-site-nav]");

const closeNavigation = () => {
  if (!navToggle || !nav) return;
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("is-open", open);
});

nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeNavigation();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-site-nav], [data-nav-toggle]")) {
    closeNavigation();
  }
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
