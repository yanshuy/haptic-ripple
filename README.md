# HapticRipple

A lightweight library that adds customizable ripple effects to UI elements, enhancing tactile feedback for clicks and touches.

## [Live Demo](https://yanshuy.github.io/haptic-ripple/)

## Installation

```bash
npm install haptic-ripple
```

or

```bash
yarn add haptic-ripple
```

## Basic Usage

```javascript
import { createHapticRipple } from "haptic-ripple";

const ripple = createHapticRipple();
ripple.enable("button"); // Apply to all buttons
```

### Optimal Element Setup

For best results, add these styles to your interactive elements:

```css
button,
interactive-element {
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
}
```

`-webkit-tap-highlight-color: transparent;` is added by default on touch devices

#### Why -webkit-tap-highlight-color?

This property removes the default mobile browser highlight that can interfere with
the ripple animation. Our custom ripple can provide superior visual feedback while
maintaining accessibility.

## Features

-   ✨ Smooth, performant ripple animations using CSS transforms
-   🎨 Fully customizable (color, size, duration, opacity, scale, easing)
-   📱 Mobile-first design with touch event support
-   🧩 Simple API with both class and factory function approaches
-   🪄 Multiple independent instances supported
-   🌈 CSS variable integration for theming

## Configuration Options

| Property       | Type   | Default          | Description                              |
| -------------- | ------ | ---------------- | ---------------------------------------- |
| color          | string | "oklab(0.5 0 0)" | CSS color value (supports CSS variables) |
| size           | number | 16               | Initial ripple diameter in pixels        |
| duration       | number | 300              | Animation duration in milliseconds       |
| initialOpacity | number | 0.7              | Starting opacity (0-1)                   |
| scale          | number | 4                | Growth multiplier during animation       |
| easing         | string | "ease-out"       | CSS animation timing function            |

## Advanced Usage

```javascript
const customRipple = createHapticRipple({
    color: "rgba(76, 110, 245, 0.7)",
    size: 24,
    duration: 400,
    initialOpacity: 0.3,
    scale: 5,
});

// Apply to multiple element types
customRipple.enable("#main-button");
customRipple.enable(document.querySelectorAll(".card"));
```

### Large Element Animation Tuning

For larger UI elements like cards or panels, slower animations with larger initial sizes create a more visually pleasing effect:

```javascript
// Perfect for cards or large touch surfaces
const cardRippleEffect = createHapticRipple({
    color: "rgba(76, 110, 245, 0.7)",
    size: 250,
    duration: 800, // Slower duration for smoother expansion
    initialOpacity: 0.125, // Lower opacity for subtle effect
    scale: 8,
});

cardRippleEffect.enable(".card-container");
```

This configuration creates a ripple effect that feels appropriate for the larger surface area, preventing the animation from appearing too aggressive or abrupt.

### Size/Scale Balance Guide

Achieve optimal visual quality by balancing these properties:

```javascript
// Ideal configuration
createHapticRipple({
    size: 24, // Medium initial size
    scale: 4, // Moderate growth
    initialOpacity: 0.4,
});

// Avoid extreme combinations
createHapticRipple({
    size: 8, // Too small
    scale: 100, // Excessive scaling
});
```

**Recommended Ranges:**

-   Size: 16-48px
-   Scale: 2-8x
-   Opacity: 0.2-0.7

## Dynamic Updates

Modify ripple properties:

```javascript
const adaptiveRipple = createHapticRipple();

// Update multiple properties
adaptiveRipple.update({
    color: "#ff000080",
    duration: 500,
    scale: 6,
});
```

## Theming with CSS Variables

```css
:root {
    --primary-ripple-color: rgba(76, 110, 245, 0.7);
    --danger-ripple-color: rgba(250, 82, 82, 0.5);
}

.danger-ripple {
    background-color: var(--danger-ripple-color);
}
```

```javascript
createHapticRipple({
    color: "var(--primary-ripple-color)",
}).enable(".primary-action");

createHapticRipple({
    color: "var(--danger-ripple-color)",
}).enable(".danger-action");
```

## API Reference

### createHapticRipple(options?)

Factory function returns controller object:

```typescript
interface HapticController {
    enable(selector: string | HTMLElement | HTMLElement[]): void;
    disable(selector: string | HTMLElement | HTMLElement[]): void;
    update(options: Partial<HapticRippleOptions>): void;
}
```

### Class API

```typescript
import { HapticRipple } from "haptic-ripple";

const ripple = new HapticRipple(options);
ripple.enable(".elements");
ripple.updateOptions(newOptions);
ripple.disable("#specific-element");
```

## Troubleshooting

**Ripple Not Visible?**

-   Check z-index conflicts
-   Verify parent has position: relative
-   Ensure no overflow:hidden is obscuring the effect
-   Confirm element isn't disabled

**Mobile Issues**

```css
/* Add to interactive elements */
touch-action: manipulation;
```

## Browser Support

Works in all modern browsers

## License

MIT License
