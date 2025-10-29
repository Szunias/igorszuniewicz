# Design Document: Portfolio Red Flags Analysis & Fix Strategy

## Overview

This document provides a comprehensive analysis of all red flags found in Igor Szuniewicz's portfolio website from the perspective of industry professionals (audio directors, recruiters, game audio leads). Each red flag is categorized by severity and includes specific recommendations for fixes.

## Red Flags Identified

### 🔴 CRITICAL RED FLAGS (Must Fix Immediately)

#### 1. **Conflicting Location Information**

**Location:** Multiple pages (about.html, contact.html, CV, README.md)

**Issue:**
- CV says: "Belgium, West Flanders"
- Contact page says: "Belgium, West Flanders"  
- About page structured data says: "Belgium, West Flanders"
- README says: "Location: Netherlands 🇳🇱"

**Why This Is a Red Flag:**
Recruiters will immediately notice this inconsistency and question:
- Is the candidate lying about their location?
- Are they confused about where they live?
- Is the portfolio outdated and unmaintained?
- Can we trust other information if basic facts are wrong?

**Fix:**
- Determine actual current location
- Update ALL instances to match (README.md, about.html, contact.html, CV, structured data)
- Ensure consistency across all 3 languages (EN/PL/NL)

---

#### 2. **Exposed Personal Phone Number**

**Location:** cv/igor-cv-dark.html (footer)

**Issue:**
```html
<div><span>Phone</span> +48 605 117 516</div>
```

**Why This Is a Red Flag:**
- Personal phone number publicly accessible on the internet
- Can lead to spam calls, scams, or harassment
- Professional portfolios typically don't include phone numbers (email is preferred)
- Shows lack of awareness about online privacy/security

**Fix:**
- Remove phone number from CV entirely
- If phone contact is necessary, use a professional service or Google Voice number
- Rely on email as primary contact method (already present: szunio2004@gmail.com)

---

#### 3. **Email Inconsistency Across Website**

**Location:** Multiple files (CV, contact.html, structured data, README)

**Issue:**
Two different emails are used:
- **szunio2004@gmail.com** - found in CV, contact page, structured data, README
- **igorszuniewiczwork@gmail.com** - actual current email (not in website)

**Why This Is a Red Flag:**
- Website shows outdated email that may not be monitored
- Recruiters contacting szunio2004@gmail.com might not get responses
- Inconsistency suggests portfolio is not maintained
- Even current email (igorszuniewiczwork@gmail.com) looks less professional than custom domain
- Gmail addresses (even "work" ones) look less professional than custom domain emails
- Exposed to spam bots scraping websites

**Fix:**
- **Option A (Recommended):** Set up professional email: igor@igorszuniewicz.com or contact@igorszuniewicz.com
  - Forward to igorszuniewiczwork@gmail.com
  - Update all instances across website
  - Looks most professional
- **Option B (Quick Fix):** Update all instances to igorszuniewiczwork@gmail.com
  - At least ensures consistency
  - Still works but less professional than custom domain
- Consider email obfuscation techniques or contact forms to prevent scraping

---

#### 4. **Demo Reel Placeholder Taking Prime Real Estate**

**Location:** index.html (Demo Reel Section)

**Issue:**
```html
<div class="demo-reel-placeholder">
  <div class="demo-reel-icon">🎬</div>
  <div class="demo-reel-placeholder-text">Demo Reel Coming Soon</div>
  <div class="demo-reel-placeholder-note">Currently compiling best work...</div>
</div>
```

**Why This Is a Red Flag:**
- Takes up massive space on homepage (entire section with badge, title, description)
- First thing recruiters see after hero section
- "Coming Soon" implies work isn't ready to show
- Suggests portfolio is incomplete or candidate isn't serious
- Recruiters won't wait - they'll move to next candidate

**Fix:**
- **Option A (Recommended):** Remove entire demo reel section until actual reel exists
- **Option B:** Replace with embedded project videos/audio players showing actual work
- **Option C:** Move to bottom of page with much smaller footprint
- Add clear CTAs to existing project pages instead

---

### 🟡 HIGH PRIORITY RED FLAGS (Fix Soon)

#### 5. **Unverifiable Technical Claims**

**Location:** Multiple project pages and about.html

**Issue:**
- "320+ audio events" - No way to verify this number
- "45ms latency" - Claimed multiple times but no technical proof
- "92% classification accuracy" - No dataset size or testing methodology mentioned
- "85% Wwise proficiency" - Arbitrary percentage with no industry standard
- "95% Reaper proficiency" - What does 95% even mean?

