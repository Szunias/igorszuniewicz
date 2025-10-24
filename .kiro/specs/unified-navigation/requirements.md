# Requirements Document

## Introduction

Ujednolicenie nawigacji na wszystkich stronach portfolio, aby każda strona używała tego samego komponentu nawigacyjnego z `assets/js/components/navigation.js` i `assets/css/navigation.css`. Obecnie różne strony mają własne wbudowane style i struktury HTML dla nawigacji, co utrudnia konserwację i powoduje niespójności.

## Glossary

- **Navigation Component**: Centralny komponent JavaScript (`assets/js/components/navigation.js`) generujący HTML nawigacji
- **Navigation Styles**: Wspólny plik CSS (`assets/css/navigation.css`) zawierający wszystkie style nawigacji
- **Inline Navigation Styles**: Style CSS wbudowane bezpośrednio w plikach HTML w tagach `<style>`
- **HTML Navigation Structure**: Struktura HTML nawigacji wbudowana bezpośrednio w plikach HTML
- **Main Pages**: Główne strony portfolio: index.html, about.html, contact.html, music.html
- **Project Pages**: Strony projektów w folderze `projects/`

## Requirements

### Requirement 1

**User Story:** Jako developer, chcę aby wszystkie strony używały tego samego komponentu nawigacji, żeby łatwo zarządzać nawigacją w jednym miejscu

#### Acceptance Criteria

1. THE System SHALL remove all inline navigation styles from all HTML files
2. THE System SHALL remove all embedded `<style>` tags containing navigation-related CSS from all HTML files
3. THE System SHALL ensure `assets/css/navigation.css` is linked in all HTML files
4. THE System SHALL ensure `assets/js/components/navigation.js` is loaded in all HTML files
5. THE System SHALL remove any hardcoded HTML navigation structures from all HTML files

### Requirement 2

**User Story:** Jako użytkownik, chcę widzieć identyczną nawigację (Home, About, Projects, Music, Contact) na każdej stronie, żeby łatwo poruszać się po portfolio

#### Acceptance Criteria

1. THE System SHALL display navigation bar with links: Home, About, Projects, Music, Contact on all pages
2. THE System SHALL display language switcher (EN, PL, NL) on all pages
3. THE System SHALL highlight active page link on navigation bar
4. THE System SHALL display mobile menu toggle button on mobile devices
5. WHEN user clicks mobile menu toggle, THE System SHALL open mobile navigation menu

### Requirement 3

**User Story:** Jako developer, chcę aby nawigacja działała poprawnie zarówno na stronach głównych jak i w podfolderach, żeby linki zawsze prowadziły do właściwych miejsc

#### Acceptance Criteria

1. WHEN page is in root directory, THE System SHALL use relative paths without prefix
2. WHEN page is in `projects/` folder, THE System SHALL use `../` prefix for navigation links
3. THE System SHALL correctly determine relative path based on current page location
4. THE System SHALL ensure all navigation links work correctly from any page location

### Requirement 4

**User Story:** Jako użytkownik, chcę aby nawigacja była responsywna i działała na wszystkich urządzeniach, żeby móc przeglądać portfolio na telefonie i komputerze

#### Acceptance Criteria

1. WHEN viewport width is greater than 768px, THE System SHALL display desktop navigation
2. WHEN viewport width is 768px or less, THE System SHALL display mobile menu toggle
3. WHEN user scrolls page, THE System SHALL add scrolled effect to header
4. THE System SHALL support touch interactions on mobile devices
5. THE System SHALL close mobile menu when user clicks overlay

### Requirement 5

**User Story:** Jako developer, chcę aby proces migracji był systematyczny i bezpieczny, żeby nie zepsuć działających stron

#### Acceptance Criteria

1. THE System SHALL process pages in specific order: index.html, about.html, contact.html, music.html, then project pages
2. THE System SHALL verify navigation component loads correctly after each page migration
3. THE System SHALL preserve all existing functionality during migration
4. THE System SHALL maintain translation integration with navigation
5. THE System SHALL ensure smooth navigation system continues to work after migration
