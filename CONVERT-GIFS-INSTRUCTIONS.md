# 🎬 Instrukcje Konwersji GIF-ów do Video

## ✅ Zaktualizowałem HTML - Teraz musisz skonwertować pliki!

Wszystkie referencje do GIF-ów w HTML zostały zaktualizowane. Teraz strona oczekuje plików `.mp4` i `.webm`.

---

## 📋 Pliki do Skonwertowania

Musisz skonwertować następujące GIF-y (sortowane według rozmiaru):

### ⚠️ PRIORYTET 1 - Największe pliki:

1. **AkantiladoGIF.gif** - 19MB
   - Lokalizacja: `assets/images/projects/`
   - Skonwertuj do: `AkantiladoGIF.mp4` i `AkantiladoGIF.webm`

2. **NotTodayGIF.gif** - 15MB
   - Lokalizacja: `assets/images/projects/`
   - Skonwertuj do: `NotTodayGIF.mp4` i `NotTodayGIF.webm`

3. **RayGIF.gif** - 15MB
   - Lokalizacja: `assets/images/projects/`
   - Skonwertuj do: `RayGIF.mp4` i `RayGIF.webm`

4. **AmorakGIF.gif** - 11MB
   - Lokalizacja: `assets/images/projects/`
   - Skonwertuj do: `AmorakGIF.mp4` i `AmorakGIF.webm`

### Priorytet 2:

5. **AudioLabGif.gif** - 3.2MB
   - Lokalizacja: `assets/images/projects/`
   - Skonwertuj do: `AudioLabGif.mp4` i `AudioLabGif.webm`

6. **pausedeservegif.gif**
   - Lokalizacja: `assets/images/projects-pausedeserve/`
   - Skonwertuj do: `pausedeservegif.mp4` i `pausedeservegif.webm`

7. **richtergif.gif**
   - Lokalizacja: `assets/images/projects-daw2/`
   - Skonwertuj do: `richtergif.mp4` i `richtergif.webm`

---

## 🔧 Metoda 1: Narzędzia Online (BEZ INSTALACJI)

### CloudConvert (Najlepsze dla GIF→MP4)

**Krok po kroku:**

1. Idź na: https://cloudconvert.com/gif-to-mp4
2. Przeciągnij GIF na stronę
3. Wybierz "Convert to: MP4"
4. Kliknij **Settings** (opcjonalne, ale zalecane):
   - Video Codec: `H.264`
   - Quality: `Standard` (lub `Good` dla większej jakości)
   - Resolution: `Original`
5. Kliknij "Convert"
6. Pobierz plik MP4
7. **Powtórz dla WebM**: Zmień "Convert to: WebM" i powtórz

### Alternatywne narzędzia:

- **Ezgif.com**: https://ezgif.com/gif-to-mp4
- **Online-Convert**: https://www.online-convert.com/

---

## 🔧 Metoda 2: FFmpeg (Jeśli masz zainstalowane)

### Instalacja FFmpeg:

**Windows:**
1. Pobierz z: https://www.gyan.dev/ffmpeg/builds/
2. Rozpakuj do `C:\ffmpeg`
3. Dodaj do PATH: `C:\ffmpeg\bin`

### Konwersja pojedynczego pliku:

```bash
cd "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\assets\images\projects"

# Do MP4
ffmpeg -i AkantiladoGIF.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset slow -crf 23 -an AkantiladoGIF.mp4

# Do WebM
ffmpeg -i AkantiladoGIF.gif -c:v libvpx-vp9 -crf 30 -b:v 0 -an AkantiladoGIF.webm
```

### Konwersja wszystkich na raz:

```bash
# Skopiuj skrypt convert-gifs.sh do głównego folderu
bash convert-gifs.sh
```

---

## 📝 Szybki Skrypt PowerShell (Windows)

Stwórz plik `convert-all-gifs.ps1`:

```powershell
$files = @(
    "assets/images/projects/AkantiladoGIF.gif",
    "assets/images/projects/NotTodayGIF.gif",
    "assets/images/projects/RayGIF.gif",
    "assets/images/projects/AmorakGIF.gif",
    "assets/images/projects/AudioLabGif.gif",
    "assets/images/projects-pausedeserve/pausedeservegif.gif",
    "assets/images/projects-daw2/richtergif.gif"
)

foreach ($file in $files) {
    $base = $file -replace '\.gif$', ''
    Write-Host "Converting $file..."

    # To MP4
    ffmpeg -i $file -movflags faststart -pix_fmt yuv420p `
        -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" `
        -c:v libx264 -preset slow -crf 23 -an "$base.mp4" -y

    # To WebM
    ffmpeg -i $file -c:v libvpx-vp9 -crf 30 -b:v 0 -an "$base.webm" -y

    Write-Host "Done: $base.mp4 and $base.webm"
}
```

Uruchom:
```bash
powershell -ExecutionPolicy Bypass -File convert-all-gifs.ps1
```

---

## ✅ Po Konwersji

### 1. Sprawdź czy pliki istnieją:

```bash
ls assets/images/projects/*.mp4
ls assets/images/projects/*.webm
```

Powinieneś zobaczyć:
- ✅ AkantiladoGIF.mp4 / .webm
- ✅ NotTodayGIF.mp4 / .webm
- ✅ RayGIF.mp4 / .webm
- ✅ AmorakGIF.mp4 / .webm
- ✅ AudioLabGif.mp4 / .webm
- ✅ pausedeservegif.mp4 / .webm (w folderze projects-pausedeserve)
- ✅ richtergif.mp4 / .webm (w folderze projects-daw2)

### 2. Testuj stronę:

Otwórz w przeglądarce:
- `index.html` - sprawdź slider (AudioLabGif)
- `projects/index.html` - sprawdź wszystkie karty projektów

### 3. Porównaj rozmiary:

```bash
# Przed
AkantiladoGIF.gif: 19MB
NotTodayGIF.gif: 15MB
RayGIF.gif: 15MB

# Po (oczekiwane)
AkantiladoGIF.mp4: ~2-3MB
NotTodayGIF.mp4: ~1-2MB
RayGIF.mp4: ~1-2MB

# Oszczędności: ~80-90%!
```

---

## 🎯 Oczekiwane Rezultaty

### Przed optymalizacją:
- **Łączny rozmiar GIF-ów:** ~75-80MB
- **Czas ładowania:** 10-30s na wolnym WiFi
- **First Contentful Paint:** >5s

### Po optymalizacji:
- **Łączny rozmiar video:** ~8-12MB
- **Czas ładowania:** 2-4s
- **First Contentful Paint:** <2s
- **Oszczędności:** ~85-90%!

---

## 🆘 Troubleshooting

### Problem: Video się nie ładuje
**Rozwiązanie:** Sprawdź czy nazwy plików są IDENTYCZNE:
- GIF: `AkantiladoGIF.gif` → Video: `AkantiladoGIF.mp4` (wielkość liter!)

### Problem: Video się zatrzymuje
**Rozwiązanie:** Dodaj atrybut `autoplay loop muted` (już jest w HTML)

### Problem: FFmpeg nie działa
**Rozwiązanie:** Użyj narzędzi online (CloudConvert)

---

## 📧 Gotowe?

Jak tylko skonwertujesz pliki:
1. Odśwież stronę (Ctrl+Shift+R)
2. Sprawdź w DevTools > Network czy pliki .mp4/.webm się ładują
3. Porównaj rozmiary przed/po w Network tab

**WAŻNE:** Nie usuwaj jeszcze oryginalnych GIF-ów! Zostaw je jako backup.
