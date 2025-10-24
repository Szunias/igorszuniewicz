# Design Document

## Overview

This design outlines a systematic approach to auditing all 14 project pages for translation completeness and functionality. The audit will identify missing locale files, incomplete translations, missing HTML markup, and non-functional translation systems. The goal is to ensure every project page has full EN/PL/NL translation support.

## Architecture

### Audit Process Flow

```
┌─────────────────────────────────────────────────────────┐
│              Phase 1: Discovery                          │
│  - List all project HTML files                          │
│  - List all locale JSON files                           │
│  - Match projects to locale files                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Phase 2: File Analysis                      │
│  - Read each project HTML                               │
│  - Read corresponding locale JSON                       │
│  - Identify translatable content                        │
│  - Check for data-i18n attributes                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Phase 3: Gap Identification                 │
│  - Missing locale files                                 │
│  - Missing language sections (EN/PL/NL)                 │
│  - Missing data-i18n attributes                         │
│  - Incomplete translation keys                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Phase 4: Remediation                        │
│  - Create missing locale files                          │
│  - Add missing translations                             │
│  - Add data-i18n attributes to HTML                     │
│  - Verify translation system loads correctly            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Phase 5: Verification                       │
│  - Test language switching on each page                 │
│  - Verify all content translates                        │
│  - Check for console errors                             │
│  - Generate final audit report                          │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Audit Data Structure

```javascript
interface ProjectAudit {
  projectName: string;
  htmlFile: string;
  localeFile: string;
  status: {
    localeFileExists: boolean;
    hasEnglish: boolean;
    hasPolish: boolean;
    hasDutch: boolean;
    htmlHasDataI18n: boolean;
    translationSystemWorks: boolean;
  };
  issues: string[];
  translatableElements: number;
  translatedElements: number;
}
```

### 2. Translation File Structure

Each locale JSON file should follow this structure:

```json
{
  "en": {
    "back": "← Back to Projects",
    "title": "Project Title",
    "subtitle": "Project Subtitle",
    "hero": {
      "badge": "Badge Text",
      "description": "Hero description"
    },
    "sections": {
      "section1": {
        "title": "Section Title",
        "content": "Section content"
      }
    }
  },
  "pl": {
    "back": "← Powrót do Projektów",
    "title": "Tytuł Projektu",
    /* ... */
  },
  "nl": {
    "back": "← Terug naar Projecten",
    "title": "Projecttitel",
    /* ... */
  }
}
```

### 3. HTML Translation Markup Pattern

```html
<!-- Headers -->
<h1 data-i18n="title">Default Title</h1>
<h2 data-i18n="subtitle">Default Subtitle</h2>

<!-- Sections -->
<div class="section">
  <h3 data-i18n="sections.overview.title">Overview</h3>
  <p data-i18n="sections.overview.content">Content here</p>
</div>

<!-- Badges and UI elements -->
<span class="badge" data-i18n="hero.badge">Badge</span>
<a href="#" data-i18n="back">← Back</a>
```

## Data Models

### Project-to-Locale Mapping

| Project HTML File | Locale JSON File | Status |
|-------------------|------------------|--------|
| akantilado.html | akantilado.json | ✓ Exists |
| amorak.html | amorak.json | ✓ Exists |
| audiolab.html | audiolab.json | ✓ Exists |
| audioq.html | audioq.json | ✓ Exists |
| environments.html | environments.json | ✓ Exists |
| middleware2.html | middleware2.json | ✓ Exists |
| musicforgames.html | musicforgames.json | ✓ Exists |
| not-today-darling.html | not-today-darling.json | ✓ Exists |
| pause-and-deserve.html | pause-and-deserve.json | ✓ Exists |
| pawism.html | pawism.json | ✓ Exists |
| ray-animation.html | ray-animation.json | ✓ Exists |
| richter.html | richter.json | ✓ Exists |
| unreal-engine-rebuilder.html | unreal-engine-rebuilder.json | ✓ Exists |
| wwise-unreal-fixer.html | wwise-unreal-fixer.json | ✓ Exists |

**Note**: All locale files exist, but we need to verify their completeness.

## Audit Methodology

### Step 1: Automated Content Analysis

For each project page:

1. **Parse HTML** to identify all user-visible text:
   - Headers (h1, h2, h3, h4, h5, h6)
   - Paragraphs (p)
   - List items (li)
   - Spans and divs with text content
   - Buttons and links
   - Badges and labels

2. **Check for data-i18n attributes**:
   - Count elements with data-i18n
   - Count elements without data-i18n
   - Calculate coverage percentage

3. **Analyze locale JSON**:
   - Verify EN section exists and is complete
   - Verify PL section exists and is complete
   - Verify NL section exists and is complete
   - Count total translation keys
   - Identify missing keys

### Step 2: Manual Content Review

For each project page:

1. **Visual inspection**:
   - Load page in browser at http://localhost:8000
   - Test language switcher (EN → PL → NL)
   - Identify untranslated content
   - Check for layout issues

2. **Console monitoring**:
   - Check for JavaScript errors
   - Check for missing translation warnings
   - Verify locale file loads successfully

3. **Translation quality**:
   - Review Polish translations for naturalness
   - Review Dutch translations for naturalness
   - Check technical terminology accuracy

### Step 3: Issue Categorization

Issues will be categorized as:

- **Critical**: Missing locale file or translation system not loading
- **High**: Missing entire language section (PL or NL)
- **Medium**: Missing data-i18n attributes on major content
- **Low**: Missing data-i18n on minor UI elements
- **Quality**: Translations exist but sound unnatural

## Error Handling

### Missing Locale Files

If a locale file doesn't exist:
1. Create new JSON file with proper structure
2. Extract all text content from HTML
3. Use English as baseline
4. Generate natural PL and NL translations
5. Add data-i18n attributes to HTML

### Incomplete Translations

If a locale file is missing keys:
1. Identify missing keys by comparing HTML to JSON
2. Add missing keys to EN section first
3. Translate to PL and NL
4. Verify keys match HTML data-i18n attributes

### Missing HTML Markup

If HTML lacks data-i18n attributes:
1. Identify all translatable elements
2. Create logical key structure
3. Add data-i18n attributes
4. Update locale JSON with new keys

## Testing Strategy

### Per-Page Testing Checklist

For each of the 14 project pages:

```
□ Load page at http://localhost:8000/projects/[page].html
□ Verify page loads without errors
□ Check default language (should be EN or last selected)
□ Click language switcher to PL
  □ Verify all text updates to Polish
  □ Check for untranslated content
  □ Verify no console errors
