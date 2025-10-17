const API_PROXY = "https://cors-anywhere.creativeclaritycreations.com/";
const BASE_URL = "https://apis.justwatch.com/content/urls?path=";

document.getElementById("searchBtn").addEventListener("click", doSearch);
document.getElementById("searchInput").addEventListener("keypress", e => {
  if (e.key === "Enter") doSearch();
});

async function doSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<div class="text-center"><div class="spinner-border text-primary"></div><p class="mt-2">Wyszukiwanie...</p></div>`;

  if (!query) {
    resultsDiv.innerHTML = `<div class="text-center text-danger">❌ Podaj tytuł do wyszukania.</div>`;
    return;
  }

  try {
    const encoded = encodeURIComponent(`/us/movie/${query.toLowerCase().replace(/\s+/g, "-")}`);
    const urlMovie = `${API_PROXY}${BASE_URL}${encoded}`;
    const encodedShow = encodeURIComponent(`/us/tv-show/${query.toLowerCase().replace(/\s+/g, "-")}`);
    const urlShow = `${API_PROXY}${BASE_URL}${encodedShow}`;

    const [movieRes, showRes] = await Promise.allSettled([
      fetch(urlMovie),
      fetch(urlShow)
    ]);

    const results = [];

    if (movieRes.status === "fulfilled" && movieRes.value.ok) {
      const movie = await movieRes.value.json();
      results.push(formatResult(movie, "🎥 Film"));
    }

    if (showRes.status === "fulfilled" && showRes.value.ok) {
      const show = await showRes.value.json();
      results.push(formatResult(show, "📺 Serial"));
    }

    if (results.length === 0) {
      resultsDiv.innerHTML = `<div class="text-center text-muted">Brak wyników dla „${query}”.</div>`;
    } else {
      resultsDiv.innerHTML = results.join("");
    }

  } catch (error) {
    console.error(error);
    resultsDiv.innerHTML = `<div class="text-center text-danger">Błąd połączenia z API.</div>`;
  }
}

function formatResult(data, label) {
  const title = data.heading_1 || data.meta_title || "Brak tytułu";
  const desc = data.meta_description || "Brak opisu";
  const link = data.full_path ? `https://www.justwatch.com${data.full_path}` : "#";
  const langs = (data.href_lang_tags || [])
    .map(tag => `<span class="badge bg-secondary me-1">${tag.locale}</span>`)
    .join(" ") || "—";

  return `
  <div class="col-md-5">
    <div class="card shadow-sm h-100">
      <div class="card-body">
        <h5 class="card-title">${label}: ${title}</h5>
        <p class="text-muted">${desc}</p>
        <p><b>Link:</b> <a href="${link}" target="_blank">${link}</a></p>
        <p><b>Dostępne języki:</b><br>${langs}</p>
      </div>
    </div>
  </div>`;
}
