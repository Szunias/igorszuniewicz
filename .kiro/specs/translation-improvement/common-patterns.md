# Common Translation Patterns to Correct

## Purpose
This document identifies recurring patterns of unnatural, literal translations found in the current Polish (pl) and Dutch (nl) locale files that need systematic correction.

## Polish Translation Patterns

### Pattern 1: Overly Formal Navigation
**Issue**: Using formal, stiff language for web navigation elements

**Examples**:
- ❌ "Główna" (too formal/old-fashioned for "Home")
- ❌ "Zobacz Moje Prace" (overly formal capitalization)
- ❌ "Skontaktuj Się" (formal imperative)

**Solution**: Use more casual, web-friendly language
- ✅ "Start" or "Strona główna"
- ✅ "Zobacz moje prace" (lowercase for natural feel)
- ✅ "Napisz do mnie" or "Skontaktuj się" (lowercase)

### Pattern 2: Literal Technical Descriptions
**Issue**: Word-for-word translation of technical descriptions that sound unnatural

**Examples**:
- ❌ "Implementacja audio do gier w Wwise/FMOD"
- ❌ "Sound design do animacji"
- ❌ "Narzędzia audio w czasie rzeczywistym rozwiązujące problemy produkcyjne"

**Solution**: Rephrase for natural Polish flow
- ✅ "Audio do gier w Wwise/FMOD"
- ✅ "Sound design dla gier i animacji"
- ✅ "Narzędzia audio, które rozwiązują problemy w produkcji"

### Pattern 3: Awkward Compound Constructions
**Issue**: Direct translation of English compound phrases

**Examples**:
- ❌ "zoptymalizowane pod wydajność i ograniczenia pamięci"
- ❌ "Zarządzam limitami głosów, budżetami pamięci"
- ❌ "Projektuję dźwięki warstwami"

**Solution**: Use more natural Polish phrasing
- ✅ "zoptymalizowane pod kątem wydajności i pamięci"
- ✅ "Zarządzam liczbą głosów i budżetem pamięci"
- ✅ "Projektuję dźwięk warstwowo"

### Pattern 4: Unnatural Verb Forms
**Issue**: Using verb forms that don't flow naturally in Polish

**Examples**:
- ❌ "Twórzmy Razem" (awkward literal translation of "Let's Create Together")
- ❌ "Połącz się Online" (unnatural construction)
- ❌ "Wyślij Wiadomość" (too formal)

**Solution**: Use idiomatic Polish expressions
- ✅ "Stwórzmy coś razem"
- ✅ "Połącz się online" (lowercase, more natural)
- ✅ "Wyślij wiadomość" (lowercase)

### Pattern 5: Over-Translation of Technical Terms
**Issue**: Translating terms that should remain in English

**Examples**:
- ❌ Translating "Blueprints" to Polish equivalent
- ❌ Translating "MetaSounds" 
- ❌ Translating "RTPC"

**Solution**: Keep widely-used English technical terms
- ✅ Keep "Blueprints", "MetaSounds", "RTPC" in English
- ✅ Translate descriptive text around them naturally

### Pattern 6: Inconsistent Preposition Usage
**Issue**: Using "do" vs "dla" vs "w" inconsistently

**Examples**:
- ❌ "Sound design do animacji" (inconsistent with "audio do gier")
- ❌ "audio w grach" vs "audio do gier"

**Solution**: Standardize preposition usage
- ✅ "audio do gier" (for games)
- ✅ "sound design dla animacji" (for animation - different context)
- ✅ Be consistent within similar contexts

## Dutch Translation Patterns

### Pattern 1: Formal vs. Informal Address
**Issue**: Using formal "Uw" instead of informal "je" in portfolio context

**Examples**:
- ❌ "Uw Naam"
- ❌ "Uw Bericht"
- ❌ "Voer uw volledige naam in"

**Solution**: Use informal "je" for approachable portfolio tone
- ✅ "Je naam"
- ✅ "Je bericht"
- ✅ "Voer je volledige naam in"

### Pattern 2: Literal English Constructions
**Issue**: Direct translation of English sentence structures

**Examples**:
- ❌ "Laten we samen maken" (literal "Let's make together")
- ❌ "Verbind Online" (awkward capitalization and phrasing)
- ❌ "Verstuur Bericht" (too formal, awkward)

**Solution**: Use natural Dutch phrasing
- ✅ "Laten we samen creëren" or "Laten we samenwerken"
- ✅ "Verbind online" (lowercase)
- ✅ "Verstuur bericht" (lowercase)

### Pattern 3: Mixed Language Technical Terms
**Issue**: Awkward mixing of English technical terms with Dutch

