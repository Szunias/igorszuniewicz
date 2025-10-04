# 📧 Contact Form - Web3Forms Integration

System formularza kontaktowego z **prawdziwym wysyłaniem emaili** przez Web3Forms API.

## ✅ Co działa teraz

Formularz **w pełni funkcjonalny** i:
- ✅ Wysyła prawdziwe emaile bezpośrednio na szunio2004@gmail.com
- ✅ Waliduje wszystkie pola w czasie rzeczywistym
- ✅ Pokazuje komunikaty błędów i sukcesu
- ✅ Zapisuje wiadomości lokalnie (backup)
- ✅ Wspiera 3 języki (PL/EN/NL)
- ✅ Animowane statusy i feedback
- ✅ Auto-reply do wysyłającego (opcjonalnie)

## 🔧 Konfiguracja (już zrobione!)

Formularz używa **Web3Forms** z kluczem API:
```
Access Key: 63daf122-621e-405f-ac46-d4537bfba2a4
```

### Co się dzieje po wysłaniu:

1. **Natychmiastowa wysyłka** - email leci bezpośrednio do szunio2004@gmail.com
2. **Backup lokalny** - wiadomość zapisywana w localStorage
3. **Potwierdzenie** - użytkownik widzi "Message sent successfully!"
4. **Reset formularza** - czyści pola automatycznie

### Opcjonalne ustawienia Web3Forms:

Zaloguj się na https://web3forms.com/ aby:
- Zmienić email docelowy
- Dodać auto-reply do wysyłającego
- Skonfigurować webhook
- Zobaczyć statystyki wysłanych emaili

## 🔍 Testowanie

### Test wysyłki
1. Otwórz `contact.html`
2. Wypełnij wszystkie pola:
   - Imię (min. 2 znaki)
   - Email (prawidłowy format)
   - Temat (opcjonalnie)
   - Wiadomość (min. 10 znaków)
3. Kliknij "Send Message"
4. Powinieneś zobaczyć: "Message sent successfully!"
5. Sprawdź email szunio2004@gmail.com - wiadomość powinna tam być!

### Test walidacji
- Zostaw puste pola → Pokaże błędy
- Wpisz zły email → Pokaże błąd
- Wpisz za krótką wiadomość → Pokaże błąd

## 📱 Wsparcie dla języków

Formularz automatycznie używa aktualnie wybranego języka:
- **Angielski** (EN)
- **Polski** (PL)
- **Holenderski** (NL)

Wszystkie komunikaty, placeholdery i errory są przetłumaczone.

## 🗄️ Backup wiadomości

Wszystkie wysłane wiadomości są zapisywane lokalnie w `localStorage`:

```javascript
// W konsoli przeglądarki:
window.getContactMessages()
// Pokaże wszystkie wysłane wiadomości
```

Przechowuje ostatnie 50 wiadomości.

## 🎨 Customizacja

### Zmiana email docelowego

W pliku `contact-form.js` linia 94 i 164:
```javascript
to_email: 'twoj-email@example.com'
```

### Zmiana komunikatów

Wszystkie tłumaczenia w `assets/js/components/enhancements.js`:
- `contact_validation_*` - błędy walidacji
- `contact_status_*` - statusy wysyłki
- `contact_form_*` - etykiety formularza

### Zmiana stylów

Style w `assets/css/custom-styles.css`:
- `.contact-professional` - główny kontener
- `.contact-section` - sekcje
- `.form-group` - pola formularza
- `.contact-submit` - przycisk

## ⚠️ Troubleshooting

### Formularz nie wysyła przez EmailJS
- Sprawdź klucze API w `contact-form.js`
- Sprawdź konsolę przeglądarki (F12)
- Upewnij się że template w EmailJS ma wszystkie zmienne

### Mailto nie działa
- Upewnij się że masz zainstalowany klient email
- Niektóre przeglądarki blokują mailto - sprawdź ustawienia

### Walidacja nie działa
- Sprawdź czy `contact-form.js` jest załadowany
- Sprawdź konsolę przeglądarki na błędy

### Tłumaczenia nie działają
- Sprawdź czy `enhancements.js` jest załadowany przed `contact-form.js`
- Sprawdź czy wybrano język w przełączniku

## 📊 Limity Web3Forms (darmowy plan)

- **250 emaili/miesiąc**
- **Unlimited forms**
- **No credit card required**
- **Email notifications**
- **Spam filtering**

Dla portfolio to w zupełności wystarczy! 🎯

---

**Gotowe!** Formularz działa i jest w pełni profesjonalny. 🚀
