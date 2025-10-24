# Design Document

## Overview

Przepiszemy opisy utworów muzycznych w `assets/audio/tracks.json`, aby brzmiały naturalnie i autentycznie. Zamiast generycznych, technicznych opisów stworzymy krótkie, osobiste notatki brzmiące jak wypowiedź artysty.

## Approach

### Zasady pisania naturalnych opisów

1. **Krótko i konkretnie** - 1-2 zdania maksymalnie
2. **Bez szablonów** - unikamy fraz typu "hypnotic atmosphere", "mesmerizing experience"
3. **Osobisty ton** - jak rozmowa, nie katalog
4. **Konkretne detale** - zamiast "energetic synths" → "syntezatory grają ostro"
5. **Prostota** - jeśli można prościej, to prościej

### Przykłady transformacji

**PRZED (AI-owe):**
```
"Hypnotic techno with deep bass and rhythmic motifs. Dark synthesizers create a mesmerizing atmosphere."
```

**PO (naturalne):**
```
"Ciemne techno, które wciąga. Bas gra główną rolę."
```

---

**PRZED:**
```
"Uptempo electronica with arpeggiated leads and a wide stereo image. Synthetic textures meet a dance‑oriented pulse and spacious production."
```

**PO:**
```
"Szybka elektronika z arpeggiowanymi leadami. Szeroka scena stereo, lekka produkcja."
```

## Track-by-Track Redesign

### 1. Ça Plane Pour Moi — Techno Remix
**Obecny (sztucznie):**
- PL: "Techno‑remix klasyka 'Ça plane pour moi': szybki beat, sprężysty bas i energetyczne syntezatory."
- EN: "Techno remix of the classic 'Ça plane pour moi': fast four‑on‑the‑floor, punchy bass and energetic synths."

**Nowy (naturalnie):**
- PL: "Klasyk w wersji techno. Szybko, mocno, prosto."
- EN: "Classic goes techno. Fast, punchy, straightforward."
- NL: "Klassieker in techno-versie. Snel, krachtig, direct."

### 2. Astrophonic Dance
**Obecny:**
- PL: "Uptempo elektronika z arpeggiowanymi leadami i szeroką sceną stereo. Syntetyczne faktury łączą się z taneczną pulsacją i lekką, przestrzenną produkcją."

**Nowy:**
- PL: "Szybka elektronika z arpeggiowanymi leadami. Szeroka scena stereo, lekka produkcja."
- EN: "Fast electronica with arpeggiated leads. Wide stereo, airy production."
- NL: "Snelle electronica met arpeggio-leads. Breed stereo, luchtige productie."

### 3. Obsidian
**Obecny:**
- PL: "Hipnotyczny techno z głębokimi basami i rytmicznymi motywami. Ciemne syntezatory tworzą hipnotyczną atmosferę."

**Nowy:**
- PL: "Ciemne techno, które wciąga. Bas gra główną rolę."
- EN: "Dark techno that pulls you in. Bass takes the lead."
- NL: "Donkere techno die je meesleept. Bas speelt de hoofdrol."

### 4. That's It — Cover
**Obecny:**
- PL: "Remix utworu 'That's It' zespołu Preservation Hall Jazz Band w stylistyce new jazz — w duchu tego, co zrobiono z 'Cantaloupe Island' tworząc 'Cantaloop'."

**Nowy (ten jest OK, ale można skrócić):**
- PL: "New jazz remix 'That's It' — w duchu 'Cantaloop'."
- EN: "New jazz remix of 'That's It' — Cantaloop style."
- NL: "New jazz remix van 'That's It' — Cantaloop-stijl."

### 5. Gnosienne No. 1
**Obecny:**
- PL: "Metalowa interpretacja klasycznego utworu Erika Satie — ciężkie gitary spotykają się z minimalistyczną elegancją."

**Nowy:**
- PL: "Satie w wersji metalowej. Ciężkie gitary, minimalistyczna elegancja."
- EN: "Satie goes metal. Heavy guitars, minimalist elegance."
- NL: "Satie in metal-versie. Zware gitaren, minimalistische elegantie."

### 6. Syncopation$
**Obecny:**
- PL: "Hipnotyczny utwór techno ze złożonymi synkopowanymi rytmami i głębokimi liniami basu tworzącymi skomplikowane doświadczenie taneczne"

**Nowy:**
- PL: "Techno z synkopami. Rytmy się plączą, bas trzyma."
- EN: "Techno with syncopation. Rhythms interweave, bass holds it down."
- NL: "Techno met syncopen. Ritmes verweven, bas houdt het vast."

### 7. Cage
**Obecny:**
- PL: "Jeden z moich najmocniejszych utworów — industrial metal / hard rock: ciężkie gitary, masywny groove i surowa energia."

