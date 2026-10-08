(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover)").matches;

  /* Theme toggle */
  var themeBtn = document.getElementById("theme");
  function themeLabel() {
    themeBtn.textContent = root.dataset.theme === "dark" ? "Light mode" : "Dark mode";
  }
  themeBtn.addEventListener("click", function () {
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    themeLabel();
  });
  themeLabel();

  document.getElementById("year").textContent = new Date().getFullYear();

  /* Mobile menu */
  var menu = document.getElementById("menu");
  var nav = document.getElementById("nav");
  menu.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", open);
    menu.textContent = open ? "Close" : "Menu";
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.textContent = "Menu";
    }
  });

  /* Scroll progress bar and back-to-top button */
  var bar = document.getElementById("progress");
  var totop = document.getElementById("totop");
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    totop.classList.toggle("show", window.scrollY > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  totop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* Highlight the current section in the nav */
  var links = {};
  document.querySelectorAll('nav a[href^="#"]').forEach(function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
        if (links[e.target.id]) links[e.target.id].classList.add("active");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
  }

  /* Toast message */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2000);
  }

  /* Buttons: ripple on click */
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (reduce) return;
      var r = btn.getBoundingClientRect();
      var dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.left = (e.clientX - r.left) + "px";
      dot.style.top = (e.clientY - r.top) + "px";
      btn.appendChild(dot);
      setTimeout(function () { dot.remove(); }, 650);
    });
  });

  /* Buttons: magnetic pull toward the cursor */
  if (fine && !reduce) {
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width * 12;
        var y = (e.clientY - r.top - r.height / 2) / r.height * 12;
        btn.style.translate = x + "px " + y + "px";
      });
      btn.addEventListener("mouseleave", function () { btn.style.translate = ""; });
    });
  }

  /* Copy email buttons with visible feedback */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var original = btn.textContent;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function done() {
        btn.textContent = "Copied";
        btn.classList.add("done");
        showToast("Email copied to clipboard");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("done");
        }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { showToast(text); });
      } else {
        var t = document.createElement("textarea");
        t.value = text;
        document.body.appendChild(t);
        t.select();
        try { document.execCommand("copy"); done(); } catch (e) { showToast(text); }
        t.remove();
      }
    });
  });

  /* Project filters */
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".proj");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-f");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip); });
      cards.forEach(function (card) {
        var show = f === "all" || card.dataset.cat.split(" ").indexOf(f) !== -1;
        card.hidden = !show;
      });
    });
  });

  /* Project cards: glow follows the cursor */
  cards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* Photo: gentle 3D tilt */
  var shot = document.getElementById("shot");
  if (shot && fine && !reduce) {
    shot.addEventListener("mousemove", function (e) {
      var r = shot.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      shot.style.transform = "perspective(800px) rotateY(" + (px * 10) + "deg) rotateX(" + (-py * 10) + "deg)";
    });
    shot.addEventListener("mouseleave", function () { shot.style.transform = ""; });
  }
})();
