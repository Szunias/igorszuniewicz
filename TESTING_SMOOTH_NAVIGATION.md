# Testowanie Systemu Płynnej Nawigacji

## Jak przetestować

### 1. Uruchom serwer lokalny
```bash
python -m http.server 8000
```
Lub użyj Live Server w VS Code.

### 2. Otwórz stronę
Przejdź do `http://localhost:8000`

### 3. Testuj nawigację
- Kliknij w linki w menu (Home, About, Projects, Music, Contact)
- Sprawdź czy nie ma białego migotania
- Sprawdź czy przejścia są płynne
- Testuj przycisk wstecz/dalej w przeglądarce

### 4. Testuj funkcje
- **Preload**: Najedź myszką na link i sprawdź Network tab - powinna się załadować strona
- **Cache**: Przejdź na stronę, wróć, i przejdź ponownie - powinna ładować się błyskawicznie
- **Tłumaczenia**: Zmień język - powinno działać bez problemów
- **Mobile menu**: Testuj na urządzeniach mobilnych

### 5. Sprawdź w Developer Tools

#### Console
Nie powinno być błędów JavaScript. Możliwe ostrzeżenia:
- `Translations timeout - showing page anyway` (normalne przy wolnym ładowaniu)
- `High memory usage detected, clearing cache` (normalne przy długim użytkowaniu)

#### Network Tab
- Pierwsze ładowanie: wszystkie zasoby
- Kolejne nawigacje: tylko nowe strony HTML
- Preload: zasoby ładowane przy hover

#### Performance Tab
- Smooth animations bez lagów
- Brak memory leaks przy długim użytkowaniu

### 6. Testuj edge cases

#### Zewnętrzne linki
- Linki do innych domen powinny działać normalnie
- Linki z `target="_blank"` powinny otwierać nowe okno
- Linki `mailto:` i `tel:` powinny działać normalnie

#### Błędy sieci
- Wyłącz internet i kliknij link - powinien fallback do standardowej nawigacji
- Serwer 404 - powinien pokazać błąd lub fallback

#### Długie strony
- Scroll position powinien resetować się do góry przy nawigacji
- Animacje fade-in powinny działać poprawnie

### 7. Testuj wydajność

#### Memory Usage
```javascript
// W konsoli
console.log(performance.memory);
window.smoothNavigation.pageCache.size; // Sprawdź rozmiar cache
```

#### Timing
```javascript
// Zmierz czas nawigacji
console.time('navigation');
window.smoothNavigation.navigateToPage('about.html').then(() => {
  console.timeEnd('navigation');
});
```

### 8. Debugowanie

#### Sprawdź cache
```javascript
window.smoothNavigation.pageCache; // Zobacz co jest w cache
```

#### Wymuś nawigację
```javascript
window.smoothNavigation.navigateToPage('contact.html');
```

#### Sprawdź konfigurację
```javascript
window.smoothNavigation.CONFIG;
```

#### Wyczyść cache
```javascript
window.smoothNavigation.pageCache.clear();
```

### 9. Problemy i rozwiązania

#### Białe migotanie nadal występuje
- Sprawdź czy `preload-lang.js` jest załadowany w `<head>`
- Sprawdź czy nie ma błędów JavaScript w konsoli
- Sprawdź czy `translations-ready` klasa jest dodawana

#### Nawigacja nie działa
- Sprawdź czy wszystkie skrypty są załadowane
- Sprawdź czy nie ma błędów w konsoli
- Sprawdź czy linki mają poprawne `href`

#### Animacje nie działają
- Sprawdź czy `page-helpers.js` jest załadowany
- Sprawdź czy elementy mają klasę `fade-in`
- Sprawdź czy `IntersectionObserver` jest obsługiwany

#### Tłumaczenia nie działają
- Sprawdź czy pliki JSON w `locales/` istnieją
- Sprawdź czy `translations.js` jest załadowany po `page-helpers.js`
- Sprawdź czy `setLanguage` funkcja jest dostępna globalnie

### 10. Kompatybilność przeglądarek

#### Obsługiwane
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

#### Fallback
- Starsze przeglądarki automatycznie używają standardowej nawigacji
- Brak obsługi `IntersectionObserver` = brak animacji fade-in
- Brak obsługi `fetch` = standardowa nawigacja

### 11. Metryki sukcesu

#### Płynność
- Brak białego migotania między stronami
- Smooth fade-in/fade-out (200ms/300ms)
- Brak lagów podczas animacji

#### Wydajność
- Pierwsza nawigacja: <500ms
- Cache hit: <100ms
- Memory usage: <100MB po długim użytkowaniu

#### UX
- Preload działa przy hover
- Przycisk wstecz/dalej działa
- Mobile menu działa poprawnie
- Tłumaczenia działają bez problemów