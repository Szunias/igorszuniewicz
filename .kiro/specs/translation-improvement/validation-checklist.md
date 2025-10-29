# Translation Validation Checklist

## Purpose
This checklist ensures quality, consistency, and technical correctness when reviewing and validating Polish (pl) and Dutch (nl) translations across all locale files.

## Pre-Translation Checklist

Before starting translation work on a file:

- [ ] Read the English (en) version completely
- [ ] Understand the context and purpose of each translation key
- [ ] Review the terminology glossary for standard translations
- [ ] Check common-patterns.md for known issues to avoid
- [ ] Identify which category each translation belongs to (UI, Professional, Technical, CTA)
- [ ] Note any HTML tags or special formatting that must be preserved

## During Translation Checklist

### Language Quality (Polish)

- [ ] Sounds natural to native Polish speakers
- [ ] Uses contemporary, not archaic language
- [ ] Avoids overly formal constructions
- [ ] Uses appropriate prepositions (do/dla/w/na)
- [ ] Maintains professional but approachable tone
- [ ] Uses idiomatic expressions, not literal translations
- [ ] Follows natural Polish word order
- [ ] Uses lowercase for web UI elements (not Title Case)
- [ ] Keeps widely-used English technical terms (Wwise, FMOD, Unity, etc.)
- [ ] Translates descriptive text naturally around English terms

### Language Quality (Dutch)

- [ ] Sounds natural to native Dutch speakers
- [ ] Uses informal "je" instead of formal "u/uw" for portfolio context
- [ ] Avoids literal English sentence structures
- [ ] Handles compound words appropriately (with/without hyphens)
- [ ] Maintains professional but accessible tone
- [ ] Uses idiomatic expressions, not literal translations
- [ ] Follows natural Dutch word order
- [ ] Uses lowercase for web UI elements (not Title Case)
- [ ] Keeps widely-used English technical terms
- [ ] Integrates English technical terms naturally with Dutch text

### Technical Accuracy

- [ ] Preserves all HTML tags exactly (`<br>`, `<span>`, etc.)
- [ ] Maintains all special characters and formatting
- [ ] Preserves line breaks and spacing
- [ ] Keeps JSON structure intact (no added/removed keys)
- [ ] Maintains nested object structure
- [ ] Preserves any placeholder variables (e.g., `{{variable}}`)
- [ ] Keeps URLs and email addresses unchanged
- [ ] Maintains proper JSON syntax (quotes, commas, brackets)

### Consistency

- [ ] Uses terminology from the glossary consistently
- [ ] Matches tone and style of other translations in same file
- [ ] Consistent with translations in other locale files
- [ ] Technical terms translated consistently across all files
- [ ] Similar phrases translated similarly
- [ ] Navigation elements consistent across all pages
- [ ] Call-to-action phrases consistent in style

### Context Appropriateness

- [ ] Appropriate for the specific page/section context
- [ ] Matches the intended audience (professional portfolio)
- [ ] Suitable for web/digital context (not print or formal business)
- [ ] Engaging for call-to-action elements
- [ ] Clear and informative for descriptions
- [ ] Professional for bio and credentials
- [ ] Friendly for contact and social elements

### Length Considerations

- [ ] Translation length is reasonable for UI display
- [ ] Not significantly longer than English (may cause UI overflow)
- [ ] Not significantly shorter (may lose meaning)
- [ ] Fits expected button/label space
- [ ] Works well in responsive layouts
- [ ] Consider mobile display constraints

## Post-Translation Checklist

After completing translation work on a file:

### File-Level Validation

- [ ] All English keys have corresponding Polish translations
- [ ] All English keys have corresponding Dutch translations
- [ ] No translation keys are missing
- [ ] No extra keys added that don't exist in English
- [ ] File structure matches English version exactly
- [ ] JSON syntax is valid (no syntax errors)
- [ ] File encoding is UTF-8
- [ ] No trailing commas or syntax issues

### Cross-File Validation

- [ ] Common elements (nav, footer) consistent across all files
- [ ] Technical terms consistent across all files
- [ ] Tone and style consistent across all files
- [ ] No contradictions between files
- [ ] Shared terminology used consistently

### Quality Assurance

- [ ] No spelling errors in Polish
- [ ] No spelling errors in Dutch
- [ ] No grammatical errors in Polish
- [ ] No grammatical errors in Dutch
- [ ] No typos or copy-paste errors
- [ ] No English text left in Polish/Dutch sections
- [ ] No placeholder text like "TODO" or "FIX"

### Native Speaker Review (Ideal)

