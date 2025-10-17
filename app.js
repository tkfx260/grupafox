
/*
  grupafox - static frontend that queries JustWatch API via a CORS proxy.
  CONFIG: set PROXY_BASE to a CORS-enabled proxy prefix, e.g.
    const PROXY_BASE = "https://cors-proxy.cooks.fyi/https://apis.justwatch.com";
  If you have your own proxy, set it here.
*/

const PROXY_BASE = "https://cors-proxy.cooks.fyi/https://apis.justwatch.com";

document.getElementById('searchBtn').addEventListener('click', () => doSearch());
document.getElementById('q').addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });

async function doSearch() {
  const query = document.getElementById('q').value.trim();
  const audioRaw = document.getElementById('audio').value.trim();
  const subsRaw = document.getElementById('subs').value.trim();
  const filterNew = document.getElementById('filterNew').checked;
  const filterPolish = document.getElementById('filterPolish').checked;

  if (!query) {
    setStatus('Wpisz tytuł do wyszukania.');
    return;
  }
  setStatus('Szukam...');

  try {
    // Use JustWatch popularTitles search endpoint (unofficial) via proxy
    // We'll call a search endpoint that many clients use:
    // /content/titles?body={"query":"...","page_size":10,"page":1,"content_types":["movie","show"],"language":"pl_PL"}
    const body = {
      query: query,
      page_size: 24,
      page: 1,
      content_types: ["movie","show"],
      language: "pl_PL"
    };

    const url = PROXY_BASE + "/content/titles?body=" + encodeURIComponent(JSON.stringify(body));
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Błąd API: ' + resp.status);
    const json = await resp.json();
    const items = json.items || json.title_results || json;

    // Normalize items
    const normalized = (items || []).map(i => {
      return {
        id: i.id || i.object_id || i.tmdb_id,
        title: i.title || i.original_title || i.name || (i.content && i.content.title),
        original_release_year: i.original_release_year || (i.content && i.content.original_release_year),
        poster: (i.poster || i.images?.poster) ? formatImage(i.poster || i.images?.poster) : null,
        offers: i.offers || i.available_offers || i.details || i.content?.offers || []
      };
    });

    // For each result we need to fetch offers (detailed) to check languages & added date
    const results = [];
    for (const it of normalized) {
      const offers = await fetchOffersForItem(it);
      it.offers = offers;
      results.push(it);
    }

    // Apply filters client-side
    const audioList = audioRaw ? audioRaw.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean) : [];
    const subsList = subsRaw ? subsRaw.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean) : [];

    const filtered = results.map(r => ({
      ...r,
      offers: r.offers.filter(o => {
        if (filterPolish) {
          const ok = hasLang(o, 'pl') || hasSubtitle(o, 'pl');
          if (!ok) return false;
        }
        if (audioList.length) {
          const ok = audioList.some(l => hasLang(o, l));
          if (!ok) return false;
        }
        if (subsList.length) {
          const ok = subsList.some(l => hasSubtitle(o, l));
          if (!ok) return false;
        }
        if (filterNew) {
          const dt = getOfferDate(o);
          if (!dt) return false;
          const cutoff = Date.now() - 1000*60*60*24*30;
          if (dt.getTime() < cutoff) return false;
        }
        return true;
      })
    })).filter(r => r.offers && r.offers.length);

    renderResults(filtered);
    setStatus('Znaleziono ' + filtered.length + ' tytułów (po zastosowaniu filtrów).');
  } catch (err) {
    console.error(err);
    setStatus('Błąd: ' + err.message);
  }
}

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function formatImage(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return 'https://images.justwatch.com' + path;
}

async function fetchOffersForItem(item) {
  // Try multiple endpoints commonly used by JustWatch clients
  try {
    // Many clients call /content/titles/<id>/locale/<locale>/offers
    const candidate1 = PROXY_BASE + `/content/titles/${encodeURIComponent(item.id)}/locale/pl_PL/`;
    const r1 = await fetch(candidate1);
    if (r1.ok) {
      const j1 = await r1.json();
      // Inspect and try to extract offers
      if (j1.offers) return j1.offers;
      if (j1.items && j1.items[0] && j1.items[0].offers) return j1.items[0].offers;
      // otherwise return whole json as single "offer"
      return [j1];
    }
  } catch(e){ /* ignore and try next */ }

  try {
    // Fallback to calling /content/titles?body=... to get offers in results if present
    const body = {query: item.title, page_size: 1, page:1, language: "pl_PL"};
    const url = PROXY_BASE + "/content/titles?body=" + encodeURIComponent(JSON.stringify(body));
    const resp = await fetch(url);
    if (resp.ok) {
      const j = await resp.json();
      if (j.items && j.items.length) {
        const entry = j.items.find(it => (it.title||'').toLowerCase() === (item.title||'').toLowerCase()) || j.items[0];
        return entry.offers || entry.available_offers || [];
      }
    }
  } catch(e){ /* ignore */ }

  return [];
}

