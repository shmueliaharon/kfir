/* Simple static app, no backend, RTL, with country filtering */
const STORAGE_KEY = 'trip_itinerary_v2';

function getData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.ITINERARY_DATA));
  return window.ITINERARY_DATA;
}

function saveData(data){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function qs(id){ return document.getElementById(id); }

function sanitizeQuery(s){
  return (s || '').toString().trim();
}

function buildUnsplashUrl(query){
  const q = encodeURIComponent(query);
  return `https://source.unsplash.com/featured/?${q}`;
}

function buildMapsUrl(query){
  const q = encodeURIComponent(query);
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

function unique(arr){
  return Array.from(new Set(arr));
}

function renderCountryChips(data, selectedCountry, onSelect){
  const countries = unique(data.days.map(d => d.country || 'לא מסווג'));
  // Keep "כל המדינות" first, then stable order
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
  list.innerHTML = '';

  const qEl = qs('q');
  const dateEl = qs('dateFilter');

  let selectedCountry = localStorage.getItem('selected_country') || '';

  // populate date filter
  const dates = data.days.map(d => d.date);
  const uniqDates = unique(dates);
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
    localStorage.setItem('selected_country', selectedCountry);
    renderCountryChips(data, selectedCountry, setCountry);
    draw();
  }

  function draw(){
    const q = sanitizeQuery(qEl.value);
    const date = dateEl.value || '';
    const filtered = data.days
      .map((d, idx) => ({ d, idx }))
      .filter(x => matchDay(x.d, q, date, selectedCountry));

    list.innerHTML = filtered.map(({d, idx}) => {
      const lod = d.lodging ? d.lodging : 'לא צוין';
      const loc = d.location ? d.location : 'לא צוין';
      const country = d.country ? d.country : 'לא מסווג';
      const placesCount = (d.places || []).length;
      return `
        <div class="dayCard">
          <div class="dayCard__top">
            <div>
              <div class="dayCard__date">${d.date}</div>
              <div class="dayCard__loc">${loc}</div>
              <div class="dayCard__lod">מדינה: ${country} | לינה: ${lod}</div>
            </div>
            <div class="badge">${placesCount} מקומות</div>
          </div>
          <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn btn--primary" data-open-day="${idx}">פתח יום</button>
            <a class="btn" href="${buildMapsUrl(loc)}" target="_blank" rel="noopener">פתח מיקום במפות</a>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('[data-open-day]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-open-day'));
        setHashDay(i);
      });
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

  qs('dayLodging').textContent = day.lodging || 'לא צוין';

  const transfersUl = qs('dayTransfers');
  const transfers = day.transfers || [];
  transfersUl.innerHTML = transfers.length
    ? transfers.map(t => `<li>${t}</li>`).join('')
    : '<li>לא צוינו מעברים</li>';

  const placesWrap = qs('placesList');
  const places = day.places || [];
  placesWrap.innerHTML = places.length ? places.map(p => {
    const query = p.name || day.location || day.country || data.title || 'travel';
    const imgUrl = buildUnsplashUrl(query);
    const mapsUrl = buildMapsUrl(p.name || day.location || '');
    const type = p.type || 'מקום';
    return `
      <div class="place">
        <div class="place__img">
          <img src="${imgUrl}" alt="${p.name}" loading="lazy"
               onerror="this.onerror=null; this.src='${buildUnsplashUrl(day.location || day.country || data.title || 'travel')}'" />
        </div>
        <div class="place__body">
          <div class="place__name">${p.name}</div>
          <div class="place__type">${type}</div>
          <div class="place__actions">
            <a class="smallBtn" href="${mapsUrl}" target="_blank" rel="noopener">פתח במפות</a>
            <button class="smallBtn" data-copy="${p.name}">העתק שם</button>
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

function showHome(){
  show(qs('viewHome'));
  hide(qs('viewDay'));
}

function showDay(){
  hide(qs('viewHome'));
  show(qs('viewDay'));
}

function wireActions(data){
  qs('btnHome').addEventListener('click', () => { location.hash = ''; });
  qs('btnBack').addEventListener('click', () => { location.hash = ''; });

  qs('btnCopyLink').addEventListener('click', async () => {
    const url = location.href;
    try { await navigator.clipboard.writeText(url); } catch(e) {}
    qs('btnCopyLink').textContent = 'הקישור הועתק';
    setTimeout(() => qs('btnCopyLink').textContent = 'העתק קישור ליום', 1000);
  });

  // Export / Import JSON
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
}

function main(){
  const data = getData();
  wireActions(data);

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
