// scrollButton.ts

const scrollButton = document.getElementById('scroll-button');
if (scrollButton) {
    scrollButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetSection = document.querySelector('section:nth-of-type(2)') as HTMLElement;
        if (!targetSection) return;

        const config = {
            duration: 1500,
            overscrollHeight: 100,
            speedFactor: 0.8,
            phase1End: 0.6
        };

        const startPosition = window.scrollY;
        const targetPosition = targetSection.offsetTop;
        const distance = targetPosition - startPosition;
        let start: number | null = null;
        let isAnimating = true;

        const scrollHandler = () => {
            if (isAnimating) {
                isAnimating = false;
                window.removeEventListener('wheel', scrollHandler);
                window.removeEventListener('touchmove', scrollHandler);
            }
        };

        window.addEventListener('wheel', scrollHandler, { passive: false });
        window.addEventListener('touchmove', scrollHandler, { passive: false });

        function easeOutCubic(x: number): number {
            return 1 - Math.pow(1 - x, 3);
        }

        function animation(currentTime: number): void {
            if (!isAnimating) return;
            if (start === null) start = currentTime;
            
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / config.duration, 1);

            let currentOffset: number;

            if (progress < config.phase1End) {
                // Going to overscroll position
                const p = progress / config.phase1End;
                const smooth = easeOutCubic(p);
                currentOffset = distance * smooth + (config.overscrollHeight * smooth);
            } else {
                // Returning from overscroll
                const p = (progress - config.phase1End) / (1 - config.phase1End);
                const smooth = 1 - Math.pow(1 - p, 4);
                currentOffset = distance + config.overscrollHeight * (1 - smooth);
            }

            if (progress === 1) {
                currentOffset = distance;
                window.removeEventListener('wheel', scrollHandler);
                window.removeEventListener('touchmove', scrollHandler);
            }

            window.scrollTo({
                top: startPosition + currentOffset,
                behavior: 'auto'
            });

            if (progress < 1 && isAnimating) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    });
}