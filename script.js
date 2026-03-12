/* =========================================
   MÉTODO TALLAJ® – script.js
   ========================================= */

(function () {
  "use strict";

  /* ── Mobile menu ────────────────────────── */
  const toggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      mobileNav.setAttribute("aria-hidden", String(!isOpen));
      // Swap icon
      toggle.querySelector(".material-symbols-outlined").textContent = isOpen
        ? "close"
        : "menu";
    });

    // Close on nav-link click (mobile)
    mobileNav.querySelectorAll(".nav-link, .btn").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
        toggle.querySelector(".material-symbols-outlined").textContent = "menu";
      });
    });
  }

  /* ── Header shadow on scroll ────────────── */
  const header = document.getElementById("site-header");
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 20) {
        header.style.boxShadow = "0 4px 24px rgba(11,37,69,.12)";
      } else {
        header.style.boxShadow = "0 1px 12px rgba(0,0,0,.05)";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── Active nav link on scroll ──────────── */
  const sections = document.querySelectorAll("section[id], footer[id]");
  const navLinks = document.querySelectorAll(".main-nav .nav-link");

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle(
                "nav-active",
                link.getAttribute("href") === "#" + entry.target.id,
              );
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ── Scroll-reveal animation ────────────── */
  const revealEls = document.querySelectorAll(
    ".feature-item, .protocol-step, .aesthetics-card, .bio-list li, .leader-grid > *, .section-header",
  );

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealEls.forEach((el, i) => {
      el.classList.add("reveal-init");
      el.style.transitionDelay = (i % 6) * 0.08 + "s";
      revealObserver.observe(el);
    });
  } else {
    // Fallback – show everything immediately
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  /* ── Map pins always visible on desktop ─── */
  function handlePinLabels() {
    const labels = document.querySelectorAll(".pin-label");
    if (window.innerWidth >= 768) {
      labels.forEach((l) => (l.style.opacity = "1"));
    } else {
      labels.forEach((l) => (l.style.opacity = ""));
    }
  }
  handlePinLabels();
  window.addEventListener("resize", handlePinLabels, { passive: true });

  /* ── Contact form submission (Formspree) ── */
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      formStatus.textContent = "";
      formStatus.className = "form-status";

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          formStatus.textContent =
            document.documentElement.lang === "pt-BR"
              ? "✓ Solicitação enviada com sucesso! Entraremos em contato em breve."
              : "✓ ¡Solicitud enviada con éxito! Nos pondremos en contacto pronto.";
          formStatus.classList.add("form-status--ok");
          contactForm.reset();
          if (typeof gtag === "function") {
            gtag("event", "form_submit", {
              event_category: "contact",
              event_label: "solicitar_evaluacion",
            });
          }
        } else {
          throw new Error("server");
        }
      } catch {
        formStatus.textContent =
          document.documentElement.lang === "pt-BR"
            ? "Ocorreu um erro ao enviar. Por favor, tente novamente."
            : "Ocurrió un error al enviar. Por favor, inténtalo de nuevo.";
        formStatus.classList.add("form-status--error");
        submitBtn.disabled = false;
      }
    });
  }

  /* ── GA4 click events ───────────────────── */
  document.querySelectorAll('a[href*="wa.me"]').forEach((el) => {
    el.addEventListener("click", () => {
      if (typeof gtag === "function") {
        gtag("event", "whatsapp_click", {
          event_category: "contact",
          event_label: el.classList.contains("whatsapp-btn") ? "boton_cta" : "topbar",
        });
      }
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
    el.addEventListener("click", () => {
      if (typeof gtag === "function") {
        gtag("event", "phone_click", {
          event_category: "contact",
          event_label: el.textContent.trim(),
        });
      }
    });
  });

  /* ── Language auto-detection ────────────── */
  // Only runs on the root page (PT version), not inside /es/
  const isEsPage = window.location.pathname.includes("/es");
  const alreadyRedirected = sessionStorage.getItem("lang-redirected");

  if (!isEsPage && !alreadyRedirected) {
    const userLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    // Redirect if browser language is Spanish (any region)
    if (userLang.startsWith("es")) {
      sessionStorage.setItem("lang-redirected", "1");
      // Preserve any anchor hash
      const hash = window.location.hash || "";
      window.location.replace("./es/" + hash);
    }
  }
})();
