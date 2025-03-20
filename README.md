# HapticRipple

A lightweight TypeScript library that adds customizable ripple effects to UI elements, enhancing tactile feedback for clicks and touches.

## Features

-   ✨ Smooth, performant ripple animations
-   🎨 Fully customizable (color, size, duration, opacity, scale)
-   📱 Works with both mouse and touch events
-   🧩 Simple API with both class and factory function approaches
-   🔄 Update options on the fly
-   🪄 Multiple instances with different settings possible
-   🌈 Supports CSS variables for theming

## Live Demo

Check out the [live demo](https://yanshuy.github.io/haptic-ripple/) to see HapticRipple in action with various configurations.

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

// Create a ripple effect with default settings
const ripple = createHapticRipple();

// Apply it to all buttons
ripple.enable("button");
```

## Advanced Configuration

```javascript
import { createHapticRipple } from "haptic-ripple";

// Create a ripple with custom options
const ripple = createHapticRipple({
    color: "rgb(76, 110, 245, 0.7)", // Color with opacity
    size: 20, // Size in pixels
    duration: 400, // Animation duration in ms
    initialOpacity: 0.3, // Starting opacity
    scale: 5, // How much the ripple grows
});

// Apply to specific elements
ripple.enable("#my-button");
ripple.enable(document.querySelector(".card"));
ripple.enable(document.querySelectorAll(".interactive"));
```

## Using CSS Variables

You can use CSS variables for seamless integration with your design system:

```html
<style>
    :root {
        --ripple-blue: rgb(201, 225, 255);
        --ripple-red: rgb(255, 201, 201);
    }

    .primary-button {
        background-color: #4c6ef5;
        color: white;
    }

    .danger-button {
        background-color: #fa5252;
        color: white;
    }
</style>

<script>
    // Create ripple effect using CSS variable for primary button
    createHapticRipple({
        color: "var(--ripple-blue)",
        size: 24,
        duration: 300,
    }).enable(".primary-button");

    // Different ripple effect for danger button
    createHapticRipple({
        color: "var(--ripple-red)",
        size: 24,
        duration: 300,
    }).enable(".danger-button");
</script>
```

This approach allows you to maintain consistent theming throughout your application.

## Balancing Size and Scale

When configuring HapticRipple, it's important to balance the `size` and `scale` properties to achieve the best visual results:

⚠️ **Important**: Using a small `size` with a large `scale` can cause distorted or pixelated ripple effects. The circle may appear stretched or unnatural when scaled too aggressively relative to its initial size.

### Recommended Configurations:

```javascript
// Good balance - subtle effect
createHapticRipple({
    size: 20,
    scale: 4,
    initialOpacity: 0.5,
}).enable(".subtle-buttons");

// Good balance - more pronounced effect
createHapticRipple({
    size: 30,
    scale: 6,
    initialOpacity: 0.6,
}).enable(".prominent-buttons");

// Lower opacity for a more subtle effect
createHapticRipple({
    size: 25,
    scale: 5,
    initialOpacity: 0.3, // Lower opacity for subtlety
    color: "rgba(100, 100, 100, 0.4)",
}).enable(".ghost-buttons");
```

### Avoid:

```javascript
// Potentially problematic - small size with excessive scale
createHapticRipple({
    size: 8, // Too small
    scale: 15, // Too much scaling
    duration: 300,
}).enable(".problematic-example");
```

## API Reference

### `createHapticRipple(options?)`

Factory function that creates and returns a haptic ripple controller.

#### Options

| Property         | Type   | Default          | Description                                                                            |
| ---------------- | ------ | ---------------- | -------------------------------------------------------------------------------------- |
| `color`          | string | "oklab(0.5 0 0)" | Color of the ripple effect. Supports any valid CSS color value including CSS variables |
| `size`           | number | 16               | Size of the ripple in pixels                                                           |
| `duration`       | number | 300              | Duration of the animation in milliseconds                                              |
| `initialOpacity` | number | 0.7              | Initial opacity of the ripple (0-1)                                                    |
| `scale`          | number | 4                | How much the ripple grows from its initial size                                        |

#### Methods

-   `enable(selector)`: Apply ripple effect to elements
-   `disable(selector)`: Remove ripple effect from elements
-   `update(options)`: Update ripple options

### `HapticRipple` Class

For more control, you can use the class directly:

```javascript
import { HapticRipple } from "haptic-ripple";

const ripple = new HapticRipple({
    color: "rgba(76, 110, 245, 0.7)",
    size: 16,
    duration: 300,
    initialOpacity: 0.7,
    scale: 4,
});

ripple.enable(".my-elements");
ripple.updateOptions({ color: "rgba(255, 0, 0, 0.5)" });
ripple.disable(".my-elements");
```

## Examples

### Basic Button with Ripple

```html
<button class="btn-primary">Click Me</button>

<script>
    import { createHapticRipple } from "haptic-ripple";

    createHapticRipple({
        color: "rgba(255, 255, 255, 0.7)",
        size: 20,
    }).enable(".btn-primary");
</script>
```

### Subtle Low-Opacity Examples

```html
<button class="subtle-btn">Subtle Effect</button>
<div class="ghost-card">Ghost Card</div>

<script>
    import { createHapticRipple } from "haptic-ripple";

    // Subtle button ripple with low opacity
    createHapticRipple({
        color: "rgba(100, 100, 255, 0.3)", // Very transparent blue
        size: 24,
        duration: 400,
        initialOpacity: 0.25, // Very low starting opacity
        scale: 4,
    }).enable(".subtle-btn");

    // Ghost card with almost invisible ripple
    createHapticRipple({
        color: "rgba(200, 200, 200, 0.2)", // Very light gray, highly transparent
        size: 30,
        duration: 500,
        initialOpacity: 0.2,
        scale: 5,
    }).enable(".ghost-card");
</script>
```

### Interactive Cards

```html
<div class="card" id="card-1">Card content</div>
<div class="card" id="card-2">Card content</div>

<script>
    import { createHapticRipple } from "haptic-ripple";

    const cardRipple = createHapticRipple({
        color: "rgba(76, 110, 245, 0.7)",
        size: 16,
        duration: 300,
    });

    cardRipple.enable(".card");

    // Later, update the effect
    cardRipple.update({
        color: "rgba(52, 199, 89, 0.6)",
        duration: 400,
    });
</script>
```

### Using Multiple Ripple Instances

```javascript
// Button ripple effect
const btnRipple = createHapticRipple({
    color: "rgba(255, 255, 255, 0.7)",
    size: 16,
});
btnRipple.enable("button");

// Card ripple effect with different settings
const cardRipple = createHapticRipple({
    color: "rgba(76, 110, 245, 0.5)",
    size: 24,
    duration: 500,
});
cardRipple.enable(".card");
```

## Browser Support

HapticRipple works in all modern browsers that support ES6 and CSS transforms.

## License

MIT
