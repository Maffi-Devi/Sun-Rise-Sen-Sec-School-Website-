/*
 * Static site builder for Sun Rise Sr. Sec. School website.
 * Usage:  node _build/build.js
 * Each file in _build/pages/*.html starts with a JSON front-matter comment:
 *   <!--{ "title": "...", "description": "...", "file": "about.html", ... }-->
 * The builder wraps it with the shared <head>, header and footer, expands
 * {{icon:name}} placeholders, adds width/height to local <img> tags and
 * writes the finished page (plus sitemap.xml) to the project root.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PAGES = path.join(__dirname, "pages");

const SITE = {
  url: "https://sunriseschoolkaithal.com",
  name: "Sun Rise Sr. Sec. School",
  fullName: "Sun Rise Sr. Sec. School, Magho Majri (Kaithal)",
  motto: "Rise Together and Shine Together",
  phone: "+91 92555 28310",
  phoneRaw: "+919255528310",
  admissionPhone: "+91 87088 67177",
  admissionPhoneRaw: "+918708867177",
  whatsapp: "918708867177",
  email: "sunrisesr.secschool@yahoo.com",
  street: "Khanouri Road, Village Magho Majri, P.O. Manas",
  city: "Kaithal",
  region: "Haryana",
  pin: "136027",
  lat: 29.81760,
  lng: 76.34808,
  affiliation: "531671",
  schoolCode: "41650",
  founded: "2005",
  instagram: "https://www.instagram.com/sunrise_sen_sec_school_ktl/",
  facebook: "https://www.facebook.com/p/Sunrise-SR-SEC-School-100057047636289/",
};

/* ---------------- Icons (stroke icons, 24x24) ---------------- */
const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  phone: P('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  mail: P('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
  pin: P('<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
  clock: P('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
  award: P('<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>'),
  book: P('<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>'),
  bookOpen: P('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
  users: P('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
  grad: P('<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>'),
  building: P('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>'),
  bus: P('<path d="M8 6v6M16 6v6M2 12h20M7 18h10"/><rect x="3" y="3" width="18" height="15" rx="3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'),
  shield: P('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
  flask: P('<path d="M9 3h6M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M7 15h10"/>'),
  monitor: P('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'),
  library: P('<path d="m16 6 4 14M12 6v14M8 8v12M4 4v16"/>'),
  trophy: P('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17c0 .6-.5 1-1 1.2C7.8 18.8 7 20.2 7 22M14 14.7V17c0 .6.5 1 1 1.2 1.2.6 2 2 2 3.8"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>'),
  heart: P('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>'),
  star: P('<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'),
  check: P('<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>'),
  arrow: P('<path d="M5 12h14M13 5l7 7-7 7"/>'),
  chev: P('<path d="m6 9 6 6 6-6"/>'),
  menu: P('<path d="M3 6h18M3 12h18M3 18h18"/>'),
  x: P('<path d="M18 6 6 18M6 6l12 12"/>'),
  left: P('<path d="m15 18-6-6 6-6"/>'),
  right: P('<path d="m9 18 6-6-6-6"/>'),
  up: P('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  calendar: P('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  file: P('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>'),
  download: P('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
  sun: P('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  palette: P('<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2v-.5a2 2 0 0 1 2-2h1.5A4.5 4.5 0 0 0 22 13 10 10 0 0 0 12 2z"/>'),
  compass: P('<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>'),
  target: P('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  eye: P('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'),
  sparkle: P('<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'),
  leaf: P('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>'),
  calc: P('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>'),
  briefcase: P('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'),
  globe: P('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
  info: P('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  clipboard: P('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>'),
  smile: P('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>'),
  user: P('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  medal: P('<path d="M7.2 15 2.7 7.2A2 2 0 0 1 2.9 5l1.3-1.6A2 2 0 0 1 5.8 3h12.4a2 2 0 0 1 1.6.8L21.1 5a2 2 0 0 1 .2 2.2L16.8 15"/><path d="M11 12 5.1 3.2M13 12l5.9-8.8M8 7h8"/><circle cx="12" cy="17" r="5"/>'),
  run: P('<circle cx="17" cy="4" r="2"/><path d="m15.6 8.6-3.8 2.8 3 3.2-1.8 5.4M8 21l3-6M5 11l3-3 4 1 3 3 3 1"/>'),
  music: P('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  instagram: P('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'),
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2c-.3 0-1.3-.2-2.6-.2-2.6 0-4.3 1.6-4.3 4.5v2H7.2V12h2.9v10h3.9V12h2.9l.5-3.5z"/></svg>',
  home: P('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>'),
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.3-1.5-5.2C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2A11.8 11.8 0 0 0 12 .2C5.5.2.2 5.5.2 12c0 2.1.5 4.1 1.6 5.9L.1 24l6.3-1.7c1.7.9 3.7 1.4 5.6 1.4 6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.4-8.3z"/></svg>',
};

/* ---------------- Navigation ---------------- */
const NAV = [
  { label: "Home", href: "index.html" },
  { label: "About", href: "about.html", children: [
    { label: "About the School", sub: "Our story since 2005", href: "about.html" },
    { label: "Principal's Message", sub: "A word from Mr. Khushi Ram", href: "about.html#principal" },
    { label: "Vision & Mission", sub: "What we stand for", href: "about.html#vision" },
    { label: "Faculty & Staff", sub: "Meet our teachers", href: "faculty.html" },
  ] },
  { label: "Academics", href: "academics.html", children: [
    { label: "Curriculum & Stages", sub: "Nursery to Class XII", href: "academics.html" },
    { label: "Senior Secondary Streams", sub: "Arts · Commerce · Science", href: "academics.html#streams" },
    { label: "Academic Calendar", sub: "Session 2026-27", href: "academics.html#calendar" },
    { label: "Co-Curricular Activities", sub: "Beyond the classroom", href: "academics.html#co-curricular" },
  ] },
  { label: "Admissions", href: "admissions.html", children: [
    { label: "Admission Process", sub: "Session 2026-27", href: "admissions.html" },
    { label: "Fee Structure", sub: "Class-wise fees & bus fee", href: "fee-structure.html" },
    { label: "Documents Required", sub: "Checklist for parents", href: "admissions.html#documents" },
    { label: "Age Eligibility", sub: "As per NEP 2020", href: "admissions.html#age" },
  ] },
  { label: "Facilities", href: "facilities.html" },
  { label: "Gallery", href: "gallery.html", children: [
    { label: "Photo Gallery", sub: "Campus, events & more", href: "gallery.html" },
    { label: "Achievements", sub: "Our pride", href: "achievements.html" },
  ] },
  { label: "Disclosure", href: "mandatory-disclosure.html" },
  { label: "Contact", href: "contact.html" },
];

function navHtml(file) {
  const items = NAV.map((n) => {
    const current = n.href === file || (n.children || []).some((c) => c.href === file);
    const cur = current ? ' aria-current="page"' : "";
    if (!n.children) {
      return `<li class="nav__item"><a class="nav__link" href="${n.href}"${cur}>${n.label}</a></li>`;
    }
    const kids = n.children.map((c) => `<li><a href="${c.href}">${c.label}<small>${c.sub}</small></a></li>`).join("");
    return `<li class="nav__item has-dropdown"><a class="nav__link" href="${n.href}"${cur} aria-haspopup="true" aria-expanded="false">${n.label}${ICONS.chev}</a><ul class="dropdown">${kids}</ul></li>`;
  }).join("\n          ");
  return items;
}

/* ---------------- Structured data ---------------- */
function schoolSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["School", "EducationalOrganization"],
    "@id": SITE.url + "/#school",
    name: SITE.name,
    alternateName: ["Sun Rise Senior Secondary School", "Sunrise Sr. Sec. School Kaithal", "Sun Rise School Magho Majri"],
    url: SITE.url + "/",
    logo: SITE.url + "/assets/img/logo.png",
    sameAs: [SITE.instagram, SITE.facebook],
    image: SITE.url + "/assets/img/campus-building.jpg",
    slogan: SITE.motto,
    foundingDate: SITE.founded,
    telephone: SITE.phoneRaw,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.street,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      postalCode: SITE.pin,
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.lat, longitude: SITE.lng },
    hasMap: `https://www.google.com/maps?q=${SITE.lat},${SITE.lng}`,
    areaServed: ["Kaithal", "Magho Majri", "Manas", "Gadli", "Gamri", "Budha Khera", "Atela", "Baba Ladana", "Sirta", "Franswala", "Bhanauli", "Chika", "Dharampura"],
    founder: { "@type": "Organization", name: "Sun Rise Education Society, Mago Majri" },
    employee: { "@type": "Person", name: "Khushi Ram", jobTitle: "Principal" },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "CBSE Affiliation",
      identifier: SITE.affiliation,
      recognizedBy: { "@type": "Organization", name: "Central Board of Secondary Education (CBSE), New Delhi" },
    },
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:30", closes: "14:20",
    }],
  };
}

function breadcrumbSchema(page) {
  if (page.file === "index.html") return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
      { "@type": "ListItem", position: 2, name: page.crumb, item: SITE.url + "/" + page.file },
    ],
  };
}

/* ---------------- Image dimension helper ---------------- */
function imageSize(file) {
  try {
    const buf = fs.readFileSync(file);
    if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
  } catch (e) { /* ignore */ }
  return null;
}

function addImageDims(html) {
  return html.replace(/<img\b([^>]*?)\/?>/g, (tag, attrs) => {
    if (/\swidth=/.test(attrs)) return tag;
    const m = attrs.match(/src="([^"]+)"/);
    if (!m || /^(https?:|data:)/.test(m[1])) return tag;
    const size = imageSize(path.join(ROOT, m[1]));
    if (!size) { console.warn("  ! missing image", m[1]); return tag; }
    return `<img${attrs.replace(/\s*$/, "")} width="${size.w}" height="${size.h}">`;
  });
}

/* ---------------- Layout ---------------- */
function layout(page, body) {
  const canonical = SITE.url + "/" + (page.file === "index.html" ? "" : page.file);
  const ogImage = SITE.url + "/assets/img/" + (page.ogImage || "morning-assembly.jpg");
  const schemas = [schoolSchema(), breadcrumbSchema(page)].concat(page.schema || []).filter(Boolean);
  const ld = schemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n  ");
  const preload = page.preload ? `\n  <link rel="preload" as="image" href="${page.preload}" fetchpriority="high">` : "";

  return `<!DOCTYPE html>
<html lang="en-IN" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="keywords" content="${page.keywords || "Sun Rise Sr. Sec. School, Sunrise School Kaithal, CBSE school Kaithal, Magho Majri school, best school in Kaithal, CBSE 531671"}">
  <meta name="author" content="${SITE.fullName}">
  <meta name="robots" content="${page.robots || "index, follow, max-image-preview:large"}">
  <meta name="theme-color" content="#0f766e">
  <meta name="geo.region" content="IN-HR">
  <meta name="geo.placename" content="Magho Majri, Kaithal">
  <meta name="geo.position" content="${SITE.lat};${SITE.lng}">
  <meta name="ICBM" content="${SITE.lat}, ${SITE.lng}">
  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:locale" content="en_IN">
  <meta property="og:title" content="${page.ogTitle || page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.ogTitle || page.title}">
  <meta name="twitter:description" content="${page.description}">
  <meta name="twitter:image" content="${ogImage}">

  <link rel="icon" type="image/png" sizes="32x32" href="assets/img/icon-32.png">
  <link rel="apple-touch-icon" href="assets/img/icon-180.png">
  <link rel="manifest" href="site.webmanifest">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">${preload}
  ${ld}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <div class="topbar">
    <div class="container">
      <ul class="topbar__list">
        <li><a href="tel:${SITE.phoneRaw}">${ICONS.phone}${SITE.phone}</a></li>
        <li class="hide-sm"><a href="mailto:${SITE.email}">${ICONS.mail}${SITE.email}</a></li>
        <li class="hide-sm">${ICONS.clock}Mon – Sat · 8:30 AM – 2:20 PM</li>
      </ul>
      <div class="topbar__right"><span class="topbar__tag">Affiliated to CBSE, New Delhi · No. ${SITE.affiliation}</span><div class="social social--top"><a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Sun Rise School on Instagram">${ICONS.instagram}</a><a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Sun Rise School on Facebook">${ICONS.facebook}</a></div></div>
    </div>
  </div>

  <header class="site-header">
    <div class="container">
      <a class="brand" href="index.html" aria-label="${SITE.name} — Home">
        <img src="assets/img/logo.png" alt="Sun Rise Sr. Sec. School logo" width="230" height="204">
        <span><span class="brand__name">Sun Rise Sr. Sec. School</span><span class="brand__sub">MAGHO MAJRI · KAITHAL · CBSE</span></span>
      </a>
      <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">${ICONS.menu}</button>
      <nav class="nav" id="site-nav" aria-label="Main navigation">
        <button class="nav-toggle nav-close" type="button" aria-label="Close menu">${ICONS.x}</button>
        <ul class="nav__list">
          ${navHtml(page.file)}
        </ul>
        <div class="nav__cta"><a class="btn btn--sm" href="admissions.html#enquiry">Apply Now</a></div>
      </nav>
      <div class="nav-backdrop"></div>
    </div>
  </header>

  <main id="main">
${body}
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <div class="footer-brand">
          <img src="assets/img/logo.png" alt="" width="230" height="204" loading="lazy">
          <div><strong>Sun Rise Sr. Sec. School</strong><span>Magho Majri, Kaithal (Haryana)</span></div>
        </div>
        <p>A CBSE-affiliated co-educational school from Nursery to Class XII, nurturing young minds in Kaithal since ${SITE.founded}. <em>“${SITE.motto}.”</em></p>
        <span class="footer-badge">${ICONS.award} CBSE Affiliation No. ${SITE.affiliation} · School Code ${SITE.schoolCode}</span>
        <p class="footer-follow">Follow us</p>
        <div class="social social--footer"><a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Sun Rise School on Instagram">${ICONS.instagram}</a><a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Sun Rise School on Facebook">${ICONS.facebook}</a></div>
      </div>
      <div>
        <h3>Quick Links</h3>
        <ul class="footer-links">
          <li><a href="about.html">About Us</a></li>
          <li><a href="academics.html">Academics</a></li>
          <li><a href="faculty.html">Faculty &amp; Staff</a></li>
          <li><a href="facilities.html">Facilities</a></li>
          <li><a href="gallery.html">Photo Gallery</a></li>
          <li><a href="achievements.html">Achievements</a></li>
        </ul>
      </div>
      <div>
        <h3>Parents' Corner</h3>
        <ul class="footer-links">
          <li><a href="admissions.html">Admissions 2026-27</a></li>
          <li><a href="fee-structure.html">Fee Structure</a></li>
          <li><a href="academics.html#calendar">Academic Calendar</a></li>
          <li><a href="mandatory-disclosure.html">Mandatory Disclosure</a></li>
          <li><a href="careers.html">Careers</a></li>
          <li><a href="contact.html">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h3>Get in Touch</h3>
        <ul class="footer-contact">
          <li>${ICONS.pin}<span>${SITE.street},<br>${SITE.city}, ${SITE.region} – ${SITE.pin}</span></li>
          <li>${ICONS.phone}<span><a href="tel:${SITE.phoneRaw}">${SITE.phone}</a><br><a href="tel:${SITE.admissionPhoneRaw}">${SITE.admissionPhone}</a> (Admissions)</span></li>
          <li>${ICONS.mail}<a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li>${ICONS.clock}<span>Principal meets parents: 10 – 11 AM daily</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <span>© <span data-year>2026</span> ${SITE.fullName}. All rights reserved.</span>
        <span>Run by Sun Rise Education Society, Mago Majri</span>
      </div>
    </div>
  </footer>

  <div class="fab">
    <a class="fab__wa" href="https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hello, I would like to know about admissions at Sun Rise Sr. Sec. School.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICONS.whatsapp}</a>
    <a class="fab__call" href="tel:${SITE.phoneRaw}" aria-label="Call the school">${ICONS.phone}</a>
    <button class="fab__top" type="button" aria-label="Back to top">${ICONS.up}</button>
  </div>

  <script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}

/* Inner-page banner used by most pages */
function pageHero(page) {
  if (!page.hero) return "";
  return `    <section class="page-hero">
      <div class="page-hero__bg"><img src="assets/img/${page.hero.img}" alt="" fetchpriority="high"${page.hero.pos ? ` style="object-position:${page.hero.pos}"` : ""}></div>
      <div class="container">
        <ol class="breadcrumb" aria-label="Breadcrumb"><li><a href="index.html">Home</a></li><li aria-current="page">${page.crumb}</li></ol>
        <h1>${page.hero.title}</h1>
        <p>${page.hero.text}</p>
      </div>
    </section>
`;
}

/* ---------------- Build ---------------- */
const built = [];
for (const name of fs.readdirSync(PAGES).filter((f) => f.endsWith(".html"))) {
  const raw = fs.readFileSync(path.join(PAGES, name), "utf8");
  const m = raw.match(/^<!--([\s\S]*?)-->\s*/);
  if (!m) throw new Error("Missing front matter in " + name);
  const page = JSON.parse(m[1]);
  page.file = page.file || name;
  if (page.hero) page.preload = "assets/img/" + page.hero.img;
  let body = pageHero(page) + raw.slice(m[0].length);
  body = body.replace(/\{\{icon:(\w+)\}\}/g, (_, k) => {
    if (!ICONS[k]) throw new Error("Unknown icon " + k + " in " + name);
    return ICONS[k];
  });
  body = body.replace(/\{\{site:(\w+)\}\}/g, (_, k) => SITE[k]);
  const html = addImageDims(layout(page, body));
  fs.writeFileSync(path.join(ROOT, page.file), html);
  built.push(page);
  console.log("built", page.file);
}

/* sitemap.xml */
const today = new Date().toISOString().slice(0, 10);
const urls = built
  .filter((p) => !p.noindex)
  .sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5))
  .map((p) => `  <url>\n    <loc>${SITE.url}/${p.file === "index.html" ? "" : p.file}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq || "monthly"}</changefreq>\n    <priority>${(p.priority || 0.6).toFixed(1)}</priority>\n  </url>`)
  .join("\n");
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log("built sitemap.xml");
