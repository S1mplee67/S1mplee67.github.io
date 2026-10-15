/* Self-contained GitHub README quicklook for the captured portfolio. */
(() => {
  "use strict";

  const panelId = "wency-readme-preview";
  let panel;
  let heroButton;
  let currentAnchor;
  let pinned = false;
  let openTimer;
  let closeTimer;
  let scanQueued = false;

  function createPanel() {
    panel = document.createElement("section");
    panel.id = panelId;
    panel.className = "wency-readme-panel";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "GitHub profile README quicklook");
    panel.hidden = true;
    panel.innerHTML = `
      <div class="wency-readme-topbar">
        <span class="wency-readme-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>~/S1mplee67/README.md</span>
        <button type="button" class="wency-readme-close" aria-label="Close README preview">&times;</button>
      </div>
      <div class="wency-readme-body">
        <div class="wency-readme-kicker"><span class="wency-readme-led" aria-hidden="true"></span> PROFILE QUICKLOOK <span class="wency-readme-handle">@S1mplee67</span></div>
        <h3>Wency Miguel D. Valmonte</h3>
        <p class="wency-readme-bio">Fourth-year BS Computer Engineering student at ICCT Colleges, Cainta Campus.</p>
        <div class="wency-readme-tags" aria-label="Focus areas"><span>Group lead</span><span>Backend</span><span>AI &amp; automation: learning</span></div>
        <div class="wency-readme-subtitle"><span aria-hidden="true">#</span> featured builds</div>
        <ul class="wency-readme-projects">
          <li><a href="https://github.com/S1mplee67/5-fingers" target="_blank" rel="noopener noreferrer">5 F!NGERS <span aria-hidden="true">↗</span></a><small>Keyboard and coding practice</small></li>
          <li><a href="https://github.com/S1mplee67/duplicates-by-s1mplee67" target="_blank" rel="noopener noreferrer">Duplicates <span aria-hidden="true">↗</span></a><small>Local image comparison</small></li>
        </ul>
        <a class="wency-readme-full" href="https://github.com/S1mplee67#readme" target="_blank" rel="noopener noreferrer">Read the full GitHub profile <span aria-hidden="true">↗</span></a>
      </div>`;

    document.body.appendChild(panel);
    panel.querySelector(".wency-readme-close").addEventListener("click", () => hide(true));
    panel.addEventListener("mouseenter", clearClose);
    panel.addEventListener("mouseleave", scheduleClose);
    panel.addEventListener("focusin", clearClose);
    panel.addEventListener("focusout", scheduleClose);
  }

  function clearClose() {
    clearTimeout(closeTimer);
  }

  function show(anchor, sticky) {
    if (!anchor || !anchor.isConnected) return;
    clearTimeout(openTimer);
    clearClose();
    currentAnchor = anchor;
    pinned = Boolean(sticky);
    panel.hidden = false;
    if (heroButton) heroButton.setAttribute("aria-expanded", "true");
    place();
    if (sticky) panel.querySelector(".wency-readme-close").focus({ preventScroll: true });
  }

  function hide(restoreFocus = false) {
    clearTimeout(openTimer);
    clearClose();
    if (!panel || panel.hidden) return;
    const focusTarget = restoreFocus && pinned && currentAnchor && currentAnchor.isConnected ? currentAnchor : null;
    panel.hidden = true;
    pinned = false;
    if (heroButton) heroButton.setAttribute("aria-expanded", "false");
    currentAnchor = null;
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  function scheduleOpen(anchor) {
    if (pinned) return;
    clearTimeout(openTimer);
    clearClose();
    openTimer = setTimeout(() => show(anchor, false), 160);
  }

  function scheduleClose() {
    if (pinned) return;
    clearTimeout(openTimer);
    clearClose();
    closeTimer = setTimeout(() => {
      const focus = document.activeElement;
      if (!panel.contains(focus) && focus !== currentAnchor && focus !== heroButton) hide();
    }, 260);
  }

  function place() {
    if (!panel || panel.hidden || !currentAnchor) return;
    if (!currentAnchor.isConnected) return hide();
    if (window.matchMedia("(max-width: 639px)").matches) {
      panel.style.left = "";
      panel.style.top = "";
      return;
    }
    const rect = currentAnchor.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const gap = 12;
    const left = Math.min(window.innerWidth - width - gap, Math.max(gap, rect.left));
    const preferredTop = rect.bottom + gap;
    const top = Math.min(window.innerHeight - height - gap, Math.max(gap, preferredTop));
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
  }

  function bindHover(node) {
    node.addEventListener("mouseenter", () => scheduleOpen(node));
    node.addEventListener("mouseleave", scheduleClose);
    node.addEventListener("focusin", () => scheduleOpen(node));
    node.addEventListener("focusout", scheduleClose);
  }

  function attach() {
    const chip = Array.from(document.querySelectorAll("main span.cursor-default"))
      .find((node) => node.textContent.trim() === "GitHub" && node.classList.contains("font-mono"));
    if (!chip || chip === heroButton) return;
    heroButton = chip;
    chip.classList.add("wency-readme-trigger");
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.setAttribute("aria-controls", panelId);
    chip.setAttribute("aria-expanded", "false");
    chip.setAttribute("aria-label", "GitHub: preview my README");
    chip.setAttribute("data-cursor-label", "peek at my README");
    bindHover(chip);
    const toggle = () => {
      if (!panel.hidden && pinned && currentAnchor === chip) hide(true);
      else show(chip, true);
    };
    chip.addEventListener("click", toggle);
    chip.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  }

  function init() {
    if (document.getElementById(panelId)) return;
    createPanel();
    attach();
    const root = document.getElementById("root");
    if (root) {
      new MutationObserver(() => {
        if (scanQueued) return;
        scanQueued = true;
        requestAnimationFrame(() => {
          scanQueued = false;
          attach();
        });
      }).observe(root, { childList: true, subtree: true });
    }
    document.addEventListener("pointerdown", (event) => {
      if (!panel.hidden && !panel.contains(event.target) &&
          !heroButton?.contains(event.target)) hide();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        hide(true);
      }
    });
    window.addEventListener("resize", place, { passive: true });
    window.addEventListener("scroll", place, { passive: true, capture: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
