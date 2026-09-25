/* Sun Rise Sr. Sec. School — site interactions */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* ---------- Sticky header shadow + back-to-top ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".fab__top");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 10);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Mobile navigation ---------- */
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var closeBtn = document.querySelector(".nav-close");
  var backdrop = document.querySelector(".nav-backdrop");
  function setNav(open) {
    if (!nav) return;
    nav.classList.toggle("is-open", open);
    if (backdrop) backdrop.classList.toggle("is-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () { setNav(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setNav(false); });
  if (backdrop) backdrop.addEventListener("click", function () { setNav(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });

  document.querySelectorAll(".nav__item.has-dropdown > .nav__link").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (window.matchMedia("(max-width: 1024px)").matches) {
        e.preventDefault();
        var item = btn.parentElement;
        var open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (wrap) {
    var btns = wrap.querySelectorAll(".tab-btn");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) {
          var sel = b === btn;
          b.setAttribute("aria-selected", String(sel));
          b.tabIndex = sel ? 0 : -1;
          var panel = document.getElementById(b.getAttribute("aria-controls"));
          if (panel) panel.hidden = !sel;
        });
      });
    });
  });

  /* ---------- Gallery filters ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var target = document.getElementById(group.getAttribute("data-filter-group"));
    if (!target) return;
    group.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".filter-btn").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", String(b === btn));
        });
        var f = btn.getAttribute("data-filter");
        target.querySelectorAll(".g-item").forEach(function (item) {
          item.classList.toggle("is-hidden", f !== "all" && item.getAttribute("data-cat") !== f);
        });
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lightbox__cap");
    var items = [], idx = 0, lastFocus = null;
    function visibleItems() {
      return Array.prototype.filter.call(document.querySelectorAll("[data-lightbox]"), function (el) {
        return !el.classList.contains("is-hidden");
      });
    }
    function show(i) {
      idx = (i + items.length) % items.length;
      var el = items[idx];
      var img = el.querySelector("img");
      lbImg.src = el.getAttribute("data-full") || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
    }
    function open(el) {
      items = visibleItems();
      lastFocus = el;
      show(items.indexOf(el));
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    }
    function close() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll("[data-lightbox]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); open(el); });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Forms → WhatsApp ---------- */
  document.querySelectorAll("form[data-whatsapp]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = [form.getAttribute("data-title") || "Enquiry — Sun Rise Sr. Sec. School"];
      Array.prototype.forEach.call(form.elements, function (f) {
        if (!f.name || !f.value) return;
        var label = form.querySelector('label[for="' + f.id + '"]');
        lines.push((label ? label.textContent.replace("*", "").trim() : f.name) + ": " + f.value.trim());
      });
      var url = "https://wa.me/" + form.getAttribute("data-whatsapp") + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  });

  /* ---------- Academic calendar: highlight the current/next exam ---------- */
  var tl = document.querySelectorAll(".tl-item[data-end]");
  if (tl.length) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    for (var i = 0; i < tl.length; i++) {
      var end = new Date(tl[i].getAttribute("data-end") + "T23:59:59");
      if (end >= today) {
        tl[i].classList.add("is-current");
        var start = new Date(tl[i].getAttribute("data-start") + "T00:00:00");
        var badge = document.createElement("span");
        badge.className = "now";
        badge.textContent = start <= today ? "Ongoing" : "Up next";
        tl[i].appendChild(badge);
        break;
      }
    }
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
