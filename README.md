# xwarez — static multimedia hub (HTML/CSS/JS)

Prosty, nowoczesny szablon statycznej strony do katalogowania Filmów, Seriali, Gier, Programów i Muzyki.
Projekt celowo **legalny** — prezentuje opisy, trailery i okładki. Nie udostępnia nielegalnych plików.

## Jak używać
1. Rozpakuj pliki i wrzuć do repo GitHub (web UI lub git).
2. Jeśli chcesz, aby strona pokazywała aktualne popularne filmy z TMDB, pobierz klucz API:
   - Załóż konto na https://www.themoviedb.org
   - W sekcji ustawień API wygeneruj klucz
   - Otwórz `assets/script.js` i wstaw klucz w zmiennej `TMDB_API_KEY`

Bez klucza TMDB strona użyje przykładowych danych (5 przykładowych artykułów + więcej losowych przykładów).

## Struktura
- `index.html` — główna strona
- `assets/style.css` — styl (ciemnoniebieski / grafitowy)
- `assets/script.js` — logika: render, pagination, TMDB optional, rejestracja (localStorage)
- `README.md` — ten plik
- `LICENSE` — MIT

## Wymagania
Strona jest czysta statyczna — wystarczy opublikować na GitHub Pages.

## Uwaga prawna
Używaj serwisu wyłącznie do legalnych treści i z poszanowaniem praw autorskich. Nie umieszczaj materiałów bez zgody właścicieli praw.
