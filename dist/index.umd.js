(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.HapticRipple = {}));
})(this, (function (exports) { 'use strict';

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
          
          height: var(--haptic-size);
          background-color: var(--haptic-color);
        }
      `;
            document.head.appendChild(this.styleElement);
        }
        create(element, event) {
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
        animateRipple(haptic) {
            let startTime = null;
            const animate = (timestamp) => {
                if (!startTime)
                    startTime = timestamp;
                const progress = timestamp - startTime;
                getComputedStyle(haptic);
                const duration = this.options.duration;
                const scale = this.options.scale;
                const initialOpacity = this.options.initialOpacity;
                if (progress < duration) {
                    const fraction = progress / duration;
                    const currentScale = 1 + fraction * scale;
                    haptic.style.transform = `scale(${currentScale})`;
                    haptic.style.opacity = `${initialOpacity * (1 - fraction)}`;
                    requestAnimationFrame(animate);
                }
                else {
                    haptic.remove();
                }
            };
            requestAnimationFrame(animate);
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
                // Use touchstart and mousedown for faster response
                const handleMouseDown = (event) => {
                    if (event.button === 0) {
                        // Primary button only
                        this.create(element, event);
                    }
                };
                const handleTouchStart = (event) => {
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
                element.removeEventListener("mousedown", handlers.mousedown);
                element.removeEventListener("touchstart", handlers.touchstart);
                delete element._hapticRippleHandlers[this.styleId];
                this.instances.delete(element);
            });
        }
    }
    HapticRipple.idCounter = 1;
    HapticRipple.commonStylesInjected = false;
    HapticRipple.COMMON_STYLE_ID = "haptic-ripple-common-styles";
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

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