**Why This Is a Red Flag:**
- Technical leads will question these numbers immediately
- No context or proof makes claims look inflated
- Percentages for skill proficiency are meaningless without benchmarks
- Suggests candidate doesn't understand how to present technical work

**Fix:**
- Remove arbitrary skill percentages (85%, 95%) - use "Expert", "Advanced", "Intermediate" instead
- Provide context for technical metrics:
  - "320+ audio events across 12 categories (vehicles, UI, environment, etc.)"
  - "45ms end-to-end latency (measured from audio input to game response)"
  - "92% accuracy on 500-sample test set (kick, snare, hi-hat classification)"
- Add links to technical documentation or GitHub repos where possible
- Include screenshots of profilers, debug tools, or technical implementations

---

#### 6. **Vague Project Contributions**

**Location:** Project pages (not-today-darling.html, etc.)

**Issue:**
- Not clear if projects were solo or team efforts
- No distinction between student projects and professional work
- Unclear what specific parts were done by Igor vs. others
- "Complete audio implementation" - but was this a team of 1 or 10?

**Why This Is a Red Flag:**
- Experienced audio directors know student projects are different from shipped games
- Claiming "complete" work when it was a team effort looks dishonest
- Recruiters need to know actual scope to assess experience level

**Fix:**
- Add "Role" section to each project clearly stating:
  - Solo project vs. team project
  - Specific responsibilities (e.g., "Sound Design & Implementation" vs. "Audio Lead")
  - Team size if applicable (e.g., "Team of 8 students")
- Add "Context" section:
  - Student project vs. professional work
  - Project duration
  - Platform/engine used
- Example: "Student project (DAE Belgium, 2024) - Solo audio implementation for team of 6 developers"

---

#### 7. **Broken or Missing Content**

**Location:** Various pages

**Issue:**
- Some images may not load properly (need to verify)
- Video embeds might be broken (YouTube links)
- Lazy loading might fail on slow connections
- Some locale translations might be incomplete

**Why This Is a Red Flag:**
- Broken content suggests portfolio is unmaintained
- Shows lack of attention to detail
- Recruiters will assume candidate doesn't test their work
- Reflects poorly on technical skills

**Fix:**
- Test all pages on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices (iOS, Android)
- Verify all images load correctly
- Check all YouTube embeds work
- Validate all locale files are complete (EN/PL/NL)
- Add fallback content for failed loads
- Test on slow connections (throttle network in DevTools)

---

#### 8. **Inconsistent Terminology**

**Location:** Multiple pages

**Issue:**
- Sometimes "Audio Designer", sometimes "Audio Engineer", sometimes "Composer"
- "Game Audio" vs. "Interactive Audio" vs. "Adaptive Audio" used interchangeably
- "Middleware" vs. "Audio Middleware" vs. "Game Audio Middleware"
- Mixing technical terms incorrectly (e.g., "HDR mixing" might be misused)

**Why This Is a Red Flag:**
- Industry professionals notice incorrect terminology immediately
- Suggests candidate doesn't understand the field deeply
- Makes it unclear what the candidate actually specializes in
- Can disqualify candidate for roles requiring specific expertise

**Fix:**
- Choose ONE primary title and stick to it: "Audio Designer & Developer" (current) is good
- Use industry-standard terms consistently:
  - "Wwise" and "FMOD" (not "audio middleware" generically)
  - "Interactive music" (not "adaptive music" unless specifically vertical remixing)
  - "Sound design" (not "audio design")
- Create a terminology guide and apply it across all pages
- Have an industry professional review terminology usage

---

### 🟢 MEDIUM PRIORITY RED FLAGS (Nice to Fix)

#### 9. **CV Image Protection Overkill**

**Location:** cv/igor-cv-dark.html

**Issue:**
```javascript
// Prevent right-click on images
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
});
```

**Why This Is a Red Flag:**
- Overly protective of images suggests insecurity or paranoia
- Doesn't actually prevent image theft (can still screenshot, inspect element, etc.)
- Annoying for legitimate users (recruiters might want to save CV)
- Shows lack of understanding that web content is inherently copyable

**Fix:**
- Remove all image protection JavaScript
- If concerned about image theft, use watermarks instead
- Accept that web content is public and copyable
- Focus on making content good rather than protecting it

---

