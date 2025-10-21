# Naprawa Białego Flashbanga

## Problem
Przy przełączaniu między stronami pojawia się biały flash (flashbang) na ułamek sekundy.

## Przyczyna
Strona ładuje się od zera i przez moment pokazuje białe tło HTML zanim załaduje się CSS i JavaScript.

## Rozwiązanie

### 1. Czarny overlay podczas ładowania
```javascript
// Overlay który zakrywa białe tło
.nav-loading-overlay {
  position: fixed;
  background: #000;
  z-index: 99999;
  opacity: 1;  // Domyślnie widoczny
  visibility: visible;
}
```

### 2. Czarne tło HTML
```css
html {
  background: #000 !important;
}
```

### 3. Wczesne ładowanie skryptu
Skrypt `simple-smooth-nav.js` jest teraz ładowany w `<head>` zaraz po `preload-lang.js`:
```html
<head>
  <script src="assets/js/preload-lang.js"></script>
  <script src="assets/js/simple-smooth-nav.js"></script>
</head>
```

### 4. SessionStorage dla płynności
```javascript
// Zapisz stan nawigacji
sessionStorage.setItem('isNavigating', 'true');
sessionStorage.setItem('navigationTime', Date.now().toString());

// Sprawdź przy ładowaniu nowej strony
const wasNavigating = sessionStorage.getItem('isNavigating') === 'true';
```

## Jak to działa

### Przy kliknięciu w link:
1. Overlay staje się widoczny (czarny ekran)
2. Body fade-out
3. Zapisz stan w sessionStorage
4. Przejdź do nowej strony

### Przy ładowaniu nowej strony:
1. Skrypt ładuje się NATYCHMIAST w `<head>`
2. Tworzy czarny overlay (zakrywa białe tło)
3. Sprawdza czy nawigowaliśmy
4. Po załadowaniu: fade-out overlay
5. Strona jest widoczna

## Rezultat
- ✅ Brak białego flashbanga
- ✅ Płynne przejścia między stronami
- ✅ Czarny ekran podczas ładowania
- ✅ Profesjonalny wygląd

## Testowanie
1. Uruchom `python -m http.server 8000`
2. Otwórz `http://localhost:8000`
3. Kliknij w linki menu
4. Sprawdź czy nie ma białego flasha

## Debugowanie
```javascript
// W konsoli
window.simpleSmoothNav; // Sprawdź system
sessionStorage.getItem('isNavigating'); // Sprawdź stan
```

## Uwagi
- Skrypt MUSI być w `<head>` żeby działać
- Overlay jest domyślnie widoczny (ukrywa się po załadowaniu)
- SessionStorage śledzi nawigację między stronami
- Fallback do standardowej nawigacji przy błędach