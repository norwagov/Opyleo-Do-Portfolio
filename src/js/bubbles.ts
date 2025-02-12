// bubbles.ts

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
    dragOffsetX?: number;
    dragOffsetY?: number;
    popped?: boolean;
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
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        // Define the responsiveness coefficient
        if (this.height < 350) { 
            this.responsivenessCoefficient = 0.6;
        } else if (this.height < 500) {
            this.responsivenessCoefficient = 0.8;
        } else if (this.height < 600) {
            this.responsivenessCoefficient = 0.9;
        }
        else this.responsivenessCoefficient = 1;

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
        this.setupPointerEvents();
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
          // If the node is being dragged, update as usual
          if (node.isDragging) {
            node.element.style.transform = `translate(${node.x - node.radius}px, ${node.y - node.radius}px)`;
            return;
          }
      
          // If the bubble is near the container's edge, pop & respawn it
          const popMargin = 10;
          if (
            !node.popped &&
            (
              (node.x + node.radius < popMargin) ||
              (node.x - node.radius > this.width - popMargin)
            )
          ) {
            this.popAndRespawnBubble(node);
            return; // Skip further updates for this frame
          }
      
          // Store the base position once bubbles settle
          if (Math.abs(node.vx) < 0.01 && Math.abs(node.vy) < 0.01) {
            node.baseX = node.x;
            node.baseY = node.y;
          }
      
          // Apply gravitational pull toward the center
          const dx = this.centerX - node.x;
          const dy = this.centerY - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            node.vx += (dx / distance) * 0.2;
            node.vy += (dy / distance) * 0.2;
          }
      
          // Apply collision resolution (unchanged)
          this.nodes.forEach(other => {
            if (node === other) return;
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (node.radius + other.radius) * 1.2;
            if (distance < minDistance && distance > 0) {
              const angle = Math.atan2(dy, dx);
              const force = (minDistance - distance) * 0.02;
              node.vx -= Math.cos(angle) * force;
              node.vy -= Math.sin(angle) * force;
            }
          });
      
          // Apply damping
          node.vx *= 0.65;
          node.vy *= 0.65;
      
          // Add gentle floating motion
          const floatAmplitude = 2.0;
          const floatFrequency = 0.5;
          const floatX = Math.sin(currentTime * floatFrequency + node.floatOffset) * floatAmplitude;
          const floatY = Math.cos(currentTime * floatFrequency + node.floatOffset) * floatAmplitude;
          node.x += node.vx + floatX * 0.1;
          node.y += node.vy + floatY * 0.1;
      
          // Update bubble position with smooth transition
          node.element.style.transition = 'transform 0.1s ease-out';
          node.element.style.transform = `translate(${node.x - node.radius}px, ${node.y - node.radius}px)`;
        });
      
        requestAnimationFrame(() => this.animate());
      }

    private setupPointerEvents(): void {
        this.nodes.forEach((node) => {
            // Enable pointer events so that both mouse and touch work
            node.element.style.touchAction = 'none';
          
            // Handle pointer down (mouse down / touch start)
            node.element.addEventListener('pointerdown', (event: PointerEvent) => {
              node.isDragging = true;
              // Store the offset between the pointer and the bubble's current position
              node.dragOffsetX = event.clientX - node.x;
              node.dragOffsetY = event.clientY - node.y;
          
              // Optionally, set pointer capture so moves outside the bubble still register
              node.element.setPointerCapture(event.pointerId);
            });
          
            // Handle pointer move (mouse move / touch move)
            window.addEventListener('pointermove', (event: PointerEvent) => {
              if (!node.isDragging) return;
              node.x = event.clientX - node.dragOffsetX!;
              node.y = event.clientY - node.dragOffsetY!;
              node.element.style.transform = `translate(${node.x - node.radius}px, ${node.y - node.radius}px)`;
            });
          
            // Handle pointer up (mouse up / touch end)
            window.addEventListener('pointerup', (event: PointerEvent) => {
              if (node.isDragging) {
                node.isDragging = false;
                node.element.releasePointerCapture(event.pointerId);
              }
            });
          });
    }

    private async popAndRespawnBubble(node: BubbleNode): Promise<void> {
        // Mark as popped so we don't trigger multiple times
        node.popped = true;

        // Set CSS variables for current translation so the pop happens at its current position
        const tx = `${node.x - node.radius}px`;
        const ty = `${node.y - node.radius}px`;
        node.element.style.setProperty('--tx', tx);
        node.element.style.setProperty('--ty', ty);

        // Trigger the pop animation using the keyframes defined above
        node.element.style.animation = 'bubblePop 0.5s ease-in forwards';

        // Wait for the pop animation to complete plus extra delay (total 1.5s)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Calculate a new position near the center with a small random offset
        let newX = this.centerX;
        let newY = this.centerY;
        const offset = 50;  // Maximum random offset
        let tries = 0;
        while (tries < 10) {
          const randomX = newX + (Math.random() - 0.5) * offset;
          const randomY = newY + (Math.random() - 0.5) * offset;
          let collides = false;
          this.nodes.forEach(other => {
            if (other === node || other.popped) return;
            const dx = randomX - other.x;
            const dy = randomY - other.y;
            if (Math.sqrt(dx * dx + dy * dy) < node.radius + other.radius) {
              collides = true;
            }
          });
          if (!collides) {
            newX = randomX;
            newY = randomY;
            break;
          }
          tries++;
        }
        
        // Reset bubble physics
        node.x = newX;
        node.y = newY;
        node.vx = (Math.random() - 0.5) * 2;
        node.vy = (Math.random() - 0.5) * 2;
        
        // Remove the pop animation so it doesn't affect the reappearance
        node.element.style.animation = 'none';
        
        // Position bubble at the new location but at scale 0 (invisible)
        node.element.style.transition = 'none';
        node.element.style.transform = `translate(${node.x - node.radius}px, ${node.y - node.radius}px) scale(0)`;
        node.element.style.opacity = '0';
        
        // Force a reflow so the new style is applied
        void node.element.offsetWidth;

        // Animate reappearing: scale from 0 to 1 and fade in smoothly (leave reappearance as is)
        node.element.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
        node.element.style.transform = `translate(${node.x - node.radius}px, ${node.y - node.radius}px) scale(1)`;
        node.element.style.opacity = '1';
        
        node.popped = false;
    }

    public destroy(): void {
        this.isRunning = false;
    }
}
