// Remote data URL (screens.json). SAMPLE used as fallback if fetch fails.
const DATA_URL = "https://raw.githubusercontent.com/ledbirting/ledbirting-bs-availability/refs/heads/main/public/screens.json";

// Static resolution icon map
const RES_ICONS = {
  "400x400":   "https://ledbirting.is/wp-content/uploads/2025/11/400x400px@2x.png",
  "512x2500":  "https://ledbirting.is/wp-content/uploads/2025/11/512x2500px@2x.png",
  "600x550":   "https://ledbirting.is/wp-content/uploads/2025/11/600x550px@2x.png",
  "640x480":   "https://ledbirting.is/wp-content/uploads/2025/11/640x480px@2x.png",
  "800x1000":  "https://ledbirting.is/wp-content/uploads/2025/11/800x1000px@2x.png",
  "800x1200":  "https://ledbirting.is/wp-content/uploads/2025/11/800x1200px@2x.png",
  "1000x500":  "https://ledbirting.is/wp-content/uploads/2025/11/1000x500px@2x.png",
  "1000x652":  "https://ledbirting.is/wp-content/uploads/2025/11/1000x652px@2x.png",
  "1000x800":  "https://ledbirting.is/wp-content/uploads/2025/11/1000x800px@2x.png",
  "1000x1000": "https://ledbirting.is/wp-content/uploads/2025/11/1000x1000px@2x.png",
  "1080x1920": "https://ledbirting.is/wp-content/uploads/2025/11/1080x1920px@2x.png",
  "1200x400":  "https://ledbirting.is/wp-content/uploads/2025/11/1200x400px@2x.png",
  "1800x1920": "https://ledbirting.is/wp-content/uploads/2025/11/1800x1920px@2x.png",
  "1920x1080": "https://ledbirting.is/wp-content/uploads/2025/11/1920x1080px@2x.png"
};

// Minimal fallback sample in case fetch fails
const SAMPLE = [
  {
    id: "demo-1",
    titleImage: "https://ledbirting.is/wp-content/uploads/2025/11/438452-R@2x-scaled.png",
    photoUrl: "https://ledbirting.is/wp-content/uploads/2025/11/AK-Demo.jpg",
    bgTexture: "https://ledbirting.is/wp-content/uploads/2025/11/Blue-BG.jpg",
    facesIcon: 2,
    mapUrl: "#",
    offerUrl: "#",
    criteria: {
      landssvaedi: ["Höfuðborgarsvæði"],
      borg_baer: ["Reykjavík"],
      building: ["Billboards"],
      upplausn: ["1000x800", "800x1000"],
      orientation: ["landscape", "portrait"]
    }
  }
];

const BTN_MAP = "https://ledbirting.is/wp-content/uploads/2025/11/Map-button.png";
const BTN_OFFER = "https://ledbirting.is/wp-content/uploads/2025/11/Get-offer-button.png";

const app = document.getElementById("app");

/* ---------- Render cards ---------- */

function cardHTML(d) {
  const crit = d.criteria || {};

  const lands     = crit.landssvaedi || [];
  const borgs     = crit.borg_baer   || [];
  const buildings = crit.building    || [];

  const upplArr = Array.isArray(crit.upplausn)
    ? crit.upplausn
    : crit.upplausn
    ? [crit.upplausn]
    : [];

  const orArr = Array.isArray(crit.orientation)
    ? crit.orientation
    : crit.orientation
    ? [crit.orientation]
    : [];

  const dataUppl     = upplArr.join("|");
  const dataOrient   = orArr.join("|");
  const dataBuilding = buildings.join("|");

  // Get all icons for all resolutions that have an entry in RES_ICONS
  const resIcons = upplArr
    .map(res => RES_ICONS[res])
    .filter(Boolean);

  return `
  <section class="card"
    data-land="${lands.join("|")}"
    data-borg="${borgs.join("|")}"
    data-building="${dataBuilding}"
    data-uppl="${dataUppl}"
    data-orient="${dataOrient}">
    <div class="side-image">
      <img src="${d.photoUrl}" alt="">
    </div>
    <div class="stack">
      <div class="black-box">
        <img src="${d.titleImage}" alt="">
      </div>
      <div class="frame" style="background-image:url('${d.bgTexture}')">
        <div class="buttons">
          <a class="btn" href="${d.offerUrl || "#"}" target="_blank" rel="noopener">
            <img src="${BTN_OFFER}" alt="Fá tilboð">
          </a>
          <a class="btn" href="${d.mapUrl || "#"}" target="_blank" rel="noopener">
            <img src="${BTN_MAP}" alt="Sjá á korti">
          </a>
        </div>
        <div class="badge">
          ${resIcons.map(src => `<img src="${src}" alt="">`).join("")}
        </div>
      </div>
    </div>
  </section>`;
}

function render(DATA) {
  app.innerHTML = DATA.map(cardHTML).join("");
}

/* ---------- Filter state & elements ---------- */

const state = {
  land:     new Set(),
  borg:     new Set(),
  building: new Set(),
  uppl:     new Set(),
  or:       new Set()
};

const el = {
  land:     document.getElementById("f-land"),
  borg:     document.getElementById("f-borg"),
  building: document.getElementById("f-building"),
  uppl:     document.getElementById("f-uppl"),
  or:       document.getElementById("f-or"),
  reset:    document.getElementById("reset-all")
};

/* ---------- Build a filter dropdown ---------- */

