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
  //   1. Se carga idiomas.json con fetch()
  //   2. Se detecta el idioma activo (localStorage o 'en' por defecto)
  //   3. applyTranslations() recorre todos los elementos con
  //      data-i18n / data-i18n-html y sustituye el contenido
  //   4. El botón langToggle llama a switchLang() sin recargar la página
  //   5. El typing también se reinicia con las frases del nuevo idioma
  // ============================================================

  const langToggle = document.getElementById('langToggle');
  const langText = document.querySelector('.lang-text');

  // Idioma por defecto: inglés, a menos que el usuario haya cambiado antes
  let currentLang = localStorage.getItem('fl-lang') || 'en';

  // Variable global que guardará el contenido completo del JSON de idiomas
  let i18nData = null;

  // Referencia al timer del typing para poder cancelarlo al cambiar idioma
  let typingTimer = null;


  // ------ Cargar el JSON de idiomas ------
  // Nota: fetch() funciona en GitHub Pages y en cualquier servidor HTTP.
  // No funciona si abres el HTML directamente como archivo (file://).
  // Para desarrollo local usa Live Server o similar.
  fetch('idiomas.json')
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar idiomas.json');
      return res.json();
    })
    .then(data => {
      i18nData = data;                  // Guardar en memoria
      applyTranslations(currentLang);   // Aplicar idioma inicial
      updateLangButton(currentLang);    // Actualizar texto del botón
      html.setAttribute('lang', currentLang);
    })
    .catch(err => {
      // Si falla la carga del JSON la web sigue funcionando con el texto del HTML
      console.warn('⚠️ idiomas.json no disponible. La web mostrará el texto por defecto del HTML.', err);
    });


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


  // ------ Actualizar el texto del botón de idioma ------
  // Si estamos en inglés, muestra "ES" (para cambiar a español) y viceversa
  function updateLangButton(lang) {
    langText.textContent = lang === 'en' ? 'ES' : 'EN';
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
  const typingEl = document.getElementById('typingText');

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
  // ============================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg && lightboxClose) {
    const allImages = Array.from(document.querySelectorAll('.imgss-slide'));
    let currentImageIndex = 0;

    // Actualizar la imagen mostrada en el lightbox
    function updateLightboxImage(index) {
      currentImageIndex = index;
      lightboxImg.src = allImages[index].src;
    }

    // Botones de navegación prev/next dentro del lightbox
    const lightboxNav = document.createElement('div');
    lightboxNav.className = 'lightbox-nav';
    lightboxNav.innerHTML = `
      <button class="lightbox-prev" aria-label="Imagen anterior"><i class="fas fa-chevron-left"></i></button>
      <button class="lightbox-next" aria-label="Imagen siguiente"><i class="fas fa-chevron-right"></i></button>
    `;
    lightbox.appendChild(lightboxNav);

    lightbox.querySelector('.lightbox-prev').addEventListener('click', e => {
      e.stopPropagation();
      updateLightboxImage((currentImageIndex - 1 + allImages.length) % allImages.length);
    });
    lightbox.querySelector('.lightbox-next').addEventListener('click', e => {
      e.stopPropagation();
      updateLightboxImage((currentImageIndex + 1) % allImages.length);
    });

    // Navegación con teclado
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('show')) return;
      if (e.key === 'ArrowLeft') updateLightboxImage((currentImageIndex - 1 + allImages.length) % allImages.length);
      if (e.key === 'ArrowRight') updateLightboxImage((currentImageIndex + 1) % allImages.length);
      if (e.key === 'Escape') lightbox.classList.remove('show');
    });

    // Abrir lightbox al clicar en una imagen del slideshow
    allImages.forEach((img, index) => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        currentImageIndex = index;
        lightbox.classList.add('show');
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