**Nowy (ten jest dobry, ale można uprościć):**
- PL: "Jeden z moich najmocniejszych — industrial metal z masywnym groove'em."
- EN: "One of my heaviest — industrial metal with massive groove."
- NL: "Een van mijn zwaarste — industrial metal met massieve groove."

### 8. Cathedral Of Time
**Obecny:**
- PL: "Atmosferyczny utwór filmowy z przestrzennymi padami i tajemniczą melodią."

**Nowy:**
- PL: "Filmowa atmosfera. Przestrzenne pady, tajemnicza melodia."
- EN: "Cinematic atmosphere. Spacious pads, mysterious melody."
- NL: "Filmische sfeer. Ruimtelijke pads, mysterieuze melodie."

### 9. Inflow
**Obecny:**
- PL: "Płynny elektroniczny utwór z organicznymi teksturami i ewoluującymi syntezatorami."

**Nowy:**
- PL: "Płynie. Organiczne tekstury, syntezatory się rozwijają."
- EN: "It flows. Organic textures, synths evolve."
- NL: "Het stroomt. Organische texturen, synths evolueren."

### 10. Edge Of Life
**Obecny:**
- PL: "Dramatyczny utwór filmowy z narastającym napięciem i emocjonalną kulminacją."

**Nowy:**
- PL: "Dramatyczne. Napięcie narasta, emocjonalna kulminacja."
- EN: "Dramatic. Tension builds, emotional climax."
- NL: "Dramatisch. Spanning bouwt op, emotionele climax."

### 11. Ray — Credits Theme
**Obecny:**
- PL: "Motyw końcowych napisów do projektu Ray — refleksyjny i emocjonalny."

**Nowy:**
- PL: "Napisy końcowe do Ray. Refleksyjne, emocjonalne."
- EN: "End credits for Ray. Reflective, emotional."
- NL: "Eindcredits voor Ray. Reflectief, emotioneel."

### 12. Richter — Main Theme
**Obecny:**
- PL: "Główny motyw muzyczny do projektu Richter — epicka orkiestracja."

**Nowy:**
- PL: "Główny motyw Richtera. Epicka orkiestracja."
- EN: "Richter's main theme. Epic orchestration."
- NL: "Richter's hoofdthema. Epische orkestratie."

### 13. Run — Main Theme
**Obecny:**
- PL: "Główny motyw do projektu Run — dynamiczny i pełen energii."

**Nowy:**
- PL: "Główny motyw Run. Dynamiczny, pełen energii."
- EN: "Run's main theme. Dynamic, full of energy."
- NL: "Run's hoofdthema. Dynamisch, vol energie."

### 14. Xian Clash — Main Theme
**Obecny:**
- PL: "Główny motyw do Xian Clash — intensywny i akcyjny."

**Nowy:**
- PL: "Główny motyw Xian Clash. Intensywny, akcyjny."
- EN: "Xian Clash main theme. Intense, action-packed."
- NL: "Xian Clash hoofdthema. Intens, actievol."

### 15. Psychedelic Journey
**Obecny:**
- PL: "Psychodeliczny utwór elektroniczny z hipnotycznymi rytmami i tripowymi syntezatorami."

**Nowy:**
- PL: "Psychodeliczna elektronika. Hipnotyczne rytmy, tripowe synthy."
- EN: "Psychedelic electronica. Hypnotic rhythms, trippy synths."
- NL: "Psychedelische electronica. Hypnotische ritmes, trippy synths."

## Data Structure

Struktura pozostaje bez zmian - tylko zawartość pola `desc` w każdym utworze:

```json
{
  "id": "track_id",
  "desc": {
    "pl": "Nowy naturalny opis po polsku",
    "en": "New natural description in English",
    "nl": "Nieuwe natuurlijke beschrijving in het Nederlands"
  }
}
```

## Translation Strategy

### Polski (bazowy)
- Krótkie zdania
- Bezpośredni styl
- Unikamy "tworzą atmosferę", "spotykają się z"
- Używamy kropek zamiast myślników tam, gdzie to naturalne

### Angielski
- Równie zwięzły jak polski
- Idiomatyczne wyrażenia (np. "holds it down" zamiast "maintains")
- Naturalny flow

### Holenderski
- Zachowuje styl polskiego i angielskiego
- Idiomatyczne wyrażenia holenderskie
- Nie dosłowne tłumaczenie, ale równoważny ton

## Error Handling

Nie dotyczy - to tylko zmiana treści tekstowej.

## Testing Strategy

1. Przeczytać każdy opis na głos - czy brzmi naturalnie?
2. Porównać z oryginałem - czy jest mniej "AI-owy"?
3. Sprawdzić wszystkie trzy języki - czy brzmią równie naturalnie?
4. Otworzyć stronę music.html i sprawdzić wizualnie
