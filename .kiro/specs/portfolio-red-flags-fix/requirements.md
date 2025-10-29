# Requirements Document

## Introduction

Portfolio website for Igor Szuniewicz (game audio designer) currently has multiple red flags that could negatively impact hiring decisions from industry professionals. This document outlines requirements to identify and fix all potential issues that might raise concerns for recruiters, audio directors, or potential clients reviewing the portfolio.

## Glossary

- **Portfolio Website**: The main website showcasing Igor's work at igorszuniewicz.com
- **Red Flag**: Any element that could raise concerns or create negative impressions for industry professionals
- **Industry Professional**: Audio directors, game audio leads, recruiters, or potential clients from the game/audio industry
- **Contact Information**: Email addresses, phone numbers, and social media links
- **Demo Reel**: Video showcase of audio work (currently placeholder)
- **Project Pages**: Individual pages showcasing specific projects with technical details
- **CV Page**: Resume/curriculum vitae accessible from the website
- **Locale Files**: JSON files containing translations for multiple languages (EN/PL/NL)

## Requirements

### Requirement 1: Contact Information Verification

**User Story:** As an audio director reviewing portfolios, I want to easily contact candidates through professional channels, so that I can reach out for opportunities without friction.

#### Acceptance Criteria

1. WHEN the Portfolio Website displays contact information, THE Portfolio Website SHALL verify all email addresses are valid and actively monitored
2. WHEN the Portfolio Website displays phone numbers, THE Portfolio Website SHALL ensure phone numbers are formatted correctly and include country codes
3. WHEN the Portfolio Website displays social media links, THE Portfolio Website SHALL verify all social media profiles exist and are active
4. IF contact information is outdated or broken, THEN THE Portfolio Website SHALL update or remove the invalid information
5. WHERE multiple contact methods exist, THE Portfolio Website SHALL prioritize professional channels (email, LinkedIn) over personal ones

### Requirement 2: Demo Reel Placeholder Assessment

**User Story:** As a hiring manager, I want to see actual work samples immediately, so that I can quickly assess if a candidate matches our needs.

#### Acceptance Criteria

1. WHEN an Industry Professional views the homepage, THE Portfolio Website SHALL display either a completed demo reel or clearly communicate timeline for completion
2. IF the demo reel is a placeholder, THEN THE Portfolio Website SHALL not use language that implies content exists when it doesn't
3. WHEN the demo reel section is present, THE Portfolio Website SHALL provide alternative ways to view work samples (project links, embedded audio)
4. THE Portfolio Website SHALL ensure the demo reel placeholder does not occupy prime real estate if no content exists
5. WHERE a demo reel placeholder exists, THE Portfolio Website SHALL include a clear call-to-action to view completed projects instead

### Requirement 3: Technical Claims Verification

**User Story:** As a technical audio lead, I want to verify that claimed technical achievements are accurate and realistic, so that I can trust the candidate's expertise level.

#### Acceptance Criteria

1. WHEN the Portfolio Website displays technical metrics (latency, accuracy, voice counts), THE Portfolio Website SHALL verify all numbers are accurate and achievable
2. WHEN the Portfolio Website claims proficiency levels (85% Wwise, 95% Reaper), THE Portfolio Website SHALL ensure percentages reflect realistic self-assessment
3. THE Portfolio Website SHALL cross-reference technical claims with actual project implementations
4. IF technical claims cannot be verified, THEN THE Portfolio Website SHALL remove or qualify the claims appropriately
5. WHERE technical achievements are listed, THE Portfolio Website SHALL provide context that makes claims credible

### Requirement 4: Project Scope Accuracy

**User Story:** As a recruiter, I want to understand the actual scope of work done on each project, so that I can accurately assess experience level.

#### Acceptance Criteria

