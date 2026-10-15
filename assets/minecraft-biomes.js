/* Independent day-mode palettes inspired by Minecraft environments.
 * No game textures, network requests, or changes to React's theme control.
 */
(() => {
  "use strict";

  if (window.__wencyMinecraftDayInitialized) return;
  window.__wencyMinecraftDayInitialized = true;

  const KEY = "wency:day-biome:v1";
  const ROOT_ID = "wency-biome-picker";
  const MENU_ID = "wency-biome-menu";
  const THEMES = [
    { id: "plains", label: "Plains", desc: "Grass & sky", swatch: "#839e78", group: "Overworld" },
    { id: "cherry", label: "Cherry Grove", desc: "Blossom haze", swatch: "#b38f9b", group: "Overworld" },
    { id: "taiga", label: "Snowy Taiga", desc: "Frost & pine", swatch: "#879ca7", group: "Overworld" },
    { id: "desert", label: "Desert", desc: "Dune sandstone", swatch: "#b9a77c", group: "Overworld" },
    { id: "lush", label: "Lush Caves", desc: "Fern & moss", swatch: "#779b8b", group: "Overworld" },
    { id: "nether", label: "Nether", desc: "Warm stone", swatch: "#ab827d", group: "Dimensions" },
    { id: "end", label: "The End", desc: "Pale lilac", swatch: "#a19bad", group: "Dimensions" },
    { id: "sift", label: "The Sift", desc: "Soft mineral", swatch: "#a19d8c", group: "Dimensions" },
    { id: "sift-meadows", label: "Sift • Meadows", desc: "Meadow tones", swatch: "#93a38a", group: "Sift inspirations" },
    { id: "sift-carapace", label: "Sift • Carapace", desc: "Earthy tones", swatch: "#99938e", group: "Sift inspirations" }
  ];
  const BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

  let selected = "plains";
  let picker;
  let trigger;
  let menu;
  let menuOpen = false;
  let pendingFrame = false;
  let lastAnchor = null;

  try {
    const previous = window.localStorage.getItem(KEY);
    if (BY_ID.has(previous)) selected = previous;
  } catch {
    // Private browsing can disable storage; the selection still works locally.
  }

  function inDayMode() {
    return document.documentElement.classList.contains("light");
  }

  function themeButton() {
    const candidates = document.querySelectorAll('header button[aria-label="Toggle theme"]');
    for (const button of candidates) {
      const bounds = button.getBoundingClientRect();
      if (bounds.width >= 15 && bounds.height >= 15 && window.getComputedStyle(button).visibility !== "hidden") {
        return button;
      }
    }
    return null;
  }

  function closeMenu(returnFocus = false) {
    if (!picker || !menuOpen) return;
    menuOpen = false;
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    picker.classList.remove("wmb-open");
    if (returnFocus && inDayMode() && !picker.hidden) trigger.focus({ preventScroll: true });
  }

  function syncSelection() {
    const theme = BY_ID.get(selected) || THEMES[0];
    document.documentElement.dataset.wencyBiome = theme.id;
    if (!picker) return;
    picker.style.setProperty("--wmb-current-swatch", theme.swatch);
    picker.querySelector(".wmb-trigger-name").textContent = theme.label;
    trigger.setAttribute("aria-label", "Choose Minecraft-inspired day biome. Current: " + theme.label);
    menu.querySelectorAll(".wmb-choice").forEach((button) => {
      const active = button.dataset.biome === theme.id;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("wmb-selected", active);
    });
  }

  function selectTheme(id) {
    if (!BY_ID.has(id)) return;
    selected = id;
    syncSelection();
    try { window.localStorage.setItem(KEY, id); } catch {}
    closeMenu(true);
  }

  function position() {
    if (!picker) return;
    if (!inDayMode()) {
      picker.hidden = true;
      lastAnchor = null;
      closeMenu(false);
      return;
    }
    const button = themeButton();
    if (!button) {
      picker.hidden = true;
      closeMenu(false);
      lastAnchor = null;
      return;
    }
    lastAnchor = button;
    picker.hidden = false;
    const rect = button.getBoundingClientRect();
    const size = window.innerWidth < 640 ? 32 : 103;
    const x = Math.min(window.innerWidth - size - 12, Math.max(12, rect.right - size));
    const y = Math.min(window.innerHeight - 48, Math.max(8, rect.bottom + 7));
    picker.style.left = Math.round(x) + "px";
    picker.style.top = Math.round(y) + "px";
  }

  function schedulePosition() {
    if (pendingFrame) return;
    pendingFrame = true;
    requestAnimationFrame(() => {
      pendingFrame = false;
      position();
    });
  }

  function openMenu() {
    if (!inDayMode()) return;
    position();
    menuOpen = true;
    menu.hidden = false;
    picker.classList.add("wmb-open");
    trigger.setAttribute("aria-expanded", "true");
    const current = menu.querySelector('.wmb-choice[aria-pressed="true"]');
    if (current) current.focus({ preventScroll: true });
  }

  function makeChoices() {
    ["Overworld", "Dimensions", "Sift inspirations"].forEach((groupName) => {
      const group = document.createElement("section");
      group.className = "wmb-group";
      group.setAttribute("aria-label", groupName);
      const heading = document.createElement("h3");
      heading.className = "wmb-group-title";
      heading.textContent = groupName;
      group.append(heading);
      const grid = document.createElement("div");
      grid.className = "wmb-grid";
      THEMES.filter((item) => item.group === groupName).forEach((item) => {
        const choice = document.createElement("button");
        choice.type = "button";
        choice.className = "wmb-choice";
        choice.dataset.biome = item.id;
        choice.style.setProperty("--wmb-choice-swatch", item.swatch);
        choice.setAttribute("aria-pressed", "false");
        choice.setAttribute("aria-label", item.label + ", " + item.desc);
        choice.innerHTML = '<span class="wmb-choice-swatch" aria-hidden="true"></span><span class="wmb-choice-copy"><strong></strong><small></small></span>';
        choice.querySelector("strong").textContent = item.label;
        choice.querySelector("small").textContent = item.desc;
        choice.addEventListener("click", () => selectTheme(item.id));
        grid.append(choice);
      });
      group.append(grid);
      menu.append(group);
    });
    const footnote = document.createElement("p");
    footnote.className = "wmb-footnote";
    footnote.textContent = "Visual inspirations only · no official textures or biome artwork.";
    menu.append(footnote);
  }

  function install() {
    if (!document.body || document.getElementById(ROOT_ID)) return;
    picker = document.createElement("div");
    picker.id = ROOT_ID;
    picker.hidden = true;
    picker.innerHTML = '<button class="wmb-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="' + MENU_ID + '"><span class="wmb-trigger-block" aria-hidden="true"></span><span class="wmb-trigger-name"></span><span class="wmb-trigger-arrow" aria-hidden="true">▾</span></button><div class="wmb-menu" id="' + MENU_ID + '" role="group" aria-label="Minecraft-inspired day palettes" hidden><div class="wmb-menu-header"><span class="wmb-menu-title">DAY MODE / BIOMES</span><span class="wmb-menu-badge">visual palette</span></div></div>';
    trigger = picker.querySelector(".wmb-trigger");
    menu = picker.querySelector(".wmb-menu");
    makeChoices();
    document.body.append(picker);
    syncSelection();
    position();

    trigger.addEventListener("click", () => {
      if (menuOpen) closeMenu(false);
      else openMenu();
    });
    trigger.addEventListener("keydown", (event) => {
      if ((event.key === "ArrowDown" || event.key === "Enter") && !menuOpen) {
        event.preventDefault();
        openMenu();
      }
    });
    menu.addEventListener("keydown", (event) => {
      const keys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      const options = [...menu.querySelectorAll(".wmb-choice")];
      const activeIndex = options.indexOf(document.activeElement);
      if (activeIndex < 0) return;
      event.preventDefault();
      let next = activeIndex;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = options.length - 1;
      else next = (activeIndex + (event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
      options[next].focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        closeMenu(true);
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (menuOpen && !picker.contains(event.target)) closeMenu(false);
    });
    window.addEventListener("resize", schedulePosition, { passive: true });
    window.addEventListener("scroll", schedulePosition, { passive: true, capture: true });
    new MutationObserver(schedulePosition).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    const reactRoot = document.getElementById("root");
    if (reactRoot) {
      new MutationObserver(schedulePosition).observe(reactRoot, { childList: true, subtree: true });
    }
  }

  document.documentElement.dataset.wencyBiome = selected;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
