
# grupafox — Upflix Search (static)

Strona statyczna do przeszukiwania upflix.com. **Demo**: ze względu na CORS i możliwe ograniczenia właściciela strony, zalecane jest użycie serwerowego proxy, które pobierze stronę upflix.com i zwróci HTML lub JSON do klienta.

## Co zawiera
- index.html
- upflix.js
- README.md

## Konfiguracja proxy
W `upflix.js` ustaw `PROXY_BASE` na adres Twojego proxy (np. Cloudflare Worker lub inny serwer który przyjmuje `GET <proxy_url><target_url>` i zwraca zawartość targetu). Domyślnie ustawiono `https://cors-proxy.cooks.fyi/` co działa do testów, ale może być niestabilne.

## Deployment na GitHub Pages
1. Utwórz repo `grupafox-upflix` na GitHub.
2. Wgraj pliki (Upload files) albo użyj git:
   ```bash
   git init
   git add .
   git commit -m "Initial upflix search site"
   git branch -M main
   git remote add origin https://github.com/<twoj-login>/grupafox-upflix.git
   git push -u origin main
   ```
3. Na GitHub -> Settings -> Pages: wybierz `main` branch i folder `/ (root)`.
4. Strona dostępna pod `https://<twoj-login>.github.io/grupafox-upflix/`.
