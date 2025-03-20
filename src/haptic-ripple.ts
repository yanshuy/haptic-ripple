// haptic-ripple.ts

interface HapticRippleOptions {
    color?: string;
    size?: number;
    duration?: number;
    initialOpacity?: number;
    scale?: number;
}

class HapticRipple {
    private static idCounter = 1;
    private static commonStylesInjected = false;
    private static readonly COMMON_STYLE_ID = "haptic-ripple-common-styles";

    private options: Required<HapticRippleOptions>;
    private styleElement: HTMLStyleElement | null = null;
    private styleId: string;
    private instances: Map<HTMLElement, boolean> = new Map();

    constructor(options: HapticRippleOptions = {}) {
        this.options = {
            color: options.color || "oklab(0.5 0 0)",
            size: options.size || 16,
            duration: options.duration || 300,
            initialOpacity: options.initialOpacity || 0.7,
            scale: options.scale || 4,
        };

        // Generate a unique ID for the instance style
        this.styleId = `haptic-ripple-${HapticRipple.idCounter++}`;

        // Inject common styles if not already done
        if (!HapticRipple.commonStylesInjected) {
            this.injectCommonStyles();
        }

        // Inject instance-specific styles
        this.injectInstanceStyles();
    }

    private injectCommonStyles(): void {
        // Check if already exists
        if (document.getElementById(HapticRipple.COMMON_STYLE_ID)) {
            HapticRipple.commonStylesInjected = true;
            return;
        }

        // Create common stylesheet with shared properties
        const commonStyle = document.createElement("style");
        commonStyle.id = HapticRipple.COMMON_STYLE_ID;
        commonStyle.textContent = `
        .haptic-ripple-base {
          border-radius: 100vw;
          position: absolute;
          aspect-ratio: 1;
          pointer-events: none;
          z-index: -1;
          transform-origin: center;
          will-change: transform, opacity;
        }
      `;
        document.head.appendChild(commonStyle);
        HapticRipple.commonStylesInjected = true;
    }

    private injectInstanceStyles(): void {
        // Remove previous style if exists
        if (this.styleElement) {
            document.head.removeChild(this.styleElement);
        }

        // Create and inject instance-specific stylesheet
        this.styleElement = document.createElement("style");
        this.styleElement.id = this.styleId;
        this.styleElement.textContent = `
        .haptic-ripple-${this.styleId} {
          --haptic-color: ${this.options.color};
          --haptic-size: ${this.options.size}px;
          --haptic-initial-opacity: ${this.options.initialOpacity};
          --haptic-duration: ${this.options.duration}ms;
          --haptic-scale: ${this.options.scale};
          
          height: var(--haptic-size);
          background-color: var(--haptic-color);
        }
      `;
        document.head.appendChild(this.styleElement);
    }

    public create(element: HTMLElement, event: MouseEvent | TouchEvent): void {
        // Prepare container for relative positioning if not already set
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === "static") {
            element.style.position = "relative";
        }

        // Create ripple element
        const haptic = document.createElement("div");
        haptic.className = `haptic-ripple-base haptic-ripple-${this.styleId}`;

        // Get coordinates
        let clientX: number, clientY: number;

        if ("touches" in event) {
            // Touch event
            clientX = (event as TouchEvent).touches[0].clientX;
            clientY = (event as TouchEvent).touches[0].clientY;
        } else {
            // Mouse event
            clientX = (event as MouseEvent).clientX;
            clientY = (event as MouseEvent).clientY;
        }

        // Position the ripple precisely at click position
        const rect = element.getBoundingClientRect();
        const offsetX = this.options.size / 2;

        // Apply position immediately
        Object.assign(haptic.style, {
            left: `${clientX - rect.left - offsetX}px`,
            top: `${clientY - rect.top - offsetX}px`,
            opacity: `${this.options.initialOpacity}`,
            transform: "scale(1)",
        });

        // Append to target element immediately in the current frame
        element.appendChild(haptic);

        // Force reflow to ensure immediate rendering
        haptic.offsetWidth;

