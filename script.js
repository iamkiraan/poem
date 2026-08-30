/* ==========================================================================
   अनकहा (Ankaha) — Kiran Acharya, poetry portfolio
   script.js
   ==========================================================================
   Everything here reads from the POEMS / CATEGORIES arrays defined in
   poems.js. Sections:
   1.  Setup & shared state
   2.  Page loader
   3.  Theme switcher (dark/light, saved in localStorage)
   4.  Scroll progress + navbar state + active link highlighting
   5.  Mobile hamburger menu
   6.  Hero tagline type/reveal animation
   7.  Ambient firefly canvas
   8.  Poems grid: render, search, filter
   9.  Reading modal: open/close, prev/next, progress
   10. Featured Words rotation
   11. Random line strip
   12. Surprise Me button
   13. Scroll-reveal (IntersectionObserver)
   ========================================================================== */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. SHARED STATE ---------- */
  let activeFilter = "All";
  let activeSearch = "";
  let filteredPoems = [...POEMS];
  let modalIndex = 0; // index into `filteredPoems` currently open in the modal

  /* ================================================================
     2. PAGE LOADER
     ================================================================ */
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    setTimeout(() => loader.classList.add("is-hidden"), 350);
  });

  /* ================================================================
     3. THEME SWITCHER
     ================================================================ */
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("ankaha-theme");

  if (savedTheme === "light") root.setAttribute("data-theme", "light");

  themeToggle.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    if (isLight) {
      root.removeAttribute("data-theme");
      localStorage.setItem("ankaha-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem("ankaha-theme", "light");
    }
  });

  /* ================================================================
     4. SCROLL PROGRESS + NAVBAR + ACTIVE LINK
     ================================================================ */
  const progressFill = document.querySelector("#scroll-progress span");
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const sectionEls = ["home", "about", "poems", "featured", "random"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressFill.style.width = `${docHeight > 0 ? (scrollTop / docHeight) * 100 : 0}%`;
    navbar.classList.toggle("is-scrolled", scrollTop > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        document.querySelectorAll("[data-section]").forEach((link) => {
          link.classList.toggle("is-active", link.dataset.section === id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sectionEls.forEach((el) => sectionObserver.observe(el));

  // close mobile menu after any nav click
  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeMobileMenu());
  });

  /* ================================================================
     5. MOBILE HAMBURGER MENU
     ================================================================ */
  const hamburger = document.getElementById("hamburger");
  const navLinksList = document.getElementById("nav-links");

  function closeMobileMenu() {
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    navLinksList.classList.remove("is-open");
  }

  hamburger.addEventListener("click", () => {
    const isOpen = navLinksList.classList.toggle("is-open");
    hamburger.classList.toggle("is-open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  /* ================================================================
     6. HERO TAGLINE REVEAL
     ================================================================ */
  const taglineEl = document.getElementById("hero-tagline");
  const taglineText = "Some feelings were never meant to be spoken. So I wrote them.";

  function typeTagline() {
    if (prefersReducedMotion) {
      taglineEl.textContent = taglineText;
      return;
    }
    let i = 0;
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    function step() {
      taglineEl.textContent = taglineText.slice(0, i);
      taglineEl.appendChild(cursor);
      i++;
      if (i <= taglineText.length) {
        setTimeout(step, 28);
      }
    }
    step();
  }
  setTimeout(typeTagline, 1400);

  /* ================================================================
     7. AMBIENT FIREFLY CANVAS
     ================================================================ */
  const canvas = document.getElementById("firefly-canvas");
  const ctx = canvas.getContext("2d");
  let fireflies = [];
  let mouse = { x: 0, y: 0 };

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function makeFireflies() {
    const count = prefersReducedMotion ? 0 : Math.min(60, Math.floor(canvas.offsetWidth / 22));
    fireflies = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 1.4 + 0.5,
      baseX: 0,
      baseY: 0,
      drift: Math.random() * 0.3 + 0.08,
      angle: Math.random() * Math.PI * 2,
      twinkle: Math.random() * Math.PI * 2,
    })).map((f) => ({ ...f, baseX: f.x, baseY: f.y }));
  }

  function accentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#C9A76A";
  }

  function drawFireflies() {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    const color = accentColor();
    const parallaxX = (mouse.x - canvas.offsetWidth / 2) * 0.012;
    const parallaxY = (mouse.y - canvas.offsetHeight / 2) * 0.012;

    fireflies.forEach((f) => {
      f.angle += 0.003;
      f.twinkle += 0.02;
      const x = f.baseX + Math.cos(f.angle) * 18 * f.drift + parallaxX;
      const y = f.baseY + Math.sin(f.angle * 0.8) * 14 * f.drift + parallaxY;
      const alpha = (Math.sin(f.twinkle) + 1) / 2 * 0.55 + 0.15;

      ctx.beginPath();
      ctx.arc(x, y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, alpha);
      ctx.fill();
    });

    requestAnimationFrame(drawFireflies);
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace("#", "");
    const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  if (canvas) {
    resizeCanvas();
    makeFireflies();
    window.addEventListener("resize", () => { resizeCanvas(); makeFireflies(); });
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    requestAnimationFrame(drawFireflies);
  }

  /* ================================================================
     8. POEMS GRID — render, search, filter
     ================================================================ */
  const grid = document.getElementById("poems-grid");
  const emptyMsg = document.getElementById("poems-empty");
  const searchInput = document.getElementById("poem-search");
  const chipsWrap = document.getElementById("filter-chips");

  // build the category chips from CATEGORIES (poems.js)
  CATEGORIES.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.category = cat;
    chip.textContent = cat;
    chipsWrap.appendChild(chip);
  });

  function renderPoems() {
    filteredPoems = POEMS.filter((p) => {
      const matchesCategory = activeFilter === "All" || p.category === activeFilter;
      const haystack = `${p.title} ${p.preview} ${p.content} ${p.category}`.toLowerCase();
      const matchesSearch = haystack.includes(activeSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    grid.innerHTML = "";
    emptyMsg.hidden = filteredPoems.length !== 0;

    filteredPoems.forEach((poem, i) => {
      const card = document.createElement("article");
      card.className = "poem-card";
      card.style.transitionDelay = `${Math.min(i, 8) * 45}ms`;
      card.innerHTML = `
        <span class="card-tag">${poem.category}</span>
        <h3 class="card-title">${poem.title}</h3>
        <p class="card-preview">${poem.preview}</p>
        <span class="card-read">
          Read poem
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>`;
      card.addEventListener("click", () => openModal(filteredPoems.findIndex((p) => p.id === poem.id)));
      grid.appendChild(card);
      cardObserver.observe(card);
    });
  }

  const cardObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  searchInput.addEventListener("input", (e) => {
    activeSearch = e.target.value.trim();
    renderPoems();
  });

  chipsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    activeFilter = btn.dataset.category;
    chipsWrap.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === btn));
    renderPoems();
  });

  renderPoems();

  /* ================================================================
     9. READING MODAL
     ================================================================ */
  const modal = document.getElementById("poem-modal");
  const modalScroll = document.getElementById("modal-scroll");
  const modalTitle = document.getElementById("modal-title");
  const modalTag = document.getElementById("modal-tag");
  const modalBody = document.getElementById("modal-body");
  const modalCount = document.getElementById("modal-count");
  const modalPrev = document.getElementById("modal-prev");
  const modalNext = document.getElementById("modal-next");
  const modalProgressFill = document.getElementById("modal-progress-fill");
  const modalClose = document.getElementById("modal-close");

  let modalPoemList = POEMS; // the pool prev/next navigates through
  let lastFocusedEl = null;

  function openModal(index, poemList = filteredPoems.length ? filteredPoems : POEMS) {
    modalPoemList = poemList;
    modalIndex = index;
    fillModal();
    lastFocusedEl = document.activeElement;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function fillModal() {
    const poem = modalPoemList[modalIndex];
    if (!poem) return;
    modalTag.textContent = poem.category;
    modalTitle.textContent = poem.title;
    modalBody.textContent = poem.content;
    modalCount.textContent = `${modalIndex + 1} / ${modalPoemList.length}`;
    modalPrev.disabled = modalIndex === 0;
    modalNext.disabled = modalIndex === modalPoemList.length - 1;
    modalScroll.scrollTop = 0;
    modalProgressFill.style.width = "0%";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight" && !modalNext.disabled) navModal(1);
    if (e.key === "ArrowLeft" && !modalPrev.disabled) navModal(-1);
  });

  function navModal(dir) {
    modalIndex = Math.min(Math.max(modalIndex + dir, 0), modalPoemList.length - 1);
    fillModal();
  }
  modalPrev.addEventListener("click", () => navModal(-1));
  modalNext.addEventListener("click", () => navModal(1));

  modalScroll.addEventListener("scroll", () => {
    const max = modalScroll.scrollHeight - modalScroll.clientHeight;
    const pct = max > 0 ? (modalScroll.scrollTop / max) * 100 : 100;
    modalProgressFill.style.width = `${pct}%`;
  });

  /* ================================================================
     10. FEATURED WORDS ROTATION
     ================================================================ */
  const featuredTag = document.getElementById("featured-tag");
  const featuredQuote = document.getElementById("featured-quote");
  const featuredTitle = document.getElementById("featured-title");
  const featuredBody = document.querySelector(".featured-body");
  const featuredReadBtn = document.getElementById("featured-read-btn");

  let featuredIndex = Math.floor(Math.random() * POEMS.length);

  function firstLines(poem, count = 3) {
    return poem.content.split("\n").filter(Boolean).slice(0, count).join("\n");
  }

  function paintFeatured() {
    const poem = POEMS[featuredIndex];
    featuredTag.textContent = poem.category;
    featuredQuote.textContent = firstLines(poem);
    featuredTitle.textContent = `— from "${poem.title}"`;
  }

  function rotateFeatured() {
    featuredBody.classList.add("is-fading");
    setTimeout(() => {
      featuredIndex = (featuredIndex + 1) % POEMS.length;
      paintFeatured();
      featuredBody.classList.remove("is-fading");
    }, 400);
  }

  paintFeatured();
  featuredReadBtn.addEventListener("click", () => openModal(featuredIndex, POEMS));
  if (!prefersReducedMotion && POEMS.length > 1) {
    setInterval(rotateFeatured, 9000);
  }

  /* ================================================================
     11. RANDOM LINE STRIP
     ================================================================ */
  const lineEl = document.getElementById("random-line");

  function paintRandomLine() {
    const poem = POEMS[Math.floor(Math.random() * POEMS.length)];
    const lines = poem.content.split("\n").filter((l) => l.trim().length > 8);
    const line = lines[Math.floor(Math.random() * lines.length)] || poem.preview;
    lineEl.classList.add("is-fading");
    setTimeout(() => {
      lineEl.textContent = `“${line.trim()}”`;
      lineEl.classList.remove("is-fading");
    }, 250);
  }
  paintRandomLine();

  /* ================================================================
     12. SURPRISE ME
     ================================================================ */
  document.getElementById("surprise-btn").addEventListener("click", () => {
    const index = Math.floor(Math.random() * POEMS.length);
    openModal(index, POEMS);
  });

  /* ================================================================
     13. SCROLL REVEAL
     ================================================================ */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal-on-scroll").forEach((el) => revealObserver.observe(el));
})();