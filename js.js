//header activar pagia actual
fetch("header.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("header").innerHTML = data;

    // Resaltar el título actual
    const currentPage = document.body.getAttribute("data-page");
    const activeLink = document.querySelector(`a[data-page="${currentPage}"]`);
    if (activeLink) {
      activeLink.classList.add("active"); // Clase que resalta el link actual
    }
  });

//footer igual
fetch("footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  });

//header lado
function toggleHeader() {
  const header = document.getElementById("header-display");
  header.classList.add("visible"); // Alterna la clase 'visible'
  backdrop.classList.add("active");

  backdrop.addEventListener("click", () => {
    backdrop.classList.remove("active");
    header.classList.remove("visible");
  });
}

function closeHeader() {
  const header = document.getElementById("header-display");
  header.classList.remove("visible"); // Alterna la clase 'visible'
  backdrop.classList.remove("active");
}

const slides = document.getElementById("slides");
const allSlides = document.querySelectorAll(".slide");
const navDots = document.getElementById("navDots");
let currentIndex = 0;

function showImageThenPlayVideo(slide) {
  const img = slide.querySelector(".slide-img");
  const video = slide.querySelector(".slide-video");

  setTimeout(() => {
    img.style.opacity = "0";
    video.style.opacity = "1";
    video.play();
  }, 5000);

  video.onended = () => {
    video.style.opacity = "0";
    img.style.opacity = "1";
  };
}

function updateSlide() {
  slides.style.transform = `translateX(-${currentIndex * 100}%)`;

  // Actualizar puntos
  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });

  // Lanzar imagen + vídeo solo para el slide actual
  allSlides.forEach((slide, index) => {
    const img = slide.querySelector(".slide-img");
    const video = slide.querySelector(".slide-video");

    // Reset todos
    img.style.opacity = "1";
    img.style.pointerEvents = "auto";

    video.style.opacity = "0";
    video.style.pointerEvents = "none";
    video.pause();
    video.currentTime = 0;

    if (index === currentIndex) {
      showImageThenPlayVideo(slide);
    }
  });
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % allSlides.length;
  updateSlide();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + allSlides.length) % allSlides.length;
  updateSlide();
}

function goToSlide(index) {
  currentIndex = index;
  updateSlide();
}

// Crear los puntos
for (let i = 0; i < allSlides.length; i++) {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  if (i === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goToSlide(i));
  navDots.appendChild(dot);
}

