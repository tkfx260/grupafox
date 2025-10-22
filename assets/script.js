// xwarez static site script (TMDB optional)
// --- Configuration ---
// Get an API Key at https://www.themoviedb.org/settings/api and paste here if you want live movie data.
const TMDB_API_KEY = 'f04ec2760797717979af557d7a4389f6'; // <-- paste your TMDB API key here (or leave empty to use sample data)
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Sample items (5 required sample articles)
const SAMPLE_ITEMS = [
  {
    id: 'a1',
    type: 'Filmy',
    title: 'Neon Horizon',
    short: 'Cyberpunkowy thriller o hakerce, która ściga wspomnienia korporacji.',
    desc: 'Akcja rozgrywa się w 2042 roku. Główna bohaterka walczy z korporacyjnymi tajemnicami, odkrywając, że rzeczywistość to projekt. Film łączy dynamiczne sekwencje akcji z głęboką historią o tożsamości i pamięci. Reżyseria: A. Kowalski. Czas trwania: 128 min.',
    img: 'https://picsum.photos/seed/neon/400/600'
  },
  {
    id: 'a2',
    type: 'Serial',
    title: 'Cienie Miasta (Sezon 1)',
    short: 'Mroczny serial kryminalny o detektywie z przeszłością.',
    desc: 'Serial śledzi historię detektywa wracającego do rodzinnego miasta, gdzie zagraża mu dawna sprawa. Zawiła intryga, głębokie postacie i klimat noir. Każdy odcinek to nowe tropy i zaskakujące zwroty akcji.',
    img: 'https://picsum.photos/seed/cienie/400/600'
  },
  {
    id: 'a3',
    type: 'Gry',
    title: 'Skyforge Legends',
    short: 'Przygodowa gra akcji z otwartym światem i magią.',
    desc: 'Skyforge Legends to gra akcji w otwartym świecie z rozbudowanym systemem umiejętności i trybem kooperacji. Przemierzaj latające wyspy, walcz z potężnymi bossami i rozwijaj swoje postaci w epickiej kampanii.',
    img: 'https://picsum.photos/seed/sky/400/600'
  },
  {
    id: 'a4',
    type: 'Programy',
    title: 'StudioNote 2.0',
    short: 'Lekki edytor notatek z szyfrowaniem i wieloma platformami.',
    desc: 'StudioNote 2.0 to nowoczesna aplikacja do notowania z szyfrowaniem end-to-end, tagami i wyszukiwaniem pełnotekstowym. Dostępna na Windows, macOS i Linux jako aplikacja desktopowa.',
    img: 'https://picsum.photos/seed/studio/400/600'
  },
  {
    id: 'a5',
    type: 'Muzyka',
    title: 'Echoes of Tomorrow (Album)',
    short: 'Ambientowy album łączący elektronikę z akustycznymi brzmieniami.',
    desc: 'Album "Echoes of Tomorrow" to podróż przez przestrzenne pejzaże dźwiękowe. Kompozycje łączą syntetyczne pady z imponującymi liniami smyczków i subtelnymi rytmami. Idealne tło do pracy i relaksu.',
    img: 'https://picsum.photos/seed/echo/400/600'
  }
];

// Create many sample items to showcase pagination and popular
const MORE = Array.from({length:30}).map((_,i)=>({
  id: 's'+i,
  type: ['Filmy','Serial','Gry','Programy','Muzyka'][i%5],
  title: `Przykładowy tytuł ${i+1}`,
  short: 'Krótki opis przykładowego artykułu. Maksymalnie 400 znaków — to jest demonstracja skróconej treści.',
  desc: 'To jest rozszerzony opis przykładowego artykułu. Zawiera szczegóły, tła i dodatkowe informacje, aby zobaczyć jak wygląda widok szczegółowy. Ten tekst ma posłużyć jako placeholder przy tworzeniu layoutu.',
  img: `https://picsum.photos/seed/sample${i}/400/600`
}));

let ALL = [...SAMPLE_ITEMS, ...MORE];

// localStorage helpers for simple registration demo
function loadUsers(){ try{ return JSON.parse(localStorage.getItem('xw_users')||'[]') }catch(e){return []} }
function saveUsers(u){ localStorage.setItem('xw_users', JSON.stringify(u)) }

