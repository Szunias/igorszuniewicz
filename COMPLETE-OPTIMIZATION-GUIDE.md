# 🚀 Kompletny Przewodnik Optymalizacji Obrazów

## ✅ Co zostało zaktualizowane w HTML:

### 1. GIF-y → Video (7 plików)
- **index.html**: AudioLabGif
- **projects/index.html**: RayGIF, NotTodayGIF, AkantiladoGIF, AmorakGIF, pausedeservegif, AudioLabGif, richtergif

### 2. PNG-y → WebP + Picture (7 plików)
- **index.html slider**: NotTodayPic1, amorak, deserve, richter
- **projects/environments.html**: Add Shot 1, Add Shot 2, Add Shot 3

---

## 📊 Pliki do Optymalizacji

### 🎬 PRIORYTET 1: GIF-y (Konwersja do MP4/WebM)

| Plik | Rozmiar | Lokalizacja | Konwertuj do |
|------|---------|-------------|--------------|
| **AkantiladoGIF.gif** | 19MB | `assets/images/projects/` | `.mp4` + `.webm` |
| **NotTodayGIF.gif** | 15MB | `assets/images/projects/` | `.mp4` + `.webm` |
| **RayGIF.gif** | 15MB | `assets/images/projects/` | `.mp4` + `.webm` |
| **AmorakGIF.gif** | 11MB | `assets/images/projects/` | `.mp4` + `.webm` |
| **AudioLabGif.gif** | 3.2MB | `assets/images/projects/` | `.mp4` + `.webm` |
| **pausedeservegif.gif** | ? | `assets/images/projects-pausedeserve/` | `.mp4` + `.webm` |
| **richtergif.gif** | ? | `assets/images/projects-daw2/` | `.mp4` + `.webm` |

**Oszczędność:** ~60MB → ~8MB (85% redukcja!)

### 🖼️ PRIORYTET 2: Duże PNG-y (Konwersja do WebP)

| Plik | Rozmiar | Lokalizacja | Konwertuj do |
|------|---------|-------------|--------------|
| **Add Shot 2.png** | 9.5MB | `assets/images/projects/` | `.webp` |
| **Add Shot 3.png** | 9.0MB | `assets/images/projects/` | `.webp` |
| **Add Shot 1.png** | 8.3MB | `assets/images/projects/` | `.webp` |
| **amorak.png** | 3.1MB | `assets/images/projects/` | `.webp` |
| **NotTodayPic1.png** | 3.0MB | `assets/images/projects/` | `.webp` |
| **deserve.png** | 2.5MB | `assets/images/projects/` | `.webp` |
| **richter.png** | 2.3MB | `assets/images/projects/` | `.webp` |

**Oszczędność:** ~37MB → ~7MB (80% redukcja!)

---

## 🛠️ Metoda 1: Narzędzia Online (NAJŁATWIEJSZA)

### A. Konwersja GIF → MP4/WebM