- [ ] Polish translation reviewed by native Polish speaker
- [ ] Dutch translation reviewed by native Dutch speaker
- [ ] Feedback incorporated
- [ ] Natural language flow confirmed
- [ ] Cultural appropriateness confirmed

## Testing Checklist

### Visual Testing

- [ ] View translation in actual website context
- [ ] Check for UI overflow or truncation
- [ ] Verify readability on desktop
- [ ] Verify readability on mobile
- [ ] Check button text fits properly
- [ ] Verify form labels display correctly
- [ ] Check navigation menu displays properly

### Functional Testing

- [ ] Language switcher works correctly
- [ ] All translated pages load without errors
- [ ] No console errors related to missing translations
- [ ] Forms work with translated labels
- [ ] Links and buttons function correctly
- [ ] No broken layouts due to translation length

## Category-Specific Checklists

### Navigation & UI Elements

- [ ] Short and concise
- [ ] Casual, web-friendly language
- [ ] Lowercase (not Title Case)
- [ ] Consistent across all pages
- [ ] Clear and immediately understandable

### Professional Descriptions

- [ ] Natural, not literal translations
- [ ] Professional but approachable tone
- [ ] Technical terms handled appropriately
- [ ] Engaging and clear
- [ ] Accurate representation of skills/experience

### Technical Content

- [ ] English technical terms preserved where appropriate
- [ ] Descriptive text translated naturally
- [ ] Accurate technical information
- [ ] Consistent terminology
- [ ] Professional language

### Call-to-Action Phrases

- [ ] Engaging and action-oriented
- [ ] Natural and inviting
- [ ] Appropriate urgency level
- [ ] Clear benefit or purpose
- [ ] Consistent style across all CTAs

### Form Elements

- [ ] Clear and instructive
- [ ] Friendly and approachable
- [ ] Appropriate formality (informal for portfolio)
- [ ] Helpful placeholder text
- [ ] Clear error messages (if applicable)

## Common Issues to Check

### Polish-Specific Issues

- [ ] Not using "Główna" for Home (use "Start" or "Strona główna")
- [ ] Not over-capitalizing UI elements
- [ ] Not using overly formal imperatives
- [ ] Not translating technical terms that should stay in English
- [ ] Not using awkward compound constructions
- [ ] Using natural prepositions (do/dla/w)
- [ ] Not using literal English word order

### Dutch-Specific Issues

- [ ] Using "je" not "u/uw" for portfolio context
- [ ] Not using literal English constructions
- [ ] Not creating awkward compound words
- [ ] Proper hyphenation of compound terms
- [ ] Not over-capitalizing UI elements
- [ ] Natural integration of English technical terms
- [ ] Not using overly formal business language

### Cross-Language Issues

- [ ] HTML tags preserved exactly
- [ ] No missing or extra translation keys
- [ ] Consistent terminology across files
- [ ] Appropriate tone for context
- [ ] Natural sentence length (not forced to match English)
- [ ] Idiomatic expressions, not literal translations

## Documentation Checklist

After completing and validating translations:

- [ ] Document any significant changes made
- [ ] Note rationale for non-obvious translation choices
- [ ] Update glossary if new terms were standardized
- [ ] Document any patterns corrected
- [ ] Note any terms that need future review
- [ ] Record any feedback received
- [ ] Update version history in documentation

## Sign-Off Checklist

Before considering translation work complete:

- [ ] All items in this checklist completed
- [ ] Files validated with JSON linter
- [ ] Visual testing completed in browser
- [ ] Cross-file consistency verified
- [ ] Documentation updated
- [ ] Changes committed to version control
- [ ] Commit message clearly describes changes
- [ ] Ready for review/deployment

## Priority Levels

### Critical (Must Fix)
- Syntax errors that break functionality
- Missing translations
- Broken HTML tags
- Incorrect technical information
- Offensive or inappropriate language

### High Priority (Should Fix)
- Unnatural phrasing that sounds AI-generated
- Inconsistent terminology
- Overly formal language in casual contexts
- UI text that doesn't fit properly
- Grammatical errors

### Medium Priority (Nice to Fix)
- Minor phrasing improvements
- Slight inconsistencies in style
- Optimization for better flow
- Enhanced engagement in CTAs

### Low Priority (Optional)
- Minor stylistic preferences
- Alternative phrasings that are equally valid
- Micro-optimizations

## Notes

- This checklist should be used for every translation file
- Not all items may apply to every file (use judgment)
- When in doubt, prioritize natural language over literal translation
- Always preserve technical accuracy and HTML structure
- Document any deviations from standard patterns with rationale

## Version History
- v1.0 (2025-10-29): Initial validation checklist created
