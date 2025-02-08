// loadingOverlay.js


// Maybe include waiting for the images too
document.addEventListener('DOMContentLoaded', () => {
    // Disable scrolling while loading
    document.body.style.overflow = 'hidden';
    
    // Hide overlay when everything is loaded
    window.addEventListener('load', () => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('transition-opacity', 'duration-500', 'opacity-0');
            setTimeout(() => {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }, 500);
        }
    });
});