import { initNeonScene, setActiveBrand } from "./three-scene.js";

// Only enable the fixed full-page layout after the scroll controller has loaded.
// This keeps the document normally scrollable if JavaScript is unavailable.
document.documentElement.classList.add("js");

const sections = Array.from(document.querySelectorAll(".panel"));
const navRail = document.querySelector("#section-nav");
const currentLabel = document.querySelector("#current-section");
const totalLabel = document.querySelector("#total-sections");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeIndex = 0;
let navigationLocked = false;
let scrollFrame = 0;
let unlockTimer = 0;
let transitionTimer = 0;
let activationTimer = 0;
let touchStartY = null;
let updateSceneBrand = setActiveBrand;
const VORTEX_DURATION = 1400;

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return [
    (number >> 16) & 255,
    (number >> 8) & 255,
    number & 255,
  ].join(", ");
}

function sectionNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function buildNavigation() {
  const fragment = document.createDocumentFragment();

  sections.forEach(function (section, index) {
    const button = document.createElement("button");
    button.className = "section-nav__item";
    button.type = "button";
    button.setAttribute("aria-label", "Go to " + section.dataset.title);
    button.dataset.index = String(index);
    button.addEventListener("click", function () {
      goToSection(index);
    });
    fragment.appendChild(button);
  });

  navRail.appendChild(fragment);
  totalLabel.textContent = String(sections.length).padStart(2, "0");
}

function updateActiveSection(index) {
  if (index < 0 || index >= sections.length) {
    return;
  }

  activeIndex = index;
  const section = sections[index];
  const color = section.dataset.color;
  const side = section.dataset.side;

  document.body.dataset.activeSection = String(index);
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--accent-rgb", hexToRgb(color));
  document.documentElement.style.setProperty(
    "--glow-x",
    side === "right" ? "74%" : side === "left" ? "26%" : "50%",
  );

  sections.forEach(function (item, itemIndex) {
    item.classList.toggle("is-active", itemIndex === index);
    item.setAttribute("aria-hidden", String(itemIndex !== index));
    item.inert = itemIndex !== index;
  });

  Array.from(navRail.children).forEach(function (button, buttonIndex) {
    const selected = buttonIndex === index;
    button.classList.toggle("is-active", selected);
    if (selected) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  currentLabel.textContent = sectionNumber(index);
  document.title =
    (index === 0 ? "Social Signal 09" : section.dataset.title) +
    " — Signal 09";

  updateSceneBrand({
    name: section.dataset.brand,
    color: color,
    side: side,
    index: index,
  });
}

function lockNavigation(duration) {
  navigationLocked = true;
  window.clearTimeout(unlockTimer);
  unlockTimer = window.setTimeout(function () {
    navigationLocked = false;
  }, duration);
}

function goToSection(index, behavior) {
  const destination = Math.max(0, Math.min(index, sections.length - 1));
  if (destination === activeIndex || navigationLocked) {
    return;
  }

  const previous = sections[activeIndex];
  const next = sections[destination];
  const direction = destination > activeIndex ? "forward" : "backward";

  if (reduceMotion.matches || behavior === "auto") {
    updateActiveSection(destination);
    lockNavigation(150);
    return;
  }

  lockNavigation(VORTEX_DURATION);
  document.body.classList.add("is-vortex-transitioning");
  previous.classList.add("is-vortex-out", "is-vortex-out--" + direction);
  next.classList.add("is-vortex-in", "is-vortex-in--" + direction);

  // Keep the outgoing section's colour and WebGL scene in place until the
  // transition is almost fully dark. This prevents the next section from
  // visually popping in before its fade-in begins.
  window.clearTimeout(activationTimer);
  activationTimer = window.setTimeout(function () {
    updateActiveSection(destination);
  }, Math.round(VORTEX_DURATION * 0.52));

  window.clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(function () {
    previous.classList.remove(
      "is-vortex-out",
      "is-vortex-out--forward",
      "is-vortex-out--backward",
    );
    next.classList.remove(
      "is-vortex-in",
      "is-vortex-in--forward",
      "is-vortex-in--backward",
    );
    document.body.classList.remove("is-vortex-transitioning");
  }, VORTEX_DURATION);
}

function findNearestSection() {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  sections.forEach(function (section, index) {
    const distance = Math.abs(section.getBoundingClientRect().top);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  if (nearestIndex !== activeIndex) {
    updateActiveSection(nearestIndex);
  }
}

function onScroll() {
  if (scrollFrame) {
    return;
  }

  scrollFrame = window.requestAnimationFrame(function () {
    findNearestSection();
    scrollFrame = 0;
  });
}

function onWheel(event) {
  if (event.ctrlKey || Math.abs(event.deltaY) < 6) {
    return;
  }

  event.preventDefault();
  if (navigationLocked) {
    return;
  }

  const direction = event.deltaY > 0 ? 1 : -1;
  goToSection(activeIndex + direction);
}

function onKeyDown(event) {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.target instanceof HTMLSelectElement
  ) {
    return;
  }

  const nextKeys = ["ArrowDown", "PageDown"];
  const previousKeys = ["ArrowUp", "PageUp"];

  if (nextKeys.includes(event.key) || (event.key === " " && !event.shiftKey)) {
    event.preventDefault();
    if (!navigationLocked) {
      goToSection(activeIndex + 1);
    }
  } else if (
    previousKeys.includes(event.key) ||
    (event.key === " " && event.shiftKey)
  ) {
    event.preventDefault();
    if (!navigationLocked) {
      goToSection(activeIndex - 1);
    }
  } else if (event.key === "Home") {
    event.preventDefault();
    goToSection(0);
  } else if (event.key === "End") {
    event.preventDefault();
    goToSection(sections.length - 1);
  }
}

function initialSectionIndex() {
  if (!window.location.hash) {
    return 0;
  }

  const index = sections.findIndex(function (section) {
    return "#" + section.id === window.location.hash;
  });
  return index >= 0 ? index : 0;
}

buildNavigation();

document.addEventListener("wheel", onWheel, { passive: false });
document.addEventListener("keydown", onKeyDown);

document.addEventListener(
  "touchstart",
  function (event) {
    touchStartY = event.touches.length === 1 ? event.touches[0].clientY : null;
  },
  { passive: true },
);

document.addEventListener(
  "touchend",
  function (event) {
    if (touchStartY === null || !event.changedTouches.length) {
      return;
    }
    const distance = touchStartY - event.changedTouches[0].clientY;
    touchStartY = null;
    if (Math.abs(distance) >= 45 && !navigationLocked) {
      goToSection(activeIndex + (distance > 0 ? 1 : -1));
    }
  },
  { passive: true },
);

document.querySelector("[data-scroll-next]").addEventListener("click", function () {
  goToSection(1);
});

document.querySelector("[data-scroll-start]").addEventListener("click", function () {
  goToSection(0);
});

document.querySelector(".skip-link").addEventListener("click", function (event) {
  event.preventDefault();
  goToSection(1);
  window.setTimeout(function () {
    document.querySelector("#github .signal-link").focus();
  }, reduceMotion.matches ? 0 : VORTEX_DURATION);
});

const firstIndex = initialSectionIndex();
updateActiveSection(firstIndex);

initNeonScene()
  .catch(function (error) {
    document.body.classList.add("no-webgl");
    console.warn("The neon WebGL scene could not start.", error);
  });
