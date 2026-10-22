/*
╭━━━╮╱╱╱╱╭╮╱╱╱╱╱╱╭╮╭━━━╮
┃╭━━╯╱╱╱╱┃┃╱╱╱╱╱╭╯┃┃╭━╮┃
┃╰━━┳━━┳━╯┣━━┳━━╋╮┃┃┃┃┃┃
┃╭━━┫┃━┫╭╮┃┃━┫━━┫┃┃┃┃┃┃┃
┃┃╱╱┃┃━┫╰╯┃┃━╋━━┣╯╰┫╰━╯┃
╰╯╱╱╰━━┻━━┻━━┻━━┻━━┻━━━╯
fedes10.com — script.js · © 2024-2026 Federico Lora · Todos los derechos reservados
*/

// ============================================================
// IDIOMAS
//   - Una página por idioma: https://fedes10.com/ (español) y https://fedes10.com/en/ (inglés).
//     Las dos llegan ya escritas (las genera Herramientas/GenerarIdiomas.py desde idiomas.json),
//     así que aquí no se traduce nada: Google y cualquiera sin JavaScript leen su idioma entero.
//   - El botón de idioma es un ENLACE a la otra página. Al pulsarlo se guarda la elección
//     (localStorage 'fl-lang') y, si otro día se entra por la dirección del otro idioma, se va
//     a la elegida. Sin elección guardada no se redirige a nadie (Google lo desaconseja).
//   - ?lang=es / ?lang=en (los enlaces que ya circulaban) llevan a la página de ese idioma.
//
// SEGURIDAD
//   - Aquí está TODO el JavaScript de la web: el HTML no lleva ni un onclick ni un onerror.
//     Por eso la CSP de nginx puede ser `script-src 'self'`, sin huellas ni 'unsafe-inline'.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const html = document.documentElement;
  const leer = (clave) => { try { return localStorage.getItem(clave); } catch { return null; } };
  const guardar = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch { /* modo privado */ } };


  // ===== Idioma: ¿esta página o la otra? =====
  const idiomaPagina = html.lang === 'en' ? 'en' : 'es';
  const otroIdioma = idiomaPagina === 'en' ? 'es' : 'en';
  const enlaceIdioma = document.getElementById('langToggle');
  const urlDelOtro = () => new URL(enlaceIdioma.getAttribute('href') + location.hash, location.href);

  const pedido = new URLSearchParams(location.search).get('lang');
  const elegido = ['es', 'en'].includes(pedido) ? pedido : leer('fl-lang');
  if (elegido === otroIdioma) {
    location.replace(urlDelOtro());
    return;
  }
  if (pedido) history.replaceState(null, '', location.pathname + location.hash);   // fuera el ?lang

  enlaceIdioma.addEventListener('click', e => {
    e.preventDefault();
    guardar('fl-lang', otroIdioma);
    location.assign(urlDelOtro());          // y en la misma sección en la que estaba
  });


  // ===== Empezar siempre desde arriba =====
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);


  // ===== Cargador =====
  const loader = document.getElementById('pageLoader');
  setTimeout(() => loader.classList.add('hidden'), 700);


  // ===== Tema claro / oscuro =====
  // Por defecto oscuro (el diseño nace ahí). Solo se guarda cuando el visitante lo cambia.
  const themeToggle = document.getElementById('themeToggle');
  html.setAttribute('data-theme', leer('fl-theme') || 'dark');
  themeToggle.addEventListener('click', () => {
    const siguiente = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', siguiente);
    guardar('fl-theme', siguiente);
  });


  // ===== Imágenes con recambio (antes era un onerror en el HTML) =====
  // data-respaldo="siguiente" → enseña el elemento de al lado · data-respaldo="<id>" → enseña ese
  document.querySelectorAll('img[data-respaldo]').forEach(img => {
    const fallar = () => {
      img.hidden = true;
      const objetivo = img.dataset.respaldo === 'siguiente'
        ? img.nextElementSibling
        : document.getElementById(img.dataset.respaldo);
      if (objetivo) objetivo.hidden = false;
    };
    // Puede haber fallado ANTES de que este script llegara a escucharla
    if (img.complete && img.naturalWidth === 0) fallar();
    else img.addEventListener('error', fallar, { once: true });
  });


  // ===== Barra de navegación =====
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const scrollTop = document.getElementById('scrollTop');

  const cerrarMenu = () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  navToggle.addEventListener('click', () => {
    const abierto = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', abierto);
    navToggle.setAttribute('aria-expanded', String(abierto));
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

  // Sección activa en la barra
  const secciones = document.querySelectorAll('section[id], header[id]');
  const enlaces = document.querySelectorAll('.nav-links a[data-section]');
  function seccionActiva() {
    let actual = 'hero';
    secciones.forEach(s => { if (window.scrollY >= s.offsetTop - 160) actual = s.id; });
    enlaces.forEach(a => a.classList.toggle('active', a.dataset.section === actual));
  }

  const orbes = document.querySelectorAll('.orb');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    scrollTop.classList.toggle('visible', y > 400);
    seccionActiva();
    // Parallax suave de los círculos del fondo de la cabecera
    if (y < window.innerHeight) orbes.forEach((o, i) => { o.style.transform = `translateY(${y * (0.06 + i * 0.035)}px)`; });
  }, { passive: true });
  seccionActiva();

  scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


  // ===== Animaciones al aparecer =====
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observador.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => observador.observe(el));


  // ===== Filtros de proyectos =====
  const filtros = document.querySelectorAll('.proj-filtro');
  const tarjetas = document.querySelectorAll('.proj-card');
  filtros.forEach(boton => boton.addEventListener('click', () => {
    const grupo = boton.dataset.filtro;
    filtros.forEach(b => {
      const activo = b === boton;
      b.classList.toggle('activo', activo);
      b.setAttribute('aria-pressed', String(activo));
    });
    tarjetas.forEach(t => {
      const entra = grupo === 'todos' || t.dataset.cat.split(' ').includes(grupo);
      t.hidden = !entra;
      if (entra) t.classList.add('visible');   // que no se quede invisible esperando al observador
    });
  }));


  // ===== Galerías de imágenes =====
  function iniciarGaleria(trackId, dotsId) {
    const track = document.getElementById(trackId);
    const dots = document.getElementById(dotsId);
    if (!track || !dots) return;
    const fotos = Array.from(track.querySelectorAll('.imgss-slide'));
    let actual = 0, temporizador;

    fotos.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'imgss-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', String(i + 1));
      d.addEventListener('click', () => { ir(i); reiniciar(); });
      dots.appendChild(d);
    });

    function ir(i) {
      actual = (i + fotos.length) % fotos.length;
      track.style.transform = `translateX(-${actual * 100}%)`;
      dots.querySelectorAll('.imgss-dot').forEach((d, j) => d.classList.toggle('active', j === actual));
      // Las fotos van con loading="lazy": se cargan la que toca y la siguiente
      [actual, actual + 1].forEach(j => { if (fotos[j]) fotos[j].loading = 'eager'; });
    }

    const caja = track.closest('.img-slideshow');
    caja.querySelector('.imgss-prev').addEventListener('click', () => { ir(actual - 1); reiniciar(); });
    caja.querySelector('.imgss-next').addEventListener('click', () => { ir(actual + 1); reiniciar(); });
    let x0 = 0;
    caja.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    caja.addEventListener('touchend', e => {
      const d = x0 - e.changedTouches[0].clientX;
      if (Math.abs(d) > 50) { ir(actual + (d > 0 ? 1 : -1)); reiniciar(); }
    });
    caja.addEventListener('mouseenter', () => clearInterval(temporizador));
    caja.addEventListener('mouseleave', arrancar);

    function arrancar() {
      clearInterval(temporizador);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) temporizador = setInterval(() => ir(actual + 1), 4500);
    }
    function reiniciar() { arrancar(); }
    ir(0);
    arrancar();
  }
  iniciarGaleria('trackLogros', 'dotsLogros');
  iniciarGaleria('trackProjects', 'dotsProjects');


  // ===== Lightbox: ampliar una foto de la galería =====
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  let fotosActivas = [], indice = 0;

  const mostrar = i => { indice = (i + fotosActivas.length) % fotosActivas.length; lightboxImg.src = fotosActivas[indice].src; };
  const cerrarLightbox = () => lightbox.classList.remove('show');

  const nav = document.createElement('div');
  nav.className = 'lightbox-nav';
  ['prev', 'next'].forEach(lado => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lightbox-' + lado;
    b.setAttribute('aria-label', lado === 'prev' ? '←' : '→');
    b.innerHTML = `<i class="fas fa-chevron-${lado === 'prev' ? 'left' : 'right'}" aria-hidden="true"></i>`;
    b.addEventListener('click', e => { e.stopPropagation(); mostrar(indice + (lado === 'prev' ? -1 : 1)); });
    nav.appendChild(b);
  });
  lightbox.appendChild(nav);

  ['trackLogros', 'trackProjects'].forEach(id => {
    const fotos = Array.from(document.querySelectorAll(`#${id} .imgss-slide`));
    fotos.forEach((img, i) => img.addEventListener('click', () => {
      fotosActivas = fotos;          // solo las de ESA galería
      mostrar(i);
      lightbox.classList.add('show');
    }));
  });
  document.getElementById('lightboxClose').addEventListener('click', cerrarLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) cerrarLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'ArrowLeft') mostrar(indice - 1);
    if (e.key === 'ArrowRight') mostrar(indice + 1);
    if (e.key === 'Escape') cerrarLightbox();
  });


  // ===== Descargar el CV, con la animación de la impresora =====
  document.getElementById('btnDownloadCV').addEventListener('click', () => {
    // El PDF de este idioma: el mismo al que apunta el botón de la barra
    const cv = document.getElementById('btnCvNav').getAttribute('href');
    const enlace = document.createElement('a');
    enlace.href = cv;
    enlace.download = decodeURIComponent(cv.split('/').pop());
    enlace.click();
    document.getElementById('printerAnim').classList.add('show');
  });


  // ===== Firma en la consola =====
  console.log('%c Federico Lora · fedes10.com · © 2024-2026 ', 'background:#1447a0;color:#fff;padding:6px 18px;border-radius:4px;font-family:monospace;');

});