1. WHEN the Portfolio Website describes project contributions, THE Portfolio Website SHALL clearly distinguish between solo work and team contributions
2. WHEN the Portfolio Website lists project features, THE Portfolio Website SHALL accurately represent what was actually implemented
3. THE Portfolio Website SHALL avoid implying ownership of work done by others
4. IF a project was a student project, THEN THE Portfolio Website SHALL clearly indicate this context
5. WHERE team projects are shown, THE Portfolio Website SHALL specify the individual's specific role and contributions

### Requirement 5: Professional Presentation Consistency

**User Story:** As an audio director, I want to see consistent professional presentation across all pages, so that I can trust the candidate's attention to detail.

#### Acceptance Criteria

1. WHEN the Portfolio Website displays content across multiple pages, THE Portfolio Website SHALL maintain consistent terminology and branding
2. WHEN the Portfolio Website uses technical terms, THE Portfolio Website SHALL use industry-standard terminology correctly
3. THE Portfolio Website SHALL ensure all pages are fully functional without broken links or missing content
4. THE Portfolio Website SHALL verify all images load correctly and are properly optimized
5. WHERE translations exist, THE Portfolio Website SHALL ensure all languages are complete and professionally translated

### Requirement 6: Availability and Location Clarity

**User Story:** As a hiring manager, I want to know if a candidate is available and where they're located, so that I can determine if they fit our hiring needs.

#### Acceptance Criteria

1. WHEN the Portfolio Website displays location information, THE Portfolio Website SHALL provide accurate current location
2. WHEN the Portfolio Website indicates availability, THE Portfolio Website SHALL clearly state current status (student, available, employed)
3. THE Portfolio Website SHALL clarify work authorization status if relevant
4. IF location information conflicts across pages, THEN THE Portfolio Website SHALL resolve inconsistencies
5. WHERE availability is mentioned, THE Portfolio Website SHALL include realistic timelines and constraints

### Requirement 7: External Links and References

**User Story:** As a recruiter, I want all external links to work correctly, so that I can verify credentials and view additional work samples.

#### Acceptance Criteria

1. WHEN the Portfolio Website includes external links, THE Portfolio Website SHALL verify all links are functional and point to correct destinations
2. WHEN the Portfolio Website links to social media profiles, THE Portfolio Website SHALL ensure profiles are professional and up-to-date
3. THE Portfolio Website SHALL verify all embedded content (YouTube videos, Spotify tracks) loads correctly
4. IF external content is no longer available, THEN THE Portfolio Website SHALL remove or replace broken links
5. WHERE external references are provided, THE Portfolio Website SHALL ensure they support rather than contradict portfolio claims

### Requirement 8: CV/Resume Accuracy

**User Story:** As a hiring manager, I want the CV to match the portfolio content, so that I can trust the information provided.

#### Acceptance Criteria

1. WHEN the Portfolio Website provides a CV, THE Portfolio Website SHALL ensure CV information matches portfolio project descriptions
2. WHEN the Portfolio Website lists skills on CV, THE Portfolio Website SHALL verify skills align with demonstrated work
3. THE Portfolio Website SHALL ensure dates and timelines are consistent between CV and portfolio
4. THE Portfolio Website SHALL verify all education and certification claims are accurate
5. WHERE discrepancies exist between CV and portfolio, THE Portfolio Website SHALL resolve conflicts

### Requirement 9: Professionalism and Tone

**User Story:** As an audio director, I want to see professional communication throughout the portfolio, so that I can assess cultural fit and communication skills.

#### Acceptance Criteria

1. WHEN the Portfolio Website displays text content, THE Portfolio Website SHALL maintain professional tone appropriate for industry
2. WHEN the Portfolio Website describes achievements, THE Portfolio Website SHALL balance confidence with humility
3. THE Portfolio Website SHALL avoid overly casual language or unprofessional expressions
4. THE Portfolio Website SHALL ensure grammar and spelling are correct across all languages
5. WHERE personal information is shared, THE Portfolio Website SHALL maintain appropriate professional boundaries