□ Click language switcher to NL
  □ Verify all text updates to Dutch
  □ Check for untranslated content
  □ Verify no console errors
□ Click language switcher back to EN
  □ Verify all text updates to English
□ Check translation quality
  □ Polish sounds natural
  □ Dutch sounds natural
  □ Technical terms are appropriate
□ Verify "Back to Projects" link works
```

### Automated Testing

Create a test script that:
1. Loads each project page
2. Attempts to load locale JSON
3. Checks for translation system initialization
4. Verifies all data-i18n elements have corresponding keys
5. Reports any mismatches or errors

## Implementation Approach

### Phase 1: Initial Audit (Discovery)

1. Read all 14 project HTML files
2. Read all 14 locale JSON files
3. Create audit matrix showing:
   - Which files exist
   - Which languages are present
   - Estimated translation coverage

### Phase 2: Detailed Analysis

For each project (prioritized by issues found):
1. Analyze HTML structure
2. Map translatable content
3. Compare with locale JSON
4. Identify gaps

### Phase 3: Remediation

For each project with issues:
1. Add missing locale file (if needed)
2. Add missing language sections (if needed)
3. Add missing translation keys
4. Add data-i18n attributes to HTML
5. Write natural translations

### Phase 4: Verification

1. Test each page manually
2. Verify language switching works
3. Check translation quality
4. Fix any issues found
5. Generate final report

## Design Decisions and Rationales

### Decision 1: Systematic Page-by-Page Approach

**Rationale**: Auditing all 14 pages at once could be overwhelming. A systematic approach ensures nothing is missed and allows for incremental progress.

**Trade-offs**:
- ✓ Thorough and complete
- ✓ Easy to track progress
- ✓ Can prioritize critical issues
- ✗ Takes more time
- ✗ More documentation needed

### Decision 2: Automated + Manual Testing

**Rationale**: Automated checks can find structural issues (missing files, keys), but manual testing is needed for translation quality and functionality.

**Trade-offs**:
- ✓ Catches both technical and quality issues
- ✓ Ensures translations sound natural
- ✓ Verifies actual user experience
- ✗ More time-consuming
- ✗ Requires human judgment

### Decision 3: English as Baseline

**Rationale**: English content in HTML serves as the source of truth. All translations are derived from English content.

**Trade-offs**:
- ✓ Clear source of truth
- ✓ Easier to maintain consistency
- ✓ Fallback language if translations fail
- ✗ Assumes English is always correct
- ✗ May not capture cultural nuances

### Decision 4: Nested Translation Keys

**Rationale**: Using nested objects (e.g., `hero.badge`, `sections.overview.title`) provides better organization and prevents naming conflicts.

**Trade-offs**:
- ✓ Better organization
- ✓ Clearer structure
- ✓ Easier to maintain
- ✗ Slightly more complex
- ✗ Requires dot-notation parsing

## Audit Report Format

The final audit report will include:

### Summary Statistics
- Total project pages: 14
- Pages with complete translations: X
- Pages with partial translations: Y
- Pages with missing translations: Z
- Total issues found: N

### Per-Page Status

```
Project: akantilado.html
Status: ✓ Complete / ⚠ Partial / ✗ Missing
Locale File: ✓ Exists
Languages: EN ✓ | PL ✓ | NL ✓
HTML Markup: 95% coverage
Issues: 
  - Minor: 2 UI elements missing data-i18n
Translation Quality: Good
```

### Priority Issues List

1. **Critical Issues** (must fix immediately)
2. **High Priority Issues** (fix soon)
3. **Medium Priority Issues** (fix when possible)
4. **Low Priority Issues** (nice to have)
5. **Quality Improvements** (enhance naturalness)

## Technical Constraints

1. **Browser Compatibility**: Translation system must work in all modern browsers
2. **Performance**: Locale files should load quickly (< 100ms)
3. **Maintainability**: Translation structure should be consistent across all pages
4. **Accessibility**: Language switcher must be keyboard accessible
5. **SEO**: Default HTML content should be in English

## Future Considerations

1. **Translation Management System**: Consider using a TMS for easier management
2. **Automated Testing**: Create automated tests for translation coverage
3. **Translation Memory**: Reuse common translations across pages
4. **Language Detection**: Auto-detect user's browser language
5. **Additional Languages**: Framework should support adding more languages easily
