// correctHeights.js
// This script checks if the used svh/lvh units are supported by the browser, and if not, translates vh units to a static unit.

document.addEventListener('DOMContentLoaded', function() {
    // Check if svh/lvh is supported
    if (!CSS.supports('height', '100svh')) {
    // Get all elements with vh units
    const sections = document.querySelectorAll('section');
    const footer = document.querySelector('footer');

    function setHeights() {
        const viewportHeight = window.innerHeight;

        sections.forEach(section => {
        const sectionElement = section as HTMLElement;
        // Convert 85vh to pixels
        if (sectionElement.classList.contains('h-[85vh]')) {
            sectionElement.style.height = `${viewportHeight * 0.85}px`;
        }
        // Convert 100vh to pixels
        if (sectionElement.classList.contains('h-[100vh]')) {
            sectionElement.style.height = `${viewportHeight}px`;
        }
        });

        // Handle footer (15vh)
        if (footer) {
        footer.style.height = `${viewportHeight * 0.15}px`;
        }
    }

    // Set heights initially
    setHeights();

    // Update heights when viewport resizes or orientation changes
    window.addEventListener('resize', setHeights);
    window.addEventListener('orientationchange', setHeights);
    }
});