#### 10. **Overly Long Project Descriptions**

**Location:** Project pages (especially not-today-darling.html)

**Issue:**
- Project pages are VERY long (2000+ lines of HTML)
- Too much detail for initial review
- Recruiters won't read everything
- Important information gets buried

**Why This Is a Red Flag:**
- Suggests candidate can't prioritize information
- Shows lack of understanding of how recruiters review portfolios
- Makes it hard to find key achievements quickly

**Fix:**
- Restructure project pages with clear hierarchy:
  1. **Hero section** (30 seconds): Project name, role, key achievement
  2. **Quick facts** (1 minute): Platform, tools, team size, duration
  3. **Key achievements** (2 minutes): 3-5 bullet points with metrics
  4. **Technical details** (expandable): For those who want to dig deeper
  5. **Media** (videos, audio players): Show, don't tell
- Use progressive disclosure (show more/less buttons)
- Add "TL;DR" section at top of each project

---

#### 11. **Missing Work Samples**

**Location:** Multiple project pages

**Issue:**
- Some projects have videos, some don't
- Audio players are present but not prominent
- No direct download links for audio samples
- Hard to actually HEAR the work

**Why This Is a Red Flag:**
- Audio portfolio without easily accessible audio is useless
- Recruiters want to hear work immediately, not hunt for it
- Suggests candidate doesn't understand portfolio best practices

**Fix:**
- Add prominent audio players to EVERY project page
- Include 30-60 second highlight reels for each project
- Provide download links for full audio samples (with permission)
- Embed SoundCloud or similar for easy playback
- Add waveform visualizations to make audio content obvious

---

#### 12. **Unclear Availability Status**

**Location:** About page, contact page

**Issue:**
- Says "Available for Projects" but also "studying at DAE Belgium"
- Unclear if looking for full-time, part-time, freelance, or internship
- No mention of graduation date or when fully available
- Conflicting signals about current status

**Why This Is a Red Flag:**
- Recruiters need to know if candidate is available NOW or later
- Unclear status wastes everyone's time
- Suggests candidate hasn't thought through their job search

**Fix:**
- Add clear availability section:
  - "Currently: Student at DAE Belgium (graduating June 2025)"
  - "Available for: Freelance projects (10-15 hrs/week), Summer internships"
  - "Seeking: Junior Audio Designer roles starting July 2025"
- Update "Available for Projects" badge to be more specific
- Add expected graduation date prominently

---

#### 13. **Social Media Profile Inconsistencies**

**Location:** Footer, contact page, structured data

**Issue:**
- LinkedIn profile might not match portfolio content
- GitHub might have outdated or incomplete projects
- Spotify artist profile might not be professional
- Itch.io might have student projects that look unprofessional

**Why This Is a Red Flag:**
- Recruiters WILL check all social media links
- Inconsistencies between portfolio and social media raise red flags
- Unprofessional social media content reflects poorly

**Fix:**
- Audit ALL linked social media profiles:
  - LinkedIn: Update with latest projects, match portfolio descriptions
  - GitHub: Archive or private old/incomplete projects, pin best work
  - Spotify: Ensure music quality is professional
  - Itch.io: Only link if games are polished and professional
- Consider removing links to profiles that aren't professional quality
- Add professional headshots to all profiles
- Ensure bios match across all platforms

---

#### 14. **Missing Context for Student Work**

**Location:** All project pages

**Issue:**
- Projects are presented as if they're professional work
- No indication that most are student projects
- Might mislead recruiters about experience level

**Why This Is a Red Flag:**
- Experienced recruiters can tell student work from professional work
- Not disclosing student context looks like trying to hide something
- Sets wrong expectations for experience level

**Fix:**
- Add clear "Project Context" section to each project:
  - "Academic Project - DAE Belgium (2024)"
  - "Student Team Project - 8 developers, 12 weeks"
  - "Personal Project - Solo development"
- Frame student work positively:
  - "Developed as part of Game Audio Integration course"
  - "Collaborated with multidisciplinary team of students"
- Don't hide student status - own it and show growth

---

### 🔵 LOW PRIORITY RED FLAGS (Polish)

#### 15. **Overly Dramatic Language**

**Location:** Various pages

**Issue:**
- "Make the impossible feel effortless" (about page)
- "Let's Create Together" (contact page)
- Some descriptions are overly flowery

**Why This Is a Red Flag:**
- Can come across as trying too hard
- Technical roles value substance over style
- Might seem immature to experienced professionals

