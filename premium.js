(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer:fine)").matches;
  const gsapReady = !!(window.gsap && window.ScrollTrigger);
  document.documentElement.dataset.motionEngine = gsapReady ? "gsap" : "native";

  function addParticles(hero) {
    if (reduced || hero.querySelector(".studio-particles")) return;
    const canvas = document.createElement("canvas");
    canvas.className = "studio-particles";
    hero.prepend(canvas);
    const ctx = canvas.getContext("2d");
    let width = 0, height = 0, ratio = 1, frame = 0;
    const particles = [];

    function resize() {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles.length = 0;
      const count = Math.min(64, Math.max(28, Math.floor(width / 22)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - .5) * .18,
          vy: (Math.random() - .5) * .15,
          r: Math.random() * 1.5 + .35,
          a: Math.random() * .45 + .12,
          gold: Math.random() > .18
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        ctx.beginPath();
        ctx.fillStyle = p.gold ? `rgba(240,199,94,${p.a})` : `rgba(185,128,50,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    }

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    addEventListener("pagehide", () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    }, { once: true });
  }

  document.querySelectorAll(".hero").forEach(addParticles);

  function themeCharts() {
    if (!window.Chart) return;
    const muted = "#c4c8d0";
    const grid = "rgba(255,255,255,.085)";
    const piePalette = [
      "#f0c75e",
      "#d9a441",
      "#b98032",
      "#f3d98a",
      "#8f6a2d",
      "#d47b37",
      "#c7aa6a",
      "#9d7840",
      "#e8bd72",
      "#a86e2d"
    ];
    Chart.defaults.color = muted;
    Chart.defaults.borderColor = grid;
    const instances = Chart.instances ? Object.values(Chart.instances) : [];
    instances.forEach(chart => {
      const options = chart.options || {};
      if (options.plugins?.legend?.labels) options.plugins.legend.labels.color = muted;
      if (options.scales) {
        Object.values(options.scales).forEach(scale => {
          scale.ticks = { ...(scale.ticks || {}), color: muted };
          if (scale.title) scale.title.color = muted;
          scale.grid = { ...(scale.grid || {}), color: grid };
          scale.border = { ...(scale.border || {}), color: grid };
        });
      }
      (chart.data?.datasets || []).forEach(dataset => {
        if (chart.config?.type === "doughnut" || chart.config?.type === "pie") {
          dataset.backgroundColor = (dataset.data || []).map((_, index) => piePalette[index % piePalette.length]);
          dataset.borderColor = "#11141a";
          dataset.borderWidth = 3;
          dataset.hoverBorderColor = "#f7f4ec";
          dataset.hoverBorderWidth = 2;
        }
        if (dataset.borderColor === "#FAF8F3" || dataset.borderColor === "#FDFCF9") {
          dataset.borderColor = "#11141a";
        }
      });
      chart.update("none");
    });
  }
  themeCharts();
  setTimeout(themeCharts, 80);

  const nav = document.querySelector(".header, body > nav");
  const updateNav = () => nav?.classList.toggle("is-compact", scrollY > 48);
  updateNav();
  addEventListener("scroll", updateNav, { passive: true });

  const revealTargets = document.querySelectorAll(
    "section .section-header, .section, .m-card, .c-card, .chart-card, .analysis-card, .ana-block, .insight-card, .top-card, .stat-card, .card, .holding-card, .tbl-wrap, .table-wrap, footer"
  );
  revealTargets.forEach(element => element.classList.add("studio-reveal"));

  if (gsapReady && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(revealTargets, { opacity: 0, y: 54, scale: .975 });
    revealTargets.forEach((element, index) => {
      gsap.to(element, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: .95,
        delay: (index % 4) * .035,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true
        },
        onStart: () => element.classList.add("is-visible")
      });
    });

    document.querySelectorAll("section").forEach((section, index) => {
      if (index === 0) return;
      section.classList.add("studio-parallax");
      gsap.fromTo(section,
        { backgroundPositionY: "0px" },
        {
          backgroundPositionY: "-70px",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: .6
          }
        }
      );
    });

    const hero = document.querySelector(".hero");
    if (hero) {
      const heroContent = hero.querySelector(".hero-inner") || hero;
      gsap.from(heroContent.children, {
        opacity: 0,
        y: 46,
        duration: 1.05,
        stagger: .11,
        ease: "power3.out",
        delay: .12
      });
      gsap.to(heroContent, {
        yPercent: 12,
        opacity: .72,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: .65
        }
      });
    }
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: "0px 0px -5% 0px" });
    revealTargets.forEach(element => observer.observe(element));
  }

  const tiltCards = document.querySelectorAll(
    ".m-card, .c-card, .chart-card, .analysis-card, .ana-block, .insight-card, .top-card, .stat-card, .card, .holding-card"
  );
  if (finePointer && !reduced) {
    tiltCards.forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--card-x", `${px * 100}%`);
        card.style.setProperty("--card-y", `${py * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 4}deg) rotateY(${(px - 0.5) * 5}deg) translateY(-7px)`;
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      }, { passive: true });
    });
  }

  document.querySelectorAll(".f-btn, .dl-btn, button[onclick^='download_'], .tab-btn").forEach(control => {
    control.addEventListener("pointerdown", event => {
      if (reduced) return;
      const rect = control.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 1.8;
      ripple.className = "studio-ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      control.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  });
})();
