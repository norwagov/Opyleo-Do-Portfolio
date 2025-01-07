export interface Genre {
    name: string;
    popularity: number;
}

interface BubbleNode {
    element: HTMLElement;
    textElement: HTMLElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    genre: Genre;
    isDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    baseX: number;    // Add base position to track original settling point
    baseY: number;
    floatOffset: number;  // Individual offset for asynchronous movement
}

export class BubbleLayout {
    private nodes: BubbleNode[] = [];
    private container: HTMLElement;
    private width: number;
    private height: number;
    private centerX: number;
    private centerY: number;
    private isRunning: boolean = false;
    private responsivenessCoefficient: number;
    private draggedNode: BubbleNode | null = null;

    constructor(containerId: string, private genres: Genre[]) {
        const containerElement = document.getElementById(containerId);
        if (!containerElement) throw new Error('Container element not found');
        this.container = containerElement;
        
        // Initialize dimensions
        const rect = this.container.getBoundingClientRect();
        console.log("Width of the container: ", rect.width);
        console.log("Height of the container: ", rect.height);
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        // Define the responsiveness coefficient
        if (this.width < 500) {
            this.responsivenessCoefficient = 0.80;
        } else if (this.width < 1000) {
            this.responsivenessCoefficient = 0.90;
        }
        else {
            this.responsivenessCoefficient = 1;
        }

        this.initialize();
        this.setupResizeListener();
    }

    private initialize(): void {
        // Clear existing bubbles
        this.container.innerHTML = '';

        // Create bubble elements
        this.nodes = this.genres.map((genre, index) => {
        const bubble = document.createElement('div');
        bubble.className = 'genre-bubble';
        
        const text = document.createElement('div');
        text.className = 'genre-bubble-text';
        text.textContent = genre.name;
        text.style.fontSize = `${genre.popularity * 1.5 * this.responsivenessCoefficient}rem`;
        
        
        bubble.appendChild(text);
        this.container.appendChild(bubble);
        
        // Add touch events for mobile
        bubble.addEventListener('touchstart', (e) => this.handleTouchStart(e, index));
        bubble.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        bubble.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Initial random position near center
        return {
            element: bubble,
            textElement: text,
            x: this.centerX + (Math.random() - 0.5) * 100,
            y: this.centerY + (Math.random() - 0.5) * 100,
            vx: 0,
            vy: 0,
            radius: genre.popularity * 80 * this.responsivenessCoefficient,
            genre,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            baseX: 0,
            baseY: 0,
            floatOffset: Math.random() * Math.PI * 2 // Random starting phase
        };
        });

        this.isRunning = true;
        this.animate();
        this.updateSizes();
    }

    private handleTouchStart(e: TouchEvent, index: number) {
        e.preventDefault();
        const touch = e.touches[0];
        this.draggedNode = this.nodes[index];
        this.draggedNode.isDragging = true;
        this.draggedNode.dragStartX = touch.clientX - this.draggedNode.x;
        this.draggedNode.dragStartY = touch.clientY - this.draggedNode.y;
        
        // Stop any current movement
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
    }

    private handleTouchMove(e: TouchEvent) {
        e.preventDefault();
        if (!this.draggedNode) return;

        const touch = e.touches[0];
        this.draggedNode.x = touch.clientX - this.draggedNode.dragStartX;
        this.draggedNode.y = touch.clientY - this.draggedNode.dragStartY;

        // Keep bubble within bounds
        this.draggedNode.x = Math.max(
            this.draggedNode.radius,
            Math.min(this.width - this.draggedNode.radius, this.draggedNode.x)
        );
        this.draggedNode.y = Math.max(
            this.draggedNode.radius,
            Math.min(this.height - this.draggedNode.radius, this.draggedNode.y)
        );
    }

    private handleTouchEnd() {
        if (this.draggedNode) {
            this.draggedNode.isDragging = false;
            this.draggedNode = null;
        }
    }

    private setupResizeListener(): void {
        let resizeTimeout: number | undefined;
        
        window.addEventListener('resize', () => {
        if (resizeTimeout) {
            window.clearTimeout(resizeTimeout);
        }
        
        resizeTimeout = window.setTimeout(() => {
            const rect = this.container.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.centerX = this.width / 2;
            this.centerY = this.height / 2;
        }, 100);
        });
    }

    private updateSizes(): void {
        this.nodes.forEach(node => {
        const size = node.radius * 2;
        node.element.style.width = `${size}px`;
        node.element.style.height = `${size}px`;
        });
    }

    private animate(): void {
        if (!this.isRunning) return;

        const currentTime = Date.now() / 1000;  // Time in seconds

        this.nodes.forEach(node => {
            if (node.isDragging) {
                node.element.style.transform = `translate(${node.x - node.radius}px, ${node.y - node.radius}px)`;
                return;
            }

            // Store base position once bubbles settle
            if (Math.abs(node.vx) < 0.01 && Math.abs(node.vy) < 0.01) {
                node.baseX = node.x;
                node.baseY = node.y;
            }

            // Reduce gravity force (from 0.5 to 0.2)
            const dx = this.centerX - node.x;
            const dy = this.centerY - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                node.vx += (dx / distance) * 0.2;  // Reduced from 0.5
                node.vy += (dy / distance) * 0.2;  // Reduced from 0.5
            }

            // Reduce collision force (from 0.05 to 0.02)
            this.nodes.forEach(other => {
                if (node === other) return;
                
                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (node.radius + other.radius) * 1.2;

                if (distance < minDistance && distance > 0) {
                    const angle = Math.atan2(dy, dx);
                    const force = (minDistance - distance) * 0.02;  // Reduced from 0.05
                    
                    node.vx -= Math.cos(angle) * force;
                    node.vy -= Math.sin(angle) * force;
                }
            });

            // Increase damping (from 0.95 to 0.98)
            node.vx *= 0.65;  // Increased from 0.95
            node.vy *= 0.65;  // Increased from 0.95
            
            // Add gentle floating motion
            const floatAmplitude = 2.0;  // Adjust for more/less movement
            const floatFrequency = 0.5;  // Adjust for faster/slower cycles
            
            const floatX = Math.sin(currentTime * floatFrequency + node.floatOffset) * floatAmplitude;
            const floatY = Math.cos(currentTime * floatFrequency + node.floatOffset) * floatAmplitude;

            // Combine physics and floating movement
            node.x += node.vx + floatX * 0.1;  // Scale down float effect
            node.y += node.vy + floatY * 0.1;

            // Add smooth transition to the element's transform
            node.element.style.transition = 'transform 0.1s ease-out';
            node.element.style.transform = `translate(${node.x - node.radius}px, ${node.y - node.radius}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }

    public destroy(): void {
        this.isRunning = false;
    }
}
