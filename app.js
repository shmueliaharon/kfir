/* WOW Mobile RTL - unique thumbnails per place (no external images) */
const STORAGE_KEY = 'trip_itinerary_v6';
const COUNTRY_KEY = 'selected_country_v6';

function getData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.ITINERARY_DATA));
  return window.ITINERARY_DATA;
}
function saveData(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function qs(id){ return document.getElementById(id); }
function sanitizeQuery(s){ return (s || '').toString().trim(); }
function unique(arr){ return Array.from(new Set(arr)); }


function buildImageUrl(rel){
  // allow absolute http(s) or relative under repo
  const s = (rel || '').toString().trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  // support leading slash
  const path = s.startsWith('/') ? s.slice(1) : s;
  // add cache buster by build version
  return path + '?v=6';
}

function buildMapsUrl(query){
  const q = encodeURIComponent((query || '').toString().trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function parseHash(){
  const h = (location.hash || '').replace(/^#/, '');
  const params = new URLSearchParams(h);
  const day = params.get('day');
  return { day: day ? Number(day) : null };
}
function setHashDay(i){
  const params = new URLSearchParams();
  params.set('day', String(i));
  location.hash = params.toString();
}
function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

function hash01(str){
  // deterministic 0..1
  const s = (str || '').toString();
  let h = 2166136261;
  for (let i = 0; i < s.length; i++){
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // unsigned
  h >>>= 0;
  return (h % 10000) / 10000;
}

function colorForCountry(country){
  const c = (country || '').toString();
  if (c.includes('תאילנד')) return ['#22c55e', '#2a4bff'];
  if (c.includes('יפן')) return ['#fb7185', '#7c3aed'];
  if (c.includes('וייטנאם')) return ['#f59e0b', '#ef4444'];
  if (c.includes('קמבודיה')) return ['#38bdf8', '#a78bfa'];
  if (c.includes('סינגפור')) return ['#60a5fa', '#34d399'];
  if (c.includes('מלזיה')) return ['#f472b6', '#22c55e'];
  return ['#2a4bff', '#7c3aed'];
}

function iconForType(type){
  const t = (type || '').toString();
  if (t.includes('אוכל')) return '🍽️';
  if (t.includes('לינה')) return '🏨';
  if (t.includes('מעבר')) return '🚗';
  return '🌴';
}

function svgBanner(title, country){
  const [a,b] = colorForCountry(country);
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="520" viewBox="0 0 1200 520">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}" stop-opacity="0.88"/>
        <stop offset="1" stop-color="${b}" stop-opacity="0.78"/>
      </linearGradient>
      <radialGradient id="r" cx="30%" cy="15%" r="70%">
        <stop offset="0" stop-color="white" stop-opacity="0.20"/>
        <stop offset="1" stop-color="white" stop-opacity="0"/>
      </radialGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="24"/>
      </filter>
    </defs>
    <rect width="1200" height="520" fill="url(#g)"/>
    <circle cx="260" cy="140" r="210" fill="url(#r)"/>
    <circle cx="940" cy="120" r="180" fill="white" opacity="0.12"/>
    <circle cx="920" cy="380" r="260" fill="white" opacity="0.06" filter="url(#blur)"/>
    <path d="M0,410 C240,330 360,520 600,440 C840,360 960,520 1200,420 L1200,520 L0,520 Z" fill="black" opacity="0.18"/>
    <path d="M0,360 C240,280 360,460 600,390 C840,320 960,460 1200,370" fill="white" opacity="0.10"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function svgThumb(seedText, country){
  const [a,b] = colorForCountry(country);
  const u = hash01(seedText);
  const v = hash01(seedText + '|2');
  const w = hash01(seedText + '|3');

  const cx1 = 60 + Math.round(120*u);
  const cy1 = 70 + Math.round(90*v);
  const r1  = 40 + Math.round(45*w);

  const cx2 = 150 + Math.round(70*v);
  const cy2 = 170 + Math.round(120*w);
  const r2  = 55 + Math.round(55*u);

  const wave = 220 + Math.round(70*w);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="360" viewBox="0 0 240 360">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}" stop-opacity="0.88"/>
        <stop offset="1" stop-color="${b}" stop-opacity="0.78"/>
      </linearGradient>
      <radialGradient id="r" cx="${20+Math.round(60*u)}%" cy="${10+Math.round(20*v)}%" r="70%">
        <stop offset="0" stop-color="white" stop-opacity="0.22"/>
        <stop offset="1" stop-color="white" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="240" height="360" rx="28" fill="url(#g)"/>
    <rect width="240" height="360" rx="28" fill="url(#r)"/>
    <circle cx="${cx1}" cy="${cy1}" r="${r1}" fill="white" opacity="0.16"/>
    <circle cx="${cx2}" cy="${cy2}" r="${r2}" fill="white" opacity="0.10"/>
    <path d="M0,${wave} C60,${wave-28} 80,${wave+52} 140,${wave+20} C190,${wave-10} 210,${wave+60} 240,${wave+30} L240,360 L0,360 Z" fill="black" opacity="0.18"/>
    <path d="M0,${wave-40} C60,${wave-70} 80,${wave+20} 140,${wave-10} C190,${wave-45} 210,${wave+25} 240,${wave-5}" fill="white" opacity="0.10"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}


function getOfficialTourismLinks(day){
  const loc = (day.location || '').toString();
  const country = (day.country || '').toString();
  const links = [];

  // Official tourism portals (good starting point when a specific city site is unavailable)
  const OFFICIAL = {
    'תאילנד': { label: 'אתר תיירות רשמי תאילנד (TAT)', url: 'https://www.tourismthailand.org/' },
    'וייטנאם': { label: 'אתר תיירות רשמי וייטנאם', url: 'https://www.vietnam.travel/' },
    'לאוס': { label: 'אתר תיירות רשמי לאוס', url: 'https://www.tourismlaos.org/' },
    'קמבודיה': { label: 'משרד התיירות קמבודיה', url: 'https://www.tourism.gov.kh/' },
  };

  // If we have a clean country label in the data, use it.
  if (OFFICIAL[country]) links.push(OFFICIAL[country]);

  // Otherwise, infer by common destination keywords in the itinerary (Hebrew).
  if (!links.length){
    const th = ['בנגקוק','קופנגן','קופניאנג','קוטאו','קוסמוי','פוקט','קראבי','צ׳אנג מאי','צ'אנג מאי','פאי'];
    const vn = ['האנוי','הו צי מין','דה נאנג','הוי אן','הואה','פונג נה','טאם קוק','הא לונג','סאפה','הא גיאנג','דאלאת'];
    const la = ['לואנג פראבנג','ויאנטין','ואנג ויאנג','נונג קיאו','דון דאט','פקסה','תאקק'];
    const kh = ['סיאם ריפ','פנום פן','אנגקור'];

    const inList = (arr) => arr.some(k => loc.includes(k));
    if (inList(th)) links.push(OFFICIAL['תאילנד']);
    else if (inList(vn)) links.push(OFFICIAL['וייטנאם']);
    else if (inList(la)) links.push(OFFICIAL['לאוס']);
    else if (inList(kh)) links.push(OFFICIAL['קמבודיה']);
  }

  // Always provide a direct Google Maps search for the destination string.
  if (loc){
    const q = encodeURIComponent(loc);
    links.push({ label: 'חיפוש היעד במפות Google', url: `https://www.google.com/maps/search/?api=1&query=${q}` });
  }

  // De-dup by url
  const seen = new Set();
  return links.filter(l => l?.url && !seen.has(l.url) && seen.add(l.url));
}


function setHeroBackground(country, locationText){
  const hero = qs('dayHero');
  hero.style.backgroundImage = `url("${svgBanner(locationText || 'יום טיול', country)}")`;
  hero.style.backgroundSize = 'cover';
  hero.style.backgroundPosition = 'center';
}

function renderCountryChips(data, selectedCountry, onSelect){
  const countries = unique(data.days.map(d => d.country || 'לא מסווג'));
  const chips = [{name:'כל המדינות', value:''}, ...countries.map(c => ({name:c, value:c}))];
  const wrap = qs('countryChips');
  wrap.innerHTML = chips.map(c => {
    const active = (c.value === selectedCountry) || (c.value === '' && !selectedCountry);
    return `<button class="chip ${active ? 'active' : ''}" data-country="${c.value}">${c.name}</button>`;
  }).join('');
  wrap.querySelectorAll('[data-country]').forEach(btn => {
    btn.addEventListener('click', () => onSelect(btn.getAttribute('data-country') || ''));
  });
}

function renderHome(data){
  qs('tripTitle').textContent = data.title || '';
  const list = qs('daysList');
  const qEl = qs('q');
  const dateEl = qs('dateFilter');

  let selectedCountry = localStorage.getItem(COUNTRY_KEY) || '';

  const uniqDates = unique(data.days.map(d => d.date));
  dateEl.innerHTML = '<option value="">כל התאריכים</option>' + uniqDates.map(d => `<option value="${d}">${d}</option>`).join('');

  function matchDay(day, q, date, country){
    if (country && (day.country || 'לא מסווג') !== country) return false;
    if (date && day.date !== date) return false;
    if (!q) return true;
    const t = q.toLowerCase();
    const hay = [
      day.date, day.location, day.lodging, day.country,
      ...(day.transfers || []),
      ...((day.places || []).map(p => p.name))
    ].join(' ').toLowerCase();
    return hay.includes(t);
  }

  function setCountry(c){
    selectedCountry = c;
    localStorage.setItem(COUNTRY_KEY, selectedCountry);
    renderCountryChips(data, selectedCountry, setCountry);
    draw();
  }

  function dayCard(d, idx){
    const loc = d.location || 'לא צוין';
    const lod = d.lodging || 'לא צוין';
    const country = d.country || 'לא מסווג';
    const placesCount = (d.places || []).length;
    const banner = svgBanner(loc, country);
    return `
      <div class="dayCard">
        <div class="dayCard__banner" style="background-image:url('${banner}'); background-size:cover; background-position:center;"></div>
        <div class="dayCard__content">
          <div class="dayCard__row">
            <div>
              <div class="dayCard__date">${d.date || ''}</div>
              <div class="dayCard__loc">${loc}</div>
              <div class="dayCard__meta">מדינה: ${country} | לינה: ${lod}</div>
            </div>
            <div class="badge">${placesCount} מקומות</div>
          </div>
          <div class="actions">
            <button class="pill pill--primary" data-open-day="${idx}">פתח יום</button>
            <a class="pill" href="${buildMapsUrl(loc)}" target="_blank" rel="noopener">מפות</a>
          </div>
        </div>
      </div>
    `;
  }

  function draw(){
    const q = sanitizeQuery(qEl.value);
    const date = dateEl.value || '';
    const filtered = data.days
      .map((d, idx) => ({ d, idx }))
      .filter(x => matchDay(x.d, q, date, selectedCountry));

    list.innerHTML = filtered.map(({d, idx}) => dayCard(d, idx)).join('');

    list.querySelectorAll('[data-open-day]').forEach(btn => {
      btn.addEventListener('click', () => setHashDay(Number(btn.getAttribute('data-open-day'))));
    });
  }

  renderCountryChips(data, selectedCountry, setCountry);
  qEl.oninput = draw;
  dateEl.onchange = draw;
  draw();
}

function renderDay(data, idx){
  const day = data.days[idx];
  if (!day) return;

  qs('dayDate').textContent = day.date || '';
  const metaParts = [];
  if (day.country) metaParts.push(`מדינה: ${day.country}`);
  if (day.location) metaParts.push(`מיקום: ${day.location}`);
  if (day.places?.length) metaParts.push(`מקומות: ${day.places.length}`);
  qs('dayMeta').textContent = metaParts.join(' | ');

  setHeroBackground(day.country, day.location);

  const locLinks = getOfficialTourismLinks(day);
  const locEl = qs('dayLocationInfo');
  if (locEl){
    locEl.innerHTML = locLinks.length ? locLinks.map(l => `<a class="link" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('<br>') : 'אין קישורים זמינים ליעד זה.';
  }

  qs('dayLodging').textContent = day.lodging || 'לא צוין';

  const transfersUl = qs('dayTransfers');
  const transfers = day.transfers || [];
  transfersUl.innerHTML = transfers.length
    ? transfers.map(t => `<li>${t}</li>`).join('')
    : '<li>לא צוינו מעברים</li>';

  const placesWrap = qs('placesList');
  const places = day.places || [];
  placesWrap.innerHTML = places.length ? places.map(p => {
    const type = p.type || 'מקום';
    const icon = iconForType(type);
    const real = buildImageUrl(p.image || '');
    const thumb = real ? real : svgThumb((p.name || '') + '|' + (day.location || '') + '|' + (day.date || ''), day.country);
    const mapsUrl = buildMapsUrl(p.name || day.location || '');
    return `
      <div class="place">
        <div class="thumb" style="background-image:url('${thumb}'); background-size:cover; background-position:center;">
          <div class="thumb__icon">${icon}</div>
          <div class="thumb__label">${(p.name || '').toString()}</div>
        </div>
        <div class="place__body">
          <div class="place__name">${(p.name || '').toString()}</div>
          <div class="place__type">${type}</div>
          ${p.description ? `<div class="place__desc">${(p.description || '').toString()}</div>` : ''}
          ${p.website ? `<a class="place__site" href="${p.website}" target="_blank" rel="noopener">אתר רשמי</a>` : ''}
          <div class="place__actions">
            <a class="small" href="${mapsUrl}" target="_blank" rel="noopener">פתח במפות</a>
            <button class="small" data-copy="${(p.name || '').toString()}">העתק שם</button>
          </div>
        </div>
      </div>
    `;
  }).join('') : '<div class="text">לא צוינו מקומות ליום זה</div>';

  placesWrap.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      try { await navigator.clipboard.writeText(text); } catch(e) {}
      btn.textContent = 'הועתק';
      setTimeout(() => btn.textContent = 'העתק שם', 900);
    });
  });
}

function showHome(){ show(qs('viewHome')); hide(qs('viewDay')); }
function showDay(){ hide(qs('viewHome')); show(qs('viewDay')); }

function wireActions(){
  qs('btnHome').addEventListener('click', () => { location.hash = ''; });
  qs('btnBack').addEventListener('click', () => { location.hash = ''; });

  qs('btnCopyLink').addEventListener('click', async () => {
    const url = location.href;
    try { await navigator.clipboard.writeText(url); } catch(e) {}
    qs('btnCopyLink').textContent = 'הועתק';
    setTimeout(() => qs('btnCopyLink').textContent = 'העתק קישור', 900);
  });

  qs('btnExport').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(getData(), null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'itinerary-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  qs('btnImport').addEventListener('click', () => qs('importFile').click());
  qs('importFile').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const j = JSON.parse(text);
      if (!j || !Array.isArray(j.days)) throw new Error('bad');
      saveData(j);
      location.reload();
    } catch(err) {
      alert('קובץ לא תקין');
    }
  });

  qs('tabHome').addEventListener('click', () => {
    location.hash = '';
    window.scrollTo({top:0, behavior:'smooth'});
  });
  qs('tabTop').addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
}

function main(){
  const data = getData();
  qs('tripTitle').textContent = data.title || '';
  wireActions();

  function route(){
    const {day} = parseHash();
    if (day !== null && !Number.isNaN(day) && day >= 0 && day < data.days.length){
      showDay();
      renderDay(data, day);
    } else {
      showHome();
      renderHome(data);
    }
  }

  window.addEventListener('hashchange', route);
  route();
}
main();
