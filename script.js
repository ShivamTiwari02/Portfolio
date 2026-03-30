// 1. SCROLL ANIMATIONS (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.hidden').forEach((el) => {
    observer.observe(el);
});

// 2. PARTICLE BACKGROUND ANIMATION
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)'; // Muted particle color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    particlesArray = [];
    // Number of particles depends on screen size to maintain performance
    let numberOfParticles = (canvas.height * canvas.width) / 12000;
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                         + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            
            if (distance < (canvas.width / 10) * (canvas.height / 10)) {
                opacityValue = 1 - (distance / 15000);
                ctx.strokeStyle = 'rgba(148, 163, 184,' + opacityValue * 0.2 + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    connect();
}

// Handle Window Resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// 3. SMOOTH SCROLLING FOR NAVIGATION
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// 4. CUSTOM SCROLL PROGRESS BAR
const scrollBar = document.getElementById('scroll-bar');
const scrollContainer = document.querySelector('.scroll-progress-container');
let isScrolling;

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    scrollBar.style.height = scrollPercentage + '%';

    // Show the progress bar container
    scrollContainer.classList.add('visible');

    // Clear our timeout throughout the scroll and set a new one
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
        scrollContainer.classList.remove('visible');
    }, 1000); // Hides 1 second after scroll stops
});

// 5. SKILL CARDS INTERACTION
const skillCards = document.querySelectorAll('.skill-card');
const skillsWrapper = document.querySelector('.skills-wrapper');
const detailTitle = document.getElementById('detail-title');
const detailDesc = document.getElementById('detail-desc');
const closeDetailBtn = document.querySelector('.close-detail-btn');
const detailPanel = document.getElementById('detail-panel');
const skillsGrid = document.querySelector('.skills-grid');

if (skillCards.length > 0 && skillsWrapper) {
    skillCards.forEach(card => {
        card.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            
            // Clear active state from all cards
            skillCards.forEach(c => c.classList.remove('active'));

            if (isActive) {
                // If clicking the active card again, just close the panel
                skillsWrapper.classList.remove('active-detail');
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        if (!skillsWrapper.classList.contains('active-detail')) {
                            skillsGrid.appendChild(detailPanel);
                        }
                    }, 400);
                }
            } else {
                if (window.innerWidth <= 768) {
                    let insertAfterNode = card;
                    if (window.innerWidth > 480) {
                        const cardIndex = Array.from(skillCards).indexOf(card);
                        // If clicking left card (even index) in 2-col grid, insert after right card
                        if (cardIndex % 2 === 0 && cardIndex + 1 < skillCards.length) {
                            insertAfterNode = skillCards[cardIndex + 1];
                        }
                    }
                    skillsGrid.insertBefore(detailPanel, insertAfterNode.nextSibling);
                    
                    // Force a browser reflow so the opening animation triggers smoothly after moving the DOM node
                    void detailPanel.offsetWidth;
                }
                // Set current card active, update text, and open panel
                card.classList.add('active');
                detailTitle.textContent = card.getAttribute('data-skill');
                detailDesc.textContent = card.getAttribute('data-exp');
                skillsWrapper.classList.add('active-detail');
            }
        });
    });

    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => {
            skillsWrapper.classList.remove('active-detail');
            skillCards.forEach(c => c.classList.remove('active'));
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    if (!skillsWrapper.classList.contains('active-detail')) {
                        skillsGrid.appendChild(detailPanel);
                    }
                }, 400);
            }
        });
    }
}

init();
animate();