"use strict";
/* Интерактивная книга: все записи и разделы — страницы одной книги с перелистыванием. */
const records = window.ENTRIES;
const byId = new Map(records.map((r) => [r.id, r]));
const sections = [
  ["gods", "Боги", "eye"],
  ["creatures", "Существа", "wing"],
  ["places", "Места", "places"],
  ["signs", "Знаки и реликвии", "rune"],
  ["books", "Библиотека", "book"],
];
sections.unshift(["all", "Все записи", "grid"]);
const paths = {
  globe:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4.5" ry="9"/><path d="M3 12h18M5 6.5q7 4 14 0m-14 11q7-4 14 0"/>',
  order:
    '<path d="M12 5v6M5 16v-5h14v5"/><circle cx="12" cy="4" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>',
  atlas:
    '<circle cx="12" cy="12" r="2.4"/><circle cx="5" cy="5" r="1.6"/><circle cx="19" cy="6" r="1.6"/><circle cx="6" cy="20" r="1.6"/><path d="m6.2 6.2 4 4m3.7.4 3.8-3.4m-7 6.5-3.6 5"/>',
  lens: '<circle cx="10" cy="10" r="6.4"/><path d="m15 15 6 6M7.2 10a3 3 0 0 1 3-3"/>',
  bookmark: '<path d="M6.5 3.5h11v17L12 17l-5.5 3.5z"/>',
  book: '<path d="M12 5.8C8.8 3.9 5.9 3.6 2.5 4.5v14.3c3.5-.9 6.2-.5 9.5 1.5 3.3-2 6-2.4 9.5-1.5V4.5c-3.4-.9-6.3-.6-9.5 1.3v14.5"/>',
  "arrow-down": '<path d="M12 4v15m-6-6 6 6 6-6"/>',
  arrow: '<path d="M5 17 18 4M7 4h11v11"/>',
  search: '<circle cx="10" cy="10" r="6.3"/><path d="m15 15 5 5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  eye: '<path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  wing: '<path d="m4 20 3.5-7L4 6l6 3 9-6-2 6-3 3 1 4-5-1-6 5Z"/>',
  places:
    '<path d="M3 20h18M5 20V9l3-3 3 3v11m1-13 3-4 4 4v13M8 11v2m7-4v2m1 3v2"/>',
  rune: '<path d="m12 2 7 7-7 6-7-6 7-7Zm0 0v20m-5-4 5-4 5 4"/>',
  close: '<path d="m5 5 14 14m0-14L5 19"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  pause: '<path d="M7 4h4v16H7zM14 4h4v16h-4z"/>',
};
const icon = (name) =>
  '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">' +
  (paths[name] || "") +
  "</svg>";
const $ = (id) => document.getElementById(id);
const escapeHTML = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        ch
      ])
  );
const normalize = (v) =>
  String(v ?? "")
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е")
    .replace(/[^\p{L}\p{N}]/gu, "");
const plural = (n) =>
  n % 10 === 1 && n % 100 !== 11
    ? "запись"
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
    ? "записи"
    : "записей";
const fileAliases = {
  "deep-ones": "deep-one",
  "elder-things": "elder-thing",
  nightgaunts: "nightgaunt",
  ghouls: "ghoul",
  pnakotic: "pnakotic-manuscripts",
};

const hasEngraving = new Set([
  "cthulhu",
  "nyarlathotep",
  "azathoth",
  "yog",
  "shub",
  "dagon",
  "chaugnar-faugn",
  "gug",
  "zoog",
  "moon-beast",
  "shantak",
  "brown-jenkin",
  "hastur",
  "tsathoggua",
  "hydra",
  "yig",
  "ghatanothoa",
  "bokrug",
  "nodens",
  "deep-ones",
  "shoggoth",
  "mi-go",
  "elder-things",
  "yith",
  "flying-polyps",
  "nightgaunts",
  "ghouls",
  "haunter",
  "dunwich-horror",
]);

