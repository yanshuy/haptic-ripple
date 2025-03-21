'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// haptic-ripple.ts
class HapticRipple {
    constructor(options = {}) {
        this.styleElement = null;
        this.instances = new Map();
        this.options = {
            color: options.color || "oklab(0.5 0 0)",
            size: options.size || 16,
            duration: options.duration || 300,
            initialOpacity: options.initialOpacity || 0.7,
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
    injectCommonStyles() {
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
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          filter: blur(0.5px);
        }
      `;
        document.head.appendChild(commonStyle);
        HapticRipple.commonStylesInjected = true;
    }
    injectInstanceStyles() {
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
        }
        
        @keyframes haptic-ripple-grow-${this.styleId} {
          0% {
            transform: scale(1);
            opacity: var(--haptic-initial-opacity);
          }
          100% {
            transform: scale(var(--haptic-scale));
            opacity: 0;
          }
        }
      `;
        document.head.appendChild(this.styleElement);
    }
    create(element, event) {
        // Prevent duplicate events (like touchstart followed by mousedown on same spot)
        const now = Date.now();
        if (now - HapticRipple.lastInteractionTime <
            HapticRipple.INTERACTION_THRESHOLD) {
            return;
        }
        HapticRipple.lastInteractionTime = now;
        // Prepare container for relative positioning if not already set
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === "static") {
            element.style.position = "relative";
        }
        // Create ripple element
        const haptic = document.createElement("div");
        haptic.className = `haptic-ripple-base haptic-ripple-${this.styleId}`;
        // Get coordinates
        let clientX, clientY;
        if ("touches" in event) {
            // Touch event
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        }
        else {
            // Mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        }
        // Position the ripple precisely at click position
        const rect = element.getBoundingClientRect();
        const offsetX = this.options.size / 2;
        // Apply position immediately
        Object.assign(haptic.style, {
            left: `${clientX - rect.left - offsetX}px`,
            top: `${clientY - rect.top - offsetX}px`,
            animation: `haptic-ripple-grow-${this.styleId} ${this.options.duration}ms ${this.options.easing} forwards`,
        });
        // Append to target element
        element.appendChild(haptic);
        // Remove the element after animation completes
        setTimeout(() => {
            if (haptic.parentNode === element) {
                element.removeChild(haptic);
            }
        }, this.options.duration);
    }
    updateOptions(options) {
        this.options = Object.assign(Object.assign({}, this.options), options);
        this.injectInstanceStyles();
    }
    enable(selector) {
        let elements;
        if (typeof selector === "string") {
            elements = Array.from(document.querySelectorAll(selector));
        }
        else if (selector instanceof HTMLElement) {
            elements = [selector];
        }
        else if (Array.isArray(selector)) {
            elements = selector;
        }
        else {
            throw new Error("Invalid selector: must be a CSS selector string, HTMLElement, or array of HTMLElements");
        }
        elements.forEach((element) => {
            // Skip if this element already has a ripple from this instance
            if (this.instances.has(element)) {
                return;
            }
            // Mark this element as having this ripple instance
            this.instances.set(element, true);
            // Use a single handler function for both event types
            const handleInteraction = (event) => {
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
            }
            else {
                // For desktop: use mouse events
                element.addEventListener("mousedown", handleInteraction);
            }
            // Store event handlers for potential cleanup
            element._hapticRippleHandlers = element._hapticRippleHandlers || {};
            element._hapticRippleHandlers[this.styleId] = {
                handler: handleInteraction,
                isTouchEnabled: "ontouchstart" in window,
            };
        });
    }
    disable(selector) {
        let elements;
        if (typeof selector === "string") {
            elements = Array.from(document.querySelectorAll(selector));
        }
        else if (selector instanceof HTMLElement) {
            elements = [selector];
        }
        else if (Array.isArray(selector)) {
            elements = selector;
        }
        else {
            throw new Error("Invalid selector: must be a CSS selector string, HTMLElement, or array of HTMLElements");
        }
        elements.forEach((element) => {
            if (!element._hapticRippleHandlers ||
                !element._hapticRippleHandlers[this.styleId]) {
                return;
            }
            const handlers = element._hapticRippleHandlers[this.styleId];
            if (handlers.isTouchEnabled) {
                element.removeEventListener("touchstart", handlers.handler);
            }
            else {
                element.removeEventListener("mousedown", handlers.handler);
            }
            delete element._hapticRippleHandlers[this.styleId];
            this.instances.delete(element);
        });
    }
}
HapticRipple.idCounter = 1;
HapticRipple.commonStylesInjected = false;
HapticRipple.COMMON_STYLE_ID = "haptic-ripple-common-styles";
// Track last interaction time to prevent duplicate events
HapticRipple.lastInteractionTime = 0;
HapticRipple.INTERACTION_THRESHOLD = 100; // ms
// Simple function for quick usage
function createHapticRipple(options) {
    const ripple = new HapticRipple(options);
    return {
        enable: (selector) => {
            ripple.enable(selector);
        },
        disable: (selector) => {
            ripple.disable(selector);
        },
        update: (newOptions) => {
            ripple.updateOptions(newOptions);
        },
    };
}

exports.HapticRipple = HapticRipple;
exports.createHapticRipple = createHapticRipple;
