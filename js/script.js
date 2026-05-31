// Menu mobile toggle
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
});

// Fermer le menu quand on clique sur un lien
mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mainNav.classList.remove('active');
    });
});

function playHeroVideo(video) {
    const playPromise = video.play();
    if (playPromise) {
        playPromise.catch(() => {});
    }
}

function initHeroVideoCarousel() {
    const videos = Array.from(document.querySelectorAll('.hero-bg-video'));

    if (videos.length === 0) {
        return;
    }

    videos.forEach(video => {
        video.pause();
        video.muted = true;
        video.playsInline = true;
    });

    videos.forEach((video, index) => {
        window.setTimeout(() => {
            if (document.querySelector('.page-panel[data-page="accueil"].page-active')) {
                playHeroVideo(video);
            }
        }, index * 2500);
    });
}

// ===== GALERIE D'IMAGES DYNAMIQUES =====
const projects = [
    {
        title: 'Complexe Résidentiel Lomé',
        description: 'Construction de 120 logements avec infrastructure complète. Livraison 2024.',
        image: '',
        icon: 'fa-home'
    },
    {
        title: 'Zone Industrielle',
        description: 'Aménagement et viabilisation de zone industrielle pour PME locales.',
        image: '',
        icon: 'fa-industry'
    },
    {
        title: 'Système d\'Eau',
        description: 'Installation système hydraulique pour approvisionnement en eau potable.',
        image: '',
        icon: 'fa-water'
    },
    {
        title: 'École Primaire',
        description: 'Construction d\'une école de 12 classes avec laboratoires et cour sportive.',
        image: '',
        icon: 'fa-school'
    },
    {
        title: 'Pont de la Région',
        description: 'Réhabilitation d\'un pont communal avec renforcement structurel.',
        image: '',
        icon: 'fa-bridge'
    }
];

// Charger les projets avec images locales
async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = '';

    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const imageUrl = project.image;
        const imageMarkup = imageUrl
            ? `<img src="${imageUrl}" alt="${project.title}" loading="lazy" onerror="this.style.display='none'">`
            : '';
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-image image-slot">
                ${imageMarkup}
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
    }
}

// Charger les projets au démarrage
window.addEventListener('DOMContentLoaded', () => {
    initHeroVideoCarousel();
    initSectionNavigation();
    loadProjects();
    lazyLoadImages();
    
    // Initialiser les animations au scroll
    initScrollAnimations();
});

// ===== ANIMATIONS AU SCROLL =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 100); // Délai échelonné pour effet de cascade
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Ajouter des classes pour animations
    document.querySelectorAll('.profil-card').forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });
    
    document.querySelectorAll('.expertise-item').forEach((item, index) => {
        if (index % 2 === 0) {
            item.classList.add('fade-in-left');
        } else {
            item.classList.add('fade-in-right');
        }
        observer.observe(item);
    });
    
    document.querySelectorAll('.project-card').forEach(card => {
        card.classList.add('scale-up');
        observer.observe(card);
    });
    
    document.querySelectorAll('.value-item').forEach(item => {
        item.classList.add('fade-in');
        observer.observe(item);
    });

    // Observer aussi les sections headers
    document.querySelectorAll('.section-header').forEach(header => {
        header.classList.add('fade-in');
        observer.observe(header);
    });
    
    // Animations témoignages
    document.querySelectorAll('.testimonial-card').forEach((card, index) => {
        card.classList.add(index % 2 === 0 ? 'fade-in-left' : 'fade-in-right');
        observer.observe(card);
    });
}

// Gestion du formulaire avec validation
function handleSubmit(event) {
    const form = event.target;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    let isValid = true;
    
    // Réinitialiser les erreurs
    form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email').parentElement.classList.add('error');
        isValid = false;
    }
    
    // Validation champs requis
    if (!name || !subject || !message) {
        if (!name) document.getElementById('name').parentElement.classList.add('error');
        if (!subject) document.getElementById('subject').parentElement.classList.add('error');
        if (!message) document.getElementById('message').parentElement.classList.add('error');
        isValid = false;
    }
    
    if (!isValid) {
        event.preventDefault();
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours...';
}

// ===== NAVIGATION SECTIONS =====
function setActiveNavLink(pageId) {
    mainNav.querySelectorAll('a[href^="#"]').forEach(link => {
        const isActive = link.getAttribute('href') === `#${pageId}`;
        link.classList.toggle('active', isActive);

        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function syncHeroVideoState(pageId) {
    const videos = document.querySelectorAll('.hero-bg-video');

    videos.forEach(video => {
        if (pageId === 'accueil') {
            playHeroVideo(video);
        } else {
            video.pause();
        }
    });
}

function showPage(pageId, shouldUpdateHash = true) {
    const validPages = ['accueil', 'apropos', 'expertises', 'projets', 'contact'];
    const nextPage = validPages.includes(pageId) ? pageId : 'accueil';

    document.querySelectorAll('.page-panel').forEach(panel => {
        const isActive = panel.dataset.page === nextPage;
        panel.classList.toggle('page-active', isActive);
        panel.hidden = !isActive;
    });

    setActiveNavLink(nextPage);
    syncHeroVideoState(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (shouldUpdateHash) {
        history.replaceState(null, '', `#${nextPage}`);
    }
}

function initSectionNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const initialPage = window.location.hash ? window.location.hash.slice(1) : 'accueil';

    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const pageId = href ? href.slice(1) : '';

            if (!document.querySelector(`.page-panel[data-page="${pageId}"]`)) {
                return;
            }

            e.preventDefault();
            showPage(pageId);
        });
    });

    showPage(initialPage, false);
}

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== LAZY LOADING IMAGES =====
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src;
                imageObserver.unobserve(img);
            }
        });
    });
    images.forEach(img => imageObserver.observe(img));
}

// ===== DARK MODE TOGGLE =====
const darkModeToggle = document.querySelector('.dark-mode-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

if (darkModeToggle) {
    darkModeToggle.querySelector('i').className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        darkModeToggle.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    });
}
