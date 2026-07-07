/* ----------------------------------------------------
   WEBORA DESIGN AGENCY INTERACTIVE CORE (app.js)
   ---------------------------------------------------- */

// Track dynamic static SPA redirects & hashes
let initialScrollTarget = '';
(function checkInitialTarget() {
    if (window.location.protocol === 'file:') return;
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('p');
    if (redirectPath) {
        const decodedPath = decodeURIComponent(redirectPath);
        // Extract section ID if it points to a section or a hash
        const parts = decodedPath.split('#');
        const pathPart = parts[0].replace('/', '');
        const hashPart = parts[1];
        
        initialScrollTarget = hashPart || pathPart;
        window.history.replaceState({}, '', decodedPath);
    } else if (window.location.hash) {
        initialScrollTarget = window.location.hash.substring(1);
        window.history.replaceState({}, '', `/${initialScrollTarget}`);
    } else if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        window.history.replaceState({}, '', '/home');
    }
})();

// Scroll to the target once the layout and assets are fully loaded (prevents halfway scrolls)
window.addEventListener('load', () => {
    if (initialScrollTarget) {
        const targetElement = document.getElementById(initialScrollTarget);
        if (targetElement) {
            // Scroll 1: Immediate on load
            targetElement.scrollIntoView({ behavior: 'smooth' });
            
            // Scroll 2: Correct height shifts after a small delay (handles fonts/images loading late)
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }, 350);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize functions
    initTheme();
    initStickyHeader();
    initMobileMenu();
    initActiveNavLinks();
    initScrollReveal();
    initFaqAccordion();
    initContactForm();
    initPortfolioLinks();
    initCleanUrls();
});

/* ==========================================================================
   1. Theme Management (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Retrieve stored theme, default to 'light'
    const storedTheme = localStorage.getItem('webora-theme') || 'light';
    
    // Apply theme
    if (storedTheme === 'dark') {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
    } else {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
    }
    
    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('theme-light')) {
            body.classList.remove('theme-light');
            body.classList.add('theme-dark');
            localStorage.setItem('webora-theme', 'dark');
            
            // Dispatch custom event to notify Three.js background of theme change
            window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: 'dark' } }));
        } else {
            body.classList.remove('theme-dark');
            body.classList.add('theme-light');
            localStorage.setItem('webora-theme', 'light');
            
            // Dispatch custom event to notify Three.js background of theme change
            window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: 'light' } }));
        }
    });
}

/* ==========================================================================
   2. Sticky Header on Scroll
   ========================================================================== */
function initStickyHeader() {
    const navbar = document.getElementById('navbar');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
}

/* ==========================================================================
   3. Mobile Navigation Drawer
   ========================================================================== */
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta');
    
    const toggleMenu = () => {
        mobileMenuToggle.classList.toggle('open');
        mobileDrawer.classList.toggle('open');
        
        // Prevent body scrolling when menu is open
        if (mobileDrawer.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };
    
    mobileMenuToggle.addEventListener('click', toggleMenu);
    
    // Close drawer when clicking nav links
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('open')) {
                toggleMenu();
            }
        });
    });
}

/* ==========================================================================
   4. Scroll Spy - Active Navigation Link Highlighting
   ========================================================================== */
function initActiveNavLinks() {
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -50% 0px', // Trigger when section occupies the center of the viewport
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        if (section.getAttribute('id')) {
            observer.observe(section);
        }
    });
}

/* ==========================================================================
   5. Scroll Reveal - Intersection Observer
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before entering viewport
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target); // Reveal only once
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   6. FAQ Accordion Toggle
   ========================================================================== */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items first
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = '0px';
            });
            
            // Toggle active state for current item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = '0px';
            }
        });
    });
}

/* ==========================================================================
   7. Form Validation & Client-Side Mock Submission
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successToast = document.getElementById('contact-success');
    const closeSuccessBtn = document.getElementById('success-close-btn');
    
    const inputs = [
        document.getElementById('form-name'),
        document.getElementById('form-email'),
        document.getElementById('form-message')
    ];
    
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };
    
    const checkInput = (input) => {
        const group = input.closest('.form-group');
        let isValid = true;
        
        if (input.required && !input.value.trim()) {
            isValid = false;
        } else if (input.type === 'email' && !validateEmail(input.value.trim())) {
            isValid = false;
        }
        
        if (!isValid) {
            group.classList.add('invalid');
        } else {
            group.classList.remove('invalid');
        }
        
        return isValid;
    };
    
    // Clear error tags on input change
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');
            if (input.value.trim()) {
                if (input.type === 'email' && !validateEmail(input.value.trim())) {
                    // still invalid format, but don't force visual error instantly
                } else {
                    group.classList.remove('invalid');
                }
            }
        });
        
        input.addEventListener('blur', () => {
            checkInput(input);
        });
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isFormValid = true;
        
        inputs.forEach(input => {
            const isValid = checkInput(input);
            if (!isValid) isFormValid = false;
        });
        
        if (isFormValid) {
            // Mock server request loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending...</span><div class="btn-spinner"></div>`;
            
            const nameVal = document.getElementById('form-name').value;
            const emailVal = document.getElementById('form-email').value;
            const msgVal = document.getElementById('form-message').value;
            
            // Build mailto link to admin@ovren.co
            const mailtoUrl = `mailto:admin@ovren.co?subject=New Quote Inquiry - ${encodeURIComponent(nameVal)}&body=${encodeURIComponent("Name: " + nameVal + "\nEmail: " + emailVal + "\n\nMessage:\n" + msgVal)}`;
            
            setTimeout(() => {
                window.location.href = mailtoUrl;
                
                // Hide form, show success message
                form.style.opacity = '0';
                setTimeout(() => {
                    form.style.display = 'none';
                    successToast.style.display = 'flex';
                    // Trigger reflow to initiate transition
                    void successToast.offsetWidth;
                    successToast.classList.add('show');
                    
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }, 300);
            }, 1000);
        }
    });
    
    closeSuccessBtn.addEventListener('click', () => {
        // Reset form inputs
        inputs.forEach(input => {
            input.value = '';
            input.closest('.form-group').classList.remove('invalid');
        });
        
        // Hide success message, show form
        successToast.classList.remove('show');
        setTimeout(() => {
            successToast.style.display = 'none';
            form.style.display = 'flex';
            // Trigger reflow to initiate transition
            void form.offsetWidth;
            form.style.opacity = '1';
        }, 300);
    });
}


/* ==========================================================================
   8. Dynamic Portfolio Subdomain Links
   ========================================================================== */
function initPortfolioLinks() {
    const portfolioLinks = document.querySelectorAll('[data-subdomain]');

    portfolioLinks.forEach(link => {
        const subdomain = link.getAttribute('data-subdomain');
        // Use root-relative paths on servers to prevent URL stacking, fall back to relative paths on local file system
        if (window.location.protocol === 'file:') {
            link.href = `./portfolio/${subdomain}/index.html`;
        } else {
            link.href = `/portfolio/${subdomain}/`;
        }
    });
}

// Custom URL history rewriting for clean URLs (e.g. /home, /services)
function initCleanUrls() {
    if (window.location.protocol === 'file:') return;

    // Intercept navbar and footer anchors for /name instead of /#name
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') return;
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState({}, '', `/${targetId}`);
            }
        });
    });
}