**Fix:**
- Tone down dramatic language
- Focus on concrete achievements and skills
- Let work speak for itself
- Use professional but approachable tone

---

#### 16. **Inconsistent Date Formats**

**Location:** CV, project pages, about page

**Issue:**
- Some dates: "2024"
- Some dates: "2023 - 2024"
- Some dates: "October 2024"
- Some dates: "2024 - Present"

**Why This Is a Red Flag:**
- Inconsistency suggests lack of attention to detail
- Makes timeline hard to follow

**Fix:**
- Choose ONE date format and apply consistently
- Recommended: "Month YYYY - Month YYYY" (e.g., "Jan 2024 - Jun 2024")
- Use "Present" for ongoing work
- Ensure dates are accurate and match across all pages

---

#### 17. **Missing Metrics on Some Projects**

**Location:** Various project pages

**Issue:**
- Some projects have detailed metrics (320+ events, 45ms latency)
- Other projects have no metrics at all
- Inconsistent level of detail

**Why This Is a Red Flag:**
- Suggests some projects are less important or less complete
- Makes it hard to compare projects
- Inconsistency looks unprofessional

**Fix:**
- Add metrics to ALL projects where possible:
  - Number of audio assets created
  - Project duration
  - Team size
  - Technical specifications (sample rate, bit depth, etc.)
  - Performance metrics (memory usage, CPU usage)
- If metrics aren't available, explain why
- Maintain consistent level of detail across all projects

---

## Architecture

### Fix Implementation Strategy

```
Priority Levels:
├── 🔴 CRITICAL (Fix in Phase 1 - Week 1)
│   ├── Location inconsistencies
│   ├── Personal contact info exposure
│   ├── Demo reel placeholder
│   └── Unverifiable technical claims
│
├── 🟡 HIGH (Fix in Phase 2 - Week 2)
│   ├── Vague project contributions
│   ├── Broken/missing content
│   ├── Inconsistent terminology
│   └── Unclear availability
│
├── 🟢 MEDIUM (Fix in Phase 3 - Week 3)
│   ├── CV image protection
│   ├── Long project descriptions
│   ├── Missing work samples
│   └── Social media inconsistencies
│
└── 🔵 LOW (Fix in Phase 4 - Week 4)
    ├── Dramatic language
    ├── Date format inconsistencies
    └── Missing metrics
```

### Testing Strategy

1. **Manual Review**
   - Review all pages as if you're a recruiter
   - Check all links and embeds
   - Verify all content loads correctly
   - Test on multiple devices and browsers

2. **Peer Review**
   - Have industry professionals review portfolio
   - Get feedback from audio directors or senior audio designers
   - Ask for honest critique

3. **A/B Testing**
   - Track which changes improve engagement
   - Monitor contact form submissions
   - Analyze time spent on pages

4. **Continuous Monitoring**
   - Set up alerts for broken links
   - Regularly check external embeds (YouTube, SoundCloud)
   - Keep content up to date

---

## Components and Interfaces

### Files to Modify

#### Critical Priority Files:
1. `README.md` - Fix location (Netherlands → Belgium)
2. `cv/igor-cv-dark.html` - Remove phone number, update email
3. `index.html` - Remove/replace demo reel placeholder
4. `about.html` - Fix technical skill percentages
5. `contact.html` - Update email to professional domain
6. All `locales/*.json` - Update contact info across all languages

#### High Priority Files:
7. `projects/not-today-darling.html` - Add role/context, fix claims
8. `projects/amorak.html` - Add role/context
9. `projects/audiolab.html` - Add technical proof/context
10. All project pages - Add "Project Context" sections

#### Medium Priority Files:
11. All project pages - Restructure for better hierarchy
12. All project pages - Add prominent audio players
13. `about.html` - Add clear availability section

#### Low Priority Files:
14. All pages - Tone down dramatic language
15. All pages - Standardize date formats
16. All project pages - Add consistent metrics

---

## Data Models

### Contact Information Model

```json
{
  "contact": {
    "email": {
      "current": "igorszuniewiczwork@gmail.com",
      "professional": "igor@igorszuniewicz.com",
      "outdated": "szunio2004@gmail.com",
      "display": "igor@igorszuniewicz.com",
      "forwardTo": "igorszuniewiczwork@gmail.com",
      "obfuscated": false
    },
    "phone": {
      "display": false,
      "note": "Available upon request"
    },
    "location": {
      "country": "Belgium",
      "region": "West Flanders",
      "remote": true
    },
    "social": {
      "linkedin": "https://www.linkedin.com/in/igor-szuniewicz-a6877a2a3",
      "github": "https://github.com/Szunias",
      "spotify": "https://open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6",
      "itch": "https://igorszuniewicz.itch.io"
    }
  }
}
```

