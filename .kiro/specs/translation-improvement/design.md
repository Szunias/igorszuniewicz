# Design Document: Translation Improvement

## Overview

This design addresses the systematic improvement of Polish and Dutch translations across all locale files in the portfolio website. The current translations suffer from literal word-for-word conversion that lacks natural language flow and contextual awareness. The solution involves analyzing each translation in context, identifying patterns of unnatural phrasing, and revising them to sound native and professional while maintaining technical accuracy.

## Architecture

### Translation Review System

The translation improvement process follows a structured approach:

1. **Analysis Phase**: Identify problematic patterns in existing translations
2. **Context Mapping**: Understand the purpose and audience for each translation key
3. **Revision Phase**: Rewrite translations with natural phrasing
4. **Validation Phase**: Ensure consistency and technical accuracy
5. **Documentation Phase**: Record changes and rationale

### File Structure

```
locales/
├── shared.json          # Common UI elements, navigation, footer
├── index.json           # Homepage content
├── about.json           # About page content
├── contact.json         # Contact page content
├── music.json           # Music page content
├── projects.json        # Projects listing page
└── [project-specific].json  # Individual project pages
```

## Components and Interfaces

### Translation Categories

Based on analysis, translations fall into these categories:

#### 1. Navigation & UI Elements
**Current Issues (Polish)**:
- "Główna" (too formal for "Home")
- "Połącz się Online" (literal "Connect Online")
- "Wyślij Wiadomość" (overly formal)

**Current Issues (Dutch)**:
- "Verbind Online" (awkward phrasing)
- "Verstuur Bericht" (too formal)
- "Uw Naam" (overly formal "Uw" instead of casual "Je")

**Design Solution**: Use casual, web-friendly language that matches modern portfolio standards. Polish should use more colloquial terms, Dutch should use "je" form for better approachability.

#### 2. Professional Descriptions
**Current Issues (Polish)**:
- "Buduję systemy audio zoptymalizowane pod wydajność" (awkward construction)
- "Zarządzam limitami głosów" (too literal "manage voice limits")
- "Projektuję dźwięki warstwami" (unnatural phrasing)

**Current Issues (Dutch)**:
- "Ik bouw audio systemen geoptimaliseerd voor performance" (too literal)
- "Beheer voice limieten" (mixing English/Dutch awkwardly)
- "Ik ontwerp geluiden in lagen" (unnatural construction)

**Design Solution**: Rewrite to sound like a native professional would describe their work. Use industry-standard terminology where appropriate, but phrase it naturally.

#### 3. Technical Terminology
**Current Issues**:
- Inconsistent handling of English technical terms (Wwise, FMOD, DSP)
- Over-translation of terms that should remain in English
- Awkward attempts to translate concepts that don't translate well

**Design Solution**: 
- Keep widely-used English terms (Wwise, FMOD, Unity, Unreal Engine, DSP, ML)
- Translate descriptive text around them naturally
- Use accepted industry terminology in target languages

#### 4. Call-to-Action Phrases
**Current Issues (Polish)**:
- "Zobacz Moje Prace" (too formal)
- "Skontaktuj Się" (formal imperative)
- "Twórzmy Razem" (awkward literal translation of "Let's Create Together")

**Current Issues (Dutch)**:
- "Bekijk Mijn Werk" (acceptable but could be more engaging)
- "Neem Contact Op" (formal)
- "Laten we samen maken" (grammatically awkward)

**Design Solution**: Use engaging, action-oriented language that feels natural and inviting in each language.

## Data Models

### Translation Entry Structure

Each translation follows this conceptual model:

```typescript
interface TranslationEntry {
  key: string;                    // e.g., "hero.title"
  en: string;                     // Original English
  pl: {
    current: string;              // Current Polish translation
    revised: string;              // Improved Polish translation
    rationale: string;            // Why it was changed
  };
  nl: {
    current: string;              // Current Dutch translation
    revised: string;              // Improved Dutch translation
    rationale: string;            // Why it was changed
  };
  category: TranslationCategory;  // UI, Professional, Technical, CTA
  preserveFormatting: boolean;    // HTML tags, line breaks
}
```

### Translation Patterns

Common patterns identified for correction:

#### Polish Patterns

1. **Overly Formal Address**
   - Current: "Twoje Imię", "Twoja Wiadomość"
   - Revised: More natural forms appropriate for web context

2. **Literal Technical Translations**
   - Current: "Zarządzam limitami głosów, budżetami pamięci"
   - Revised: Natural phrasing that conveys the same meaning

3. **Awkward Compound Constructions**
   - Current: "zoptymalizowane pod wydajność i ograniczenia pamięci"
   - Revised: Smoother phrasing

4. **Unnatural Verb Forms**
   - Current: "Projektuję dźwięki warstwami"
   - Revised: More idiomatic constructions

#### Dutch Patterns

