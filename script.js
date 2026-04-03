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

// Mouse object to store coordinates
let mouse = {
    x: null,
    y: null,
    radius: 120
};

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Reset mouse position when it leaves the window
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.glow = 0;
        // Randomly assign cyan or purple for the interaction highlight
        this.glowColor = Math.random() > 0.5 ? '#06b6d4' : '#8b5cf6';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Mouse interactivity (repel)
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= (dx / distance) * force * 3;
                this.y -= (dy / distance) * force * 3;
                this.glow = 1; // Trigger glow when pushed
            }
        }
        
        // Smoothly fade out the glow over time
        if (this.glow > 0) {
            this.glow -= 0.02;
        }
    }
    draw() {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)'; // Muted particle color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw colored glowing overlay if active
        if (this.glow > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(this.glow, 1));
            ctx.fillStyle = this.glowColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
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
                skillsGrid.classList.remove('has-active-card');
                
                // Unlock the section height after transition to restore responsive flow
                const parentSection = skillsWrapper.closest('section');
                if (parentSection) {
                    setTimeout(() => {
                        if (!skillsWrapper.classList.contains('active-detail')) {
                            parentSection.style.minHeight = '';
                        }
                    }, 400); // Wait for CSS transition
                }
                
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
                
                // Lock the parent section height so the page doesn't jump when cards shrink
                const parentSection = skillsWrapper.closest('section');
                if (parentSection && window.innerWidth > 768) {
                    if (!parentSection.style.minHeight) {
                        parentSection.style.minHeight = parentSection.offsetHeight + 'px';
                    }
                }
                
                // Set current card active, update text, and open panel
                card.classList.add('active');
                detailTitle.textContent = card.getAttribute('data-skill');
                detailDesc.textContent = card.getAttribute('data-exp');
                skillsWrapper.classList.add('active-detail');
                skillsGrid.classList.add('has-active-card');
            }
        });
    });

    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => {
            skillsWrapper.classList.remove('active-detail');
            skillsGrid.classList.remove('has-active-card');
            skillCards.forEach(c => c.classList.remove('active'));
            
            const parentSection = skillsWrapper.closest('section');
            if (parentSection) {
                setTimeout(() => {
                    if (!skillsWrapper.classList.contains('active-detail')) {
                        parentSection.style.minHeight = '';
                    }
                }, 400);
            }
            
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

// 6. HERO TYPEWRITER EFFECT
const heroDesc = document.querySelector('.hero p');
if (heroDesc) {
    const text = heroDesc.textContent.trim();
    if (text.length > 0) {
        heroDesc.textContent = ''; 
        heroDesc.style.position = 'relative';
        
        const charSpans = [];
        // Pre-render text invisibly to lock responsive layout and word-wraps
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.visibility = 'hidden';
            heroDesc.appendChild(span);
            charSpans.push(span);
        }
        const cursorSpan = document.createElement('span');
        
        cursorSpan.textContent = '|';
        cursorSpan.style.position = 'absolute';

        cursorSpan.style.fontWeight = 'bold';
        cursorSpan.style.color = 'var(--neon-cyan)';
        cursorSpan.style.animation = 'cursor-blink 1s step-end infinite';
        
        if (charSpans.length > 0) {
            cursorSpan.style.left = charSpans[0].offsetLeft + 'px';
            cursorSpan.style.top = charSpans[0].offsetTop + 'px';
        }
        heroDesc.appendChild(cursorSpan);

        let i = 0;
        function typeWriter() {
            if (i < charSpans.length) {
                charSpans[i].style.visibility = 'visible';
                
                // Move cursor using exact static coordinates
                const currentSpan = charSpans[i];
                cursorSpan.style.left = (currentSpan.offsetLeft + currentSpan.offsetWidth) + 'px';
                cursorSpan.style.top = currentSpan.offsetTop + 'px';
                    
                i++;
                setTimeout(typeWriter, Math.random() * 15 + 10); // 10-25ms random typing delay
            } else {
                // Fade out the blinking cursor gracefully when typing is done
                cursorSpan.style.animation = 'none';
                cursorSpan.style.transition = 'opacity 0.8s ease';
                cursorSpan.style.opacity = '0';
                setTimeout(() => {
                    cursorSpan.remove();
                }, 800);
            }
        }
        
        // Start typing slightly after the page entrance animation finishes
        setTimeout(typeWriter, 1200);
    }
}

init();
animate();