
# grupafox — JustWatch Search (static)

Statyczna strona frontendowa wyszukująca filmy i seriale korzystając z publicznego API JustWatch (przez proxy CORS).
Projekt jest gotowy do publikacji na GitHub Pages (push na branch `main` i włączenie Pages).

## Co zawiera
- `index.html` — aplikacja SPA (HTML + Tailwind + JS)
- `app.js` — logika wyszukiwania + filtrowania (audio, subs, nowo dodane 30 dni, polski)
- `README.md` — instrukcja
- `favicon.png` — ikona (placeholder)
- `DEPLOY.md` — instrukcje szybkiego deployu na GitHub Pages

## Konfiguracja proxy
Domyślnie `app.js` używa `https://cors-proxy.cooks.fyi/https://apis.justwatch.com` jako proxy (PROXY_BASE).  
Jeśli chcesz używać własnego proxy, zmień wartość `PROXY_BASE` w `app.js`.

## Wdrożenie na GitHub Pages (szybko)
1. Stwórz nowe repo w GitHub o nazwie `grupafox` (publiczne).
2. Skopiuj pliki z tego folderu do repo i commituj (najprościej przeciągnij i upuść w web UI albo użyj `git`):
   ```bash
   git init
   git add .
   git commit -m "Initial grupafox site"
   git branch -M main
   git remote add origin https://github.com/<twoj-login>/grupafox.git
   git push -u origin main
   ```
3. Na GitHub: Repo -> Settings -> Pages -> Source: wybierz `main` branch i folder `/ (root)`. Zapisz.
4. Po chwili strona będzie pod `https://<twoj-login>.github.io/grupafox/`

## Uwagi
- Publiczne API JustWatch może zmieniać strukturę odpowiedzi. Jeśli coś nie działa, zalecane jest uruchomienie własnego prostego proxy (np. na Heroku/Cloudflare Workers) które przekieruje żądania do `https://apis.justwatch.com` i doda CORS header.
