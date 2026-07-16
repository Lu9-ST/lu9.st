(() => {
  "use strict";

  const MANIFEST_URL = "data/manifest.json";

  const desktop = document.getElementById("desktop");
  const windowsLayer = document.getElementById("windows-layer");
  const winTemplate = document.getElementById("window-template");
  const iconTemplate = document.getElementById("icon-template");

  let zCounter = 10;
  let cascadeOffset = 0;
  const openWindows = new Map();

  let sortMode = localStorage.getItem("archiveSortMode") || "name"; // "name" | "date"

  function setSortMode(mode) {
    sortMode = mode;
    localStorage.setItem("archiveSortMode", mode);
    // re-render every open explorer window with the new order
    openWindows.forEach((win) => {
      if (win.entries) renderIconGrid(win.grid, win.entries);
    });
    document.querySelectorAll(".sort-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === sortMode);
    });
  }

  function compareByName(a, b) {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  }

  function compareByDate(a, b) {
    // newest first, no date at the end
    if (!a.date && !b.date) return compareByName(a, b);
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date) || compareByName(a, b);
  }

  function sortEntries(entries) {
    const folders = entries.filter((e) => e.type === "folder");
    const files = entries.filter((e) => e.type !== "folder");
    folders.sort(compareByName); // folders always alphabetical
    files.sort(sortMode === "date" ? compareByDate : compareByName);
    return [...folders, ...files];
  }

  // icons
  const GLYPHS = {
    folder: `<img src="data/folder.svg"></img>`,
    scratch: `<img src="data/scratch.svg"></img>`,
    image: `<img src="data/image.svg"></img>`,
    video: `<img src="data/video.svg"></img>`,
    pdf: `<img src="data/pdf.svg"></img>`,
    text: `<img src="data/text.svg"></img>`,
    html: `<img src="data/html.svg"></img>`,
    file: `<img src="data/file.svg"></img>`,
  };

  function glyphFor(type) {
    return GLYPHS[type] || GLYPHS.file;
  }

  //load file index
  async function loadManifest() {
    try {
      const res = await fetch(MANIFEST_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      openExplorer("Scratch Archive", data.entries || [], { pinned: true });
    } catch (err) {
      openErrorWindow(err);
    }
  }

  function openErrorWindow(err) {
    const { el } = createWindow({
      title: "Error'd!",
      width: 420,
      height: 220,
    });
    const body = el.querySelector(".win-body");
    body.innerHTML = `<div class="error-state">
      Couldn't load data/manifest.json.<br><br>
      ${escapeHtml(err.message)}<br><br>
      Run <code>node scripts/generate-manifest.js</code>, or check that the file exists
      and that this page is being served over HTTP.
    </div>`;
    placeWindow(el);
    focusWindow(el);
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  //icon grid
  function openExplorer(title, entries, opts = {}) {
    const { el, body, id } = createWindow({
      title: `📁 ${title}`,
      width: 480,
      height: 360,
      pinned: !!opts.pinned,
    });

    const toolbar = document.createElement("div");
    toolbar.className = "explorer-toolbar";
    toolbar.innerHTML = `
      <span class="toolbar-label">Sort:</span>
      <button type="button" class="sort-btn" data-mode="name">Name</button>
      <button type="button" class="sort-btn" data-mode="date">Date</button>
    `;
    toolbar.querySelectorAll(".sort-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === sortMode);
      btn.addEventListener("click", () => setSortMode(btn.dataset.mode));
    });
    body.appendChild(toolbar);

    const grid = document.createElement("div");
    grid.className = "icon-grid";
    body.appendChild(grid);

    // remember this window's raw entries + grid element so sort toggles can re-render it
    const winRecord = openWindows.get(id);
    winRecord.entries = entries;
    winRecord.grid = grid;

    renderIconGrid(grid, entries);
    el.querySelector(".win-status").textContent = `${entries.length} item${entries.length === 1 ? "" : "s"}`;

    placeWindow(el);
    focusWindow(el);
    return el;
  }

  function renderIconGrid(grid, entries) {
    grid.innerHTML = "";
    if (!entries.length) {
      grid.innerHTML = `<div class="empty-state"><em>There's nothing here...</em></div>`;
      return;
    }
    sortEntries(entries).forEach((entry) => grid.appendChild(buildIcon(entry)));
  }

  function buildIcon(entry) {
    const node = iconTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".icon-glyph").innerHTML = glyphFor(entry.type);
    node.querySelector(".icon-label").textContent = entry.name;
    node.title = entry.date ? `${entry.name} — ${entry.date}` : entry.name;

    node.addEventListener("click", () => {
      document.querySelectorAll(".icon.selected").forEach((n) => n.classList.remove("selected"));
      node.classList.add("selected");
    });
    node.addEventListener("dblclick", () => openEntry(entry));
    return node;
  }

  function openEntry(entry) {
    if (entry.type === "folder") {
      openExplorer(entry.name, entry.entries || []);
      return;
    }

    const { el, body } = createWindow({
      title: entry.name,
      width: entry.type === "scratch" ? 530 : 440,
      height: entry.type === "scratch" ? 480 : 360,
    });

    const absoluteUrl = new URL(entry.file, window.location.href).href;

    if (entry.type === "scratch") {
      const iframe = document.createElement("iframe");
      iframe.src = `https://turbowarp.org/embed?project_url=${encodeURIComponent(absoluteUrl)}&interpolate&settings-button`;
      iframe.allow = "autoplay; fullscreen";
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("allowtransparency", "true");
      body.appendChild(iframe);
    } else if ((entry.type === "image") || (entry.type === "video")) {
      const img = document.createElement("img");
      img.src = absoluteUrl;
      img.alt = entry.name;
      if (entry.type === "image")
      body.appendChild(img);
      else if (entry.type === "video")
      body.appendChild(iframe);
    } else {
      //text, html or unknown
      const iframe = document.createElement("iframe");
      iframe.src = absoluteUrl;
      body.appendChild(iframe);
    }

    const status = el.querySelector(".win-status");
    status.innerHTML = "";
    const statusText = document.createElement("span");
    statusText.textContent = entry.date ? `Last modified ${entry.date}` : entry.file;
    status.appendChild(statusText);

    const downloadLink = document.createElement("a");
    downloadLink.href = absoluteUrl;
    downloadLink.download = entry.name;
    downloadLink.className = "status-download";
    downloadLink.textContent = "⬇ Download";
    status.appendChild(downloadLink);

    placeWindow(el);
    focusWindow(el);
  }

  //window funcs
  let winCounter = 0;

  function createWindow({ title, width, height, pinned = false }) {
    const id = `win-${++winCounter}`;
    const el = winTemplate.content.firstElementChild.cloneNode(true);
    el.dataset.id = id;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    if (pinned) el.classList.add("pinned");

    el.querySelector(".win-title").textContent = title;
    const body = el.querySelector(".win-body");

    const resizeHandle = document.createElement("div");
    resizeHandle.className = "win-resize-handle";
    el.appendChild(resizeHandle);

    windowsLayer.appendChild(el);
    openWindows.set(id, { el, pinned });

    //close
    if (!pinned) {
      el.querySelector(".win-close").addEventListener("click", () => closeWindow(id));
    }

    //focus
    el.addEventListener("mousedown", () => focusWindow(el));

    makeDraggable(el, el.querySelector(".win-titlebar"));
    makeResizable(el, resizeHandle);

    return { el, body, id };
  }

  function placeWindow(el) {
    cascadeOffset = (cascadeOffset + 28) % 200;
    const deskRect = desktop.getBoundingClientRect();
    const w = parseInt(el.style.width, 10);
    const h = parseInt(el.style.height, 10);
    const left = Math.min(40 + cascadeOffset, Math.max(0, deskRect.width - w - 10));
    const top = Math.min(30 + cascadeOffset, Math.max(0, deskRect.height - h - 10));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  function focusWindow(el) {
    document.querySelectorAll(".win.active").forEach((w) => w.classList.remove("active"));
    el.classList.add("active");
    el.style.zIndex = ++zCounter;
  }

  function closeWindow(id) {
    const entry = openWindows.get(id);
    if (!entry || entry.pinned) return;
    entry.el.remove();
    openWindows.delete(id);
  }

  function makeDraggable(el, handle) {
    let startX, startY, startLeft, startTop, dragging = false;

    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest(".win-btn")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = el.offsetLeft;
      startTop = el.offsetTop;
      focusWindow(el);
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const deskRect = desktop.getBoundingClientRect();
      let newLeft = startLeft + (e.clientX - startX);
      let newTop = startTop + (e.clientY - startY);
      newLeft = Math.max(-el.offsetWidth + 60, Math.min(newLeft, deskRect.width - 60));
      newTop = Math.max(0, Math.min(newTop, deskRect.height - 30));
      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;
    });

    window.addEventListener("mouseup", () => { dragging = false; });
  }

  function makeResizable(el, handle) {
    let startX, startY, startW, startH, resizing = false;

    handle.addEventListener("mousedown", (e) => {
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = el.offsetWidth;
      startH = el.offsetHeight;
      focusWindow(el);
      e.preventDefault();
      e.stopPropagation();
    });

    window.addEventListener("mousemove", (e) => {
      if (!resizing) return;
      const newW = Math.max(260, startW + (e.clientX - startX));
      const newH = Math.max(180, startH + (e.clientY - startY));
      el.style.width = `${newW}px`;
      el.style.height = `${newH}px`;
    });

    window.addEventListener("mouseup", () => { resizing = false; });
  }

  //startup
  loadManifest();
})();