// Helpers to test languages and dates in loosely structured offer objects
function hasLang(offer, lang) {
  if (!offer) return false;
  // common property names
  const candidates = ['audio','audio_languages','audio_locales','audio_languages_display','audio_locale','language', 'languages'];
  for (const c of candidates) {
    const val = findProp(offer, c);
    if (!val) continue;
    if (typeof val === 'string' && val.toLowerCase().includes(lang)) return true;
    if (Array.isArray(val) && val.some(x => String(x).toLowerCase().includes(lang))) return true;
  }
  // also check technical info in subtitles/audios arrays
  if (offer.audio && Array.isArray(offer.audio)) return offer.audio.some(a => String(a).toLowerCase().includes(lang));
  return false;
}

function hasSubtitle(offer, lang) {
  if (!offer) return false;
  const candidates = ['subtitles','subtitle_languages','subtitle','subtitle_locales','subtitles_display'];
  for (const c of candidates) {
    const val = findProp(offer, c);
    if (!val) continue;
    if (typeof val === 'string' && val.toLowerCase().includes(lang)) return true;
    if (Array.isArray(val) && val.some(x => String(x).toLowerCase().includes(lang))) return true;
  }
  if (offer.subtitles && Array.isArray(offer.subtitles)) return offer.subtitles.some(s => String(s).toLowerCase().includes(lang));
  return false;
}

function findProp(obj, name) {
  if (!obj) return undefined;
  // direct
  if (obj[name] !== undefined) return obj[name];
  // try case-insensitive
  const keys = Object.keys(obj || {});
  for (const k of keys) {
    if (k.toLowerCase() === name.toLowerCase()) return obj[k];
  }
  // try nested
  for (const k of keys) {
    const v = obj[k];
    if (v && typeof v === 'object') {
      const found = findProp(v, name);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function getOfferDate(offer) {
  if (!offer) return null;
  const candidates = ['first_seen','first_added','first_seen_at','added_at','published_at','release_date','created_at','updated_at'];
  for (const c of candidates) {
    const val = findProp(offer, c);
    if (!val) continue;
    const dt = new Date(val);
    if (!isNaN(dt)) return dt;
    // sometimes values are epoch seconds or millis
    if (!isNaN(Number(val))) {
      const n = Number(val);
      if (String(val).length === 10) return new Date(n*1000);
      return new Date(n);
    }
  }
  return null;
}

function renderResults(items) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="col-span-full text-slate-400">Brak wyników</div>';
    return;
  }
  for (const it of items) {
    const card = document.createElement('div');
    card.className = 'bg-slate-800 rounded-lg p-3 shadow hover:shadow-lg transition';
    const img = document.createElement('img');
    img.src = it.poster || 'https://via.placeholder.com/400x600?text=No+Image';
    img.alt = it.title;
    img.className = 'w-full h-56 object-cover rounded-md mb-2';
    const h = document.createElement('h3');
    h.textContent = it.title + (it.original_release_year ? ' ('+it.original_release_year+')' : '');
    h.className = 'font-semibold';
    const offersList = document.createElement('div');
    offersList.className = 'mt-2 space-y-1 text-sm text-slate-300';
    if (it.offers && it.offers.length) {
      for (const o of it.offers) {
        const div = document.createElement('div');
        div.className = 'p-2 bg-slate-900/40 rounded flex items-center justify-between';
        const left = document.createElement('div');
        left.innerHTML = `<div class="font-medium">${o.package_name || o.package || o.provider || o.clear_name || o.name || ''}</div>
                          <div class="text-xs text-slate-400">${o.monetization_type || o.type || o.presentation_type || ''}</div>`;
        const right = document.createElement('div');
        const link = (o.urls && (o.urls.standard_web || o.urls.standard_web_url)) || o.url || o.standard_web_url || o.href || null;
        if (link) {
          const a = document.createElement('a');
          a.href = link;
          a.target = '_blank';
          a.rel = 'noopener';
          a.className = 'text-indigo-300 hover:underline text-sm';
          a.textContent = 'Otwórz';
          right.appendChild(a);
        }
        div.appendChild(left);
        div.appendChild(right);
        offersList.appendChild(div);
      }
    } else {
      offersList.textContent = 'Brak ofert';
    }
    card.appendChild(img);
    card.appendChild(h);
    card.appendChild(offersList);
    container.appendChild(card);
  }
}
