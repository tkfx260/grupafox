const endpoints = {
  movie: "https://cors-anywhere.creativeclaritycreations.com/https://apis.justwatch.com/content/urls?path=%2fus%2fmovie%2fa-boy-and-his-dog",
  show:  "https://cors-anywhere.creativeclaritycreations.com/https://apis.justwatch.com/content/urls?path=%2fus%2ftv-show%2fblack-rabbit"
};

async function loadContent(type, url) {
  const el = document.getElementById(type);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();

    const title = data.heading_1 || data.meta_title || "Brak tytułu";
    const desc  = data.meta_description || "Brak opisu";
    const path  = data.full_path ? `https://www.justwatch.com${data.full_path}` : "#";

    const langList = (data.href_lang_tags || [])
      .map(tag => `<span class='badge bg-secondary me-1'>${tag.locale}</span>`)
      .join(" ");

    el.innerHTML = `
      <h5>${title}</h5>
      <p class='text-muted'>${desc}</p>
      <p><b>Link:</b> <a href='${path}' target='_blank'>${path}</a></p>
      <p><b>Dostępne języki:</b><br>${langList || "—"}</p>
    `;
  } catch (err) {
    el.innerHTML = `<p class='text-danger'>❌ Błąd pobierania danych: ${err.message}</p>`;
    console.error(`Błąd dla ${type}:`, err);
  }
}

loadContent("movie", endpoints.movie);
loadContent("tv-show", endpoints.show);
