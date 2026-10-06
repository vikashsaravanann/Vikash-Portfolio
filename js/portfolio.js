(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  root.classList.add("js-enabled");
  const header = document.querySelector(".site-header");
  const menu = document.querySelector("#menu-toggle");
  const nav = document.querySelector("#site-nav");
  const closeMenu = (restoreFocus = false) => {
    menu?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
    if (restoreFocus) menu?.focus();
  };
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav?.classList.toggle("is-open", open);
  });
  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!nav?.contains(event.target) && !menu?.contains(event.target))
      closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menu?.getAttribute("aria-expanded") === "true"
    )
      closeMenu(true);
  });
  matchMedia("(min-width: 681px)").addEventListener("change", () =>
    closeMenu(),
  );
  let paused = reduced.matches;
  try {
    paused ||= localStorage.getItem("portfolio-motion") === "paused";
  } catch {
    /* Optional preference storage. */
  }
  const motionButton = document.querySelector("#motion-toggle");
  const applyMotion = () => {
    root.classList.toggle("motion-paused", paused || reduced.matches);
    if (motionButton) {
      motionButton.hidden = false;
      motionButton.textContent =
        paused || reduced.matches ? "Animations paused" : "Pause animations";
      motionButton.setAttribute(
        "aria-pressed",
        String(paused || reduced.matches),
      );
      motionButton.disabled = reduced.matches;
      motionButton.title = reduced.matches
        ? "Following your reduced-motion preference"
        : "Toggle decorative motion";
    }
  };
  applyMotion();
  motionButton?.addEventListener("click", () => {
    paused = !paused;
    try {
      localStorage.setItem("portfolio-motion", paused ? "paused" : "on");
    } catch {
      /* Optional. */
    }
    applyMotion();
  });
  reduced.addEventListener("change", () => {
    paused = reduced.matches;
    applyMotion();
  });
  const reveals = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && !reduced.matches && !paused) {
    root.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06 },
    );
    reveals.forEach((element) => observer.observe(element));
  }
  const links = [...document.querySelectorAll('[data-nav][href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  let frame = 0;
  const updateScroll = () => {
    const scrollable = root.scrollHeight - innerHeight;
    root.style.setProperty(
      "--progress",
      scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0,
    );
    header?.classList.toggle("is-scrolled", scrollY > 20);
    const current = sections
      .filter((section) => section.getBoundingClientRect().top <= 180)
      .at(-1);
    links.forEach((link) => {
      if (current && link.hash === "#" + current.id)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    frame = 0;
  };
  addEventListener(
    "scroll",
    () => {
      if (!frame) frame = requestAnimationFrame(updateScroll);
    },
    { passive: true },
  );
  addEventListener("resize", updateScroll);
  updateScroll();
  const portrait = document.querySelector(".portrait-stage");
  let portraitFrame = 0;
  const resetPortrait = () => {
    cancelAnimationFrame(portraitFrame);
    portraitFrame = 0;
    portrait?.style.setProperty("--pointer-x", "0px");
    portrait?.style.setProperty("--pointer-y", "0px");
  };
  portrait?.addEventListener("pointermove", (event) => {
    if (paused || reduced.matches || !finePointer.matches || portraitFrame)
      return;
    const bounds = portrait.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 14;
    portraitFrame = requestAnimationFrame(() => {
      portrait.style.setProperty("--pointer-x", `${x}px`);
      portrait.style.setProperty("--pointer-y", `${y}px`);
      portraitFrame = 0;
    });
  });
  portrait?.addEventListener("pointerleave", resetPortrait);
  reduced.addEventListener("change", resetPortrait);
  motionButton?.addEventListener("click", resetPortrait);
  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    button.addEventListener("click", async () => {
      const status = document.querySelector("#copy-status");
      const email = "createwithvikash@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        if (status) status.textContent = "Email address copied.";
      } catch {
        if (status) status.textContent = `Copy this address: ${email}`;
      }
    });
  });
  const year = document.querySelector("#copyright-year");
  if (year) year.textContent = new Date().getFullYear();
})();