// DOM refs
const menuButtons = document.querySelectorAll('.menu button');
const itemsArea = document.getElementById('items-area');
const popularList = document.getElementById('popular-list');
const newsList = document.getElementById('news-list');
const searchInput = document.getElementById('search');
const paginationEl = document.getElementById('pagination');
const detailModal = document.getElementById('detail-modal');
const detailBody = document.getElementById('detail-body');
const detailClose = document.getElementById('detail-close');
const registerBtn = document.getElementById('register-btn');
const regModal = document.getElementById('reg-modal');
const regClose = document.getElementById('reg-close');
const regClose2 = document.getElementById('reg-close-2');
const regForm = document.getElementById('reg-form');
const authArea = document.getElementById('auth-area');

let state = {
  filter: 'Wszystko',
  query: '',
  page: 1,
  pageSizeHome: 10,
  pageSizeOther: 20
};

// --- TMDB integration (optional) ---
async function fetchTMDBPopular(page=1){
  if(!TMDB_API_KEY) return null;
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pl-PL&page=${page}`;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('TMDB failed');
    const data = await res.json();
    // map to our item shape
    return data.results.map(r=>({
      id: 'tmdb-'+r.id,
      type: 'Filmy',
      title: r.title || r.name,
      short: r.overview ? (r.overview.slice(0,200)+'...') : '',
      desc: r.overview || '',
      img: r.poster_path ? (TMDB_IMAGE_BASE + r.poster_path) : ('https://picsum.photos/seed/tmdb'+r.id+'/400/600')
    }));
  }catch(e){
    console.warn('TMDB error', e);
    return null;
  }
}

// --- Rendering ---
function renderNews(){
  const list = SAMPLE_ITEMS.slice(0,3);
  newsList.innerHTML = list.map(i=>`
    <div class="news-item"><img src="${i.img}" /><div><strong>${i.title}</strong><div class="small">${i.type}</div></div></div>
  `).join('');
}

function renderPopular(){
  const top = ALL.slice(0,8);
  popularList.innerHTML = top.map(i=>`
    <a href="#" class="pop-item" data-id="${i.id}"><img src="${i.img}" /><div><strong>${i.title}</strong><div class="small">${i.type}</div></div></a>
  `).join('');
  // attach handlers
  document.querySelectorAll('#popular-list a').forEach(a=>{
    a.addEventListener('click', e=>{ e.preventDefault(); openDetail(a.dataset.id); });
  });
}

function filterItems(){
  const q = state.query.trim().toLowerCase();
  return ALL.filter(it=>{
    if(state.filter!=='Wszystko' && it.type!==state.filter) return false;
    if(!q) return true;
    return (it.title + ' ' + it.short + ' ' + it.desc).toLowerCase().includes(q);
  });
}

function renderItems(){
  const all = filterItems();
  const pageSize = state.page===1 ? state.pageSizeHome : state.pageSizeOther;
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  if(state.page > totalPages) state.page = 1;
  const start = (state.page -1)*pageSize;
  const pageItems = all.slice(start, start + pageSize).slice(0, pageSize);

  itemsArea.innerHTML = pageItems.map(it=>`
    <article class="card">
      <img src="${it.img}" alt="${escapeHtml(it.title)}" />
      <div class="meta">
        <h3>${escapeHtml(it.title)}</h3>
        <div class="small">${it.type}</div>
        <p>${escapeHtml(it.short)}</p>
        <div class="actions">
          <button class="btn" data-id="${it.id}" data-action="more">Więcej</button>
          <button class="btn" data-id="${it.id}" data-action="trailer">Trailer</button>
        </div>
      </div>
    </article>
  `).join('') || '<p>Brak wyników</p>';

  // attach handlers
  itemsArea.querySelectorAll('button[data-action="more"]').forEach(b=>{
    b.addEventListener('click', ()=> openDetail(b.dataset.id));
  });
  itemsArea.querySelectorAll('button[data-action="trailer"]').forEach(b=>{
    b.addEventListener('click', ()=> openDetail(b.dataset.id, {openTrailer:true}));
  });

  // pagination
  renderPagination(totalPages);
}

function renderPagination(total){
  paginationEl.innerHTML = '';
  for(let i=1;i<=total;i++){
    const btn = document.createElement('button');
    btn.textContent = i;
    if(i===state.page) btn.style.background = 'rgba(255,255,255,0.06)';
    btn.addEventListener('click', ()=>{ state.page = i; renderAll(); });
    paginationEl.appendChild(btn);
  }
}

// --- Detail modal ---
function openDetail(id, opts={}){
  const item = ALL.find(x=>x.id==id) || SAMPLE_ITEMS[0];
  detailBody.innerHTML = `
    <h2>${escapeHtml(item.title)}</h2>
    <div class="small">${item.type}</div>
    <div style="display:flex;gap:12px;margin-top:12px">
      <img src="${item.img}" style="width:180px;height:260px;object-fit:cover;border-radius:8px" />
      <div style="flex:1">
        <p style="color:var(--muted)">${escapeHtml(item.desc)}</p>
        ${opts.openTrailer ? renderTrailer(item) : ''}
        <div style="margin-top:12px"><button class="btn primary" id="open-trailer-btn">Otwórz trailer</button></div>
      </div>
    </div>
  `;
  detailModal.classList.remove('hidden');
  document.getElementById('open-trailer-btn')?.addEventListener('click', ()=>{
    detailBody.insertAdjacentHTML('beforeend', renderTrailer(item));
    document.getElementById('open-trailer-btn').style.display='none';
  });
}

function renderTrailer(item){
  // if TMDB id? try youtube not available; show placeholder iframe to youtube search for title
  const q = encodeURIComponent(item.title + ' trailer');
  return `<div style="margin-top:12px"><iframe src="https://www.youtube.com/embed?listType=search&list=${q}" frameborder="0" width="100%" height="360" allowfullscreen></iframe></div>`;
}

// --- Registration UI ---
function renderAuthArea(){
  const users = loadUsers();
  const current = JSON.parse(localStorage.getItem('xw_current')||'null');
  if(current){
    authArea.innerHTML = `<div>Witaj, <strong>${escapeHtml(current.name)}</strong><div style="margin-top:8px"><button class="btn" id="logout-btn">Wyloguj</button></div></div>`;
    document.getElementById('logout-btn').addEventListener('click', ()=>{ localStorage.removeItem('xw_current'); renderAuthArea(); });
  } else {
    authArea.innerHTML = `<div>Pozostań zalogowany, aby komentować i tworzyć listy.<div style="margin-top:8px"><button class="btn primary" id="open-reg">Zarejestruj / Zaloguj</button></div></div>`;
    document.getElementById('open-reg').addEventListener('click', ()=>{ regModal.classList.remove('hidden'); });
  }
}

regForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = new FormData(regForm);
  const user = { name: f.get('name'), email: f.get('email') };
  const users = loadUsers();
  users.push(user);
  saveUsers(users);
  localStorage.setItem('xw_current', JSON.stringify({ name: user.name, email:user.email }));
  regModal.classList.add('hidden');
  renderAuthArea();
});

regClose?.addEventListener('click', ()=> regModal.classList.add('hidden'));
regClose2?.addEventListener('click', ()=> regModal.classList.add('hidden'));
registerBtn?.addEventListener('click', ()=> regModal.classList.remove('hidden'));
detailClose?.addEventListener('click', ()=> detailModal.classList.add('hidden'));

// escape helper
function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// --- Event wiring ---
menuButtons.forEach(b=> b.addEventListener('click', ()=>{
  menuButtons.forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  state.filter = b.dataset.filter;
  state.page = 1;
  renderAll();
}));

searchInput?.addEventListener('input', ()=>{ state.query = searchInput.value; state.page=1; renderAll(); });

// click on popular or news handled after rendering lists
document.addEventListener('click', (e)=>{
  const a = e.target.closest('[data-id]');
  if(a && a.dataset.id && e.target.matches('.pop-item, .pop-item *')){
    e.preventDefault();
    openDetail(a.dataset.id);
  }
});

// Init flow: try TMDB if key present, else use sample
async function init(){
  renderNews();
  const tmdb = await fetchTMDBPopular(1);
  if(tmdb && tmdb.length){
    // merge TMDB results at front
    ALL = [...tmdb, ...ALL];
  }
  renderPopular();
  renderAuthArea();
  renderAll();
}

function renderAll(){ renderItems(); renderPopular(); }

init();
