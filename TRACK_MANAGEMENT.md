# 🎵 Track Management System

Automatyczny system dodawania utworów do strony muzycznej, który aktualizuje wszystkie potrzebne pliki jednocześnie.

## 🚀 Sposób użycia

### Metoda 1: Interaktywny skrypt (polecana)

```bash
node add-track.js
```

Skrypt zapyta o wszystkie potrzebne informacje:
- ID utworu (unikalny)
- Tytuł
- Artysta (domyślnie: Igor Szuniewicz)
- Ścieżka do pliku audio (w folderze songs/)
- Ścieżka do okładki (w folderze images/)
- Tagi (oddzielone przecinkami)
- Rok wydania
- Opisy w 3 językach (PL, EN, NL)

### Metoda 2: Szybkie dodawanie

```bash
node quick-add-track.js "<id>" "<tytuł>" "<audio>" "<okładka>" "<tagi>" "<rok>" "[opis]"
```

**Przykład:**
```bash
node quick-add-track.js "darkwave" "Dark Wave" "songs/darkwave.wav" "images/darkwave.png" "electronic,dark" "2023" "Atmospheric dark electronic track"
```

## 📁 Struktura plików

Przed dodaniem utworu upewnij się, że masz:

```
songs/
├── twoj-utwor.wav          # Plik audio (zalecany format: WAV)

images/
├── twoja-okladka.png       # Okładka (zalecany format: PNG/JPG)
```

## 🔧 Co robi automatycznie

Skrypt automatycznie:

1. ✅ **Dodaje utwór do `tracks.json`** - główna baza utworów
2. ✅ **Aktualizuje fallback w `music.js`** - zapasowa lista w kodzie
3. ✅ **Escapuje teksty bezpiecznie** - brak problemów z apostrofami
4. ✅ **Aktualizuje timestampy cache** - wymusza odświeżenie w przeglądarce
5. ✅ **Sprawdza istnienie plików** - ostrzega jeśli brakuje audio/okładki
6. ✅ **Sprawdza duplikaty** - nie pozwala na powielanie ID

## 🏷️ Dostępne tagi

Możesz użyć tych tagów (lub dodać nowe):
- `electronic` - elektronika
- `techno` - techno
- `metal` - metal
- `film` - muzyka filmowa
- `score` - kompozycje orkiestrowe
- `single` - single
- `playful` - playful
- `jazz` - jazz
- `remix` - remiksy

## 🐛 Rozwiązywanie problemów

### Problem: "Could not find fallback tracks array"
- Sprawdź czy jesteś w głównym folderze strony
- Sprawdź czy plik `music.js` nie został uszkodzony

### Problem: "Track already exists"
- Wybierz inne ID utworu (musi być unikalne)

### Problem: "Audio/Cover file not found"
- Sprawdź ścieżki do plików
- Upewnij się że pliki istnieją w folderach `songs/` i `images/`

### Problem: Utwór się nie wyświetla
- Odśwież stronę z Ctrl+F5 (wyczyści cache)
- Sprawdź konsolę przeglądarki czy są błędy

## 💡 Przykłady

### Dodawanie utworu techno:
```bash
node quick-add-track.js "pulse" "Pulse" "songs/pulse.wav" "images/pulse.png" "techno,electronic" "2023" "Driving techno track with hypnotic bassline"
```

### Dodawanie kompozycji filmowej:
```bash
node quick-add-track.js "epic_theme" "Epic Theme" "songs/epic.wav" "images/epic.png" "film,score" "2024" "Orchestral theme for epic scenes"
```

### Dodawanie metalu:
```bash
node quick-add-track.js "heavy_riff" "Heavy Riff" "songs/heavy.wav" "images/heavy.png" "metal,single" "2023" "Aggressive metal track with crushing riffs"
```

## 🎯 Zalecenia

1. **ID utworu** - użyj prostych nazw bez spacji (np. "dark_ambient", "techno_2023")
2. **Formaty plików** - WAV dla audio, PNG/JPG dla okładek
3. **Tagi** - używaj istniejących tagów dla konsystencji
4. **Opisy** - krótkie, rzeczowe opisy (1-2 zdania)

---

**Teraz dodawanie utworów to jedna komenda zamiast 10 poprawek! 🎉**