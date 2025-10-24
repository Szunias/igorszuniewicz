# Requirements Document

## Introduction

This specification addresses a comprehensive audit of all project pages to ensure complete translation coverage across all three supported languages: English (EN), Polish (PL), and Dutch (NL). The user has reported that some project pages are still missing translations or have non-functional translation systems.

## Glossary

- **Translation System**: The i18n (internationalization) system that provides content in English (EN), Polish (PL), and Dutch (NL) languages
- **Project Pages**: Individual HTML pages in the /projects/ directory showcasing portfolio work (14 main pages)
- **Locale Files**: JSON files in /locales/ directory containing translations for each project page
- **Translation Keys**: Dot-notation paths (e.g., "hero.title") that map HTML elements to translated content
- **Language Switcher**: UI component that allows users to change the display language

## Requirements

### Requirement 1: Complete Translation File Coverage

**User Story:** As a developer, I want every project page to have a corresponding locale JSON file with complete translations, so that the translation system can function properly.

#### Acceptance Criteria

1. WHEN auditing project pages, THE System SHALL identify all project HTML files in the /projects/ directory
2. WHEN checking locale files, THE System SHALL verify that each project page has a corresponding JSON file in /locales/
3. IF a project page lacks a locale file, THEN THE System SHALL create one with complete EN/PL/NL translations
4. WHEN reviewing locale files, THE System SHALL verify that all three languages (EN, PL, NL) are present
5. IF a locale file is missing any language, THEN THE System SHALL add the missing language translations

### Requirement 2: Complete HTML Translation Markup

**User Story:** As a visitor, I want all text content on project pages to be translatable, so that I can read everything in my preferred language.

#### Acceptance Criteria

1. WHEN auditing a project page HTML, THE System SHALL identify all user-visible text content
2. WHEN checking HTML elements, THE System SHALL verify that translatable elements have data-i18n attributes
3. IF translatable content lacks data-i18n attributes, THEN THE System SHALL add them with appropriate translation keys
4. WHEN reviewing translation keys, THE System SHALL ensure they follow consistent dot-notation naming conventions
5. WHEN a page loads, THE Translation System SHALL replace all data-i18n elements with translated content

### Requirement 3: Translation System Functionality

**User Story:** As a visitor, I want the language switcher to work on every project page, so that I can change languages without errors.

#### Acceptance Criteria

1. WHEN a user clicks the language switcher on any project page, THE Translation System SHALL load the correct locale file
2. WHEN translations load, THE System SHALL update all elements with data-i18n attributes
3. IF a translation key is missing, THEN THE System SHALL display the default HTML content and log a warning
4. WHEN switching languages multiple times, THE Translation System SHALL maintain functionality without errors
5. WHEN a page loads, THE Translation System SHALL apply the user's previously selected language

### Requirement 4: Natural Language Quality

**User Story:** As a Polish or Dutch speaker, I want translations that sound natural and human, so that the content feels professionally written.

#### Acceptance Criteria

1. WHEN reviewing Polish translations, THE Content SHALL use natural Polish idioms and sentence structures
2. WHEN reviewing Dutch translations, THE Content SHALL use natural Dutch idioms and sentence structures
3. WHERE technical terms exist, THE Translations SHALL use commonly accepted terminology in each language
4. WHEN describing creative work, THE Translations SHALL maintain the artistic and professional tone
5. IF translations sound robotic or machine-generated, THEN THE Content SHALL be rewritten to sound human

### Requirement 5: Comprehensive Audit Report

**User Story:** As a developer, I want a detailed report of translation issues across all project pages, so that I can prioritize fixes.

#### Acceptance Criteria

1. WHEN the audit completes, THE System SHALL generate a report listing all project pages
2. WHEN reporting on each page, THE System SHALL indicate translation file status (exists/missing)
3. WHEN checking translations, THE System SHALL report which languages are complete (EN/PL/NL)
4. WHEN analyzing HTML, THE System SHALL report missing data-i18n attributes
5. WHEN testing functionality, THE System SHALL report any translation loading errors

## Project Pages to Audit

The following 14 project pages must be audited:

1. akantilado.html
2. amorak.html
3. audiolab.html
4. audioq.html
5. environments.html
6. middleware2.html
7. musicforgames.html
8. not-today-darling.html
9. pause-and-deserve.html
10. pawism.html
11. ray-animation.html
12. richter.html
13. unreal-engine-rebuilder.html
14. wwise-unreal-fixer.html
