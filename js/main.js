(function () {
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  var typeEl = document.getElementById("type");
  if (typeEl) {
    var roles = [
      "custom bpe tokenizer · rust + pyo3",
      "temporal memory for agents · vlk² · mcp",
      "grounded rag · 936 episodes · qdrant",
      "ai web ide · vfs · npm subsystems",
      "websocket sync · <100ms latency"
    ];
    if (prefersReduced) {
      typeEl.textContent = roles[0];
    } else {
      var roleIndex = 0;
      var charIndex = 0;
      var deleting = false;

      function tick() {
        var role = roles[roleIndex];
        if (deleting) {
          charIndex--;
          if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(tick, 350);
            return;
          }
        } else {
          charIndex++;
          if (charIndex === role.length) {
            deleting = true;
            setTimeout(tick, 2100);
            return;
          }
        }
        typeEl.textContent = role.slice(0, charIndex);
        setTimeout(tick, deleting ? 16 : 34);
      }
      tick();
    }
  }

  var copyBtn = document.querySelector(".copy-btn");
  if (copyBtn && navigator.clipboard) {
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(copyBtn.dataset.copy).then(function () {
        copyBtn.textContent = "copied ✓";
        copyBtn.setAttribute("data-copied", "");
        setTimeout(function () {
          copyBtn.textContent = "copy email";
          copyBtn.removeAttribute("data-copied");
        }, 1600);
      });
    });
  }
})();