function placeholderFor(r) {
  const L = (r.name.replace(/^[^А-ЯЁа-яё]+/, "")[0] || "?").toUpperCase();
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="g"><stop offset="0" stop-color="#f6ecd2"/><stop offset="1" stop-color="#e3d0a4"/></radialGradient></defs>' +
    '<circle cx="200" cy="200" r="168" fill="url(#g)" stroke="#9b7c5d" stroke-width="3" stroke-dasharray="10 12"/>' +
    '<g fill="none" stroke="#9b7c5d" stroke-width="3" opacity=".35"><path d="M120 300c10-40 40-30 30-70M160 318c0-50 30-40 20-90M240 318c0-50-30-40-20-90M280 300c-10-40-40-30-30-70"/></g>' +
    '<text x="200" y="245" text-anchor="middle" font-family="Georgia,serif" font-size="170" font-weight="700" fill="#8d2a1e" opacity=".82">' +
    L +
    "</text>" +
    '<text x="200" y="330" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="22" fill="#6b5741">' +
    escapeHTML(r.latin) +
    "</text></svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
function artPath(r) {
  const custom=window.bookImages?.get(r.id);
  if(custom)return custom;
  if (r.group === "books" && !["necronomicon", "pnakotic"].includes(r.id))
    return "art/books/" + r.id + ".svg";
  if (
    (r.group === "creatures" || r.group === "gods") &&
    !hasEngraving.has(r.id)
  )
    return placeholderFor(r);
  return "art/" + (fileAliases[r.id] || r.id) + ".webp";
}
function illustration(r, eager = false) {
  const custom=window.bookImages?.get(r.id);
  if(custom)return '<img src="'+escapeHTML(custom)+'" alt="" loading="'+(eager?'eager':'lazy')+'">';
  const base = artPath(r),
    cls = r.group === "books" ? "book-cover" : "";
  if (base.startsWith("data:"))
    return (
      '<img src="art/plates/' +
      r.id +
      '.png" data-next="' +
      base +
      '" alt="" class="' +
      cls +
      '" loading="' +
      (eager ? "eager" : "lazy") +
      '" onerror="plateFallback(this)">'
    );
  return (
    '<img src="' +
    base +
    '" alt="" loading="' +
    (eager ? "eager" : "lazy") +
    '" class="' +
    cls +
    '">'
  );
}
/* Ваши картинки в art/plates/<id>.png (прозрачный фон) имеют приоритет над всем остальным. */
const cutoutSet = new Set([
  "brown-jenkin",
  "chaugnar-faugn",
  "cthulhu",
  "deep-one",
  "ghoul",
  "gug",
  "hastur",
  "mi-go",
  "moon-beast",
  "nightgaunt",
  "nyarlathotep",
  "yig",
  "zoog",
  "flying-polyps",
  "azathoth",
  "dagon",
  "shantak",
  "shoggoth",
  "nodens",
  "bokrug",
]);
const paintedSet = new Set(["elder-things", "yith", "tsathoggua"]);
function plateCandidates(r) {
  const custom=window.bookImages?.get(r.id);
  if(custom)return [custom];
  const file = fileAliases[r.id] || r.id,
    list = [];
  if (paintedSet.has(r.id)) list.push("art/plates/" + r.id + ".webp");
  else if (["gods", "creatures"].includes(r.group))
    list.push("art/plates/" + r.id + ".png");
  if (cutoutSet.has(file)) list.push("art/cutouts/" + file + ".webp");
  list.push(artPath(r));
  return list;
}
function plateImage(r, cls = "", alt = "") {
  const [first, ...rest] = plateCandidates(r);
  const framed = !window.bookImages?.get(r.id) && rest.length === 0 && first.endsWith(".webp");
  return (
    '<img class="plate-img ' +
    cls +
    (framed ? " framed" : "") +
    (first.startsWith("data:") && !window.bookImages?.get(r.id) ? " placeholder" : "") +
    '" src="' +
    first +
    '" data-next="' +
    rest.join("|") +
    '" alt="' +
    escapeHTML(alt) +
    '" onerror="plateFallback(this)">'
  );
}
function plateFallback(img) {
  const rest = (img.dataset.next || "").split("|").filter(Boolean);
  if (!rest.length) {
    img.onerror = null;
    return;
  }
  const next = rest.shift();
  img.dataset.next = rest.join("|");
  if (!rest.length && next.endsWith(".webp") && !next.includes("/cutouts/"))
    img.classList.add("framed");
  if (next.startsWith("data:")) img.classList.add("placeholder");
  img.src = next;
}
function motionOf(id) {
  const m = window.motionMap || {};
  for (const k of ["writhe", "float", "flicker", "crawl", "sway"])
    if ((m[k] || []).includes(id)) return k;
  return window.fieldNotes?.[id]?.motion || "breathe";
}
function updateBookmarkButton() {}

/* ---------- Порядок страниц ---------- */
const chapters = window.bookChapters.map((ch) => ({ ...ch }));
const listed = new Set(chapters.filter((c) => c.ids).flatMap((c) => c.ids));
chapters.forEach((ch) => {
  if (!ch.ids)
    ch.ids = records
      .filter((r) => ch.group.includes(r.group) && !listed.has(r.id))
      .map((r) => r.id);
  ch.ids = ch.ids.filter((id) => byId.has(id));
});
chapters.push({
  id: "atlas",
  num: "VII",
  title: "Атлас натуралиста",
  art: "polar-reliefs",
  intro:
    "Хроника Старцев, карты ареалов и миров, пантеон, родословное древо и шкала размеров.",
  ids: [],
});
chapters.push({
  id: "appendix",
  num: "VIII",
  title: "Приложения",
  art: "arkham",
  intro:
    "История Мифов от рождения Лавкрафта до наших дней, что почитать и во что сыграть.",
  ids: [],
});
const chapterOf = new Map();
chapters.forEach((ch) => ch.ids.forEach((id) => chapterOf.set(id, ch)));
const pages = [];
const addPage = (hash, title, ch) => pages.push({ hash, title, ch });
addPage("#cover", "Обложка", null);
addPage("#contents", "Оглавление", null);
addPage("#about", "Зачем эта книга", null);
addPage("#preface", "Предисловие", null);
addPage("#catalog", "Каталог", null);
chapters.forEach((ch) => {
  if (ch.id === "appendix") return;
  addPage("#chapter/" + ch.id, ch.title, ch);
  ch.ids.forEach((id) => {
    const r = byId.get(id);
    addPage("#entry/" + id, r.name, ch);
    addPage("#entry/" + id + "/notes", r.name + " · свидетельства", ch);
  });
});
const atlasCh = chapters.find((c) => c.id === "atlas");
window.earthEpochs.forEach((e) =>
  addPage("#chronicle/" + e.id, "Хроника: " + e.title, atlasCh)
);
addPage("#habitats", "Где они обитали", atlasCh);
addPage("#worlds/earth", "Карта миров", atlasCh);
addPage("#hierarchy", "Пантеон", atlasCh);
addPage("#atlas/cthulhu", "Родословное древо", atlasCh);
addPage("#sizes", "Шкала размеров", atlasCh);
const appCh = chapters.find((c) => c.id === "appendix");
addPage("#chapter/appendix", "Приложения", appCh);
addPage("#history", "История Мифов", appCh);
addPage("#culture", "Следы Древних в культуре", appCh);
function pageIndex(hash) {
  if (!hash || hash === "#") return 0;
  let i = pages.findIndex((p) => p.hash === hash);
  if (i >= 0) return i;
  const [view, id] = hash.slice(1).split("/");
  const pref = {
    atlas: "#atlas/",
    habitats: "#habitats",
    worlds: "#worlds/",
    hierarchy: "#hierarchy",
    sizes: "#sizes",
    culture: "#culture",
    catalog: "#catalog",
    chronicle: "#chronicle/" + (id || window.earthEpochs[0].id),
  }[view];
  if (pref) {
    i = pages.findIndex((p) => p.hash.startsWith(pref));
    if (i >= 0) return i;
  }
  if (view === "entry") {
    i = pages.findIndex((p) => p.hash === "#entry/" + id);
    if (i >= 0) return i;
  }
  return 0;
}

/* ---------- Страница-хост и перелистывание ---------- */
const host = $("folio");
host.open = true;
let current = -1,
  pendingDir = 0;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
let leafCleanup = null;
function openFolio(markup, mode = "record-mode") {
  const dir = pendingDir;
  pendingDir = 0;
  leafCleanup?.();
  const animate = dir && host.innerHTML && !reduceMotion.matches;
  host.className = "page-host " + mode;
  host.innerHTML = markup;
  host.scrollTop = 0;
  if (animate) turnLeaf(dir);
}
function turnLeaf(dir) {
  // Only an empty decorative layer moves; the live spread is never copied.
  const layer = document.createElement('div');
  layer.className = 'paper-turn ' + (dir > 0 ? 'paper-turn-forward' : 'paper-turn-back');
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  let timer;
  const cleanup = () => {
    clearTimeout(timer);
    layer.remove();
    if (leafCleanup === cleanup) leafCleanup = null;
  };
  leafCleanup = cleanup;
  layer.addEventListener('animationend', event => {
    if (event.target === layer && event.animationName === 'paper-turn-finish') cleanup();
  });
  $('pages').append(layer);
  timer = setTimeout(cleanup, 1550);
}

/* ---------- Разделы книги ---------- */
function chapterEdgeTabs() {
  const colors=['#644135','#3c5146','#454b61','#5e4939','#5c454c','#47594d','#4a5060','#665438'];
  return chapters.map((ch,index) => '<a href="#chapter/'+ch.id+'" data-ch="'+ch.id+'" title="'+escapeHTML(ch.title)+'" aria-label="Глава '+escapeHTML(ch.num)+'. '+escapeHTML(ch.title)+'" style="--tab-color:'+colors[index%colors.length]+'"><b>'+ch.num+'</b><span><small>Глава '+escapeHTML(ch.num)+'</small>'+escapeHTML(ch.title)+'</span></a>').join('');
}

function miniCard(r, i) {
  const f = window.fieldNotes[r.id] || {},
    p = window.speciesProfiles[r.id];
  return (
    '<a class="mini-book" href="#entry/' +
    r.id +
    '" style="--i:' +
    i +
    '"><span class="mini-art">' +
    plateImage(r, "mini") +
    '</span><span class="mini-text"><b>' +
    escapeHTML(r.name) +
    "</b><small>" +
    escapeHTML(r.epithet) +
    "</small>" +
    (f.guide || p?.guide
      ? "<i>с. " +
        escapeHTML(
          String(f.guide || p.guide)
            .replace(/^с\.\s*/, "")
            .split(" ")[0]
        ) +
        "</i>"
      : "") +
    "</span></a>"
  );
}
function renderCover() {
  openFolio(
    '<div class="open-book cover-spread"><section class="book-page verso inside-cover"><div class="cover-art"><img src="'+escapeHTML(window.bookImages?.get('hero')||'art/hero.webp')+'" alt=""></div>' +
      '<blockquote class="cover-epigraph"><p>Не мёртво то, что в вечности живёт;<br>Со смертью времени и смерть умрёт.</p><cite>— Абдул Альхазред, «Некрономикон»</cite></blockquote></section>' +
      '<section class="book-page recto title-page"><div class="title-frame"><span class="title-kicker">Архив Мискатоника · полевое издание</span><div class="title-crest"><img class="cover-mark" src="art/intro-sigil.svg" alt="Геометрическая эмблема, отпечатанная тёмными чернилами"></div><h1>Бестиарий<br><em>Лавкрафта</em></h1><svg class="tentacle-rule" viewBox="0 0 300 30" aria-hidden="true"><path d="M4 14c40 14 90 14 140 6s100-10 130 2c14 6 20-4 14-10-6-5-14 0-11 5"/></svg><div class="cipher" aria-hidden="true">' +
      "ᛚᛟᚡᛖᚲᚱᚨᚠᛏᛁᚨᚾ ᛒᛖᛊᛏᛁᚨᚱᛇ" +
      "</div>" +
      '<p class="title-sub">Руководство натуралиста по богам, чудовищам, местам и запретным книгам вселенной Говарда Филлипса Лавкрафта</p>' +
      '<div class="title-stats"><span><b>' +
      records.filter((r) => r.group === "gods" || r.group === "creatures")
        .length +
      "</b> существ и богов</span><span><b>" +
      records.filter((r) => r.group === "places").length +
      "</b> мест</span><span><b>" +
      records.filter((r) => r.group === "books").length +
      "</b> книг</span></div>" +
      '</div></section></div>',
    "spread-mode cover-mode"
  );
}
function renderContents() {
  const toc = chapters
    .map((ch) => {
      const i = pageIndex("#chapter/" + ch.id);
      return (
        '<a class="toc-row" href="#chapter/' +
        ch.id +
        '"><b>' +
        ch.num +
        "</b><span>" +
        escapeHTML(ch.title) +
        "<small>" +
        (ch.ids.length
          ? ch.ids.length + " " + plural(ch.ids.length)
          : "шесть разделов") +
        "</small></span><i></i><em>" +
        (i * 2 + 1) +
        "</em></a>"
      );
    })
    .join("");
  const atlasRows = [
    ["#chronicle/" + window.earthEpochs[0].id, "Хроника Старцев"],
    ["#habitats", "Где они обитали — эпохи и глобус"],
    ["#worlds/earth", "Карта миров — Земля, Страна Грёз, космос"],
    ["#hierarchy", "Пантеон мифов"],
    ["#atlas/cthulhu", "Родословное древо"],
    ["#sizes", "Шкала размеров"],
  ]
    .concat([
      ["#catalog", "Каталог всех записей"],
      ["#history", "История Мифов"],
      ["#culture/type/book", "Книги и рассказы"],
      ["#culture/type/tabletop", "Настольные игры"],
      ["#culture", "Следы Древних в культуре"],
      ["#about", "Зачем эта книга"],
    ])
    .map(
      ([h, t]) =>
        '<a class="toc-sub" href="' +
        h +
        '">' +
        t +
        "<i></i><em>" +
        (pageIndex(h) * 2 + 1) +
        "</em></a>"
    )
    .join("");
  const sorted = [...records].sort((a, b) =>
    a.name.localeCompare(b.name, "ru")
  );
  const letters = new Map();
  sorted.forEach((r) => {
    const l = thumbLetter(r);
    if (!letters.has(l)) letters.set(l, []);
    letters.get(l).push(r);
  });
  const index = [...letters]
    .map(
      ([l, rs]) =>
        '<div class="idx-group"><b>' +
        l +
        "</b>" +
        rs
          .map(
            (r) =>
              '<a href="#entry/' +
              r.id +
              '">' +
              escapeHTML(r.name) +
              "<em>" +
              (pageIndex("#entry/" + r.id) * 2 + 1) +
              "</em></a>"
          )
          .join("") +
        "</div>"
    )
    .join("");
  const paths = [
    [
      "#culture/type/book",
      "I",
      "Впервые в Мифах",
      "Рассказы и русские издания: выберите, с чего начать.",
    ],
    [
      "#catalog",
      "II",
      "Изучить бестиарий",
      "Существа, боги и места — с описаниями и связями.",
    ],
    [
      "#habitats",
      "III",
      "Исследовать мир",
      "Карта обитания; рядом — хроники, пантеон и древо.",
    ],
  ]
    .map(
      ([h, n, t, d]) =>
        '<a class="reading-path" href="' +
        h +
        '"><i>' +
        n +
        "</i><span><b>" +
        t +
        "</b><small>" +
        d +
        '</small></span><span aria-hidden="true">→</span></a>'
    )
    .join("");
  openFolio(
    '<div class="open-book"><section class="book-page verso"><header class="page-title"><h2 id="dialog-title">Содержание</h2><div class="cipher">' +
      cipherLine("contents") +
      '</div></header><p class="sheet-lead">Выберите свой путь по книге — или откройте любую главу ниже.</p><nav class="reading-paths" aria-label="С чего начать">' +
      paths +
      '</nav><aside class="resource-note"><b>Библиотека</b> — вымышленные трактаты Мифов. <b>Книги</b> — реальные рассказы и издания. <b>Хроники</b> рассказывают о Старцах, а <b>История</b> — о Лавкрафте и создании Мифов.</aside><nav class="toc">' +
      toc +
      '<div class="toc-atlas">' +
      atlasRows +
      '</div></nav><div class="folio-page">i</div></section>' +
      '<section class="book-page recto"><header class="page-title"><h2>Алфавитный указатель</h2></header><div class="alpha-index">' +
      index +
      '</div><div class="folio-page">ii</div></section></div>',
    "spread-mode"
  );
}
function renderPreface() {
  openFolio(
    '<div class="open-book"><section class="book-page verso"><header class="page-title"><h2 id="dialog-title">Предисловие</h2><div class="cipher">' +
      cipherLine("preface") +
      "</div></header>" +
      '<p class="dropcap">Эта книга — полевой справочник для тех, кто хочет узнать мир Говарда Филлипса Лавкрафта по существам, которые его населяют. За основу взято «Руководство натуралиста» Сэнди Петерсена: все его монстры из Мифов и существа из Страны Грёз пересказаны здесь своими словами.</p>' +
      "<p>К ним добавлены боги и чудовища из рассказов, которых в «Руководстве» нет, города и руины, знаки и реликвии и целая библиотека запретных книг.</p>" +
      "<p>У каждой записи два разворота. На первом — описание в духе натуралиста: места обитания, распространение, повадки, отличительные признаки и диаграмма размеров. На втором — свидетельства: как описывал существо сам автор, запись из полевой книжки и место для ваших заметок.</p>" +
      '<div class="folio-page">iii</div></section><section class="book-page recto"><header class="page-title"><h2>Как читать эту книгу</h2></header>' +
      '<ul class="howto"><li><b>← →</b> на клавиатуре, стрелки по краям или свайп — перелистывание.</li><li><b>Оглавление</b> вверху — вернуться к разделам из любой точки.</li><li><b>Закладки</b> на правом обрезе — главы I–VIII.</li><li><b>Ползунок</b> внизу — быстро пролистать к любой странице.</li><li><b>Поиск</b> вверху находит существо, место, произведение или раздел.</li><li>Рисунки <b>оживают</b> — их можно остановить кнопкой «Замереть».</li><li><b>↗</b> — внешняя ссылка, открывается в новой вкладке браузера.</li></ul>' +
      '<aside class="key-slip wide"><b>Об иллюстрациях</b><p>Образы существ — художественные интерпретации. Анимация помогает рассмотреть рисунок; описания и связи ищите в тексте. Для некоторых существ иллюстрации ещё готовятся.</p></aside>' +
      '<a class="open-btn small" href="#chapter/mythos">Начать с главы I →</a><div class="folio-page">iv</div></section></div>',
    "spread-mode"
  );
}
function renderChapter(ch, catalogOnly = false) {
  const items = ch.ids.map((id) => byId.get(id));
  const appx =
    ch.id === "appendix"
      ? [
          [
            "#history",
            "История Мифов",
            "arkham",
            "От Провиденса 1890 года до настольных игр",
          ],
          [
            "#culture/type/book",
            "Книги и рассказы",
            "necronomicon",
            "Что читать и где найти тексты",
          ],
          ["#culture/type/tabletop", "Настольные игры", "elder-sign", "Мифы за игровым столом"],
          ["#culture", "Следы Древних в культуре", "cthulhu", "Видеоигры, аниме, кино и поздние книги"],
          ["#about", "Зачем эта книга", "wilcox-relief", "От составителя"],
          [
            "https://universeoflovecraft.github.io/index.html",
            "Энциклопедия существ ↗",
            "yith-archive",
            "Внешний сайт: 45 статей о богах, расах и существах",
          ],
        ]
          .map(
            ([h, t, img, d], i) =>
              '<a class="mini-book atlas-card" href="' +
              h +
              '"' +
              (h.startsWith("http")
                ? ' target="_blank" rel="noopener noreferrer"'
                : "") +
              ' style="--i:' +
              i +
              '"><span class="mini-art"><img src="art/' +
              img +
              '.webp" alt="" class="plate-img framed mini"></span><span class="mini-text"><b>' +
              t +
              "</b><small>" +
              d +
              "</small></span></a>"
          )
          .join("")
      : "";
  const extra =
    ch.id === "atlas"
      ? [
          [
            "#chronicle/" + window.earthEpochs[0].id,
            "Хроника Старцев",
            "polar-reliefs",
            "Девять этапов истории древнего народа по «Хребтам Безумия»",
          ],
          [
            "#habitats",
            "Где они обитали",
            "earth-surface",
            "Глобус и восемь эпох Земли",
          ],
          [
            "#worlds/earth",
            "Карта миров",
            "kadath",
            "Места из рассказов, Страна Грёз и космос",
          ],
          [
            "#hierarchy",
            "Пантеон",
            "azathoth",
            "Круги богов и рас, как на старинной схеме",
          ],
          [
            "#atlas/cthulhu",
            "Родословное древо",
            "yog",
            "Связи всех записей и поиск пути между ними",
          ],
          ["#sizes", "Шкала размеров", "gug", "Все существа рядом с человеком"],
        ]
          .map(
            ([h, t, img, d], i) =>
              '<a class="mini-book atlas-card" href="' +
              h +
              '" style="--i:' +
              i +
              '"><span class="mini-art"><img src="art/' +
              img +
              '.webp" alt="" class="plate-img framed mini"></span><span class="mini-text"><b>' +
              t +
              "</b><small>" +
              d +
              "</small></span></a>"
          )
          .join("")
      : "";
  if (catalogOnly) return extra + appx;
  openFolio(
    '<div class="open-book chapter-spread"><section class="book-page verso chapter-plate"><img class="chapter-bg" data-image-id="chapter:'+escapeHTML(ch.id)+'" src="'+escapeHTML(window.bookImages?.get('chapter:'+ch.id)||window.bookImages?.resolve('art/'+ch.art+'.webp')||'art/'+ch.art+'.webp')+'" data-image-original="art/'+ch.art+'.webp" alt=""><div class="chapter-label"><span>Глава</span><b>'+ch.num+'</b><h2 id="dialog-title">'+escapeHTML(ch.title)+'</h2></div></section>'+
    '<section class="book-page recto chapter-records"><header class="chapter-records-heading"><a class="ink-link" href="#catalog">← Каталог</a><span>Глава '+escapeHTML(ch.num)+'</span><h3>'+escapeHTML(ch.title)+'</h3><p>'+(items.length?items.length+' '+plural(items.length)+' · Нажмите на карточку, чтобы открыть запись':'Выберите раздел главы')+'</p></header><p class="chapter-intro">'+escapeHTML(ch.intro)+'</p><div class="mini-shelf">'+items.map(miniCard).join('')+extra+appx+'</div><div class="folio-page">'+(pageIndex('#chapter/'+ch.id)*2+2)+'</div></section></div>',
    'spread-mode'
  );
}

/* ---------- Маршрутизация ---------- */
function paintReadingProgress(index){
  const percent=Math.round(index/Math.max(1,pages.length-1)*100);
  $('scrub').style.setProperty('--read-progress',percent+'%');
  $('progress-percent').textContent=percent+'%';
  $('scrub').setAttribute('aria-valuetext',pages[index].title+', страницы '+(index*2+1)+'–'+(index*2+2));
}
function updateChrome(i) {
  const p = pages[i];
  const chapterLabel=p.ch?'Глава '+p.ch.num+' — '+p.ch.title:'';
  $("where").textContent =p.ch?(p.title===p.ch.title?chapterLabel:chapterLabel+' / '+p.title):p.title;
  $("pagenum").textContent =
    "Страницы " + (i * 2 + 1) + "–" + (i * 2 + 2) + " из " + pages.length * 2;
  $("scrub").max = pages.length - 1;
  $("scrub").value = i;
  paintReadingProgress(i);
  $('where').title=$('where').textContent;
  $("prev").disabled = i === 0;
  $("next").disabled = i === pages.length - 1;
  document
    .querySelectorAll("#tabs a")
    .forEach((a) => {
      const active=p.ch?.id===a.dataset.ch;
      a.classList.toggle('on',active);
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
  document.title = p.title + " — Бестиарий Лавкрафта";
  const sec = location.hash.split("/")[0];
  $('tabs').hidden = true;
  document.querySelector('.reader .book').classList.remove('has-chapter-tabs');
  document.querySelectorAll(".section-tabs a").forEach((a) => {
    const h = a.getAttribute("href");
    const active =
      h === location.hash ||
        (h.split("/")[0] === sec &&
          ["#chronicle", "#atlas", "#catalog", "#habitats", "#culture"].includes(sec)) ||
        (h === "#chapter/books" && p.ch?.id === "books") ||
        (h === "#catalog" && sec==="#entry" && p.ch?.id!=="books") ||
        (!!a.dataset.ch && a.dataset.ch===p.ch?.id);
    a.classList.toggle("on",active);
    if(active)a.setAttribute("aria-current","page");
    else a.removeAttribute("aria-current");
  });

}
function route() {
  const hash = location.hash || "#cover";
  const i = pageIndex(hash);
  if (current >= 0 && i !== current) pendingDir = i > current ? 1 : -1;
  current = i;
  updateChrome(i);
  const [view, id, leaf, layer] = hash.slice(1).split("/");
  if (view === "contents") return renderContents();
  if (view === "preface") return renderPreface();
  if (view === "chapter") {
    const ch = chapters.find((c) => c.id === id);
    if (ch) return renderChapter(ch);
  }
  if (view === "entry" && byId.has(id))
    return openNotebook(byId.get(id), leaf === "notes");
  if (view === "chronicle") return openChronicle(id);
  if (view === "hierarchy") return openHierarchy(id);
  if (view === "habitats") return openHabitats(id, leaf, layer);
  if (view === "worlds") return openWorlds(id);
  if (view === "sizes") return openSizes(id);
  if (view === "history") return renderHistory();
  if (view === "reading") { location.replace("#culture/type/book"); return; }
  if (view === "games") { location.replace("#culture/type/tabletop"); return; }
  if (view === "culture") return renderCulture(id, leaf);
  if (view === "catalog") return renderCatalog(id);
  if (view === "atlas") {
    const r = byId.get(id) || byId.get("cthulhu");
    return openAtlas(r);
  }
  if (view === "about") return renderAbout();
  renderCover();
}
function go(delta) {
  const i = Math.min(pages.length - 1, Math.max(0, current + delta));
  if (i !== current) location.hash = pages[i].hash;
}

/* ---------- Поиск ---------- */
function runSearch() {
  const q = normalize($("search").value),
    box = $("search-results");
  if (!q) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  const destinations = [
    ["#contents", "Оглавление", "Все разделы книги"],
    ["#habitats", "Карта обитания", "География существ и эпохи"],
    ["#chronicle/arrival", "Хроники Старцев", "История цивилизации"],
    ["#history", "История Мифов", "Лавкрафт и его последователи"],
    ["#hierarchy", "Иерархия · пантеон", "Боги и расы"],
    ["#atlas/cthulhu", "Родословное древо", "Связи существ"],
    ["#culture/type/book", "Книги и рассказы", "Читать на русском"],
    ["#culture/type/tabletop", "Настольные игры", "Настолки и правила на русском"],
    ["#culture", "Следы Древних в культуре", "За пределами писаний · аниме · фильмы · игры"],
    ["#chapter/books", "Библиотека", "Вымышленные книги Мифов"],
    ["#about", "О проекте", "Зачем эта книга"],
  ];
  cultureAllMedia().forEach(media=>destinations.push(["#culture/media/"+media.id,media.title,media.year+" · "+cultureTypes[media.type]]));
  const links = destinations
    .filter(([, t, d]) => normalize(t + " " + d).includes(q))
    .slice(0, 4);
  const hits = records
    .filter((r) =>
      [r.name, r.latin, r.epithet, r.kind].some((v) => normalize(v).includes(q))
    )
    .slice(0, 9);
  box.innerHTML =
    links
      .map(
        ([h, t, d]) =>
          '<a href="' +
          h +
          '"><img src="mark.svg" alt=""><span><b>' +
          escapeHTML(t) +
          "</b><small>" +
          escapeHTML(d) +
          "</small></span></a>"
      )
      .join("") +
      hits
        .map(
          (r) =>
            '<a href="#entry/' +
            r.id +
            '">' +
            illustration(r) +
            "<span><b>" +
            escapeHTML(r.name) +
            "</b><small>" +
            escapeHTML(r.kind) +
            "</small></span></a>"
        )
        .join("") ||
    "<p>Ничего не найдено. Попробуйте имя существа или название раздела.</p>";
  box.hidden = false;
}

/* ---------- События ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("button,a");
  if (!t) return;
  if (t.dataset.quiz || t.dataset.answer) {
    fieldAction(t);
    return;
  }
  if (t.hasAttribute("data-zoom")) {
    const ex = t.getAttribute("aria-expanded") !== "true";
    t.setAttribute("aria-expanded", String(ex));
    t.closest(".specimen-art").classList.toggle("full-plate", ex);
    t.querySelector("span").textContent = ex ? "Свернуть" : "Рассмотреть";
    return;
  }
  if (t.hasAttribute("data-still")) {
    const still = !document.body.classList.contains("still-art");
    document.body.classList.toggle("still-art", still);
    try {
      localStorage.setItem("bestiary.still", still ? "1" : "");
    } catch {}
    document
      .querySelectorAll("[data-still]")
      .forEach(
        (b) =>
          (b.innerHTML =
            icon(still ? "play" : "pause") + (still ? "Оживить" : "Замереть"))
      );
    return;
  }
  if (t.id === "prev") {
    go(-1);
    return;
  }
  if (t.id === "next") {
    go(1);
    return;
  }
  if (t.closest("#search-results")) {
    $("search").value = "";
    $("search-results").hidden = true;
  }
});
$("search").addEventListener("input", runSearch);
$("search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const a = $("search-results").querySelector("a");
    if (a) {
      location.hash = a.getAttribute("href");
      $("search").value = "";
      runSearch();
      $("search").blur();
    }
  }
  if (e.key === "Escape") {
    $("search").value = "";
    runSearch();
  }
});
document.addEventListener("keydown", (e) => {
  if(document.querySelector('.image-library[open], .hierarchy-info[open]'))return;
  if (e.target.closest("input,textarea,select")) return;
  if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    go(1);
  }
  if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    go(-1);
  }
  if (e.key === "Home") {
    location.hash = "#cover";
  }
  if (e.key === "/") {
    e.preventDefault();
    $("search").focus();
  }
});
let touchX = null,
  touchY = null;
$("book").addEventListener(
  "touchstart",
  (e) => {
    if(document.querySelector('.hierarchy-info[open]')){touchX=null;touchY=null;return;}
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  },
  { passive: true }
);
$("book").addEventListener(
  "touchend",
  (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX,
      dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    if (
      Math.abs(dx) > 70 &&
      Math.abs(dx) > Math.abs(dy) * 1.6 &&
      !e.target.closest(".tree-scroll,.atlas-map,.lineup-stage,input,textarea")
    )
      go(dx < 0 ? 1 : -1);
  },
  { passive: true }
);
$("scrub").addEventListener("input", () => {
  $("scrub-tip").textContent = pages[+$("scrub").value].title;
  paintReadingProgress(+$('scrub').value);
});
$("scrub").addEventListener("change", () => {
  location.hash = pages[+$("scrub").value].hash;
  $("scrub-tip").textContent = "";
});
try {
  if (localStorage.getItem("bestiary.still"))
    document.body.classList.add("still-art");
} catch {}
document.querySelectorAll("[data-icon]").forEach((el) => {
  el.innerHTML = icon(el.dataset.icon);
});
$("tabs").innerHTML = chapterEdgeTabs();
window.addEventListener("hashchange", route);
window.addEventListener("bookimageschange",route);
route();