### Project Context Model

```json
{
  "project": {
    "name": "Not Today, Darling!",
    "context": {
      "type": "student",
      "institution": "DAE Belgium",
      "year": 2024,
      "duration": "12 weeks",
      "teamSize": 8,
      "role": "Audio Designer & Implementer (Solo)",
      "responsibilities": [
        "Sound design",
        "Audio implementation",
        "Mixing",
        "Voiceover direction"
      ]
    },
    "metrics": {
      "audioEvents": "320+",
      "categories": 12,
      "memoryFootprint": "180 MB",
      "maxVoices": 32,
      "latency": "<45ms"
    }
  }
}
```

### Skill Proficiency Model

```json
{
  "skills": {
    "wwise": {
      "level": "Advanced",
      "description": "RTPCs, States/Switches, HDR mixing, attenuation curves, music system design",
      "yearsExperience": 2,
      "projects": ["Not Today Darling", "Interactive Music Systems"]
    },
    "reaper": {
      "level": "Expert",
      "description": "Sound design, SFX editing, batch processing, custom scripts, game audio workflows",
      "yearsExperience": 4,
      "projects": ["Amorak", "Akantilado", "All sound design work"]
    }
  }
}
```

---

## Error Handling

### Broken Links Strategy

1. **Detection**
   - Implement automated link checker
   - Run weekly to catch broken links
   - Alert if critical links break

2. **Fallback Content**
   - If YouTube embed fails, show thumbnail with link
   - If image fails to load, show placeholder with alt text
   - If audio player fails, provide download link

3. **User Communication**
   - If content is temporarily unavailable, show clear message
   - Provide alternative ways to view content
   - Include contact info for reporting issues

### Missing Content Strategy

1. **Placeholder Guidelines**
   - Only use placeholders for non-critical content
   - Always provide alternative content
   - Never use "Coming Soon" for critical sections

2. **Progressive Enhancement**
   - Core content works without JavaScript
   - Enhanced features degrade gracefully
   - Mobile-first approach ensures basic functionality

---

## Testing Strategy

### Pre-Launch Checklist

#### Critical Tests:
- [ ] All contact information is consistent across all pages
- [ ] Professional email is set up and working
- [ ] Phone number is removed from public pages
- [ ] Location is consistent (Belgium, not Netherlands)
- [ ] Demo reel section is removed or replaced with actual content
- [ ] All technical claims have context and proof

#### High Priority Tests:
- [ ] All project pages have "Role" and "Context" sections
- [ ] All links work (internal and external)
- [ ] All images load correctly
- [ ] All videos/embeds work
- [ ] All locale files are complete and accurate
- [ ] Terminology is consistent across all pages

#### Medium Priority Tests:
- [ ] Audio players are prominent and functional
- [ ] Project descriptions are concise and scannable
- [ ] Availability status is clear
- [ ] Social media profiles are professional and consistent

#### Low Priority Tests:
- [ ] Language tone is professional throughout
- [ ] Date formats are consistent
- [ ] All projects have comparable levels of detail

### Browser/Device Testing:
- [ ] Chrome (Windows, Mac, Linux)
- [ ] Firefox (Windows, Mac, Linux)
- [ ] Safari (Mac, iOS)
- [ ] Edge (Windows)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet (iPad, Android tablet)

### Performance Testing:
- [ ] Page load times < 3 seconds
- [ ] Images are optimized (WebP with PNG fallback)
- [ ] Lazy loading works correctly
- [ ] No console errors
- [ ] Lighthouse score > 90

---

## Summary

This design document identifies **17 red flags** across 4 priority levels:
- **4 Critical** (must fix immediately)
- **8 High Priority** (fix soon)
- **3 Medium Priority** (nice to fix)
- **2 Low Priority** (polish)

The most critical issues are:
1. Location inconsistencies (Belgium vs. Netherlands)
2. Exposed personal contact information
3. Demo reel placeholder taking prime real estate
4. Unverifiable technical claims

Fixing these issues will significantly improve the portfolio's professional presentation and increase chances of positive responses from recruiters and industry professionals.
