interface HapticRippleOptions {
    color?: string;
    size?: number;
    duration?: number;
    initialOpacity?: number;
    scale?: number;
    easing?: string;
}

class HapticRipple {
    private static idCounter = 1;
    private static commonStylesInjected = false;
    private static readonly COMMON_STYLE_ID = "haptic-ripple-common-styles";

    // Track last interaction time to prevent duplicate events
    private static lastInteractionTime = 0;
    private static INTERACTION_THRESHOLD = 100; // ms

    private options: Required<HapticRippleOptions>;
    private styleElement: HTMLStyleElement | null = null;
    private styleId: string;
    private instances: Map<HTMLElement, boolean> = new Map();

    constructor(options: HapticRippleOptions = {}) {
        this.options = {
            color: options.color || "rgba(0, 0, 0",
            size: options.size || 16,
            duration: options.duration || 300,
            initialOpacity: options.initialOpacity || 0.3,
            scale: options.scale || 4,
            easing: options.easing || "ease-out",
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
          border-radius: 50%;
          position: absolute;
          aspect-ratio: 1;
          pointer-events: none;
          z-index: -1;
          transform-origin: center;
          will-change: transform, opacity;
          transition-property: transform, opacity;
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
          --haptic-easing: ${this.options.easing};
          
          height: var(--haptic-size);
          background-color: var(--haptic-color);
          transition-duration: var(--haptic-duration);
          transition-timing-function: var(--haptic-easing);
        }
      `;
        document.head.appendChild(this.styleElement);
    }

    public create(element: HTMLElement, event: MouseEvent | TouchEvent): void {
        // Prevent duplicate events (like touchstart followed by mousedown on same spot)

        const now = Date.now();
        if (
            now - HapticRipple.lastInteractionTime <
            HapticRipple.INTERACTION_THRESHOLD
        ) {
            return;
        }
        HapticRipple.lastInteractionTime = now;

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

        // Apply initial state
        Object.assign(haptic.style, {
            left: `${clientX - rect.left - offsetX}px`,
            top: `${clientY - rect.top - offsetX}px`,
            transform: "scale(1)",
            opacity: `${this.options.initialOpacity}`,
        });

        // Append to target element
        element.appendChild(haptic);

        // Trigger reflow to ensure initial state is applied
        haptic.offsetHeight;

        // Expand ripple
        requestAnimationFrame(() => {
            Object.assign(haptic.style, {
                transform: `scale(${this.options.scale})`,
                opacity: `${this.options.initialOpacity}`,
            });
        });

        const handleInteractionEnd = (event: MouseEvent | TouchEvent) => {
            // Fade out ripple
            Object.assign(haptic.style, {
                opacity: "0",
            });

            // Remove ripple after transition
            setTimeout(() => {
                if (haptic.parentNode === element) {
                    element.removeChild(haptic);
                }
            }, this.options.duration);

            // Remove event listeners
            if ("ontouchstart" in window) {
                element.removeEventListener("touchend", handleInteractionEnd);
                element.removeEventListener(
                    "touchcancel",
                    handleInteractionEnd
                );
            } else {
                element.removeEventListener("mouseup", handleInteractionEnd);
                element.removeEventListener("mouseleave", handleInteractionEnd);
            }
        };

        if ("ontouchstart" in window) {
            element.addEventListener("touchend", handleInteractionEnd, {
                passive: true,
            });
            element.addEventListener("touchcancel", handleInteractionEnd, {
                passive: true,
            });
        } else {
            element.addEventListener("mouseup", handleInteractionEnd, {
                passive: true,
            });
            element.addEventListener("mouseleave", handleInteractionEnd, {
                passive: true,
            });
        }

        element._hapticRippleHandlers = element._hapticRippleHandlers || {};
        element._hapticRippleHandlers[this.styleId].endHandler =
            handleInteractionEnd;
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

            // Prepare container for relative positioning if not already set
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position != "relative") {
                element.style.position = "relative";
            }
            if (computedStyle.isolation != "isolate") {
                element.style.isolation = "isolate";
            }
            element.style.userSelect = "text";

            // Mark this element as having this ripple instance
            this.instances.set(element, true);

            // Use a single handler function for both event types
            const handleInteraction = (event: MouseEvent | TouchEvent) => {
                if ("button" in event && event.button !== 0) {
                    return; // Only handle primary mouse button
                }
                this.create(element, event);
            };

            // For mobile: prioritize touch events
            if ("ontouchstart" in window) {
                element.addEventListener("touchstart", handleInteraction, {
                    passive: true,
                });
                //@ts-ignore
                element.style["-webkit-tap-highlight-color"] = "transparent";
            } else {
                // For desktop: use mouse events
                element.addEventListener("mousedown", handleInteraction, {
                    passive: true,
                });
            }

            // Store event handlers for potential cleanup
            element._hapticRippleHandlers = element._hapticRippleHandlers || {};
            element._hapticRippleHandlers[this.styleId] = {
                startHandler: handleInteraction,
                endHandler: null!,
                isTouchEnabled: "ontouchstart" in window,
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

            if (handlers.isTouchEnabled) {
                element.removeEventListener(
                    "touchstart",
                    handlers.startHandler
                );
                element.removeEventListener("touchstart", handlers.endHandler);
            } else {
                element.removeEventListener("mousedown", handlers.startHandler);
                element.removeEventListener("mousedown", handlers.endHandler);
            }

            delete element._hapticRippleHandlers[this.styleId];
            this.instances.delete(element);
        });
    }
}

declare global {
    interface HTMLElement {
        _hapticRippleHandlers?: {
            [key: string]: {
                startHandler: (event: MouseEvent | TouchEvent) => void;
                endHandler: (event: MouseEvent | TouchEvent) => void;
                isTouchEnabled: boolean;
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

export default HapticRipple;
export { HapticRipple, createHapticRipple };

export type { HapticRippleOptions };