**Examples**:
- ❌ "voice limieten" (mixing English/Dutch)
- ❌ "geheugen budgets" (awkward spacing)
- ❌ "beatboxclassificatie" (compound without space)

**Solution**: Better integration of English terms
- ✅ "voice count" or "voice-limieten" (with hyphen)
- ✅ "geheugenbudget" (one word) or "geheugen budget" (consistent spacing)
- ✅ "beatbox-classificatie" (with hyphen for clarity)

### Pattern 4: Awkward Compound Words
**Issue**: Creating unnatural Dutch compounds

**Examples**:
- ❌ "Muziekportfolio" (too compressed)
- ❌ "Geluidsontwerp" (acceptable but could be clearer in some contexts)
- ❌ "Audiosystemen" (acceptable but check context)

**Solution**: Balance compound formation with readability
- ✅ "Muziekportfolio" (acceptable as one word)
- ✅ "Sound design" (keep English when more natural)
- ✅ "Audiosystemen" (acceptable)

### Pattern 5: Over-Formal Professional Language
**Issue**: Using overly formal business language

**Examples**:
- ❌ "Een verzameling softwareontwikkelingsprojecten die innovatie en technische expertise laten zien"
- ❌ "Neem Contact Op" (formal capitalization)

**Solution**: More conversational professional tone
- ✅ "Een verzameling projecten die innovatie en technische expertise tonen"
- ✅ "Neem contact op" (lowercase)

### Pattern 6: Inconsistent Technical Term Handling
**Issue**: Sometimes translating, sometimes keeping English terms inconsistently

**Examples**:
- ❌ "Geluidsontwerp" in one place, "Sound design" in another
- ❌ "Game-audio" vs "Game audio" (inconsistent hyphenation)

**Solution**: Standardize approach per term
- ✅ Decide per term: keep "Sound design" consistently OR "Geluidsontwerp" consistently
- ✅ Use consistent hyphenation: "Game audio" (no hyphen) or "Game-audio" (with hyphen)

## Cross-Language Patterns

### Pattern 1: Inconsistent Capitalization
**Issue**: Over-capitalizing words that should be lowercase in both languages

**Examples**:
- ❌ "Zobacz Moje Prace" / "Bekijk Mijn Werk" (unnecessary capitals)
- ❌ "Wyślij Wiadomość" / "Verstuur Bericht" (unnecessary capitals)

**Solution**: Use sentence case for natural feel
- ✅ "Zobacz moje prace" / "Bekijk mijn werk"
- ✅ "Wyślij wiadomość" / "Verstuur bericht"

### Pattern 2: Literal Translation of Idioms
**Issue**: Translating English idioms word-for-word

**Examples**:
- ❌ "By The Numbers" → "W Liczbach" / "In Cijfers" (acceptable but could be more natural)
- ❌ "Let's Create Together" → literal translations

**Solution**: Find equivalent expressions or adapt naturally
- ✅ "W liczbach" (lowercase, acceptable)
- ✅ "Stwórzmy coś razem" / "Laten we samen creëren"

### Pattern 3: Preserving English Sentence Length
**Issue**: Trying to match English sentence length exactly

**Examples**:
- ❌ Creating overly long compound sentences to match English
- ❌ Breaking up natural flow to match English structure

**Solution**: Allow natural sentence length in target language
- ✅ Polish and Dutch may need different sentence structures
- ✅ Prioritize natural flow over matching English exactly

## Validation Checklist for Pattern Corrections

When reviewing translations, check for:

- [ ] Natural word order for target language (not English order)
- [ ] Appropriate formality level (casual for portfolio, not business-formal)
- [ ] Consistent technical term handling (English vs. translated)
- [ ] Natural preposition usage (not literal English prepositions)
- [ ] Lowercase for web UI elements (not Title Case)
- [ ] Idiomatic expressions (not literal translations)
- [ ] Appropriate compound word formation (Dutch)
- [ ] Consistent terminology across all files
- [ ] Professional but approachable tone
- [ ] HTML tags preserved exactly

## Priority Correction Areas

**High Priority** (most visible, affects user perception):
1. Navigation elements (nav_home, nav_about, etc.)
2. Hero section CTAs (cta1, cta2)
3. Contact form elements
4. Main page titles and descriptions

**Medium Priority** (important for engagement):
1. Project descriptions
2. About page content
3. Professional bio sections
4. Skills and education descriptions

**Lower Priority** (completeness):
1. Footer elements
2. Helper text
3. Placeholder text
4. Social media labels

## Notes

- These patterns were identified through analysis of shared.json, index.json, and contact.json
- Similar patterns likely exist in other locale files
- Corrections should be applied systematically across all files
- Always verify corrections with native speakers when possible

## Version History
- v1.0 (2025-10-29): Initial pattern documentation based on locale file analysis
