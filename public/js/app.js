document.documentElement.classList.add('js-ready');

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = siteNav.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        menuToggle.innerHTML = `<i class="bx ${isOpen ? 'bx-x' : 'bx-menu'}"></i>`;
    });

    siteNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            siteNav.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open navigation');
            menuToggle.innerHTML = '<i class="bx bx-menu"></i>';
        });
    });
}

const revealItems = [...document.querySelectorAll('[data-reveal]')];

revealItems.forEach(item => {
    const siblings = [...item.parentElement.children].filter(sibling => sibling.hasAttribute('data-reveal'));
    const siblingIndex = siblings.indexOf(item);
    item.style.setProperty('--reveal-delay', `${(siblingIndex % 3) * 85}ms`);
});

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealItems.forEach(item => revealObserver.observe(item));
} else {
    revealItems.forEach(item => item.classList.add('is-visible'));
}