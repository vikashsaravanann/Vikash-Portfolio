(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js-enabled");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("site-nav");
  const navLinks = [...document.querySelectorAll("[data-nav]")];

  const setMenuOpen = (open, restoreFocus = false) => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
    header?.classList.toggle("is-menu-open", open);
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle?.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (
      menuToggle?.getAttribute("aria-expanded") === "true" &&
      !navigation?.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  // Restore the collapsed state when leaving the mobile layout.
  const desktopLayout = window.matchMedia("(min-width: 861px)");
  desktopLayout.addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false);
  });

  let scrollFrame = 0;
  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 20);
    scrollFrame = 0;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollFrame)
        scrollFrame = window.requestAnimationFrame(updateHeader);
    },
    { passive: true },
  );
  updateHeader();

  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      return href?.startsWith("#")
        ? document.getElementById(href.slice(1))
        : null;
    })
    .filter(Boolean);

  const setActiveSection = (id) => {
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if ("IntersectionObserver" in window && sections.length) {
    const visibleSections = new Set();
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.add(entry.target);
          else visibleSections.delete(entry.target);
        });
        const current = [...visibleSections].sort(
          (a, b) =>
            Math.abs(a.getBoundingClientRect().top - 100) -
            Math.abs(b.getBoundingClientRect().top - 100),
        )[0];
        if (current) setActiveSection(current.id);
        else if (window.scrollY < 100)
          navLinks.forEach((link) => link.removeAttribute("aria-current"));
      },
      { rootMargin: "-15% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  const revealElements = [...document.querySelectorAll(".reveal")];
  let revealObserver;
  const showAll = () => {
    revealObserver?.disconnect();
    root.classList.remove("motion-ready");
    revealElements.forEach((element) => element.classList.add("is-visible"));
  };

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    root.classList.add("motion-ready");
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    showAll();
  }

  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) showAll();
  });

  const email = "vikash07052008@gmail.com";
  const copyStatus = document.getElementById("copy-status");
  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard?.writeText)
          throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(email);
        if (copyStatus)
          copyStatus.textContent =
            "Email address copied. Let’s make something great.";
      } catch {
        if (copyStatus)
          copyStatus.textContent = `Email me at ${email}. Opening your email app…`;
        window.location.href = `mailto:${email}`;
      }
    });
  });

  const certificateDialog = document.getElementById("certificate-dialog");
  const certificateImage = document.getElementById("certificate-image");
  const certificateTitle = document.getElementById("certificate-title");
  const certificateIssuer = document.getElementById("certificate-issuer");
  let certificateTrigger;

  if (
    certificateDialog &&
    typeof certificateDialog.showModal === "function" &&
    certificateImage &&
    certificateTitle &&
    certificateIssuer
  ) {
    document.querySelectorAll("[data-certificate]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        certificateTrigger = link;
        certificateTitle.textContent = link.dataset.title || "Certificate";
        certificateIssuer.textContent = link.dataset.issuer || "";
        certificateImage.src = link.href;
        certificateImage.alt = `${link.dataset.title || "Certificate"}${link.dataset.issuer ? ` — ${link.dataset.issuer}` : ""}`;
        certificateDialog.showModal();
      });
    });
    document
      .getElementById("close-certificate")
      ?.addEventListener("click", () => certificateDialog.close());
    certificateDialog.addEventListener("click", (event) => {
      if (event.target !== certificateDialog) return;
      const bounds = certificateDialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        certificateDialog.close();
      }
    });
    certificateDialog.addEventListener("close", () =>
      certificateTrigger?.focus(),
    );
  }

  const guideToggle = document.getElementById("guide-toggle");
  const guide = document.getElementById("portfolio-guide");
  const guideClose = document.getElementById("guide-close");
  const guideAnswer = document.getElementById("guide-answer");
  const guideAnswers = {
    skills:
      "I work with Python, SQL, React, TypeScript, and Supabase. My interests include prompt engineering, AI automation, computer vision, and building useful web applications. Explore the skills section for more.",
    projects:
      "Start with the About me section to learn about my background, then explore my toolkit and certificates.",
    contact: `I’m open to internship opportunities and collaborations in AI and web development. Say hello at ${email}, or connect with me through the social links in the contact section.`,
  };

  const setGuideOpen = (open, restoreFocus = false) => {
    if (!guide || !guideToggle) return;
    guide.hidden = !open;
    guideToggle.setAttribute("aria-expanded", String(open));
    if (open) guideClose?.focus();
    else if (restoreFocus) guideToggle.focus();
  };

  guideToggle?.addEventListener("click", () => {
    setGuideOpen(guideToggle.getAttribute("aria-expanded") !== "true");
  });
  guideClose?.addEventListener("click", () => setGuideOpen(false, true));
  guide
    ?.querySelector('a[href="#contact"]')
    ?.addEventListener("click", () => setGuideOpen(false));
  document.querySelectorAll("[data-guide-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = guideAnswers[button.dataset.guideTopic];
      if (guideAnswer && answer) guideAnswer.textContent = answer;
      document.querySelectorAll("[data-guide-topic]").forEach((topic) => {
        topic.setAttribute("aria-pressed", String(topic === button));
      });
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || certificateDialog?.open) return;
    if (guideToggle?.getAttribute("aria-expanded") === "true")
      setGuideOpen(false, true);
    else if (menuToggle?.getAttribute("aria-expanded") === "true")
      setMenuOpen(false, true);
  });

  const portrait = document.querySelector(".portrait-stage");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let portraitFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  const resetPortrait = () => {
    window.cancelAnimationFrame(portraitFrame);
    portraitFrame = 0;
    portrait?.style.setProperty("--pointer-x", "0px");
    portrait?.style.setProperty("--pointer-y", "0px");
  };

  portrait?.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const bounds = portrait.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 18;
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 18;
    if (portraitFrame) return;
    portraitFrame = window.requestAnimationFrame(() => {
      portrait.style.setProperty("--pointer-x", `${pointerX.toFixed(2)}px`);
      portrait.style.setProperty("--pointer-y", `${pointerY.toFixed(2)}px`);
      portraitFrame = 0;
    });
  });
  portrait?.addEventListener("pointerleave", resetPortrait);
  reducedMotion.addEventListener("change", resetPortrait);
  finePointer.addEventListener("change", resetPortrait);

  const copyrightYear = document.getElementById("copyright-year");
  if (copyrightYear)
    copyrightYear.textContent = String(new Date().getFullYear());
})();
