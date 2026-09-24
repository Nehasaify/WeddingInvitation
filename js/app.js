(() => {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  const track = document.getElementById("track");
  const titleEl = document.getElementById("pageTitle");
  const pages = Array.from(document.querySelectorAll(".page"));
  const order = ["home", "venue", "rituals", "dress", "timeline", "rsvp"];
  const titles = { home: "Shubh Vivah", venue: "Venue", rituals: "Rituals", dress: "Dress Code", timeline: "Timeline", rsvp: "RSVP" };

  let current = 0;
  let navLock = false;

  const showPage = (key) => {
    const i = order.indexOf(key);
    if (i < 0) return;
    const dir = i > current ? -1 : 1;
    current = i;
    gsap.to(track, {
      xPercent: -i * 100,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => {
        navLock = false;
        ScrollTrigger.refresh();
      },
    });
    gsap.to(".viewport", { scaleX: 1, opacity: 1, duration: 0.55, ease: "power3.inOut", overwrite: "auto" });
    setActiveNav(key);
    animateTitle(titles[key]);
    introCurrent(key);
  };

  const setActiveNav = (key) => {
    document.querySelectorAll(".tab").forEach(t => {
      const on = t.dataset.nav === key;
      t.classList.toggle("is-active", on);
      if (on) {
        const ic = t.querySelector(".tab-ic");
        gsap.fromTo(ic, { scale: 0.4 }, { scale: 1, duration: 0.5, ease: "back.out(2.4)", overwrite: true });
      }
    });
  };

  const animateTitle = (text) => {
    gsap.to(titleEl, {
      y: -16, opacity: 0, duration: 0.22, ease: "power2.in",
      overwrite: "auto",
      onComplete: () => {
        titleEl.textContent = text;
        gsap.fromTo(titleEl, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "power2.out" });
      },
    });
  };

  const introCurrent = (idx) => {
    const page = pages[idx];
    if (idx === 0) return;
    const head = Array.from(page.querySelectorAll(".phead > *"));
    if (!head.length) return;
    gsap.fromTo(head, { y: 22, opacity: 0, stagger: 0.06 }, {
      y: 0, opacity: 1, duration: 0.5, ease: "power2.out", overwrite: "auto",
    });
  };

  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (navLock) return;
      closeDrawer();
      showPage(btn.dataset.nav);
    });
  });

  let startX = 0, startY = 0, startT = 0, swiping = false;

  track.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button, iframe, .drawer")) return;
    swiping = true;
    startX = e.clientX;
    startY = e.clientY;
    startT = performance.now();
    try { track.setPointerCapture(e.pointerId); } catch (_) {}
  });

  track.addEventListener("pointerup", (e) => {
    if (!swiping) return;
    swiping = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const dt = performance.now() - startT;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) || dt > 500) return;
    if (dx < 0 && current < order.length - 1) showPage(order[current + 1]);
    if (dx > 0 && current > 0) showPage(order[current - 1]);
  });

  track.addEventListener("pointercancel", () => { swiping = false; });
  track.addEventListener("pointermove", (e) => {
    if (!swiping) return;
    if (Math.abs(e.clientY - startY) > Math.abs(e.clientX - startX) + 12) swiping = false;
  });

  const drawer = document.getElementById("drawer");
  const scrim = document.getElementById("scrim");
  const menuBtn = document.getElementById("menuBtn");
  let drawerOpen = false;

  const openDrawer = () => {
    drawerOpen = true;
    scrim.hidden = false;
    menuBtn.classList.add("is-open");
    menuBtn.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    gsap.to(scrim, { opacity: 1, duration: 0.25 });
    gsap.to(drawer, { x: "0%", duration: 0.4, ease: "power3.out" });
    gsap.fromTo(drawer.querySelectorAll(".drawer-link"),
      { x: 36, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay: 0.12, ease: "power2.out" });
  };

  const closeDrawer = () => {
    if (!drawerOpen) return;
    drawerOpen = false;
    menuBtn.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    gsap.set(drawer.querySelectorAll(".drawer-link"), { clearProps: "transform,opacity" });
    gsap.to(drawer, { x: "102%", duration: 0.32, ease: "power3.in" });
    gsap.to(scrim, { opacity: 0, duration: 0.3, onComplete: () => { scrim.hidden = true; } });
  };

  menuBtn.addEventListener("click", () => (drawerOpen ? closeDrawer() : openDrawer()));
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeDrawer(); }
    if (e.key === "ArrowRight" && current < order.length - 1) showPage(order[current + 1]);
    if (e.key === "ArrowLeft" && current > 0) showPage(order[current - 1]);
  });

  const saveBtn = document.getElementById("saveBtn");
  saveBtn.addEventListener("click", () => {
    const saved = saveBtn.classList.toggle("is-saved");
    saveBtn.setAttribute("aria-pressed", String(saved));
    saveBtn.querySelector("span").textContent = saved ? "Date Saved!" : "Save the Date";
    gsap.fromTo(saveBtn, { scale: 1.14 }, { scale: 1, duration: 0.5, ease: "back.out(2)", overwrite: true });
  });

  const rsvpForm = document.getElementById("rsvpForm");
  const rsvpNote = document.getElementById("rsvpNote");
  const WHATSAPP_NUMBER = "918417950012";

  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("rsvpName").value.trim();
    const attend = document.querySelector('input[name="attend"]:checked').value;
    const msg = document.getElementById("rsvpMsg").value.trim();
    if (!name) {
      document.getElementById("rsvpName").focus();
      return;
    }
    const attendLabel = attend === "yes" ? "Joyfully Accepts" : "Regretfully Declines";
    const text = encodeURIComponent(
      `*RSVP - Shweta & Dr. Narendra Wedding*\n\nName: ${name}\nAttendance: ${attendLabel}` +
      (msg ? `\nMessage: ${msg}` : "")
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    rsvpForm.classList.add("is-sent");
    rsvpNote.hidden = false;
    rsvpForm.reset();
    gsap.fromTo(rsvpNote, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", overwrite: "auto" });
  });

  const heroTl = gsap.timeline({ delay: 0.15 });
  heroTl.paused(true);
  heroTl
    .from(".inv-art", { opacity: 0, scale: 0.94, duration: 1.3, ease: "power2.out" })
    .from(".inv-texture", { opacity: 0, duration: 0.8 }, "-=1.1")
    .from(".kicker", { y: 18, opacity: 0, duration: 0.6 }, "-=0.9")
    .from(".couple", { y: 26, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.35")
    .from(".inv-bottom .divider", { scaleX: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "power2.out" }, "-=0.45")
    .from(".invite", { y: 16, opacity: 0, duration: 0.6 }, "-=0.35")
    .from(".inv-ceremony", { y: 14, opacity: 0, duration: 0.5 }, "-=0.3")
    .from(".inv-date", { y: 12, opacity: 0, duration: 0.5 }, "-=0.3")
    .from(".inv-venue", { y: 12, opacity: 0, duration: 0.5 }, "-=0.3")
    .from(".inv-rsvp", { y: 12, opacity: 0, duration: 0.5 }, "-=0.3")
    .from(".save-btn", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
    .from(".scroll-cue", { opacity: 0, y: 10, duration: 0.5 }, "-=0.25");

  const splash = document.getElementById("splash");
  splash.addEventListener("click", () => {
    splash.classList.add("done");
    heroTl.play();
    gsap.to(splash, {
      opacity: 0,
      scale: 1.06,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => splash.remove(),
    });
  });

  document.querySelectorAll(".petal-float i").forEach((el, i) => {
    gsap.fromTo(el,
      { y: -24, opacity: 0, rotation: 24 },
      {
        y: () => window.innerHeight * (0.55 + i * 0.12),
        opacity: 0.75,
        rotation: 90,
        duration: 5 + i * 1.1,
        delay: i * 0.6,
        repeat: -1,
        repeatRefresh: true,
        ease: "sine.inOut",
      });
  });

  document.querySelectorAll(".page .reveal").forEach((el) => {
    const page = el.closest(".page");
    gsap.fromTo(el, { opacity: 0, y: 36 }, {
      opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        scroller: page,
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    });
  });

  ScrollTrigger.create({
    scroller: pages[0],
    trigger: ".hero",
    start: "top top",
    onUpdate: (self) => {
      const p = self.progress;
      gsap.to(".scroll-cue", { opacity: 1 - p * 2.2, duration: 0.1, overwrite: "auto" });
    },
  });

  ScrollTrigger.refresh();

  const cdBox = document.querySelector(".countdown");
  const cdParts = {
    days: document.getElementById("cdDays"),
    hours: document.getElementById("cdHours"),
    mins: document.getElementById("cdMins"),
    secs: document.getElementById("cdSecs"),
  };
  const WEDDING_DAY = new Date("2026-12-05T00:00:00").getTime();
  const pad = (n) => String(n).padStart(2, "0");

  if (cdBox && cdParts.days) {
    const tick = () => {
      const diff = WEDDING_DAY - Date.now();
      if (diff <= 0) {
        cdBox.innerHTML = "<p class=\"cd-done\">Today's the day!</p>";
        clearInterval(timer);
        return;
      }
      cdParts.days.textContent = pad(Math.floor(diff / 86400000));
      cdParts.hours.textContent = pad(Math.floor(diff % 86400000 / 3600000));
      cdParts.mins.textContent = pad(Math.floor(diff % 3600000 / 60000));
      cdParts.secs.textContent = pad(Math.floor(diff % 60000 / 1000));
    };
    const timer = setInterval(tick, 1000);
    tick();
  }
})();