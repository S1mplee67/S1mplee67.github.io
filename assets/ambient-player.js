/* Wency's credited Creative Commons background-music player.
 * Plays full Scott Buckley tracks and shuffles when each song ends.
 * Browsers may require a real user gesture before unmuted playback is allowed.
 */
(() => {
  "use strict";

  if (window.__wencyAmbientPlayerInitialized) return;
  window.__wencyAmbientPlayerInitialized = true;

  const TRACKS = [
    { title: "Aurora", artist: "Scott Buckley", file: "/assets/music/scott-buckley-aurora.mp3" },
    { title: "Snowfall", artist: "Scott Buckley", file: "/assets/music/scott-buckley-snowfall.mp3" },
    { title: "Cirrus", artist: "Scott Buckley", file: "/assets/music/scott-buckley-cirrus.mp3" }
  ];
  const STORAGE_KEY = "wency:ambient-player:v1";
  const DEFAULT_VOLUME = 0.16;
  const FALLBACK_STATUS = "Licensed music temporarily unavailable";

  function readPrefs() {
    try {
      const item = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        volume: typeof item.volume === "number" && Number.isFinite(item.volume)
          ? Math.max(0, Math.min(1, item.volume)) : DEFAULT_VOLUME,
        muted: typeof item.muted === "boolean" ? item.muted : false,
        last: Number.isInteger(item.last) && item.last >= 0 && item.last < TRACKS.length
          ? item.last : -1
      };
    } catch {
      return { volume: DEFAULT_VOLUME, muted: false, last: -1 };
    }
  }

  function savePrefs(prefs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
  }

  function node(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content !== undefined) el.textContent = content;
    return el;
  }

  function makeButton(className, text, label) {
    const button = node("button", "wbgm-button " + className, text);
    button.type = "button";
    button.setAttribute("aria-label", label);
    return button;
  }

  function asClock(seconds) {
    const time = Math.max(0, Math.floor(seconds));
    return String(Math.floor(time / 60)).padStart(2, "0") + ":" +
      String(time % 60).padStart(2, "0");
  }

  // The local server supports HEAD. GET+Range is only used when HEAD is
  // unsupported/blocked; cancel its body so no full audio download is needed.
  async function audioExists(file) {
    function validResponse(response) {
      if (!response.ok) return false;
      const type = (response.headers.get("content-type") || "").toLowerCase();
      return type.startsWith("audio/") || type.includes("application/octet-stream");
    }
    try {
      const response = await fetch(file, { method: "HEAD", cache: "no-store" });
      if (validResponse(response)) return true;
      if (response.status !== 405 && response.status !== 501 && response.status !== 403) return false;
    } catch {
      // A server that disallows HEAD can still serve GET requests.
    }
    try {
      const response = await fetch(file, {
        method: "GET", headers: { Range: "bytes=0-0" }, cache: "no-store"
      });
      const exists = validResponse(response);
      if (response.body) await response.body.cancel();
      return exists;
    } catch {
      return false;
    }
  }

  function mount() {
    if (!document.body || document.getElementById("wency-bgm")) return;

    const prefs = readPrefs();
    const root = node("section", "wbgm-player");
    root.id = "wency-bgm";
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Background music player");
    root.dataset.state = "loading";

    const panel = node("div", "wbgm-panel");
    const header = node("div", "wbgm-header");
    const icon = node("span", "wbgm-icon", "♪");
    icon.setAttribute("aria-hidden", "true");
    const title = node("span", "wbgm-title", "Ambient music");
    const collapse = makeButton("wbgm-collapse", "−", "Collapse music player");
    collapse.setAttribute("aria-expanded", "true");
    collapse.setAttribute("aria-controls", "wbgm-body");
    header.append(icon, title, collapse);

    const body = node("div", "wbgm-body");
    body.id = "wbgm-body";
    const track = node("div", "wbgm-track", "Checking local songs…");
    const artist = node("div", "wbgm-artist", "Scott Buckley • CC BY 4.0");
    const visualizer = node("div", "wbgm-visualizer");
    visualizer.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 5; i++) visualizer.append(node("span", "wbgm-bar"));

    const controls = node("div", "wbgm-controls");
    const play = makeButton("wbgm-play", "▶", "Play background music");
    const skip = makeButton("wbgm-skip", "↠", "Next background song");
    const mute = makeButton("wbgm-mute", "♫", "Mute background music");
    mute.setAttribute("aria-pressed", String(prefs.muted));

    const volumeLabel = node("label", "wbgm-volume-label", "Volume");
    volumeLabel.htmlFor = "wbgm-volume";
    const volume = node("input", "wbgm-volume");
    volume.id = "wbgm-volume";
    volume.type = "range";
    volume.min = "0";
    volume.max = "100";
    volume.step = "1";
    volume.value = String(Math.round(prefs.volume * 100));
    volume.setAttribute("aria-label", "Background music volume");
    const volumeValue = node("span", "wbgm-volume-value");
    const volumeRow = node("div", "wbgm-volume-row");
    volumeRow.append(volumeLabel, volume, volumeValue);
    controls.append(play, skip, mute);

    const status = node("p", "wbgm-status", "Checking music tracks…");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    const setup = node("p", "wbgm-setup");
    const details = node("details", "wbgm-details");
    details.append(node("summary", "", "Track availability"));
    details.append(node("p", "", "Expected Creative Commons MP3 files:"));
    const fileList = node("ul");
    TRACKS.forEach(item => fileList.append(node("li", "", item.file.split("/").pop())));
    details.append(fileList);
    const credit = node("a", "wbgm-credits-link", "Music credits · CC BY 4.0 ↗");
    credit.href = "/music-credits.html";
    credit.target = "_blank";
    credit.rel = "noopener noreferrer";
    credit.setAttribute("aria-label", "Music credits, sources and Creative Commons license (opens in a new tab)");
    body.append(track, artist, visualizer, controls, volumeRow, status, credit, setup, details);
    panel.append(header, body);
    root.append(panel);
    document.body.append(root);

    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.loop = false;
    audio.volume = prefs.volume;
    audio.muted = prefs.muted;

    let available = [];
    let failed = new Set();
    let selected = -1;
    let userPaused = false;
    let gestureArmed = false;
    let isAdvancing = false;
    let shuffleBag = [];
    let state = "loading";
    let loadingToken = 0;

    function setState(nextState, message) {
      state = nextState;
      root.dataset.state = nextState;
      root.classList.toggle("wbgm-playing", nextState === "playing");
      root.classList.toggle("wbgm-muted", prefs.muted || prefs.volume === 0);
      if (message !== undefined) status.textContent = message;
      const isPlaying = nextState === "playing";
      play.textContent = isPlaying ? "Ⅱ" : "▶";
      play.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
      mute.textContent = prefs.muted || prefs.volume === 0 ? "♩" : "♫";
      mute.setAttribute("aria-label", prefs.muted ? "Unmute background music" : "Mute background music");
      mute.setAttribute("aria-pressed", String(prefs.muted));
      volumeValue.textContent = Math.round(prefs.volume * 100) + "%";
      const usable = available.some(i => !failed.has(i));
      play.disabled = !usable || nextState === "loading" || nextState === "error" || nextState === "missing";
      skip.disabled = !usable || nextState === "loading" || nextState === "error" || nextState === "missing";
    }

    function showFilesState() {
      const usable = available.filter(i => !failed.has(i));
      if (usable.length === 0) {
        track.textContent = "No songs loaded";
        artist.textContent = "Scott Buckley • CC BY 4.0";
        setup.textContent = FALLBACK_STATUS;
        details.hidden = false;
        setState(available.length ? "error" : "missing",
          available.length ? "Audio files could not be played." : FALLBACK_STATUS);
      } else {
        const missingCount = TRACKS.length - available.length;
        setup.textContent = missingCount ? missingCount + " of 3 licensed music files missing." : "";
        details.hidden = missingCount === 0;
      }
    }

    function chooseIndex(exclude) {
      const usable = available.filter(i => !failed.has(i));
      if (!usable.length) return -1;
      shuffleBag = shuffleBag.filter(i => usable.includes(i));
      if (!shuffleBag.length) {
        // Shuffle all playable tracks into a new round; each gets played once.
        shuffleBag = usable.slice();
        for (let i = shuffleBag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffleBag[i], shuffleBag[j]] = [shuffleBag[j], shuffleBag[i]];
        }
      }
      if (usable.length > 1 && shuffleBag[0] === exclude) {
        // Across shuffle-round boundaries and page reloads, avoid a repeat.
        const other = shuffleBag.findIndex(i => i !== exclude);
        if (other >= 0) [shuffleBag[0], shuffleBag[other]] = [shuffleBag[other], shuffleBag[0]];
        else {
          shuffleBag = usable.filter(i => i !== exclude);
          // Normally unreachable: all prior picks consume the shuffle bag.
        }
      }
      return shuffleBag.shift();
    }

    function disarmGesture() {
      if (!gestureArmed) return;
      gestureArmed = false;
      document.removeEventListener("pointerdown", retryOnGesture, true);
      document.removeEventListener("keydown", retryOnGesture, true);
    }

    function retryOnGesture(event) {
      // A visitor operating Pause, Mute, Volume or other player buttons
      // should not accidentally start music with that same gesture.
      if (root.contains(event.target)) return;
      if (event.type === "keydown" &&
          (event.isComposing || ["Shift", "Control", "Alt", "Meta", "Escape"].includes(event.key))) return;
      disarmGesture();
      if (!userPaused && !prefs.muted && prefs.volume > 0 && selected >= 0) requestPlay();
    }

    function armGesture() {
      if (gestureArmed || userPaused || prefs.muted || prefs.volume === 0) return;
      gestureArmed = true;
      // These become one-shot listeners: only the first eligible outside-player
      // pointer/keyboard gesture consumes them (or a pause/mute disarms them).
      document.addEventListener("pointerdown", retryOnGesture, true);
      document.addEventListener("keydown", retryOnGesture, true);
    }

    function failedPlayback(error) {
      if (error && error.name === "AbortError") return;
      if (error && error.name === "NotAllowedError") {
        if (userPaused || prefs.muted || prefs.volume === 0) {
          setState("blocked", "Press Play to start music");
        } else {
          setState("blocked", "Tap anywhere to enable music");
          armGesture();
        }
        return;
      }
      // Unsupported, corrupt or unusable files should not cause endless retries.
      disarmGesture();
      failed.add(selected);
      const next = chooseIndex(selected);
      if (next < 0) {
        audio.pause();
        showFilesState();
      } else {
        loadTrack(next, true);
      }
    }

    function requestPlay() {
      if (selected < 0 || userPaused) return;
      disarmGesture();
      const token = loadingToken;
      let result;
      try {
        // Calling play immediately (even before metadata) preserves the user
        // activation window for a first interaction and also attempts autoplay.
        result = audio.play();
      } catch (error) {
        if (token === loadingToken) failedPlayback(error);
        return;
      }
      if (result && typeof result.then === "function") {
        result.then(() => {
          if (token === loadingToken) disarmGesture();
        }).catch(error => {
          if (token !== loadingToken || userPaused) return;
          failedPlayback(error);
        });
      }
    }

    function loadTrack(index, shouldPlay) {
      if (index < 0) return showFilesState();
      loadingToken++;
      selected = index;
      prefs.last = index;
      savePrefs(prefs);
      userPaused = !shouldPlay;
      disarmGesture();
      const item = TRACKS[index];
      audio.pause();
      track.textContent = item.title;
      artist.textContent = item.artist + " • full track";
      audio.src = item.file;
      audio.load();
      setState("ready", shouldPlay ? "Loading full song…" : "Ready — press Play");
      if (shouldPlay) requestPlay();
    }

    function advance(shouldPlay = !userPaused) {
      if (isAdvancing || selected < 0) return;
      isAdvancing = true;
      try {
        const next = chooseIndex(selected);
        if (next < 0) return showFilesState();
        // Never repeats the same track when two or more valid songs remain.
        // With only one valid MP3, restarting that same song is intentional.
        loadTrack(next, shouldPlay);
      } finally {
        isAdvancing = false;
      }
    }

    audio.addEventListener("loadedmetadata", () => {
      if (selected < 0) return;
      artist.textContent = TRACKS[selected].artist + " • full track" +
        (Number.isFinite(audio.duration) ? " • " + asClock(audio.duration) : "");
    });
    audio.addEventListener("playing", () => {
      if (selected >= 0) {
        setState("playing", "Playing " + TRACKS[selected].title +
          (audio.muted || audio.volume === 0 ? " (muted)" : ""));
        disarmGesture();
      }
    });
    audio.addEventListener("pause", () => {
      if (selected >= 0 && state === "playing") setState("paused", "Paused — press Play to resume");
    });
    audio.addEventListener("ended", () => {
      if (selected >= 0 && !userPaused) advance(true);
    });
    audio.addEventListener("error", () => {
      if (selected < 0) return;
      disarmGesture();
      failed.add(selected);
      const another = chooseIndex(selected);
      if (another < 0) {
        audio.pause();
        showFilesState();
      } else {
        loadTrack(another, !userPaused);
      }
    });

    play.addEventListener("click", () => {
      if (selected < 0) return;
      if (state === "playing" && !audio.paused) {
        userPaused = true;
        disarmGesture();
        audio.pause();
      } else {
        userPaused = false;
        if (audio.ended) audio.currentTime = 0;
        requestPlay();
      }
    });
    skip.addEventListener("click", () => {
      // Next changes songs even while paused, without overriding that pause.
      const shouldPlay = !userPaused;
      disarmGesture();
      advance(shouldPlay);
    });
    mute.addEventListener("click", () => {
      prefs.muted = !prefs.muted;
      audio.muted = prefs.muted;
      // A deliberate mute cancels any waiting autoplay-gesture recovery.
      if (prefs.muted && state === "blocked") {
        userPaused = true;
        disarmGesture();
      }
      savePrefs(prefs);
      setState(state, state === "playing"
        ? "Playing " + TRACKS[selected].title + (prefs.muted ? " (muted)" : "")
        : prefs.muted && userPaused ? "Muted — press Play when ready" : undefined);
    });
    volume.addEventListener("input", () => {
      prefs.volume = Number(volume.value) / 100;
      audio.volume = prefs.volume;
      if (prefs.volume > 0 && prefs.muted) {
        prefs.muted = false;
        audio.muted = false;
      }
      if (prefs.volume === 0 && state === "blocked") {
        userPaused = true;
        disarmGesture();
      }
      savePrefs(prefs);
      setState(state, state === "playing"
        ? "Playing " + TRACKS[selected].title + (prefs.volume === 0 ? " (muted)" : "")
        : prefs.volume === 0 && userPaused ? "Volume at 0 — press Play when ready" : undefined);
    });
    function setCollapsed(collapsed) {
      root.classList.toggle("wbgm-collapsed", collapsed);
      body.hidden = collapsed;
      collapse.textContent = collapsed ? "+" : "−";
      collapse.setAttribute("aria-expanded", String(!collapsed));
      collapse.setAttribute("aria-label", collapsed && state === "missing"
        ? "Expand music player to view music information"
        : collapsed ? "Expand music player" : "Collapse music player");
    }
    let collapseTouched = false;
    collapse.addEventListener("click", () => {
      collapseTouched = true;
      setCollapsed(!root.classList.contains("wbgm-collapsed"));
    });

    setState("loading");
    Promise.all(TRACKS.map(item => audioExists(item.file)))
      .then(results => {
        available = results.flatMap((exists, index) => exists ? [index] : []);
        showFilesState();
        if (!available.length) {
          // Keep the initial missing-files widget discreet. Manual expansion wins.
          if (!collapseTouched) setCollapsed(true);
          return;
        }
        const first = chooseIndex(prefs.last);
        loadTrack(first, true); // Attempt only after availability; browser may block autoplay.
      })
      .catch(() => showFilesState());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
