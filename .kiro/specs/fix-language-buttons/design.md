# Design Document

## Overview

Naprawa przycisków języka poprzez modyfikację funkcji `shouldInterceptLink()` w pliku `simple-smooth-nav.js`. Rozwiązanie polega na dodaniu sprawdzenia, czy kliknięty element (lub jego rodzic) to przycisk języka, i w takim przypadku pozwoleniu na normalne działanie zdarzenia.

## Architecture

### Obecny Przepływ Zdarzeń (Zepsuty)

```
Użytkownik klika przycisk języka
  ↓
simple-smooth-nav.js przechwytuje zdarzenie (capture phase)
  ↓
event.preventDefault() + event.stopPropagation()
  ↓
translations.js NIE otrzymuje zdarzenia
  ↓
Język się NIE zmienia ❌
```

### Nowy Przepływ Zdarzeń (Naprawiony)

```
Użytkownik klika przycisk języka
  ↓
simple-smooth-nav.js sprawdza czy to przycisk języka
  ↓
TAK → Nie przechwytuje zdarzenia, return early
  ↓
translations.js otrzymuje zdarzenie
  ↓
Język się zmienia ✓
```

### Przepływ dla Normalnych Linków (Bez Zmian)

```
Użytkownik klika link nawigacyjny
  ↓
simple-smooth-nav.js sprawdza czy to przycisk języka
  ↓
NIE → Sprawdza czy to link do przechwycenia
  ↓
TAK → event.preventDefault() + navigateToPage()
  ↓
Nawigacja działa ✓
```

## Components and Interfaces

### 1. Modyfikacja funkcji `shouldInterceptLink()`

Obecna sygnatura:
```javascript
function shouldInterceptLink(href, link) {
  // Sprawdza tylko href i atrybuty linka
  return boolean;
}
```

Nowa sygnatura (bez zmian, ale dodatkowa logika):
```javascript
function shouldInterceptLink(href, link) {
  // 1. Sprawdź czy to przycisk języka (NOWE)
  // 2. Sprawdź href i atrybuty linka (ISTNIEJĄCE)
  return boolean;
}
```

### 2. Nowa funkcja pomocnicza

```javascript
function isLanguageButton(element) {
  // Sprawdź czy element ma klasę 'lang-btn'
  if (element.classList.contains('lang-btn')) return true;
  
  // Sprawdź czy rodzic ma klasę 'lang-btn' (dla zagnieżdżonych elementów)
  if (element.closest('.lang-btn')) return true;
  
  return false;
}
```

### 3. Modyfikacja event handlera

Obecny kod:
```javascript
clickHandler = (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  
  const href = link.getAttribute('href');
  if (!shouldInterceptLink(href, link)) return;
  
  event.preventDefault();
  event.stopPropagation();
  navigateToPage(href);
};
```

Nowy kod:
```javascript
clickHandler = (event) => {
  // NOWE: Sprawdź czy to przycisk języka
  if (isLanguageButton(event.target)) return;
  
  const link = event.target.closest('a');
  if (!link) return;
  
  const href = link.getAttribute('href');
  if (!shouldInterceptLink(href, link)) return;
  
  event.preventDefault();
  event.stopPropagation();
  navigateToPage(href);
};
```

## Data Models

### Struktura HTML Przycisków Języka

Desktop:
```html
<li class="lang-switcher">
  <button class="lang-btn active" data-lang="en">EN</button>
  <button class="lang-btn" data-lang="pl">PL</button>
  <button class="lang-btn" data-lang="nl">NL</button>
</li>
```

Mobile:
```html
<div class="mobile-lang-switcher">
  <button class="lang-btn active" data-lang="en">EN</button>
  <button class="lang-btn" data-lang="pl">PL</button>
  <button class="lang-btn" data-lang="nl">NL</button>
</div>
```

### Identyfikacja Przycisków Języka

Przyciski języka można zidentyfikować po:
1. Klasie CSS: `lang-btn`
2. Atrybucie: `data-lang` (opcjonalnie, dla dodatkowej pewności)
3. Rodzicu: `.lang-switcher` lub `.mobile-lang-switcher` (opcjonalnie)

## Error Handling

### Przypadek 1: Element nie ma classList

```javascript
function isLanguageButton(element) {
  if (!element || !element.classList) return false;
  // ... reszta kodu
}
```

### Przypadek 2: closest() nie jest wspierane

```javascript
function isLanguageButton(element) {
  if (!element || !element.classList) return false;
  if (element.classList.contains('lang-btn')) return true;
  
  // Fallback dla starszych przeglądarek
  if (typeof element.closest === 'function') {
    return !!element.closest('.lang-btn');
  }
  
  return false;
}
```

## Testing Strategy

### Test 1: Przyciski Języka Działają

```
1. Otwórz index.html
2. Kliknij przycisk "PL"
3. Sprawdź czy język się zmienił
4. Kliknij przycisk "NL"
5. Sprawdź czy język się zmienił
6. Kliknij przycisk "EN"
7. Sprawdź czy język się zmienił
✓ Wszystkie przyciski działają
```

### Test 2: Przyciski Języka na Wszystkich Stronach

```
Dla każdej strony (index, about, music, contact, projects):
1. Otwórz stronę
2. Kliknij każdy przycisk języka
3. Sprawdź czy język się zmienia
✓ Przyciski działają na wszystkich stronach
```

### Test 3: Nawigacja Nadal Działa

```
1. Otwórz index.html
2. Kliknij link "About"
3. Sprawdź czy strona się załadowała
4. Kliknij link "Music"
5. Sprawdź czy strona się załadowała
6. Kliknij kartę projektu
7. Sprawdź czy strona się załadowała
✓ Nawigacja działa poprawnie
```