function buildFilter(root, { label, values }) {
  const key =
    root.id === "f-land"     ? "land"     :
    root.id === "f-borg"     ? "borg"     :
    root.id === "f-building" ? "building" :
    root.id === "f-uppl"     ? "uppl"     :
    "or";

  root.classList.remove("open");

  const optionsHTML = values.map(v => {
    const safeId = `${root.id}-${String(v)
      .replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "")}`;
    return `
      <div class="row">
        <input type="checkbox" value="${v}" id="${safeId}">
        <label for="${safeId}">${v}</label>
      </div>`;
  }).join("");

  root.innerHTML = `
    <button class="toggle" type="button" aria-haspopup="listbox" aria-expanded="false">
      <span class="label">${label}</span>
      <span class="summary">All</span>
      <svg class="chev" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
      </svg>
    </button>
    <div class="menu" role="listbox" tabindex="-1">
      <div class="section">
        ${optionsHTML}
      </div>
      <div class="actions">
        <button class="btn clear" type="button">Clear</button>
        <button class="btn primary apply" type="button">Apply</button>
      </div>
    </div>
  `;

  const toggle = root.querySelector(".toggle");
  const menu   = root.querySelector(".menu");
  const clear  = root.querySelector(".clear");
  const apply  = root.querySelector(".apply");
  const rows   = [...root.querySelectorAll(".row input")];

  // open/close
  toggle.addEventListener("click", () => {
    const isOpen = !root.classList.contains("open");
    root.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", e => {
    if (!root.contains(e.target)) {
      root.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // preselect from state
  rows.forEach(r => {
    r.checked = state[key].has(r.value);
  });

  // clear
  clear.addEventListener("click", () => {
    rows.forEach(r => r.checked = false);
  });

  // apply -> write to state and update summary
  apply.addEventListener("click", () => {
    const sel = rows.filter(r => r.checked).map(r => r.value);
    state[key] = new Set(sel);

    const summaryEl = root.querySelector(".summary");
    const summary = sel.length === 0
      ? "All"
      : sel.slice(0, 2).map(x => `<span class="chip">${x}</span>`).join("") +
        (sel.length > 2
          ? ` <span class="chip">+${sel.length - 2}</span>`
          : "");

    summaryEl.innerHTML = summary;

    root.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    applyFilters();
  });
}

/* ---------- Apply filters ---------- */

function applyFilters() {
  const landSel     = [...state.land];
  const borgSel     = [...state.borg];
  const buildingSel = [...state.building];
  const upplSel     = [...state.uppl];
  const orSel       = [...state.or];

  [...app.children].forEach(card => {
    const lands     = (card.dataset.land      || "").split("|").filter(Boolean);
    const borgs     = (card.dataset.borg      || "").split("|").filter(Boolean);
    const buildings = (card.dataset.building  || "").split("|").filter(Boolean);
    const uppls     = (card.dataset.uppl      || "").split("|").filter(Boolean);
    const orients   = (card.dataset.orient    || "").split("|").filter(Boolean);

    const ok =
      (landSel.length     ? lands.some(v     => landSel.includes(v))     : true) &&
      (borgSel.length     ? borgs.some(v     => borgSel.includes(v))     : true) &&
      (buildingSel.length ? buildings.some(v => buildingSel.includes(v)) : true) &&
      (upplSel.length     ? uppls.some(v     => upplSel.includes(v))     : true) &&
      (orSel.length       ? orients.some(v   => orSel.includes(v))       : true);

    card.classList.toggle("hidden", !ok);
  });
}

/* ---------- Build filters from data ---------- */

function hydrateFilters(DATA) {
  const uniq = a => [...new Set(a)];

  const allLand = uniq(
    DATA.flatMap(d => d.criteria?.landssvaedi || [])
  ).sort((a,b) => a.localeCompare(b));

  const allBorg = uniq(
    DATA.flatMap(d => d.criteria?.borg_baer || [])
  ).sort((a,b) => a.localeCompare(b));

  const allBuilding = uniq(
    DATA.flatMap(d => {
      const b = d.criteria?.building;
      if (Array.isArray(b)) return b;
      if (b) return [b];
      return [];
    })
  ).sort((a,b) => a.localeCompare(b));

  const allUppl = uniq(
    DATA.flatMap(d => {
      const u = d.criteria?.upplausn;
      if (Array.isArray(u)) return u;
      if (u) return [u];
      return [];
    })
  ).sort((a,b) => a.localeCompare(b));

  const allOr = uniq(
    DATA.flatMap(d => {
      const o = d.criteria?.orientation;
      if (Array.isArray(o)) return o;
      if (o) return [o];
      return [];
    })
  ).sort((a,b) => a.localeCompare(b));

  buildFilter(el.land,     { label: "Landssvæði", values: allLand });
  buildFilter(el.borg,     { label: "Borg/bær",   values: allBorg });
  buildFilter(el.building, { label: "Þjónusta",   values: allBuilding });
  buildFilter(el.uppl,     { label: "Upplausn",   values: allUppl });
  buildFilter(el.or,       { label: "Orientation",values: allOr });
}

/* ---------- Reset all ---------- */

el.reset.addEventListener("click", () => {
  state.land.clear();
  state.borg.clear();
  state.building.clear();
  state.uppl.clear();
  state.or.clear();
  hydrateFilters(currentData);
  applyFilters();
});

/* ---------- Boot ---------- */

let currentData = SAMPLE;

async function boot() {
  try {
    const r = await fetch(DATA_URL, { cache: "no-store", mode: "cors" });
    if (r.ok) {
      currentData = await r.json();
    } else {
      console.warn("Fetch failed, using SAMPLE. Status:", r.status);
    }
  } catch (e) {
    console.warn("Using SAMPLE due to fetch error:", e);
  }

  hydrateFilters(currentData);
  render(currentData);
}

boot();
