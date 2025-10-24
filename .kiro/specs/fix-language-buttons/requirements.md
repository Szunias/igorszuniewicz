# Requirements Document

## Introduction

Po integracji wspólnej nawigacji (unified navigation), przyciski do zmiany języka (EN/PL/NL) przestały działać na wszystkich stronach portfolio. Problem występuje, ponieważ system `simple-smooth-nav.js` przechwytuje wszystkie kliknięcia w fazie capture, co blokuje działanie przycisków języka.

## Glossary

- **Language Buttons**: Przyciski `<button class="lang-btn">` służące do przełączania języka interfejsu (EN/PL/NL)
- **Simple Smooth Nav**: System nawigacji w pliku `assets/js/simple-smooth-nav.js` odpowiedzialny za płynne przejścia między stronami
- **Event Capture Phase**: Faza przechwytywania zdarzeń w DOM, która występuje przed fazą bubbling
- **Translation System**: System tłumaczeń w pliku `assets/js/translations.js` odpowiedzialny za zmianę języka

## Requirements

### Requirement 1: Przyciski Języka Muszą Działać

**User Story:** Jako użytkownik, chcę móc klikać przyciski języka (EN/PL/NL), aby zmienić język interfejsu, niezależnie od tego, na której stronie się znajduję.

#### Acceptance Criteria

1. WHEN użytkownik kliknie przycisk języka, THE Translation System SHALL zmienić język interfejsu
2. WHEN użytkownik kliknie przycisk języka, THE Simple Smooth Nav SHALL nie przechwytywać tego zdarzenia
3. WHEN użytkownik kliknie przycisk języka, THE Browser SHALL nie nawigować do innej strony
4. WHEN użytkownik kliknie przycisk języka na dowolnej stronie (index, about, music, contact, projects), THE Language Buttons SHALL działać poprawnie
5. WHEN użytkownik kliknie przycisk języka w wersji mobilnej, THE Language Buttons SHALL działać poprawnie

### Requirement 2: Nawigacja Nie Może Być Zepsuta

**User Story:** Jako użytkownik, chcę aby nawigacja między stronami nadal działała płynnie po naprawie przycisków języka, aby móc swobodnie poruszać się po portfolio.

#### Acceptance Criteria

1. WHEN użytkownik kliknie link nawigacyjny, THE Simple Smooth Nav SHALL przechwycić to zdarzenie i wykonać nawigację
2. WHEN użytkownik kliknie kartę projektu, THE Simple Smooth Nav SHALL przechwycić to zdarzenie i wykonać nawigację
3. WHEN użytkownik kliknie przycisk "Back to Projects", THE Simple Smooth Nav SHALL przechwycić to zdarzenie i wykonać nawigację
4. WHEN użytkownik kliknie link zewnętrzny, THE Simple Smooth Nav SHALL nie przechwytywać tego zdarzenia
5. WHEN użytkownik kliknie link z atrybutem `target`, THE Simple Smooth Nav SHALL nie przechwytywać tego zdarzenia

### Requirement 3: Rozwiązanie Musi Być Minimalne

**User Story:** Jako developer, chcę aby naprawa była minimalna i nie wprowadzała nowych problemów, aby utrzymać stabilność systemu.

#### Acceptance Criteria

1. THE Solution SHALL modyfikować tylko plik `assets/js/simple-smooth-nav.js`
2. THE Solution SHALL dodać sprawdzenie, czy kliknięty element to przycisk języka
3. THE Solution SHALL nie modyfikować systemu tłumaczeń
4. THE Solution SHALL nie modyfikować plików HTML
5. THE Solution SHALL zachować wszystkie istniejące funkcjonalności nawigacji
