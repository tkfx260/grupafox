
/*
  grupafox — Upflix Search static frontend
  WARNING: upflix.com may block scraping and has no public API. Use a proxy that fetches HTML server-side and returns JSON.
  Configure PROXY_BASE to point to your CORS-enabled proxy that will accept a `url` parameter and return HTML or JSON.
*/

const PROXY_BASE = "https://cors-proxy.cooks.fyi/"; // default proxy prefix - replace with your proxy endpoint (must accept full URL)

document.getElementById('searchBtn').addEventListener('click', () => doSearch());
document.getElementById('q').addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });

async function doSearch() {
  const q = document.getElementById('q').value.trim();
  const type = document.getElementById('type').value;
  if (!q) { setStatus('Wpisz zapytanie.'); return; }
  setStatus('Szukam...');
  try {
    // Upflix site search: upflix.com has search pages like https://upflix.com/search?query=... (site structure may change)
    const target = `https://upflix.com/search?query=${encodeURIComponent(q)}`;
    const url = PROXY_BASE + target;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Błąd proxy/API: ' + resp.status);
    const text = await resp.text();
    // parse HTML response to extract items (simple heuristics)
    const items = parseUpflixHtml(text);
    // optional filtering by type (movie/show)
    const filtered = items.filter(it => {
      if (type === 'all') return true;
      return it.type === type;
    });
    renderResults(filtered);
    setStatus('Znaleziono ' + filtered.length + ' wyników.');
  } catch (err) {
    console.error(err);
    setStatus('Błąd: ' + err.message);
  }
}

function setStatus(msg){ document.getElementById('status').textContent = msg; }

function parseUpflixHtml(html) {
  // Very simple parser: looks for article.card or elements with title and link.
  // This is fragile and for demo only. A robust implementation should run server-side and return JSON.
  const results = [];
  try {
    // create DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    // upflix uses list items with class 'movie' or 'show' or cards; try multiple selectors
    const nodes = doc.querySelectorAll('.movie, .show, .card, article, .title, .result-item');
    const seen = new Set();
    nodes.forEach(n => {
      // try to find a link and title
      const a = n.querySelector('a') || n.querySelector('a.title') || n.querySelector('h2 a');
      const title = (n.querySelector('.title') || n.querySelector('h2') || a)?.textContent?.trim();
      const href = a?.getAttribute('href') || null;
      if (!title || !href) return;
      if (seen.has(href)) return;
      seen.add(href);
      // try to infer type and year/poster
      const type = href.includes('/movie/') ? 'movie' : href.includes('/show/') ? 'show' : 'movie';
      const poster = (n.querySelector('img') && (n.querySelector('img').src || n.querySelector('img').getAttribute('data-src'))) || null;
      results.push({ title, href: href.startsWith('http') ? href : ('https://upflix.com' + href), type, poster });
    });
  } catch(e){
    console.error('parse error', e);
  }
  return results;
}

function renderResults(items) {
  const c = document.getElementById('results');
  c.innerHTML = '';
  if (!items || items.length === 0) {
    c.innerHTML = '<div class="col-span-full text-slate-400">Brak wyników</div>';
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
    h.textContent = it.title;
    h.className = 'font-semibold';
    const meta = document.createElement('div');
    meta.className = 'text-xs text-slate-400 mt-1';
    meta.textContent = it.type;
    const a = document.createElement('a');
    a.href = it.href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'text-emerald-300 hover:underline text-sm';
    a.textContent = 'Otwórz na upflix.com';
    card.appendChild(img);
    card.appendChild(h);
    card.appendChild(meta);
    card.appendChild(a);
    c.appendChild(card);
  }
}

