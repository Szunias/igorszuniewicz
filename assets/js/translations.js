// Standalone translation dictionary (no ES6 modules)
(function() {
  'use strict';
  
  // Translation dictionary in format: key -> { en, pl, nl }
  const I18N = {
    // Navigation
    nav_home: { en: 'Home', pl: 'Główna', nl: 'Home' },
    nav_about: { en: 'About', pl: 'O mnie', nl: 'Over mij' },
    nav_projects: { en: 'Projects', pl: 'Projekty', nl: 'Projecten' },
    nav_music: { en: 'Music', pl: 'Muzyka', nl: 'Muziek' },
    nav_contact: { en: 'Contact', pl: 'Kontakt', nl: 'Contact' },
    
    // Homepage specific
    'nav.work': { en: 'Work', pl: 'Prace', nl: 'Werk' },
    'nav.about': { en: 'About', pl: 'O mnie', nl: 'Over' },
    'nav.projects': { en: 'All Projects', pl: 'Wszystkie Projekty', nl: 'Alle Projecten' },
    'nav.music': { en: 'Music', pl: 'Muzyka', nl: 'Muziek' },
    'nav.contact': { en: 'Contact', pl: 'Kontakt', nl: 'Contact' },
    'hero.label': { en: 'Audio Designer & Developer', pl: 'Audio Designer & Developer', nl: 'Audio Designer & Developer' },
    'hero.title': { en: 'Crafting Immersive<br>Audio Experiences', pl: 'Tworzenie Immersyjnych<br>Doświadczeń Audio', nl: 'Het Creëren van Meeslepende<br>Audio Ervaringen' },
    'hero.description': { en: 'Interactive music systems, sound design for animation & games, and innovative audio tools.', pl: 'Interaktywne systemy muzyczne, sound design dla animacji i gier oraz innowacyjne narzędzia audio.', nl: 'Interactieve muzieksystemen, geluidsontwerp voor animatie & games, en innovatieve audio tools.' },
    'hero.cta1': { en: 'View My Work', pl: 'Zobacz Moje Prace', nl: 'Bekijk Mijn Werk' },
    'hero.cta2': { en: 'Get In Touch', pl: 'Skontaktuj Się', nl: 'Neem Contact Op' },
    'projects.label': { en: 'Featured Work', pl: 'Wybrane Prace', nl: 'Uitgelicht Werk' },
    'projects.title': { en: 'Selected Projects', pl: 'Wybrane Projekty', nl: 'Geselecteerde Projecten' },
    'projects.description': { en: 'A curated selection of recent work spanning game audio, sound design, and interactive music.', pl: 'Starannie wybrane najnowsze prace obejmujące audio dla gier, sound design i interaktywną muzykę.', nl: 'Een selectie van recent werk spanning game audio, geluidsontwerp en interactieve muziek.' },
    'projects.viewall': { en: 'View All Projects', pl: 'Wszystkie Projekty', nl: 'Alle Projecten' },
    'stats.label': { en: 'By The Numbers', pl: 'W Liczbach', nl: 'In Cijfers' },
    'stats.title': { en: 'Experience & Impact', pl: 'Doświadczenie & Wpływ', nl: 'Ervaring & Impact' },
    'stats.projects': { en: 'Projects Completed', pl: 'Ukończone Projekty', nl: 'Voltooide Projecten' },
    'stats.tools': { en: 'Tools Built', pl: 'Zbudowane Narzędzia', nl: 'Gebouwde Tools' },
    'stats.languages': { en: 'Languages', pl: 'Języki', nl: 'Talen' },
    'stats.passion': { en: 'Passion', pl: 'Pasja', nl: 'Passie' },
    'footer.projects': { en: 'Projects', pl: 'Projekty', nl: 'Projecten' },
    'footer.music': { en: 'Music', pl: 'Muzyka', nl: 'Muziek' },
    'footer.about': { en: 'About', pl: 'O mnie', nl: 'Over' },
    'footer.contact': { en: 'Contact', pl: 'Kontakt', nl: 'Contact' },
    
    // About page
    about_page_title: { en: 'About Me', pl: 'O mnie', nl: 'Over mij' },
    about_page_description: { en: 'Audio designer, composer, and developer specialized in interactive music systems, game audio implementation, and real-time DSP. Combining creative intuition with technical precision.', pl: 'Audio designer, kompozytor i programista specjalizujący się w interaktywnych systemach muzycznych, implementacji audio w grach i przetwarzaniu sygnałów DSP w czasie rzeczywistym. Łączę kreatywną intuicję z techniczną precyzją.', nl: 'Audiodesigner, componist en ontwikkelaar gespecialiseerd in interactieve muzieksystemen, game audio-implementatie en realtime DSP. Combineert creatieve intuïtie met technische precisie.' },
    about_journey_title: { en: 'My Journey', pl: 'Moja Droga', nl: 'Mijn Reis' },
    about_journey_p1: { en: 'My path into audio technology started with classical piano at age 6, where I learned discipline and musical structure. During high school, I discovered the mathematical beauty behind sound — how frequencies, harmonics, and digital signal processing could create entirely new sonic possibilities.', pl: 'Moja droga w technologię audio zaczęła się od klasycznego pianina w wieku 6 lat, gdzie nauczyłem się dyscypliny i struktury muzycznej. W liceum odkryłem matematyczne piękno dźwięku — jak częstotliwości, harmoniczne i cyfrowe przetwarzanie sygnałów mogą tworzyć zupełnie nowe możliwości dźwiękowe.', nl: 'Mijn pad naar audiotechnologie begon met klassieke piano op 6-jarige leeftijd, waar ik discipline en muzikale structuur leerde. Tijdens de middelbare school ontdekte ik de wiskundige schoonheid achter geluid — hoe frequenties, harmonieken en digitale signaalverwerking volledig nieuwe sonische mogelijkheden kunnen creëren.' },
    about_journey_p2: { en: 'This led me to develop machine learning systems for real-time audio analysis (achieving 45ms latency), create custom DSP algorithms for spatial audio, and build interactive music systems that adapt to player behavior. Currently at DAE Belgium, I\'m focusing on professional game audio integration, learning how to make audio systems that enhance gameplay and create emotional connections between players and virtual worlds.', pl: 'Doprowadziło mnie to do tworzenia systemów uczenia maszynowego do analizy audio w czasie rzeczywistym (osiągając 45ms opóźnienia), tworzenia niestandardowych algorytmów DSP dla dźwięku przestrzennego i budowania interaktywnych systemów muzycznych, które dostosowują się do zachowania gracza. Obecnie w DAE Belgia koncentruję się na profesjonalnej integracji audio w grach, ucząc się jak tworzyć systemy audio, które wzbogacają rozgrywkę i tworzą emocjonalne połączenia między graczami a wirtualnymi światami.', nl: 'Dit leidde ertoe dat ik machine learning-systemen ontwikkelde voor realtime audio-analyse (met een latentie van 45ms), aangepaste DSP-algoritmen maakte voor ruimtelijk geluid en interactieve muzieksystemen bouwde die zich aanpassen aan spelersgedrag. Momenteel richt ik mij bij DAE België op professionele game audio-integratie en leer ik hoe ik audiosystemen kan maken die gameplay verbeteren en emotionele verbindingen creëren tussen spelers en virtuele werelden.' },
    about_drives_title: { en: 'What Drives Me', pl: 'Co mnie napędza', nl: 'Wat me drijft' },
    about_drives_p1: { en: 'I believe great audio should feel magical to users while being robust under the hood. Every millisecond of latency matters when creating responsive systems. Every frequency band matters when crafting immersive soundscapes.', pl: 'Wierzę, że świetne audio powinno być magiczne dla użytkowników, będąc jednocześnie solidne pod maską. Każda milisekunda opóźnienia ma znaczenie podczas tworzenia responsywnych systemów. Każde pasmo częstotliwości ma znaczenie podczas tworzenia immersyjnych krajobrazów dźwiękowych.', nl: 'Ik geloof dat geweldige audio magisch moet aanvoelen voor gebruikers, terwijl het robuust is onder de motorkap. Elke milliseconde latentie is belangrijk bij het creëren van responsieve systemen. Elk frequentieband is belangrijk bij het vormgeven van meeslepende soundscapes.' },
    about_drives_p2: { en: 'I\'m passionate about bridging the gap between artistic vision and technical implementation — creating tools that let composers and designers focus on creativity while the technology handles the complexity. Whether it\'s real-time beat detection or designing adaptive music that seamlessly responds to gameplay, I\'m driven by making the impossible feel effortless.', pl: 'Pasjonuję się wypełnianiem luki między wizją artystyczną a techniczną implementacją — tworzeniem narzędzi, które pozwalają kompozytorom i projektantom skupić się na kreatywności, podczas gdy technologia zajmuje się złożonością. Czy to wykrywanie rytmu w czasie rzeczywistym, czy projektowanie adaptacyjnej muzyki, która płynnie reaguje na rozgrywkę, napędza mnie sprawianie, by niemożliwe wydawało się bezwysiłkowe.', nl: 'Ik ben gepassioneerd over het overbruggen van de kloof tussen artistieke visie en technische implementatie — het creëren van tools waarmee componisten en ontwerpers zich kunnen concentreren op creativiteit, terwijl de technologie de complexiteit afhandelt. Of het nu gaat om realtime beat-detectie of het ontwerpen van adaptieve muziek die naadloos reageert op gameplay, ik word gedreven door het maken van het onmogelijke moeiteloos.' },
    about_education_title: { en: 'Education', pl: 'Edukacja', nl: 'Opleiding' },
    about_education_dae: { en: 'Howest — DAE', pl: 'Howest — DAE', nl: 'Howest — DAE' },
    about_education_dae_desc: { en: 'Game Development — Sound Integration (ongoing)', pl: 'Game Development — Integracja Dźwięku (w trakcie)', nl: 'Game Development — Sound Integration (lopend)' },
    about_education_hs: { en: 'Bilingual High School', pl: 'Dwujęzyczne Liceum', nl: 'Tweetalige Middelbare School' },
    about_education_hs_desc: { en: 'Maths & Physics (graduated)', pl: 'Matematyka i Fizyka (ukończone)', nl: 'Wiskunde & Natuurkunde (afgestudeerd)' },
    about_education_music: { en: 'State Music School', pl: 'Państwowa Szkoła Muzyczna', nl: 'Staatsmuziekschool' },
    about_education_music_desc: { en: 'Classical Piano & Theory (graduated)', pl: 'Fortepian Klasyczny i Teoria (ukończone)', nl: 'Klassieke Piano & Theorie (afgestudeerd)' },
    about_tools_title: { en: 'Audio Tools', pl: 'Narzędzia Audio', nl: 'Audio Tools' },
    about_tools_middleware: { en: 'Middleware:', pl: 'Middleware:', nl: 'Middleware:' },
    about_tools_middleware_desc: { en: 'Wwise, FMOD — Professional implementation', pl: 'Wwise, FMOD — Profesjonalna implementacja', nl: 'Wwise, FMOD — Professionele implementatie' },
    about_tools_engines: { en: 'Engines:', pl: 'Silniki:', nl: 'Engines:' },
    about_tools_engines_desc: { en: 'Unreal Engine, Unity — Game integration', pl: 'Unreal Engine, Unity — Integracja z grami', nl: 'Unreal Engine, Unity — Game-integratie' },
    about_tools_production: { en: 'Production:', pl: 'Produkcja:', nl: 'Productie:' },
    about_tools_production_desc: { en: 'Reaper, Pro Tools, Logic Pro, Studio One', pl: 'Reaper, Pro Tools, Logic Pro, Studio One', nl: 'Reaper, Pro Tools, Logic Pro, Studio One' },
    about_dev_title: { en: 'Development', pl: 'Programowanie', nl: 'Ontwikkeling' },
    about_dev_dsp: { en: 'DSP & Audio:', pl: 'DSP i Audio:', nl: 'DSP & Audio:' },
    about_dev_dsp_desc: { en: 'C++/JUCE for VST development', pl: 'C++/JUCE do tworzenia VST', nl: 'C++/JUCE voor VST-ontwikkeling' },
    about_dev_ml: { en: 'Machine Learning:', pl: 'Uczenie Maszynowe:', nl: 'Machine Learning:' },
    about_dev_ml_desc: { en: 'Real-time audio classification (45ms latency)', pl: 'Klasyfikacja audio w czasie rzeczywistym (45ms opóźnienia)', nl: 'Realtime audioclassificatie (45ms latentie)' },
    about_dev_systems: { en: 'Systems:', pl: 'Systemy:', nl: 'Systemen:' },
    about_dev_systems_desc: { en: 'Python, C#, scripting for automation', pl: 'Python, C#, skrypty do automatyzacji', nl: 'Python, C#, scripting voor automatisering' },
    about_stat_music: { en: 'Years of Music', pl: 'Lat Muzyki', nl: 'Jaren Muziek' },
    about_stat_latency: { en: 'ML Audio Latency', pl: 'Opóźnienie ML Audio', nl: 'ML Audio Latentie' },
    about_stat_projects: { en: 'Projects Shipped', pl: 'Ukończone Projekty', nl: 'Projecten Afgeleverd' },
    about_stat_languages: { en: 'Languages Fluent', pl: 'Języki Biegle', nl: 'Talen Vloeiend' },
    
    // Contact page
    contact_badge: { en: 'Available for Projects', pl: 'Dostępny do Projektów', nl: 'Beschikbaar voor Projecten' },
    contact_title: { en: 'Let\'s Create Together', pl: 'Twórzmy Razem', nl: 'Laten we samen creëren' },
    contact_subtitle: { en: 'I typically respond within 24–48 hours. Let\'s discuss your project.', pl: 'Zazwyczaj odpowiadam w ciągu 24–48 godzin. Porozmawiajmy o Twoim projekcie.', nl: 'Ik reageer meestal binnen 24–48 uur. Laten we uw project bespreken.' },
    contact_form_title: { en: 'Send a Message', pl: 'Wyślij Wiadomość', nl: 'Stuur een Bericht' },
    contact_form_name: { en: 'Your Name', pl: 'Twoje Imię', nl: 'Uw Naam' },
    contact_form_email: { en: 'Email Address', pl: 'Adres Email', nl: 'E-mailadres' },
    contact_form_subject: { en: 'Subject', pl: 'Temat', nl: 'Onderwerp' },
    contact_form_message: { en: 'Your Message', pl: 'Twoja Wiadomość', nl: 'Uw Bericht' },
    contact_form_submit: { en: 'Send Message', pl: 'Wyślij Wiadomość', nl: 'Verstuur Bericht' },
    contact_info_title: { en: 'Direct Contact', pl: 'Bezpośredni Kontakt', nl: 'Direct Contact' },
    contact_info_email: { en: 'Email', pl: 'Email', nl: 'E-mail' },
    contact_info_location: { en: 'Location', pl: 'Lokalizacja', nl: 'Locatie' },
    contact_info_location_value: { en: 'Belgium, West Flanders', pl: 'Belgia, Flandria Zachodnia', nl: 'België, West-Vlaanderen' },
    contact_info_response: { en: 'Response Time', pl: 'Czas Odpowiedzi', nl: 'Responstijd' },
    contact_info_response_value: { en: '24–48 hours', pl: '24–48 godzin', nl: '24–48 uur' },
    contact_social_title: { en: 'Connect Online', pl: 'Połącz się Online', nl: 'Verbind Online' },
    contact_social_github: { en: 'GitHub', pl: 'GitHub', nl: 'GitHub' },
    contact_social_github_handle: { en: '@Szunias', pl: '@Szunias', nl: '@Szunias' },
    contact_social_linkedin: { en: 'LinkedIn', pl: 'LinkedIn', nl: 'LinkedIn' },
    contact_social_linkedin_handle: { en: 'Igor Szuniewicz', pl: 'Igor Szuniewicz', nl: 'Igor Szuniewicz' },
    contact_social_spotify: { en: 'Spotify', pl: 'Spotify', nl: 'Spotify' },
    contact_social_spotify_handle: { en: 'Music Portfolio', pl: 'Portfolio Muzyczne', nl: 'Muziekportfolio' },
    contact_social_itch: { en: 'Itch.io', pl: 'Itch.io', nl: 'Itch.io' },
    contact_social_itch_handle: { en: 'Game Projects', pl: 'Projekty Gier', nl: 'Game Projecten' },
    
    // Projects page
    projects_page_title: { en: 'My Projects', pl: 'Moje Projekty', nl: 'Mijn Projecten' },
    projects_page_subtitle: { en: 'A collection of software development projects showcasing innovation and technical expertise', pl: 'Kolekcja projektów programistycznych prezentujących innowacje i wiedzę techniczną', nl: 'Een verzameling softwareontwikkelingsprojecten die innovatie en technische expertise laten zien' },
    projects_filter_all: { en: 'All', pl: 'Wszystkie', nl: 'Alle' },
    projects_filter_game: { en: 'Game Audio', pl: 'Audio do Gier', nl: 'Game Audio' },
    projects_filter_sound: { en: 'Sound Design', pl: 'Sound Design', nl: 'Sounddesign' },
    projects_filter_music: { en: 'Music', pl: 'Muzyka', nl: 'Muziek' },
    projects_filter_tools: { en: 'Dev Tools', pl: 'Narzędzia', nl: 'Dev Tools' },
    projects_view_project: { en: 'View Project', pl: 'Zobacz Projekt', nl: 'Bekijk Project' }
  };
  
  // Convert I18N format to translations format
  window.translations = {};
  const languages = ['en', 'pl', 'nl'];
  
  for (const lang of languages) {
    window.translations[lang] = {};
    for (const [key, value] of Object.entries(I18N)) {
      if (value && typeof value === 'object' && value[lang]) {
        window.translations[lang][key] = value[lang];
      }
    }
  }
  
  // Language switcher logic
  let currentLang = localStorage.getItem('language') || 'en';

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (window.translations[lang] && window.translations[lang][key]) {
        if (key.includes('.title') && window.translations[lang][key].includes('<br>')) {
          el.innerHTML = window.translations[lang][key];
        } else {
          el.textContent = window.translations[lang][key];
        }
      }
    });
    
    // Update active state of language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  // Initialize language on page load
  document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    
    // Add click handlers to language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
  });
})();

// Language switcher logic
let currentLang = localStorage.getItem('language') || 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      if (key.includes('.title') && translations[lang][key].includes('<br>')) {
        el.innerHTML = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });
  
  // Update active state of language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  
  // Add click handlers to language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
});
