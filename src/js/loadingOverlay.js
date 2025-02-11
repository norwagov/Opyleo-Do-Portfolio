// loadingOverlay.js


// Maybe include waiting for the images too
document.addEventListener('DOMContentLoaded', () => {
    // Disable scrolling while loading
    document.body.style.overflow = 'hidden';
    
    // Create a Promise that resolves when slides are loaded
    const slidesLoaded = new Promise((resolve) => {
        const checkSlides = () => {
            const slides = document.querySelectorAll('.swiper-slide');
            if (slides.length > 0) {
                // Wait for all slide images to load
                const imagePromises = Array.from(slides).map(slide => {
                    const img = slide.querySelector('img');
                    if (!img) return Promise.resolve();
                    
                    return new Promise((imgResolve) => {
                        if (img.complete) {
                            if (img.naturalWidth === 0) {
                                // Image failed to load, use default
                                img.src = `${basePrefix}default-image.jpg`;
                            }
                            imgResolve();
                        } else {
                            img.onload = imgResolve;
                            img.onerror = () => {
                                // On error, replace with default image and resolve
                                img.src = `${basePrefix}default-image.jpg`;
                                imgResolve();
                            };
                        }
                    });
                });

                Promise.all(imagePromises).then(resolve);
            } else {
                setTimeout(checkSlides, 100);
            }
        };
        checkSlides();
    });

    // Wait for both window load and slides to be ready
    Promise.all([
        new Promise(resolve => window.addEventListener('load', resolve)),
        slidesLoaded
    ]).then(() => {
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