1. **Formal vs. Informal Address**
   - Current: "Uw Naam", "Uw Bericht"
   - Revised: "Je naam", "Je bericht" (more appropriate for portfolio)

2. **Literal English Constructions**
   - Current: "Laten we samen maken"
   - Revised: More natural Dutch phrasing

3. **Mixed Language Technical Terms**
   - Current: "voice limieten", "geheugen budgets"
   - Revised: Better integration of English technical terms

4. **Awkward Compound Words**
   - Current: "beatboxclassificatie"
   - Revised: More natural spacing or phrasing

## Error Handling

### Validation Rules

1. **Structure Preservation**
   - All HTML tags must remain intact
   - Line breaks (`<br>`) must be preserved
   - Special characters and formatting must not be altered

2. **Key Consistency**
   - All translation keys must match across en/pl/nl
   - No keys should be added or removed
   - Nested structure must remain identical

3. **Technical Term Consistency**
   - Technical terms should be consistent across all files
   - Create a glossary of accepted translations for recurring terms

4. **Length Considerations**
   - Translations should be reasonably similar in length to English
   - Flag translations that are significantly longer (may cause UI issues)

### Quality Checks

1. **Native Speaker Review**
   - Polish translations should sound natural to Polish speakers
   - Dutch translations should sound natural to Dutch speakers

2. **Context Appropriateness**
   - Professional tone maintained throughout
   - Casual where appropriate (CTAs, navigation)
   - Technical where necessary (descriptions, specifications)

3. **Consistency Check**
   - Same terms translated consistently across files
   - Tone consistency within each language
   - Style guide adherence

## Testing Strategy

### Manual Review Process

1. **File-by-File Review**
   - Review each locale file individually
   - Compare en/pl/nl side by side
   - Identify unnatural phrasings

2. **Contextual Testing**
   - View translations in actual website context
   - Check for UI fit and readability
   - Verify technical accuracy

3. **Cross-File Consistency**
   - Ensure terminology consistency across all files
   - Check that similar phrases are translated similarly
   - Verify navigation and common elements match

### Validation Checklist

For each translation:
- [ ] Sounds natural to native speakers
- [ ] Maintains professional tone
- [ ] Preserves technical accuracy
- [ ] Keeps HTML/formatting intact
- [ ] Consistent with other translations
- [ ] Appropriate length for UI
- [ ] Uses accepted industry terminology

## Implementation Approach

### Phase 1: Core Files (shared.json, index.json, about.json, contact.json)
These files contain the most visible and frequently accessed content. Priority for natural, engaging language.

### Phase 2: Project-Specific Files
Individual project descriptions. Ensure consistency with core terminology while adapting to specific project contexts.

### Phase 3: Specialized Content (music.json, projects.json)
Less frequently updated content, but still important for completeness.

### Revision Priorities

**High Priority** (affects user perception immediately):
- Navigation elements
- Hero sections
- Call-to-action buttons
- Contact forms

**Medium Priority** (important for engagement):
- About page descriptions
- Project descriptions
- Professional bio content

**Lower Priority** (completeness):
- Footer text
- Helper text
- Placeholder text

## Key Translation Principles

### Polish Translation Guidelines

1. **Use Contemporary Language**: Avoid overly formal or archaic constructions
2. **Technical Terms**: Keep English terms for widely-used technology (Wwise, FMOD, Unity, etc.)
3. **Professional but Approachable**: Balance professionalism with accessibility
4. **Natural Word Order**: Avoid literal English word order
5. **Idiomatic Expressions**: Use Polish equivalents, not literal translations

### Dutch Translation Guidelines

1. **Informal Address**: Use "je" instead of "u" for portfolio context
2. **Technical Terms**: Keep English terms, integrate naturally
3. **Compound Words**: Be careful with Dutch compound word formation
4. **Natural Phrasing**: Avoid English sentence structures
5. **Professional Tone**: Maintain expertise while being approachable

## Documentation Requirements

### Change Log Format

For significant changes, document:
```
Key: hero.description
Language: pl
Before: "Implementacja audio do gier w Wwise/FMOD. Sound design do animacji."
After: "Audio do gier w Wwise/FMOD. Sound design dla gier i animacji."
Rationale: More natural phrasing, "do animacji" → "dla gier i animacji" flows better
```

### Terminology Glossary

Maintain a glossary of standard translations:
- Game audio → Audio do gier (pl), Game audio (nl)
- Sound design → Sound design (both, keep English)
- Interactive music → Muzyka interaktywna (pl), Interactieve muziek (nl)
- Real-time → W czasie rzeczywistym (pl), Realtime (nl)
- etc.

## Success Criteria

Translations are successful when:
1. Native speakers find them natural and professional
2. Technical accuracy is maintained
3. Tone is consistent across all content
4. UI elements fit properly without overflow
5. Brand voice is preserved in translation
6. No grammatical or spelling errors
7. Terminology is consistent across all files
