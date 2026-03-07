/*
╭━━━╮╱╱╱╱╭╮╱╱╱╱╱╱╭╮╭━━━╮
┃╭━━╯╱╱╱╱┃┃╱╱╱╱╱╭╯┃┃╭━╮┃
┃╰━━┳━━┳━╯┣━━┳━━╋╮┃┃┃┃┃┃
┃╭━━┫┃━┫╭╮┃┃━┫━━┫┃┃┃┃┃┃┃
┃┃╱╱┃┃━┫╰╯┃┃━╋━━┣╯╰┫╰━╯┃
╰╯╱╱╰━━┻━━┻━━┻━━┻━━┻━━━╯
© 2026 Federico Lora - F10 Prohibida la copia, distribución o modificación sin autorización
*/

// ============================================================
// script.js — CV de Federico Lora
// Motor i18n + interactividad completa
//
// ARQUITECTURA DE IDIOMAS:
//   - Las traducciones viven en idiomas.json (misma carpeta)
//   - El JSON se carga una vez al arrancar y se cachea en memoria
//   - NO se recarga la página al cambiar idioma: todo es DOM puro
//   - Idioma por defecto: inglés (en)
//   - Se guarda la preferencia en localStorage con clave 'fl-lang'
//
// ATRIBUTOS data-i18n en el HTML:
//   data-i18n="clave"      → actualiza el textContent del elemento
//   data-i18n-html="clave" → actualiza el innerHTML (para textos con <strong>, etc.)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // ===== SCROLL — forzar inicio desde arriba al cargar =====
  // ============================================================
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);


  // ============================================================
  // ===== LOADER =====
  // ============================================================
  const loader = document.getElementById('pageLoader');
  setTimeout(() => loader.classList.add('hidden'), 800);


  // ============================================================
  // ===== TEMA CLARO / OSCURO =====
  // ============================================================
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  // Recuperar tema guardado o usar oscuro por defecto
  const savedTheme = localStorage.getItem('fl-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  localStorage.setItem('fl-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('fl-theme', next);
  });


  // ============================================================
  // ===== MOTOR DE IDIOMAS (i18n) =====
  //
  // Flujo:
  //   1. Las traducciones están INCRUSTADAS directamente en este script
  //      (no se usa fetch, funciona en file://, GitHub Pages y todo entorno)
  //   2. Se detecta el idioma activo (localStorage o 'en' por defecto)
  //   3. applyTranslations() recorre todos los elementos con
  //      data-i18n / data-i18n-html y sustituye el contenido
  //   4. El botón langToggle llama a switchLang() sin recargar la página
  //   5. El typing también se reinicia con las frases del nuevo idioma
  //
  // PARA ACTUALIZAR TEXTOS: edita idiomas.json y vuelve a incrustar
  // el JSON en la variable i18nData de este archivo (línea ~108)
  // ============================================================

  const langToggle = document.getElementById('langToggle');
  const langText = document.querySelector('.lang-text');

  // Idioma por defecto: inglés, a menos que el usuario haya cambiado antes
  let currentLang = localStorage.getItem('fl-lang') || 'en';

  // Variable global que guardará el contenido completo del JSON de idiomas
  let i18nData = null;

  // Referencia al timer del typing para poder cancelarlo al cambiar idioma
  let typingTimer = null;
  // typingEl declarado aquí (no dentro de startTypingEffect) para evitar
  // ReferenceError al llamarse startTypingEffect antes de llegar a su definición
  const typingEl = document.getElementById('typingText');
  const FLAG_ES = 'https://raw.githubusercontent.com/Fedes10/Fedes10/refs/heads/main/Imagenes/espa%C3%B1ol.png';
  const FLAG_EN = 'https://raw.githubusercontent.com/Fedes10/Fedes10/refs/heads/main/Imagenes/ingles.png';



  // ------ Traducciones incrustadas directamente (sin fetch) ------
  // Funciona en file://, GitHub Pages y cualquier entorno sin servidor.
  // Para actualizar textos edita idiomas.json y vuelve a incrustar con este script,
  // O edita directamente el objeto i18nData aquí abajo.
  i18nData = { "_meta": { "autor": "Federico Lora — F10", "descripcion": "Archivo central de traducciones del CV web. Contiene todos los textos visibles en español (es) e inglés (en). Para actualizar cualquier texto: localiza la clave correspondiente y edita el valor en el idioma deseado. No toques las claves (las palabras a la izquierda del ':'), solo los valores entre comillas.", "uso": "Cada elemento HTML con data-i18n='clave' recibe automáticamente el texto de este archivo según el idioma activo.", "notas_traduccion": "Todas las traducciones al inglés han sido redactadas manualmente para preservar el mismo tono, énfasis y registro profesional del original en español. No se ha usado traducción automática." }, "es": { "_seccion_navbar": "=== BARRA DE NAVEGACIÓN ===", "nav-sobre-mi": "Sobre mí", "nav-experiencia": "Experiencia", "nav-formacion": "Formación", "nav-habilidades": "Habilidades", "nav-logros": "Logros", "nav-proyectos": "Proyectos", "nav-contacto": "Contacto", "nav-btn-cv": "Descargar CV", "_seccion_hero": "=== SECCIÓN HERO (cabecera principal) ===", "hero-badge": "Disponible para nuevas oportunidades", "hero-subtitle": "Técnico Superior en Administración de Sistemas Informáticos en Red", "hero-quote": "La excelencia no es un acto, sino un hábito", "hero-btn-conocer": "Conocerme", "hero-btn-contactar": "Contactar", "_seccion_typing": "=== FRASES DEL EFECTO TYPING (se rotan automáticamente) ===", "typing-0": "Administrador de Sistemas", "typing-1": "Apasionado de la Ciberseguridad", "typing-2": "Estudiante de DAM", "typing-3": "Experiencia Erasmus Plus", "typing-4": "Experto en Hardware", "_seccion_sobre_mi": "=== SECCIÓN 01 — SOBRE MÍ ===", "s01-label": "Sobre mí", "s01-title": "Quién soy", "about-location": "Córdoba, España", "about-carnet": "Carnet B1", "about-idioma": "Inglés B1", "about-estudios": "DAM en curso", "about-lead": "Técnico Superior en Administración de Sistemas Informáticos y Redes con fundamentos en ciberseguridad y gran experiencia en hardware, redes locales, sistemas y servidores. Actualmente curso el Grado Superior en <strong>Desarrollo de Aplicaciones Multiplataforma (DAM)</strong> en horario de tardes.", "about-p2": "Cuento con el <strong>Grado Superior en ASIR</strong> y el <strong>Grado Medio en SMR</strong>. Mi experiencia profesional me ha permitido desarrollar competencias sólidas en <strong>administración de servidores, diagnóstico de hardware, seguridad informática y soporte técnico</strong>. Especializado en la gestión de servidores y sistemas, disfruto igualmente del trabajo con redes, ciberseguridad y hardware.", "about-p3": "La participación en el programa <strong>Erasmus Plus en Lituania</strong>, entre otras experiencias profesionales, ha potenciado mi capacidad para afrontar nuevos entornos. Busco desafíos que me permitan seguir creciendo, ya que el aprendizaje es clave para el éxito. Me considero <strong>responsable, eficaz y con gran capacidad de adaptación y resolución de problemas</strong>.", "stat-titulaciones": "Titulaciones", "stat-empresas": "Empresas", "stat-erasmus": "País Erasmus", "stat-robotica": "Años robótica", "_seccion_experiencia": "=== SECCIÓN 02 — EXPERIENCIA PROFESIONAL ===", "s02-label": "Experiencia", "s02-title": "Trayectoria profesional", "tl-badge-current": "Más reciente", "tl1-role": "Técnico IT — Prácticas DAM", "tl1-company": "CleverByte Consulting, Córdoba", "tl1-badge": "Prácticas DAM · Feb 2026", "tl1-task1": "Implantación y gestión completa del ERP Dolibarr en contenedores Docker con base de datos PostgreSQL", "tl1-task2": "Administración de bases de datos PostgreSQL en entorno productivo", "tl1-task3": "Diseño de formularios de registro y prueba gratuita para CleverFactu (nueva web corporativa)", "tl1-task4": "Migraciones de servidores WordPress entre entornos de producción", "tl2-role": "Técnico Informático — Dpto. de Informática", "tl2-company": "Hospital Cruz Roja, Córdoba", "tl2-badge": "Prácticas ASIR · 2025", "tl2-task1": "Instalación y configuración de sistemas operativos", "tl2-task2": "Resolución de incidencias en entorno hospitalario crítico", "tl2-task3": "Reparación y mantenimiento de equipos informáticos", "tl2-task4": "Soporte técnico y configuración de software", "tl3-role": "Técnico Informático — Dpto. TI", "tl3-company": "Magtel, Córdoba", "tl3-badge": "Prácticas SMR · 2023", "tl3-task1": "Resolución de incidencias y soporte técnico a usuarios", "tl3-task2": "Administración y mantenimiento de sistemas", "tl3-task3": "Reparación y montaje de equipos informáticos", "tl3-task4": "Formación en modelado de procesos con Bizagi Modeler Studio", "tl4-role": "Prácticas Erasmus Plus — Técnico IT", "tl4-company": "Emtoservis, Vilna, Lituania", "tl4-badge": "Jun – Jul 2022", "tl4-desc": "Participación en el programa europeo Erasmus Plus como técnico informático en entorno multicultural. Fortaleció mis habilidades técnicas, capacidad de adaptación y nivel de inglés.", "_seccion_formacion": "=== SECCIÓN 03 — FORMACIÓN ACADÉMICA ===", "s03-label": "Formación", "s03-title": "Educación académica", "edu1-badge": "En curso", "edu1-full": "Grado Superior en Desarrollo de Aplicaciones Multiplataforma", "edu2-full": "Grado Superior en Administración de Sistemas Informáticos en Red", "edu3-full": "Grado Medio en Sistemas Microinformáticos y Redes", "edu4-full": "Educación Secundaria Obligatoria", "_seccion_habilidades": "=== SECCIÓN 04 — HABILIDADES ===", "s04-label": "Habilidades", "s04-title": "Stack técnico", "skills-cat-sistemas": "Sistemas y Redes", "skills-cat-cyber": "Ciberseguridad", "skills-cat-hardware": "Hardware", "skills-cat-dev": "Desarrollo", "skills-cat-erp": "ERP y Gestión", "skills-cat-ia": "IA", "skills-pill-sysadmin": "Administración de servidores", "skills-pill-lan": "Redes locales (LAN/WLAN)", "skills-pill-winlin": "Windows Server / Linux", "skills-pill-virt": "Virtualización", "skills-pill-syno": "Synology / XPEnology", "skills-pill-ad": "Active Directory", "skills-pill-swinstall": "Instalación de software", "skills-pill-osinstall": "Instalación de SO", "skills-pill-netmon": "Monitorización de redes", "skills-pill-sec": "Seguridad informática", "skills-pill-pentest": "Pruebas de Pentesting (Nmap, Metasploit, Ataques de fuerza bruta)", "skills-pill-pentest-m": "Pentesting (Nmap, Metasploit)", "skills-pill-fw": "Firewalls y políticas", "skills-pill-vulns": "Análisis de vulnerabilidades", "skills-pill-hw-mont": "Montaje y configuración", "skills-pill-hw-diag": "Diagnóstico y reparación", "skills-pill-hw-maint": "Mantenimiento", "skills-pill-hw-isoinstall": "Instalación ISOs", "skills-pill-hw-isocreate": "Creación ISOs", "skills-pill-hw-repair": "Reparación componentes", "skills-pill-hw-upgrade": "Actualización equipos", "skills-pill-support": "Soporte técnico (presencial y remoto)", "skills-pill-support-m": "Soporte técnico", "skills-pill-incidents": "Resolución incidencias", "skills-pill-aiuse": "Uso avanzado IA", "skills-pill-prompting": "Prompting avanzado", "skills-pill-aiauto": "Automatización con IA", "skills-pill-aiint": "Integración de IA", "skills-pill-ml": "Fundamentos ML", "legend-high": "Avanzado", "legend-med": "Medio", "legend-base": "Básico", "_seccion_logros": "=== SECCIÓN 05 — LOGROS Y RECONOCIMIENTOS ===", "s05-label": "Logros", "s05-title": "Reconocimientos y logros", "logro1-title": "Finalista Andalucía Skills 2025", "logro1-desc": "Especialidad 39 — TI Administración de Sistemas en Red, Jaén", "logro2-title": "Campeón de Andalucía", "logro2-desc": "First Lego League 2017", "logro3-title": "Finalista España", "logro3-desc": "First Lego League 2017", "logro4-title": "Robótica", "logro4-desc": "4 años de estudios en Bwit", "logro5-title": "Arduino", "logro5-desc": "2 años de programación en Bwit", "logro6-title": "Experiencia Internacional", "logro6-desc": "Erasmus Plus — Vilna, Lituania (2022)", "gallery-logros": "Galería de logros", "_seccion_proyectos": "=== SECCIÓN 06 — PROYECTOS ===", "s06-label": "Proyectos", "s06-title": "Mi taller - Laboratorio", "proj1-title": "Dolibarr en Docker + PostgreSQL", "proj1-cat": "ERP / DevOps", "proj1-desc": "Implantación completa del ERP <strong>Dolibarr</strong> en contenedores Docker con base de datos <strong>PostgreSQL</strong>. Configuración de toda la infraestructura y gestión de base de datos en entorno productivo.", "proj2-title": "CleverFactu — Formularios Web", "proj2-cat": "Diseño Web", "proj2-desc": "Diseño y maquetación de los formularios de <strong>registro</strong> y <strong>prueba gratuita</strong> de la plataforma CleverFactu.", "proj3-title": "Migraciones de Servidores WordPress", "proj3-cat": "Administración", "proj3-desc": "Migraciones de sitios WordPress entre servidores de producción, incluyendo configuración de dominios, SSL, DNS y ajustes de rendimiento.", "proj4-title": "CV Web Personal", "proj4-cat": "Portfolio", "proj4-desc": "Diseño y desarrollo de este portfolio / CV web con HTML, CSS y JavaScript puro: animaciones, modo claro/oscuro, acordeón y diseño 100% responsivo.", "proj-github": "Ver en GitHub", "gallery-projects": "Galería de proyectos", "_seccion_contacto": "=== SECCIÓN 07 — CONTACTO ===", "s07-label": "Contacto", "s07-title": "Hablemos", "contact-role": "Técnico Superior ASIR & DAM", "contact-msg1": "¿Buscas un profesional comprometido, versátil y con ganas de crecer?", "contact-msg2": "Estoy abierto a nuevas oportunidades profesionales. No dudes en escribirme o conectar conmigo.", "contact-reply": "Respondo con la mayor brevedad posible", "cta-title": "Descargar Curriculum", "cta-subtitle": "Versión completa en PDF", "cta-btn": "Descargar", "printer-msg": "¡CV descargado!", "_seccion_footer": "=== PIE DE PÁGINA ===", "footer-copy": "© 2026 · F10 · Todos los derechos reservados", "_seccion_ui": "=== ELEMENTOS UI GENERALES ===", "scroll-top-label": "Volver arriba", "meta-description": "Federico Lora — Técnico Superior ASIR, DAM, ciberseguridad y administración de sistemas.", "logro7-title": "Introducción a Microsoft Azure", "logro7-desc": "Fundamentos de la nube — Microsoft Azure" }, "en": { "_seccion_navbar": "=== NAVIGATION BAR ===", "nav-sobre-mi": "About me", "nav-experiencia": "Experience", "nav-formacion": "Education", "nav-habilidades": "Skills", "nav-logros": "Achievements", "nav-proyectos": "Projects", "nav-contacto": "Contact", "nav-btn-cv": "Download CV", "_seccion_hero": "=== HERO SECTION (main header) ===", "hero-badge": "Open to new opportunities", "hero-subtitle": "Higher Technician in Network Computer Systems Administration", "hero-quote": "Excellence is not an act, but a habit", "hero-btn-conocer": "Learn about me", "hero-btn-contactar": "Get in touch", "_seccion_typing": "=== TYPING EFFECT PHRASES (rotate automatically) ===", "typing-0": "Systems Administrator", "typing-1": "Cybersecurity Enthusiast", "typing-2": "DAM Student", "typing-3": "Erasmus Plus Experience", "typing-4": "Hardware Expert", "_seccion_sobre_mi": "=== SECTION 01 — ABOUT ME ===", "s01-label": "About me", "s01-title": "Who I am", "about-location": "Córdoba, Spain", "about-carnet": "Driver's License B", "about-idioma": "English B1", "about-estudios": "DAM — ongoing", "about-lead": "Higher Technician in Network Computer Systems Administration with a strong foundation in cybersecurity and extensive hands-on experience in hardware, local networks, systems, and servers. Currently studying the <strong>Multiplatform Application Development (DAM)</strong> degree in the evenings.", "about-p2": "I hold a <strong>Higher Degree in ASIR</strong> and a <strong>Intermediate Degree in SMR</strong>. My professional experience has allowed me to build solid skills in <strong>server administration, hardware diagnostics, IT security, and technical support</strong>. While specializing in server and systems management, I equally enjoy working with networking, cybersecurity, and hardware.", "about-p3": "Participating in the <strong>Erasmus Plus programme in Lithuania</strong>, among other professional experiences, has strengthened my ability to thrive in new environments. I seek challenges that push me to keep growing, as continuous learning is the key to success. I consider myself <strong>reliable, efficient, and highly adaptable with strong problem-solving skills</strong>.", "stat-titulaciones": "Qualifications", "stat-empresas": "Companies", "stat-erasmus": "Erasmus Country", "stat-robotica": "Years in robotics", "_seccion_experiencia": "=== SECTION 02 — PROFESSIONAL EXPERIENCE ===", "s02-label": "Experience", "s02-title": "Professional journey", "tl-badge-current": "Most recent", "tl1-role": "IT Technician — DAM Internship", "tl1-company": "CleverByte Consulting, Córdoba", "tl1-badge": "DAM Internship · Feb 2026", "tl1-task1": "Full deployment and management of Dolibarr ERP in Docker containers with a PostgreSQL database", "tl1-task2": "PostgreSQL database administration in a production environment", "tl1-task3": "Design of registration and free-trial forms for CleverFactu (new corporate website)", "tl1-task4": "WordPress server migrations between production environments", "tl2-role": "IT Technician — IT Department", "tl2-company": "Hospital Cruz Roja, Córdoba", "tl2-badge": "ASIR Internship · 2025", "tl2-task1": "Operating system installation and configuration", "tl2-task2": "Incident resolution in a critical hospital environment", "tl2-task3": "Computer hardware repair and maintenance", "tl2-task4": "Technical support and software configuration", "tl3-role": "IT Technician — IT Department", "tl3-company": "Magtel, Córdoba", "tl3-badge": "SMR Internship · 2023", "tl3-task1": "Incident resolution and end-user technical support", "tl3-task2": "System administration and maintenance", "tl3-task3": "Computer assembly and hardware repair", "tl3-task4": "Training in process modelling with Bizagi Modeler Studio", "tl4-role": "Erasmus Plus Internship — IT Technician", "tl4-company": "Emtoservis, Vilnius, Lithuania", "tl4-badge": "Jun – Jul 2022", "tl4-desc": "Participated in the European Erasmus Plus programme as an IT technician in a multicultural work environment. Strengthened my technical skills, adaptability, and English proficiency.", "_seccion_formacion": "=== SECTION 03 — EDUCATION ===", "s03-label": "Education", "s03-title": "Academic background", "edu1-badge": "Ongoing", "edu1-full": "Higher Degree in Multiplatform Application Development", "edu2-full": "Higher Degree in Network Computer Systems Administration", "edu3-full": "Intermediate Degree in Microcomputer Systems and Networks", "edu4-full": "Secondary Education", "_seccion_habilidades": "=== SECTION 04 — SKILLS ===", "s04-label": "Skills", "s04-title": "Tech stack", "skills-cat-sistemas": "Systems & Networks", "skills-cat-cyber": "Cybersecurity", "skills-cat-hardware": "Hardware", "skills-cat-dev": "Development", "skills-cat-erp": "ERP & Management", "skills-cat-ia": "AI", "skills-pill-sysadmin": "Server administration", "skills-pill-lan": "Local networks (LAN/WLAN)", "skills-pill-winlin": "Windows Server / Linux", "skills-pill-virt": "Virtualization", "skills-pill-syno": "Synology / XPEnology", "skills-pill-ad": "Active Directory", "skills-pill-swinstall": "Software installation", "skills-pill-osinstall": "OS installation", "skills-pill-netmon": "Network monitoring", "skills-pill-sec": "Information security", "skills-pill-pentest": "Penetration testing (Nmap, Metasploit, brute-force attacks)", "skills-pill-pentest-m": "Pentesting (Nmap, Metasploit)", "skills-pill-fw": "Firewalls & policies", "skills-pill-vulns": "Vulnerability analysis", "skills-pill-hw-mont": "Assembly & configuration", "skills-pill-hw-diag": "Diagnostics & repair", "skills-pill-hw-maint": "Maintenance", "skills-pill-hw-isoinstall": "ISO installation", "skills-pill-hw-isocreate": "ISO creation", "skills-pill-hw-repair": "Component repair", "skills-pill-hw-upgrade": "Hardware upgrades", "skills-pill-support": "Technical support (on-site & remote)", "skills-pill-support-m": "Technical support", "skills-pill-incidents": "Incident resolution", "skills-pill-aiuse": "Advanced AI usage", "skills-pill-prompting": "Advanced prompting", "skills-pill-aiauto": "AI automation", "skills-pill-aiint": "AI integration", "skills-pill-ml": "ML fundamentals", "legend-high": "Advanced", "legend-med": "Intermediate", "legend-base": "Basic", "_seccion_logros": "=== SECTION 05 — ACHIEVEMENTS ===", "s05-label": "Achievements", "s05-title": "Awards & achievements", "logro1-title": "Andalucía Skills 2025 Finalist", "logro1-desc": "Specialty 39 — IT Network Systems Administration, Jaén", "logro2-title": "Andalusia Champion", "logro2-desc": "First Lego League 2017", "logro3-title": "Spain Finalist", "logro3-desc": "First Lego League 2017", "logro4-title": "Robotics", "logro4-desc": "4 years of studies at Bwit", "logro5-title": "Arduino", "logro5-desc": "2 years of programming at Bwit", "logro6-title": "International Experience", "logro6-desc": "Erasmus Plus — Vilnius, Lithuania (2022)", "gallery-logros": "Achievements gallery", "_seccion_proyectos": "=== SECTION 06 — PROJECTS ===", "s06-label": "Projects", "s06-title": "My workshop - Lab", "proj1-title": "Dolibarr on Docker + PostgreSQL", "proj1-cat": "ERP / DevOps", "proj1-desc": "Full deployment of the <strong>Dolibarr</strong> ERP in Docker containers with a <strong>PostgreSQL</strong> database. Complete infrastructure setup and database management in a production environment.", "proj2-title": "CleverFactu — Web Forms", "proj2-cat": "Web Design", "proj2-desc": "Design and layout of the <strong>registration</strong> and <strong>free trial</strong> forms for the CleverFactu platform.", "proj3-title": "WordPress Server Migrations", "proj3-cat": "Administration", "proj3-desc": "WordPress site migrations between production servers, including domain, SSL, DNS configuration, and performance tuning.", "proj4-title": "Personal CV Website", "proj4-cat": "Portfolio", "proj4-desc": "Design and development of this portfolio / CV website using pure HTML, CSS and JavaScript: animations, light/dark mode, accordion, and fully responsive layout.", "proj-github": "View on GitHub", "gallery-projects": "Projects gallery", "_seccion_contacto": "=== SECTION 07 — CONTACT ===", "s07-label": "Contact", "s07-title": "Let's talk", "contact-role": "Higher Technician ASIR & DAM", "contact-msg1": "Looking for a committed, versatile professional eager to grow?", "contact-msg2": "I'm open to new professional opportunities. Feel free to message me or connect.", "contact-reply": "I'll get back to you as soon as possible", "cta-title": "Download Resume", "cta-subtitle": "Full PDF version", "cta-btn": "Download", "printer-msg": "CV downloaded!", "_seccion_footer": "=== FOOTER ===", "footer-copy": "© 2026 · F10 · All rights reserved", "_seccion_ui": "=== GENERAL UI ELEMENTS ===", "scroll-top-label": "Back to top", "meta-description": "Federico Lora — Higher Technician ASIR, DAM, cybersecurity and systems administration.", "logro7-title": "Introduction to Microsoft Azure", "logro7-desc": "Cloud fundamentals — Microsoft Azure" } };
  applyTranslations(currentLang);
  updateLangButton(currentLang);


  // ------ Aplicar todas las traducciones al DOM ------
  // Se ejecuta cada vez que se cambia de idioma
  function applyTranslations(lang) {
    if (!i18nData || !i18nData[lang]) return;

    const dict = i18nData[lang]; // Diccionario del idioma activo

    // --- data-i18n: texto plano (textContent) ---
    // Ejemplo HTML: <span data-i18n="nav-sobre-mi">About me</span>
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      // Las claves que empiezan por "_" son comentarios del JSON, no textos
      if (key && !key.startsWith('_') && dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // --- data-i18n-html: texto con HTML dentro (innerHTML) ---
    // Ejemplo HTML: <p data-i18n-html="about-lead"></p>
    // Permite negritas <strong>, cursivas, etc. dentro del texto
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key && !key.startsWith('_') && dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // --- Meta descripción SEO ---
    const metaDesc = document.getElementById('metaDescription');
    if (metaDesc && dict['meta-description']) {
      metaDesc.setAttribute('content', dict['meta-description']);
    }

    // --- Atributo lang del <html> ---
    html.setAttribute('lang', lang);

    // --- Reiniciar el efecto typing con las frases del nuevo idioma ---
    startTypingEffect(lang);
  }


  // ------ Cambiar idioma al pulsar el botón ------
  function switchLang(lang) {
    currentLang = lang;
    localStorage.setItem('fl-lang', lang);
    applyTranslations(lang);
    updateLangButton(lang);
  }


  // ------ Actualizar el texto y bandera del botón de idioma ------
  // El botón muestra el idioma ACTIVO:
  //   Web en inglés  → bandera EN + "EN"
  //   Web en español → bandera ES + "ES"
  // Al pulsar cambia al otro idioma y el botón se actualiza

  function updateLangButton(lang) {
    langText.textContent = lang === 'en' ? 'EN' : 'ES';
    const flag = document.getElementById('langFlag');
    if (flag) {
      flag.src = lang === 'en' ? FLAG_EN : FLAG_ES;
      flag.alt = lang === 'en' ? 'English' : 'Español';
    }
    // Actualizar el title del botón según idioma activo
    langToggle.title = lang === 'en' ? 'Change language / Cambiar idioma' : 'Cambiar idioma / Change language';
    langToggle.setAttribute('aria-label', langToggle.title);
  }


  // ------ Evento del botón de idioma ------
  langToggle.addEventListener('click', () => {
    const next = currentLang === 'en' ? 'es' : 'en';
    switchLang(next);
  });


  // ============================================================
  // ===== NAVBAR: desktop y móvil =====
  // ============================================================
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const scrollTop = document.getElementById('scrollTop');

  // Mostrar/ocultar navbar con sombra y botón "volver arriba" al hacer scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    scrollTop.classList.toggle('visible', window.scrollY > 400);
    actualizarSeccionActiva();
  }, { passive: true });

  // Abrir/cerrar menú hamburguesa en móvil
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  // Cerrar el menú móvil al hacer clic en cualquier enlace de navegación
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navToggle && navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    })
  );


  // ============================================================
  // ===== SECCIÓN ACTIVA EN LA NAVBAR =====
  // Resalta el enlace de la sección que está visible en pantalla
  // ============================================================
  const sections = document.querySelectorAll('section[id], header[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[data-section]');

  function actualizarSeccionActiva() {
    let current = 'hero';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
    });
    navAnchors.forEach(a =>
      a.classList.toggle('active', a.dataset.section === current)
    );
  }
  actualizarSeccionActiva();


  // ============================================================
  // ===== INTERSECTION OBSERVER — animaciones reveal =====
  // Los elementos con clase reveal-up/left/right se animan
  // cuando entran en el viewport
  // ============================================================
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }).observe(el);
  });


  // ============================================================
  // ===== EFECTO TYPING EN EL HERO =====
  //
  // Las frases se obtienen del JSON de idiomas (typing-0..4).
  // Si el JSON no está disponible, usa frases de respaldo en inglés.
  // Al cambiar de idioma se cancela el timer anterior y se reinicia.
  // ============================================================

  // Frases de respaldo si el JSON no carga
  const fallbackPhrases = {
    en: ['Systems Administrator', 'Cybersecurity Enthusiast', 'DAM Student', 'Erasmus Plus Experience', 'Hardware Expert'],
    es: ['Administrador de Sistemas', 'Apasionado de la Ciberseguridad', 'Estudiante de DAM', 'Experiencia Erasmus Plus', 'Experto en Hardware']
  };

  function startTypingEffect(lang) {
    // Cancelar cualquier timer previo para evitar doble ejecución
    if (typingTimer) clearTimeout(typingTimer);
    typingEl.textContent = '';

    // Obtener frases del JSON o del respaldo
    const phrases = getPhrases(lang);
    let pIdx = 0, cIdx = 0, deleting = false;

    function typeLoop() {
      const phrase = phrases[pIdx];
      if (deleting) {
        cIdx--;
      } else {
        cIdx++;
      }
      typingEl.textContent = phrase.slice(0, cIdx);

      if (!deleting && cIdx === phrase.length) {
        // Espera antes de empezar a borrar
        deleting = true;
        typingTimer = setTimeout(typeLoop, 2000);
        return;
      }
      if (deleting && cIdx === 0) {
        // Pasar a la siguiente frase
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }

      typingTimer = setTimeout(typeLoop, deleting ? 40 : 68);
    }

    typingTimer = setTimeout(typeLoop, 500);
  }

  // Devuelve el array de frases para el idioma dado
  function getPhrases(lang) {
    if (i18nData && i18nData[lang]) {
      const dict = i18nData[lang];
      // Recoger todas las claves typing-0, typing-1, ... que existan
      const phrases = [];
      let i = 0;
      while (dict[`typing-${i}`] !== undefined) {
        phrases.push(dict[`typing-${i}`]);
        i++;
      }
      if (phrases.length > 0) return phrases;
    }
    // Si el JSON no está disponible, usar frases de respaldo
    return fallbackPhrases[lang] || fallbackPhrases.en;
  }

  // Arranque inicial del typing (cuando el JSON aún puede no estar listo)
  // applyTranslations() lo reiniciará con las frases del JSON una vez cargado
  startTypingEffect(currentLang);


  // ============================================================
  // ===== SLIDESHOW DE IMÁGENES (genérico, reutilizable) =====
  // Inicializa cualquier slideshow pasándole el ID del track y los dots
  // ============================================================
  function initImgSlideshow(trackId, dotsId) {
    const track = document.getElementById(trackId);
    const dotsEl = document.getElementById(dotsId);
    if (!track || !dotsEl) return;

    const slides = Array.from(track.querySelectorAll('.imgss-slide'));
    let current = 0;
    let autoTimer;

    // Crear los puntos de navegación (dots) dinámicamente
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'imgss-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsEl.appendChild(d);
    });

    // Mover al slide indicado
    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dotsEl.querySelectorAll('.imgss-dot').forEach((d, i) =>
        d.classList.toggle('active', i === current)
      );
    }

    // Conectar botones prev/next y soporte táctil
    const wrapper = track.closest('.img-slideshow');
    if (wrapper) {
      wrapper.querySelector('.imgss-prev')?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
      wrapper.querySelector('.imgss-next')?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

      // Swipe táctil
      let tx = 0;
      wrapper.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
      wrapper.addEventListener('touchend', e => {
        const diff = tx - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? goTo(current + 1) : goTo(current - 1); resetAuto(); }
      });

      // Pausar auto-avance al pasar el ratón por encima
      wrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
      wrapper.addEventListener('mouseleave', startAuto);
    }

    function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 4000); }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }
    startAuto();
  }

  // Inicializar los dos slideshows de la web
  initImgSlideshow('trackLogros', 'dotsLogros');
  initImgSlideshow('trackProjects', 'dotsProjects');


  // ============================================================
  // ===== LIGHTBOX (ampliar imágenes del slideshow) =====
  //
  // Cada galería (logros / proyectos) tiene su propio conjunto de
  // imágenes. Al abrir el lightbox desde una imagen, la navegación
  // prev/next se limita a las imágenes de ESA galería, no mezcla ambas.
  // ============================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg && lightboxClose) {

    // Imágenes activas del lightbox (solo las de la galería que se abrió)
    let activeImages = [];
    let currentImageIndex = 0;

    // Actualizar la imagen mostrada
    function updateLightboxImage(index) {
      currentImageIndex = (index + activeImages.length) % activeImages.length;
      lightboxImg.src = activeImages[currentImageIndex].src;
    }

    // Botones de navegación dentro del lightbox
    const lightboxNav = document.createElement('div');
    lightboxNav.className = 'lightbox-nav';
    lightboxNav.innerHTML = `
      <button class="lightbox-prev" aria-label="Imagen anterior"><i class="fas fa-chevron-left"></i></button>
      <button class="lightbox-next" aria-label="Imagen siguiente"><i class="fas fa-chevron-right"></i></button>
    `;
    lightbox.appendChild(lightboxNav);

    lightbox.querySelector('.lightbox-prev').addEventListener('click', e => {
      e.stopPropagation();
      updateLightboxImage(currentImageIndex - 1);
    });
    lightbox.querySelector('.lightbox-next').addEventListener('click', e => {
      e.stopPropagation();
      updateLightboxImage(currentImageIndex + 1);
    });

    // Navegación con teclado
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('show')) return;
      if (e.key === 'ArrowLeft') updateLightboxImage(currentImageIndex - 1);
      if (e.key === 'ArrowRight') updateLightboxImage(currentImageIndex + 1);
      if (e.key === 'Escape') lightbox.classList.remove('show');
    });

    // Vincular el click a cada galería por separado
    // gallerySectionId: el ID del <section> o wrapper que contiene el track
    // así las imágenes de logros no se mezclan con las de proyectos
    ['trackLogros', 'trackProjects'].forEach(trackId => {
      const track = document.getElementById(trackId);
      if (!track) return;
      const imgs = Array.from(track.querySelectorAll('.imgss-slide'));
      imgs.forEach((img, idx) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
          activeImages = imgs;           // solo las de esta galería
          currentImageIndex = idx;
          lightboxImg.src = img.src;
          lightbox.classList.add('show');
        });
      });
    });

    // Cerrar lightbox
    lightboxClose.addEventListener('click', () => lightbox.classList.remove('show'));
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) lightbox.classList.remove('show');
    });
  }


  // ============================================================
  // ===== ACORDEÓN DE PROYECTOS =====
  // Expande/colapsa cada proyecto al hacer clic en su cabecera
  // ============================================================
  window.toggleProj = function (id) {
    const item = document.getElementById(id);
    if (!item) return;
    const isOpen = item.classList.contains('open');
    // Cerrar todos antes de abrir el seleccionado
    document.querySelectorAll('.proj-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  };


  // ============================================================
  // ===== DESCARGA DEL CV — animación impresora =====
  // La animación se muestra al descargar y NO se cierra automáticamente
  // (se reinicia al refrescar la página)
  // ============================================================
  window.triggerDownload = function () {
    // Crear un enlace temporal y hacer clic en él para forzar la descarga
    const link = document.createElement('a');
    link.href = 'Federico_Lora_CV.pdf';
    link.download = 'Federico_Lora_CV.pdf';
    link.click();

    // Mostrar la animación de impresora
    const anim = document.getElementById('printerAnim');
    if (anim) anim.classList.add('show');
  };


  // ============================================================
  // ===== BOTÓN VOLVER ARRIBA =====
  // ============================================================
  scrollTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );


  // ============================================================
  // ===== PARALLAX EN LOS ORBS DEL HERO =====
  // Los círculos de fondo se mueven a diferentes velocidades al hacer scroll
  // ============================================================
  const heroOrbs = document.querySelectorAll('.orb');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroOrbs.forEach((orb, i) => {
      orb.style.transform = `translateY(${y * (0.06 + i * 0.035)}px)`;
    });
  }, { passive: true });


  // ============================================================
  // ===== CONSOLA — firma del desarrollador =====
  // ============================================================
  console.log(
    '%c Federico Lora — CV Web © 2026 · F10 ',
    'background:#1447a0;color:#fff;padding:6px 18px;border-radius:4px;font-family:monospace;'
  );

}); // fin DOMContentLoaded