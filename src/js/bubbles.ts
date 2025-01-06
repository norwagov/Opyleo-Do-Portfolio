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
}

export class BubbleLayout {
    private nodes: BubbleNode[] = [];
    private container: HTMLElement;
    private width: number;
    private height: number;
    private centerX: number;
    private centerY: number;
    private isRunning: boolean = false;

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
        text.style.fontSize = `${genre.popularity * 1.5}rem`;
        
        
        bubble.appendChild(text);
        this.container.appendChild(bubble);

        // Initial random position near center
        return {
            element: bubble,
            textElement: text,
            x: this.centerX + (Math.random() - 0.5) * 100,
            y: this.centerY + (Math.random() - 0.5) * 100,
            vx: 0,
            vy: 0,
            radius: genre.popularity * 80,
            genre
        };
        });

        this.isRunning = true;
        this.animate();
        this.updateSizes();
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

        // Apply forces
        this.nodes.forEach(node => {
        // Gravity towards center
        const dx = this.centerX - node.x;
        const dy = this.centerY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            node.vx += (dx / distance) * 0.5;
            node.vy += (dy / distance) * 0.5;
        }

        // Collision avoidance
        this.nodes.forEach(other => {
            if (node === other) return;
            
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (node.radius + other.radius) * 1.2;

            if (distance < minDistance && distance > 0) {
            const angle = Math.atan2(dy, dx);
            const force = (minDistance - distance) * 0.05;
            
            node.vx -= Math.cos(angle) * force;
            node.vy -= Math.sin(angle) * force;
            }
        });

        // Apply velocity with damping
        node.vx *= 0.95;
        node.vy *= 0.95;
        
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Constrain to bounds
        node.x = Math.max(node.radius, Math.min(this.width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(this.height - node.radius, node.y));

        // Update element position
        node.element.style.transform = `translate(${node.x - node.radius}px, ${node.y - node.radius}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }

    public destroy(): void {
        this.isRunning = false;
    }
}