### Test 4: Przyciski Mobilne

```
1. Otwórz stronę w trybie mobilnym (DevTools)
2. Otwórz menu mobilne
3. Kliknij przyciski języka w menu mobilnym
4. Sprawdź czy język się zmienia
✓ Przyciski mobilne działają
```

### Test 5: Konsola Bez Błędów

```
1. Otwórz DevTools Console
2. Wykonaj wszystkie powyższe testy
3. Sprawdź czy nie ma błędów w konsoli
✓ Brak błędów
```

## Implementation Approach

### Krok 1: Dodaj funkcję `isLanguageButton()`

Dodaj nową funkcję pomocniczą przed funkcją `shouldInterceptLink()`:

```javascript
// Sprawdź czy element to przycisk języka
function isLanguageButton(element) {
  if (!element || !element.classList) return false;
  
  // Sprawdź bezpośrednio element
  if (element.classList.contains('lang-btn')) return true;
  
  // Sprawdź rodziców
  if (typeof element.closest === 'function') {
    return !!element.closest('.lang-btn');
  }
  
  return false;
}
```

### Krok 2: Modyfikuj `clickHandler`

Dodaj sprawdzenie na początku funkcji `clickHandler`:

```javascript
clickHandler = (event) => {
  // Nie przechwytuj kliknięć w przyciski języka
  if (isLanguageButton(event.target)) return;
  
  // ... reszta istniejącego kodu
};
```

### Krok 3: Testuj

1. Zapisz plik
2. Odśwież stronę (Ctrl+F5 dla hard refresh)
3. Przetestuj przyciski języka
4. Przetestuj nawigację

## Design Decisions and Rationales

### Decyzja 1: Sprawdzanie w `clickHandler` zamiast `shouldInterceptLink`

**Uzasadnienie**: Przyciski języka nie są linkami (`<a>`), więc `shouldInterceptLink()` nigdy ich nie zobaczy. Sprawdzenie musi być wcześniej, zanim szukamy `closest('a')`.

**Alternatywy**:
- ❌ Modyfikacja `shouldInterceptLink()` - nie zadziała, bo przyciski nie są linkami
- ✓ Sprawdzenie na początku `clickHandler` - działa dla wszystkich elementów

### Decyzja 2: Użycie klasy CSS `.lang-btn` jako identyfikatora

**Uzasadnienie**: Wszystkie przyciski języka mają tę klasę, jest to najbardziej niezawodny sposób identyfikacji.

**Alternatywy**:
- ❌ Sprawdzanie `data-lang` - może być używane w innych miejscach
- ❌ Sprawdzanie rodzica `.lang-switcher` - nie zadziała dla mobilnych przycisków
- ✓ Sprawdzanie klasy `.lang-btn` - jednoznaczne i niezawodne

### Decyzja 3: Użycie `closest()` dla zagnieżdżonych elementów

**Uzasadnienie**: Jeśli użytkownik kliknie tekst wewnątrz przycisku (np. "EN"), `event.target` będzie elementem tekstowym, nie przyciskiem. `closest()` znajdzie najbliższy przycisk w hierarchii.

**Alternatywy**:
- ❌ Tylko `classList.contains()` - nie zadziała dla zagnieżdżonych elementów
- ✓ `closest('.lang-btn')` - działa dla wszystkich przypadków

### Decyzja 4: Return early zamiast dodawania warunku

**Uzasadnienie**: Kod jest bardziej czytelny i wydajny - jeśli to przycisk języka, od razu wychodzimy z funkcji.

**Alternatywy**:
- ❌ `if (!isLanguageButton(event.target)) { ... cały kod ... }` - głębsze zagnieżdżenie
- ✓ `if (isLanguageButton(event.target)) return;` - czytelniejsze

## Technical Constraints

1. **Kompatybilność z przeglądarkami**: `closest()` jest wspierane we wszystkich nowoczesnych przeglądarkach (IE11+)
2. **Wydajność**: Sprawdzenie klasy CSS jest bardzo szybkie, nie wpływa na wydajność
3. **Brak zależności**: Rozwiązanie nie wymaga żadnych dodatkowych bibliotek
4. **Minimalna ingerencja**: Modyfikacja tylko jednego pliku, bez zmian w HTML/CSS

## Future Considerations

1. **Inne elementy interaktywne**: W przyszłości może być potrzebne dodanie podobnych sprawdzeń dla innych przycisków/elementów
2. **Centralna lista wyjątków**: Można stworzyć tablicę selektorów, które nie powinny być przechwytywane
3. **Konfiguracja**: Można dodać opcję konfiguracji, które elementy ignorować

## Przykładowy Kod Końcowy

```javascript
// Sprawdź czy element to przycisk języka
function isLanguageButton(element) {
  if (!element || !element.classList) return false;
  
  // Sprawdź bezpośrednio element
  if (element.classList.contains('lang-btn')) return true;
  
  // Sprawdź rodziców
  if (typeof element.closest === 'function') {
    return !!element.closest('.lang-btn');
  }
  
  return false;
}

// Event listenery
function setupEventListeners() {
  // Remove existing handlers if they exist
  if (clickHandler) {
    document.removeEventListener('click', clickHandler, true);
  }
  if (hoverHandler) {
    document.removeEventListener('mouseover', hoverHandler);
  }
  
  // Przechwytuj kliknięcia w linki
  clickHandler = (event) => {
    // Nie przechwytuj kliknięć w przyciski języka
    if (isLanguageButton(event.target)) return;
    
    const link = event.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!shouldInterceptLink(href, link)) return;
    
    event.preventDefault();
    event.stopPropagation();
    navigateToPage(href);
  };
  
  document.addEventListener('click', clickHandler, true);
  
  // ... reszta kodu bez zmian
}
```