        // Start animation in the next frame
        requestAnimationFrame(() => this.animateRipple(haptic));
    }

    private animateRipple(haptic: HTMLElement): void {
        let startTime: number | null = null;

        const animate = (timestamp: number): void => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const computedStyle = getComputedStyle(haptic);
            const duration = this.options.duration;
            const scale = this.options.scale;
            const initialOpacity = this.options.initialOpacity;

            if (progress < duration) {
                const fraction = progress / duration;
                const currentScale = 1 + fraction * scale;

                haptic.style.transform = `scale(${currentScale})`;
                haptic.style.opacity = `${initialOpacity * (1 - fraction)}`;

                requestAnimationFrame(animate);
            } else {
                haptic.remove();
            }
        };

        requestAnimationFrame(animate);
    }

    public updateOptions(options: HapticRippleOptions): void {
        this.options = { ...this.options, ...options };
        this.injectInstanceStyles();
    }

    public enable(selector: string | HTMLElement | HTMLElement[]): void {
        let elements: HTMLElement[];

        if (typeof selector === "string") {
            elements = Array.from(
                document.querySelectorAll(selector)
            ) as HTMLElement[];
        } else if (selector instanceof HTMLElement) {
            elements = [selector];
        } else if (Array.isArray(selector)) {
            elements = selector;
        } else {
            throw new Error(
                "Invalid selector: must be a CSS selector string, HTMLElement, or array of HTMLElements"
            );
        }

        elements.forEach((element) => {
            // Skip if this element already has a ripple from this instance
            if (this.instances.has(element)) {
                return;
            }

            // Mark this element as having this ripple instance
            this.instances.set(element, true);

            // Use touchstart and mousedown for faster response
            const handleMouseDown = (event: MouseEvent) => {
                if (event.button === 0) {
                    // Primary button only
                    this.create(element, event);
                }
            };

            const handleTouchStart = (event: TouchEvent) => {
                this.create(element, event);
            };

            element.addEventListener("mousedown", handleMouseDown);
            element.addEventListener("touchstart", handleTouchStart, {
                passive: true,
            });

            // Store event handlers for potential cleanup
            element._hapticRippleHandlers = element._hapticRippleHandlers || {};
            element._hapticRippleHandlers[this.styleId] = {
                mousedown: handleMouseDown,
                touchstart: handleTouchStart,
            };
        });
    }

    public disable(selector: string | HTMLElement | HTMLElement[]): void {
        let elements: HTMLElement[];

        if (typeof selector === "string") {
            elements = Array.from(
                document.querySelectorAll(selector)
            ) as HTMLElement[];
        } else if (selector instanceof HTMLElement) {
            elements = [selector];
        } else if (Array.isArray(selector)) {
            elements = selector;
        } else {
            throw new Error(
                "Invalid selector: must be a CSS selector string, HTMLElement, or array of HTMLElements"
            );
        }

        elements.forEach((element) => {
            if (
                !element._hapticRippleHandlers ||
                !element._hapticRippleHandlers[this.styleId]
            ) {
                return;
            }

            const handlers = element._hapticRippleHandlers[this.styleId];

            element.removeEventListener("mousedown", handlers.mousedown);
            element.removeEventListener("touchstart", handlers.touchstart);

            delete element._hapticRippleHandlers[this.styleId];
            this.instances.delete(element);
        });
    }
}

// Add a property to HTMLElement for TypeScript
declare global {
    interface HTMLElement {
        _hapticRippleHandlers?: {
            [key: string]: {
                mousedown: (event: MouseEvent) => void;
                touchstart: (event: TouchEvent) => void;
            };
        };
    }
}

// Simple function for quick usage
function createHapticRipple(options?: HapticRippleOptions) {
    const ripple = new HapticRipple(options);

    return {
        enable: (selector: string | HTMLElement | HTMLElement[]): void => {
            ripple.enable(selector);
        },

        disable: (selector: string | HTMLElement | HTMLElement[]): void => {
            ripple.disable(selector);
        },

        update: (newOptions: HapticRippleOptions): void => {
            ripple.updateOptions(newOptions);
        },
    };
}

export { HapticRipple, createHapticRipple, HapticRippleOptions };