**CloudConvert** (https://cloudconvert.com/gif-to-mp4)

1. Otwórz https://cloudconvert.com/gif-to-mp4
2. Przeciągnij GIF (np. `AkantiladoGIF.gif`)
3. **Settings:**
   - Video Codec: `H.264`
   - Quality: `Standard`
4. Kliknij "Convert" → Pobierz MP4
5. **Powtórz dla WebM:** Zmień na "gif-to-webm" i powtórz
6. Zapisz oba pliki w tym samym folderze co GIF

**Przykład:**
```
assets/images/projects/
├── AkantiladoGIF.gif (original - zostaw jako backup)
├── AkantiladoGIF.mp4 (nowy)
└── AkantiladoGIF.webm (nowy)
```

### B. Konwersja PNG → WebP

**Squoosh** (https://squoosh.app/)

1. Otwórz https://squoosh.app/
2. Przeciągnij PNG (np. `Add Shot 1.png`)
3. **Po prawej stronie wybierz:**
   - Format: `WebP`
   - Quality: `75-80`
   - Effort: `4`
4. Kliknij "Download" (nazwa: `Add Shot 1.webp`)
5. Zapisz w tym samym folderze co PNG

**Alternatywnie - TinyPNG** (https://tinypng.com/)
- Automatyczna kompresja PNG
- Do 20 plików za darmo
- Pobierz zoptymalizowane PNG jako backup

---

## 🔧 Metoda 2: FFmpeg (Dla Zaawansowanych)

### Instalacja FFmpeg (Windows):

1. Pobierz: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.7z
2. Rozpakuj do `C:\ffmpeg`
3. Dodaj do PATH:
   ```
   Windows Search → "Environment Variables"
   → Path → Edit → New → C:\ffmpeg\bin
   ```
4. Test: Otwórz CMD i wpisz `ffmpeg -version`

### Konwersja GIF → MP4 + WebM:

```bash
cd "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz\assets\images\projects"

# Do MP4 (każdy plik osobno)
ffmpeg -i AkantiladoGIF.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset slow -crf 23 -an AkantiladoGIF.mp4

# Do WebM
ffmpeg -i AkantiladoGIF.gif -c:v libvpx-vp9 -crf 30 -b:v 0 -an AkantiladoGIF.webm
```

### Konwersja PNG → WebP:

```bash
# Pojedynczy plik
ffmpeg -i "Add Shot 1.png" -c:v libwebp -quality 80 "Add Shot 1.webp"

# Wszystkie PNG w folderze (PowerShell)
Get-ChildItem *.png | ForEach-Object { ffmpeg -i $_.FullName -c:v libwebp -quality 80 ($_.BaseName + ".webp") }
```

---

## 📝 Szybki Skrypt Batch (Wszystko na raz)

Stwórz plik `optimize-all.bat`:

```batch
@echo off
cd /d "C:\Users\szuni\OneDrive\Pulpit\guwno\igorszuniewicz"

echo Converting GIFs to MP4/WebM...
cd assets\images\projects

for %%f in (AkantiladoGIF.gif NotTodayGIF.gif RayGIF.gif AmorakGIF.gif AudioLabGif.gif) do (
    echo Processing %%f...
    ffmpeg -i %%f -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset slow -crf 23 -an "%%~nf.mp4" -y
    ffmpeg -i %%f -c:v libvpx-vp9 -crf 30 -b:v 0 -an "%%~nf.webm" -y
)

cd ..\projects-pausedeserve
ffmpeg -i pausedeservegif.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset slow -crf 23 -an pausedeservegif.mp4 -y
ffmpeg -i pausedeservegif.gif -c:v libvpx-vp9 -crf 30 -b:v 0 -an pausedeservegif.webm -y

cd ..\projects-daw2
ffmpeg -i richtergif.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset slow -crf 23 -an richtergif.mp4 -y
ffmpeg -i richtergif.gif -c:v libvpx-vp9 -crf 30 -b:v 0 -an richtergif.webm -y

echo.
echo Converting PNGs to WebP...
cd ..\projects

for %%f in ("Add Shot 1.png" "Add Shot 2.png" "Add Shot 3.png" amorak.png NotTodayPic1.png deserve.png richter.png) do (
    echo Processing %%f...
    ffmpeg -i %%f -c:v libwebp -quality 80 "%%~nf.webp" -y
)

echo.
echo Done! Check file sizes:
dir *.mp4 *.webm *.webp

pause
```

Uruchom: Kliknij dwukrotnie na `optimize-all.bat`

---

## ✅ Checklist - Po Konwersji

### 1. Sprawdź czy pliki istnieją:

**GIF-y (MP4 + WebM):**
```
assets/images/projects/
├── AkantiladoGIF.mp4 ✅
├── AkantiladoGIF.webm ✅
├── NotTodayGIF.mp4 ✅
├── NotTodayGIF.webm ✅
├── RayGIF.mp4 ✅
├── RayGIF.webm ✅
├── AmorakGIF.mp4 ✅
├── AmorakGIF.webm ✅
├── AudioLabGif.mp4 ✅
└── AudioLabGif.webm ✅

assets/images/projects-pausedeserve/
├── pausedeservegif.mp4 ✅
└── pausedeservegif.webm ✅

assets/images/projects-daw2/
├── richtergif.mp4 ✅
└── richtergif.webm ✅
```

**PNG-y (WebP):**
```
assets/images/projects/
├── Add Shot 1.webp ✅
├── Add Shot 2.webp ✅
├── Add Shot 3.webp ✅
├── amorak.webp ✅
├── NotTodayPic1.webp ✅
├── deserve.webp ✅
└── richter.webp ✅
```

### 2. Testuj strony:

1. Otwórz w przeglądarce (Ctrl+Shift+R aby wyczyścić cache):
   - `index.html` - sprawdź slider
   - `projects/index.html` - sprawdź wszystkie karty
   - `projects/environments.html` - sprawdź Add Shot 1/2/3

2. Otwórz DevTools (F12) → Network tab
3. Odśwież stronę
4. Sprawdź czy pliki `.mp4`/`.webm`/`.webp` się ładują

### 3. Porównaj rozmiary:

**Przed:**
- Strona główna: ~30-40MB
- Czas ładowania: 10-20s (slow WiFi)

**Po:**
- Strona główna: ~5-8MB
- Czas ładowania: 2-3s (slow WiFi)
- **Oszczędność: 75-85%!** 🎉

---

## 🎯 Oczekiwane Rezultaty

### Performance Metrics (Google Lighthouse):

**Przed:**
- Performance: 40-50
- LCP: >5s
- Total Blocking Time: >2s

**Po:**
- Performance: 85-95
- LCP: <2s
- Total Blocking Time: <300ms

---

## 🆘 Troubleshooting

### ❌ Video się nie ładuje
**Przyczyna:** Nazwa pliku nie zgadza się
**Rozwiązanie:** Sprawdź wielkość liter! `AkantiladoGIF.mp4` ≠ `akantiladogif.mp4`

### ❌ WebP się nie wyświetla
**Przyczyna:** Stara przeglądarka (IE11, stary Safari)
**Rozwiązanie:** Przeglądarka automatycznie użyje PNG fallback (już jest w HTML)

### ❌ FFmpeg nie znaleziony
**Przyczyna:** Nie dodano do PATH
**Rozwiązanie:** Użyj narzędzi online lub sprawdź instalację

### ❌ Plik zbyt duży po konwersji
**Rozwiązanie:**
- WebP: Zmniejsz quality do 70-75
- MP4: Zwiększ CRF do 25-28

---

## 📈 Monitorowanie

### Po wdrożeniu sprawdź:

1. **Google PageSpeed Insights:**
   - https://pagespeed.web.dev/
   - Wklej: https://igorszuniewicz.com

2. **WebPageTest:**
   - https://www.webpagetest.org/
   - Test na Slow 3G

3. **Chrome DevTools:**
   - Network tab → Size column
   - Lighthouse → Performance audit

---

## 💡 Dodatkowe Wskazówki

### Nie usuwaj oryginalnych plików!
Zostaw GIF-y i PNG-y jako backup:
```
AkantiladoGIF.gif (backup)
AkantiladoGIF.mp4 (używany)
AkantiladoGIF.webm (używany)
```

### Przyszłe obrazy:
Zawsze przed uplodem:
1. GIF → Konwertuj do MP4/WebM
2. PNG/JPG → Kompresuj + WebP
3. Limit: <500KB per image

### CDN (Opcjonalne):
Rozważ Cloudflare Images lub Cloudinary dla automatycznej optymalizacji

---

## ✨ Podsumowanie

**Zoptymalizowanych plików:** 14 (7 GIF-ów + 7 PNG-ów)
**Oszczędność:** ~90MB → ~15MB (83% redukcja!)
**Czas do ukończenia:** 15-30 min (z narzędziami online)

Powodzenia! 🚀
