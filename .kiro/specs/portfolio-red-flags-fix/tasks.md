# Implementation Plan: Portfolio Red Flags Fix

## Phase 1: Critical Red Flags (Week 1)

- [x] 1. Fix Location Inconsistencies


  - Update README.md to change "Netherlands 🇳🇱" to "Belgium, West Flanders"
  - Verify all structured data (JSON-LD) in about.html, contact.html shows "Belgium"
  - Check all locale files (locales/shared.json, locales/about.json, locales/contact.json) for location consistency
  - Ensure CV (cv/igor-cv-dark.html) shows correct location
  - _Requirements: 1.4, 6.1, 6.4, 8.3_




- [ ] 2. Remove/Protect Personal Contact Information
- [ ] 2.1 Set up professional email domain
  - Register email: igor@igorszuniewicz.com or contact@igorszuniewicz.com
  - Configure email forwarding to personal Gmail

  - Test email delivery and spam filters
  - _Requirements: 1.1, 1.4_

- [ ] 2.2 Update email across all files
  - Replace szunio2004@gmail.com with professional email (igor@igorszuniewicz.com or igorszuniewiczwork@gmail.com) in cv/igor-cv-dark.html
  - Update contact.html with new email
  - Update all structured data (JSON-LD) with new email
  - Update all locale files (locales/*.json) with new email

  - Update README.md with new email
  - Note: Current working email is igorszuniewiczwork@gmail.com (not szunio2004@gmail.com shown on website)
  - _Requirements: 1.1, 8.1, 8.3_




- [ ] 2.3 Remove phone number from public pages
  - Remove phone number from cv/igor-cv-dark.html footer
  - Add "Available upon request" note if phone contact is needed
  - _Requirements: 1.2, 1.4_


- [ ] 3. Fix Demo Reel Placeholder Issue
- [ ] 3.1 Evaluate demo reel options
  - Decide: Remove section, replace with actual content, or move to bottom
  - If removing: prepare alternative CTAs to project pages





  - If replacing: gather video/audio content for actual demo reel
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 3.2 Implement demo reel fix
  - Remove or replace demo reel section in index.html

  - Update locale files (locales/index.json) to remove demo reel translations if section removed
  - Add prominent CTAs to featured projects instead
  - Test that homepage flows better without placeholder
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [ ] 4. Fix Unverifiable Technical Claims
- [x] 4.1 Replace skill percentages with levels




  - Change "85% Wwise" to "Advanced" in about.html
  - Change "95% Reaper" to "Expert" in about.html
  - Update all skill proficiency displays to use "Expert", "Advanced", "Intermediate"
  - Update locale files (locales/shared.json, locales/about.json) with new skill level terminology
  - _Requirements: 3.2, 3.4, 8.2_




- [ ] 4.2 Add context to technical metrics
  - Update "320+ audio events" to "320+ audio events across 12 categories (vehicles, UI, environment, etc.)"
  - Update "45ms latency" to "45ms end-to-end latency (measured from audio input to game response)"


  - Update "92% accuracy" to "92% accuracy on 500-sample test set (kick, snare, hi-hat classification)"
  - Apply changes to projects/not-today-darling.html, projects/audiolab.html
  - Update locale files (locales/not-today-darling.json, locales/audiolab.json) with contextualized metrics
  - _Requirements: 3.1, 3.3, 3.5_



## Phase 2: High Priority Red Flags (Week 2)

- [x] 5. Add Project Context and Role Clarity

- [ ] 5.1 Create project context template
  - Design HTML/CSS for "Project Context" section
  - Include fields: Type (student/professional), Institution, Year, Duration, Team Size, Role, Responsibilities
  - Create reusable component that can be added to all project pages
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 5.2 Add context to Not Today, Darling project
  - Add "Project Context" section to projects/not-today-darling.html
  - Specify: "Student Project - DAE Belgium (2024), 12 weeks, Team of 8, Solo Audio Implementation"
  - List specific responsibilities: Sound design, Audio implementation, Mixing, Voiceover direction
  - Update locale files (locales/not-today-darling.json) with context translations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5.3 Add context to Amorak project
  - Add "Project Context" section to projects/amorak.html
  - Specify project type, duration, role
  - Update locale files (locales/amorak.json) with context translations
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 5.4 Add context to AudioLab project
  - Add "Project Context" section to projects/audiolab.html
  - Specify project type, duration, role, technical details
  - Update locale files (locales/audiolab.json) with context translations
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 5.5 Add context to remaining projects
  - Add "Project Context" sections to all other project pages
  - Ensure consistency in format and level of detail
  - Update all corresponding locale files
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 6. Fix Broken/Missing Content
- [ ] 6.1 Audit all links and embeds
  - Create checklist of all external links (YouTube, Spotify, LinkedIn, GitHub, Itch.io)
  - Test each link manually
  - Document any broken links
  - _Requirements: 7.1, 7.3, 7.4_

- [ ] 6.2 Fix broken links and embeds
  - Replace or remove broken YouTube embeds
  - Update social media links if profiles changed
  - Fix any broken internal links
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 6.3 Test image loading
  - Verify all images load correctly on all pages
  - Check WebP fallbacks work for browsers without WebP support
  - Test lazy loading functionality
  - Optimize any oversized images
  - _Requirements: 5.4, 7.3_

- [ ] 6.4 Validate locale completeness
  - Check all locale files (EN/PL/NL) have matching keys
  - Translate any missing strings
  - Verify translations are professional and accurate
  - _Requirements: 5.5, 8.4_

- [ ] 7. Standardize Terminology
- [ ] 7.1 Create terminology guide
  - Document standard terms to use: "Audio Designer & Developer", "Wwise", "FMOD", "Interactive music", "Sound design"
  - Define when to use each term
  - Create list of terms to avoid or replace
  - _Requirements: 5.2, 8.2_

- [ ] 7.2 Apply terminology consistently
  - Update all pages to use standard terminology
  - Replace inconsistent terms (e.g., "adaptive music" → "interactive music" where appropriate)
  - Ensure technical terms are used correctly
  - Update all locale files with consistent terminology
  - _Requirements: 5.2, 8.2_

- [ ] 8. Clarify Availability Status
- [ ] 8.1 Add availability section to about page
  - Create "Current Status & Availability" section in about.html
  - Include: Current status (Student at DAE Belgium), Graduation date (June 2025), Available for (Freelance, Internships), Seeking (Junior roles starting July 2025)
  - Update locale files (locales/about.json) with availability translations
  - _Requirements: 6.2, 6.3, 6.5_

- [ ] 8.2 Update "Available for Projects" badge
  - Make badge more specific: "Available for Freelance Projects" or "Seeking Junior Audio Designer Roles"
  - Update on contact page and any other pages with availability badge
  - Update locale files with new badge text
  - _Requirements: 6.2, 6.5_

## Phase 3: Medium Priority Red Flags (Week 3)

- [ ] 9. Remove CV Image Protection
  - Remove all image protection JavaScript from cv/igor-cv-dark.html
  - Remove contextmenu, dragstart, and keydown event listeners
  - Test that CV still displays correctly
  - _Requirements: 9.1_

- [ ] 10. Restructure Project Pages for Better Hierarchy
- [ ] 10.1 Design new project page structure
  - Create template with sections: Hero (30s), Quick Facts (1min), Key Achievements (2min), Technical Details (expandable), Media
  - Add "TL;DR" section at top
  - Design show/hide functionality for detailed sections
  - _Requirements: 4.1, 4.2_

- [ ] 10.2 Restructure Not Today, Darling page
  - Apply new structure to projects/not-today-darling.html
  - Move detailed content into expandable sections
  - Ensure key information is visible immediately
  - Test that page is easier to scan
  - _Requirements: 4.1, 4.2_

- [ ] 10.3 Restructure remaining project pages
  - Apply new structure to all other project pages
  - Ensure consistency across all projects
  - Test navigation and readability
  - _Requirements: 4.1, 4.2_

- [ ] 11. Add Prominent Audio Players
- [ ] 11.1 Audit current audio content
  - List all projects that should have audio samples
  - Identify which projects already have audio players
  - Determine what audio content is missing
  - _Requirements: 2.3, 2.5_

- [ ] 11.2 Add audio players to all project pages
  - Implement prominent audio players at top of each project page
  - Create 30-60 second highlight reels for each project
  - Add waveform visualizations if possible
  - Ensure audio players work on all browsers and devices
  - _Requirements: 2.3, 2.5_

- [ ] 11.3 Add download links for audio samples
  - Provide download links for full audio samples (with permission)
  - Consider embedding SoundCloud or similar for easy playback
  - Add clear labels for each audio sample
  - _Requirements: 2.3, 2.5_

- [ ] 12. Audit and Update Social Media Profiles
- [ ] 12.1 Review all linked social media profiles
  - Check LinkedIn profile matches portfolio content
  - Review GitHub for outdated or incomplete projects
  - Verify Spotify artist profile is professional
  - Check Itch.io for unprofessional student projects
  - _Requirements: 7.2, 7.5_

- [ ] 12.2 Update social media profiles
  - Update LinkedIn with latest projects
  - Archive or private old GitHub projects, pin best work
  - Ensure Spotify music quality is professional
  - Remove Itch.io link if games aren't polished
  - Add professional headshots to all profiles
  - Ensure bios match across all platforms
  - _Requirements: 7.2, 7.5_

## Phase 4: Low Priority Red Flags (Week 4)

- [ ] 13. Tone Down Dramatic Language
  - Review all pages for overly dramatic language
  - Replace flowery descriptions with concrete achievements
  - Update about.html to remove phrases like "make the impossible feel effortless"
  - Update contact.html to use more professional tone
  - Update locale files with toned-down language
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 14. Standardize Date Formats
  - Choose standard date format: "Month YYYY - Month YYYY" (e.g., "Jan 2024 - Jun 2024")
  - Update all dates in CV (cv/igor-cv-dark.html)
  - Update all dates on project pages
  - Update all dates on about page
  - Use "Present" for ongoing work
  - Ensure dates are accurate and match across all pages
  - _Requirements: 8.3_

- [ ] 15. Add Metrics to All Projects
  - Identify projects missing metrics
  - Add metrics where possible: Number of audio assets, Project duration, Team size, Technical specs, Performance metrics
  - If metrics aren't available, explain why
  - Ensure consistent level of detail across all projects
  - Update locale files with new metrics
  - _Requirements: 3.1, 3.3, 3.5_

## Phase 5: Testing and Validation

- [ ] 16. Pre-Launch Testing
- [ ] 16.1 Critical tests
  - Verify all contact information is consistent across all pages
  - Confirm professional email is set up and working
  - Verify phone number is removed from public pages
  - Confirm location is consistent (Belgium, not Netherlands)
  - Verify demo reel section is removed or replaced
  - Confirm all technical claims have context and proof
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 3.1, 6.1, 6.4, 8.1, 8.3_

- [ ] 16.2 High priority tests
  - Verify all project pages have "Role" and "Context" sections
  - Test all links (internal and external)
  - Verify all images load correctly
  - Test all videos/embeds work
  - Verify all locale files are complete and accurate
  - Confirm terminology is consistent across all pages
  - _Requirements: 4.1, 4.2, 5.2, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4_

- [ ] 16.3 Medium priority tests
  - Verify audio players are prominent and functional
  - Confirm project descriptions are concise and scannable
  - Verify availability status is clear
  - Confirm social media profiles are professional and consistent
  - _Requirements: 2.3, 6.2, 7.2, 7.5_

- [ ] 16.4 Low priority tests
  - Verify language tone is professional throughout
  - Confirm date formats are consistent
  - Verify all projects have comparable levels of detail
  - _Requirements: 3.1, 8.3, 9.1, 9.2, 9.3_

- [ ] 17. Browser and Device Testing
- [ ] 17.1 Desktop browser testing
  - Test on Chrome (Windows, Mac, Linux)
  - Test on Firefox (Windows, Mac, Linux)
  - Test on Safari (Mac)
  - Test on Edge (Windows)
  - _Requirements: 5.1, 5.3_

- [ ] 17.2 Mobile device testing
  - Test on iOS Safari (iPhone)
  - Test on Android Chrome (Android phone)
  - Test on iPad
  - Test on Android tablet
  - _Requirements: 5.1, 5.3_

- [ ] 18. Performance Testing
  - Verify page load times < 3 seconds
  - Confirm images are optimized (WebP with PNG fallback)
  - Test lazy loading works correctly
  - Check for console errors
  - Run Lighthouse audit (target score > 90)
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 19. Final Review and Launch
  - Conduct final manual review of all pages
  - Have industry professional review portfolio
  - Get feedback from audio directors or senior audio designers
  - Make final adjustments based on feedback
  - Deploy changes to production
  - Monitor for any issues post-launch
  - _Requirements: All requirements_