// Drawer lateral
document.addEventListener("DOMContentLoaded", () => {
  // --- Variables ---
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("backdrop");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const thumbTrack = document.getElementById("thumbTrack");
  const thumbPrev = document.getElementById("thumbPrev");
  const thumbNext = document.getElementById("thumbNext");
  const fullscreenViewer = document.getElementById("fullscreenViewer");
  const fullscreenImg = document.getElementById("fullscreenImg");
  const fullscreenPrev = document.getElementById("fullscreenPrev");
  const fullscreenNext = document.getElementById("fullscreenNext");
  const closeFullscreenBtn = document.getElementById("closeFullscreenBtn");

  let thumbIndex = 0;
  let numImages = 6;
  let thumbImages = [];
  let basePath = "";
  let fullscreenCurrent = 0;

  // --- Ocultar meta-items vacíos ---

  function hideEmptyMetaItems(container) {
    container.querySelectorAll(".meta-item").forEach((item) => {
      const value = item.querySelector(".meta-value");
      if (
        value &&
        (!value.innerHTML.trim() || value.innerHTML.trim() === "-")
      ) {
        item.style.display = "none";
      } else {
        item.style.display = "";
      }
    });
  }

  // --- Rellenar Drawer ---
  function fillDrawer(data) {
    document.getElementById("drawer-titol").innerHTML = data.titol;
    document.getElementById("drawer-descripcio").innerHTML = data.descripcio;
    document.getElementById("drawer-headerimage").src = data.headerimage;
    document.getElementById("drawer-format").innerHTML = data.format;
    document.getElementById("drawer-estrena").innerHTML = data.estrena;
    document.getElementById("drawer-durada").innerHTML = data.durada;
    document.getElementById("drawer-repartiment").innerHTML =
      data.repartiment || "";
    document.getElementById("drawer-realitzat").innerHTML =
      data.realitzat || "";
    document.getElementById("drawer-regio").innerHTML = data.regio || "";
    document.getElementById("drawer-audio").innerHTML = data.audio || "";
    document.getElementById("drawer-recorregut").innerHTML =
      data.recorregut || "";

    // Ocultar el botón si no hay enlace
    const trailerBtn = document.getElementById("drawer-trailer");
    if (!data.trailer || data.trailer === "-" || data.trailer === "#") {
      trailerBtn.style.display = "none";
    } else {
      trailerBtn.href = data.trailer;
      trailerBtn.style.display = "";
    }

    // Ocultar meta-items vacíos
    const drawerInfo = document.querySelector(".drawer-info");
    if (drawerInfo) hideEmptyMetaItems(drawerInfo);
  }

  // --- Cargar fotogramas según el proyecto ---
  function loadThumbImages(projectKey) {
    if (projectKey === "epileg") {
      basePath = "media/epileg/fotogrames/";
      numImages = 6;
    } else if (projectKey === "memoria") {
      basePath = "media/memoria_historica/fotogrames/";
      numImages = 6;
    } else if (projectKey === "esberlada") {
      basePath = "media/esberlada/fotogrames/";
      numImages = 6;
    }
    thumbTrack.innerHTML = "";
    thumbImages = [];
    for (let i = 1; i <= numImages; i++) {
      const img = document.createElement("img");
      img.src = `${basePath}${i}.png`;
      img.alt = `Fotograma ${i}`;
      img.dataset.index = i - 1;
      img.addEventListener("click", () => {
        openFullscreenViewer(i - 1);
      });
      thumbTrack.appendChild(img);
      thumbImages.push(img.src);
    }
    thumbIndex = 0;
    updateThumbCarousel();
  }

  function updateThumbCarousel() {
    const imageWidth = thumbTrack.querySelector("img")?.offsetWidth || 150;
    const offset = thumbIndex * imageWidth;
    thumbTrack.style.transform = `translateX(-${offset}px)`;
  }

  thumbNext.addEventListener("click", () => {
    thumbIndex = (thumbIndex + 1) % numImages;
    updateThumbCarousel();
  });
  thumbPrev.addEventListener("click", () => {
    thumbIndex = (thumbIndex - 1 + numImages) % numImages;
    updateThumbCarousel();
  });

  function openFullscreenViewer(index) {
    fullscreenCurrent = index;
    fullscreenImg.src = thumbImages[fullscreenCurrent];
    fullscreenViewer.classList.remove("fullscreen-hidden");
    fullscreenViewer.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  fullscreenPrev.addEventListener("click", () => {
    fullscreenCurrent =
      (fullscreenCurrent - 1 + thumbImages.length) % thumbImages.length;
    fullscreenImg.src = thumbImages[fullscreenCurrent];
  });
  fullscreenNext.addEventListener("click", () => {
    fullscreenCurrent = (fullscreenCurrent + 1) % thumbImages.length;
    fullscreenImg.src = thumbImages[fullscreenCurrent];
  });
  closeFullscreenBtn.addEventListener("click", () => {
    fullscreenViewer.classList.remove("active");
    fullscreenViewer.classList.add("fullscreen-hidden");
    document.body.style.overflow = "";
  });

  // --- Abrir drawer desde project-card y slide-text ---
  document.querySelectorAll(".project-card").forEach((card) => {
    const projectKey = card.getAttribute("data-project");
    const data = projectInfo[projectKey];
    if (data) {
      // Actualiza los campos usando los IDs existentes
      const portada = card.querySelector("#portada");
      if (portada) portada.src = data.portada;

      const titol = card.querySelector("#titol");
      if (titol) titol.textContent = data.titol;

      const format = card.querySelector("#format");
      if (format) format.textContent = data.format;

      const estrena = card.querySelector("#estrena");
      if (estrena) estrena.textContent = data.estrena;

      const durada = card.querySelector("#durada");
      if (durada) durada.textContent = data.durada;
    }

    // Al hacer clic, abre el drawer con la info del proyecto
    card.addEventListener("click", () => {
      fillDrawer(data);
      loadThumbImages(projectKey);
      drawer.classList.add("active");
      backdrop.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  // --- Actualizar carousel del inicio ---
  document.querySelectorAll(".slide-text").forEach((slide) => {
    const projectKey = slide.getAttribute("data-project");
    const data = projectInfo[projectKey];
    if (data) {
      const titol = slide.querySelector("#slide-titol");
      if (titol) titol.textContent = data.titol;

      const format = slide.querySelector("#slide-format");
      if (format) format.textContent = data.format;

      const estrena = slide.querySelector("#slide-estrena");
      if (estrena) estrena.textContent = data.estrena;

      const durada = slide.querySelector("#slide-durada");
      if (durada) durada.textContent = data.durada;
    }
  });

  document.querySelectorAll(".btn-outline").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const slide = btn.closest(".slide-text");
      const projectKey = slide.getAttribute("data-project");
      const data = projectInfo[projectKey];
      if (data) {
        fillDrawer(data);
        loadThumbImages(projectKey);
        drawer.classList.add("active");
        backdrop.classList.add("active");
        document.body.style.overflow = "hidden";
      }
      e.stopPropagation();
    });
  });

  closeDrawerBtn.addEventListener("click", () => {
    drawer.classList.remove("active");
    backdrop.classList.remove("active");
    document.body.style.overflow = "";
  });

  backdrop.addEventListener("click", () => {
    drawer.classList.remove("active");
    backdrop.classList.remove("active");
    document.body.style.overflow = "";
  });

  // --- Abrir trailer en modal ---
  const trailerModal = document.getElementById("trailerModal");
  const trailerEmbed = document.getElementById("trailerEmbed");
  const closeTrailerModal = document.getElementById("closeTrailerModal");
  const trailerBtn = document.getElementById("drawer-trailer");

  trailerBtn.addEventListener("click", function (e) {
    e.preventDefault();
    // Obtén el enlace del tráiler actual
    const url = trailerBtn.href;
    let embedHtml = "";

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // Extrae el ID de YouTube
      let videoId = "";
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split(/[?&]/)[0];
      } else {
        const params = new URLSearchParams(url.split("?")[1] || "");
        videoId = params.get("v");
      }
      if (videoId) {
        embedHtml = `<iframe width="800" height="450" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      }
    } else if (url.includes("vimeo.com")) {
      // Extrae el ID de Vimeo
      const matches = url.match(/vimeo\.com\/(\d+)/);
      if (matches && matches[1]) {
        embedHtml = `<iframe src="https://player.vimeo.com/video/${matches[1]}?autoplay=1" width="800" height="450" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
      }
    }

    if (embedHtml) {
      trailerEmbed.innerHTML = embedHtml;
      trailerModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  });

  closeTrailerModal.addEventListener("click", function () {
    trailerModal.style.display = "none";
    trailerEmbed.innerHTML = "";
    document.body.style.overflow = "";
  });

  // --- ESCAPE KEY ---
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      // Cerrar drawer si está abierto
      if (drawer.classList.contains("active")) {
        drawer.classList.remove("active");
        backdrop.classList.remove("active");
        document.body.style.overflow = "";
      }
      // Cerrar modal de tráiler si está abierto
      if (trailerModal.style.display === "flex") {
        trailerModal.style.display = "none";
        trailerEmbed.innerHTML = "";
        document.body.style.overflow = "";
      }
      // Cerrar visor de pantalla completa si está abierto
      if (!fullscreenViewer.classList.contains("fullscreen-hidden")) {
        fullscreenViewer.classList.remove("active");
        fullscreenViewer.classList.add("fullscreen-hidden");
        document.body.style.overflow = "";
      }
    }
  });
});

