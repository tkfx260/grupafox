// Sample JS to populate project cards (legal/open-source examples)
const projects = [
  {
    title: "Przykładowy Projekt A",
    desc: "Opis projektu A. Open-source, licencja MIT.",
    tags: ["CLI","MIT"],
    link: "#"
  },
  {
    title: "Narzędzie B",
    desc: "Narzędzie B — freeware z autorską licencją.",
    tags: ["GUI","Freeware"],
    link: "#"
  },
  {
    title: "Biblioteka C",
    desc: "Biblioteka C — dostępna na GitHubie.",
    tags: ["Library","Open-Source"],
    link: "#"
  }
];

function renderProjects(){
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';
  projects.forEach(p=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <p style="margin-top:10px"><small>${p.tags.join(' · ')}</small></p>
      <p style="margin-top:12px"><a class="btn" href="${p.link}">Szczegóły</a></p>
    `;
    grid.appendChild(el);
  });
}

document.getElementById('contact-form').addEventListener('submit', e=>{
  e.preventDefault();
  alert('Formularz wysłany (demo).');
  e.target.reset();
});

renderProjects();
