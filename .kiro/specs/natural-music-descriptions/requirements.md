# Requirements Document

## Introduction

Opisy utworów muzycznych w katalogu brzmią sztucznie i generycznie ("AI-owo"). Użytkownik chce, aby teksty były bardziej naturalne, autentyczne i osobiste — takie, jakby artysta sam opisywał swoją muzykę w swobodny sposób.

## Glossary

- **Music Catalog**: Katalog utworów muzycznych na stronie music.html
- **Track Description**: Opis pojedynczego utworu w pliku tracks.json
- **Translation Files**: Pliki tłumaczeń w katalogu locales/

## Requirements

### Requirement 1

**User Story:** Jako odwiedzający stronę, chcę czytać autentyczne opisy utworów, żeby poczuć osobisty styl artysty i lepiej zrozumieć jego muzykę.

#### Acceptance Criteria

1. WHEN użytkownik czyta opis utworu, THE Music Catalog SHALL wyświetlać tekst brzmiący naturalnie i osobiście
2. WHEN użytkownik przełącza język, THE Music Catalog SHALL pokazywać równie naturalne tłumaczenia w każdym języku (PL, EN, NL)
3. THE Track Description SHALL unikać generycznych fraz typu "hypnotic atmosphere", "energetic synths", "intricate dance floor experience"
4. THE Track Description SHALL zawierać konkretne, osobiste spostrzeżenia zamiast ogólnych określeń
5. WHERE utwór ma ciekawą historię powstania, THE Track Description SHALL ją zawierać

### Requirement 2

**User Story:** Jako artysta, chcę, żeby opisy moich utworów brzmiały jak moja własna wypowiedź, nie jak wygenerowany tekst marketingowy.

#### Acceptance Criteria

1. THE Track Description SHALL używać prostego, bezpośredniego języka
2. THE Track Description SHALL unikać nadmiernie technicznych terminów bez kontekstu
3. WHEN opis zawiera terminy techniczne, THE Track Description SHALL używać ich naturalnie, nie na siłę
4. THE Track Description SHALL być zwięzły — 1-2 zdania maksymalnie
5. THE Track Description SHALL brzmieć jak rozmowa, nie jak opis katalogowy

### Requirement 3

**User Story:** Jako użytkownik wielojęzyczny, chcę, żeby tłumaczenia były równie naturalne jak oryginał, nie dosłowne i sztywne.

#### Acceptance Criteria

1. WHEN tłumaczenie jest tworzone, THE Translation Files SHALL zawierać idiomatyczne wyrażenia w danym języku
2. THE Translation Files SHALL unikać dosłownych tłumaczeń, które brzmią nienaturalnie
3. WHEN język docelowy ma lepsze wyrażenie niż dosłowne tłumaczenie, THE Translation Files SHALL używać lokalnego idiom
4. THE Translation Files SHALL zachowywać ten sam ton i styl we wszystkich językach
5. THE Translation Files SHALL brzmieć jak tekst napisany przez native speakera