// Contenido por proyecto
const projectInfo = {
  epileg: {
    titol: "Epíleg",
    portada: "media/cartell_epileg.jpg",
    descripcio:
      "La Maria Àngels, propietària d’un antic hostal del poble, que ara resta buit. En Carles Xavier, que deambula constantment acompanyat de l’Ombra, la seva gossa. En Jordi, que fa d’operari de manteniment municipal. La Marta, que retorna al pis familiar per ultimar les gestions d’una mudança. Quatre persones que coexisteixen en els paisatges ambivalents de Portbou.",
    headerimage: "media/epileg/1.67.1_1.67.1.png",
    trailer: "https://vimeo.com/985794131",
    format: "Llargmetratge documental",
    estrena: "2025",
    durada: "72 min",
    repartiment:
      "Maria Àngles Macias<br>Carles Xavier Maga<br>Jordi Sors<br>Marta Prats",
    realitzat: "Alba Bauçà i Raimon Casanovas",
    regio: "Portbou",
    audio: "Català",
    recorregut:
      "Estrena a l'Atlàntida Mallorca Film Fest 2025<br>Preestrena a Portbou",
  },

  memoria: {
    titol: "Memòria històrica de Cadaqués",
    portada: "media/memoria_historica/senyores.png",
    descripcio:
      "Un llargmetratge documental sobre la memòria històrica de Cadaqués, un document de preservació de la memòria individual de diverses persones del poble; la confecció d’un imaginari local i col·lectiu, la immortalització de les arrels i les tradicions de Cadaqués i la seva gent.",
    headerimage: "media/memoria_historica/senyores.png",
    format: "Llargmetratge documental",
    estrena: "2026 - En desenvolupament",
    durada: "-",
    realitzat:
      "Raimon Casanovas i Alba Bauçà<br>Amb el suport de l'Ajuntament de Cadaqués",
    regio: "Cadaqués",
    audio: "Català",
    trailer: "-",
  },
  esberlada: {
    titol: "Esberlada",
    portada: "media/esberlada/stills_pedra seca_1.24.1.jpg",
    descripcio:
      "Esberlada desdibuixa es pas des temps des d’una mirada anacrònica sobre sa pedra seca, incloent es testimoniatge de peretaires de Cadaqués entrevistats per Mercè Donat.<br>Desenvolupat dins es marc de sa XII Trobada de Pedra Seca i Arquitectura Tradicional, que tingué lloc a Cadaqués del 19 al 22 d'octubre de 2023.",
    headerimage: "media/esberlada/stills_pedra seca_1.24.1.jpg",
    format: "Curtmetratge documental",
    estrena: "2023",
    durada: "14 min",
    trailer: "https://vimeo.com/874225549",
    repartiment:
      "Maria Àngles Macias, Carles Xavier Maga, Jordi Sors, Marta Prats",
    realitzat:
      "Alba Bauçà i Raimon Casanovas<br>Amb el suport de l'Ajuntament de Cadaqués",
    regio: "Cadaqués i Cap de Creus",
    audio: "Català",
    recorregut:
      "Projecció a La Cate Figueres<br>Projecció al Centre d'Art i Cultura ARBAR<br>Selecció al Festival Niu<br> Projeccióal Teatre Art i Joia<br>Estrena al Corral de la Gala",
  },
};

updateSlide(); // Inicializar la primera imagen y puntos
