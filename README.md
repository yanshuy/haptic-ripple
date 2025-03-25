## HapticRipple Overview

HapticRipple is a lightweight JavaScript library for creating customizable ripple effects on UI elements - similar to the material design ripple effect but with more customization options. It enhances tactile feedback for clicks and touches on interactive elements.

## [Live Demo](https://yanshuy.github.io/haptic-ripple/)

### Installation Options

1. **npm/yarn**:

    ```bash
    npm install haptic-ripple
    ```

    or

    ```bash
    yarn add haptic-ripple
    ```

2. **CDN (for direct browser usage)**:

    ```html
    <script src="https://cdn.jsdelivr.net/npm/haptic-ripple/dist/index.umd.js"></script>
    ```

3. **Local download**: Download the UMD build and include it in your project.

### Basic Usage

When using with bundlers:

```javascript
import { createHapticRipple } from "haptic-ripple";

const ripple = createHapticRipple();
ripple.enable("button"); // Apply to all buttons
```

When using via CDN or local UMD file:

```javascript
// Access through the HapticRipple namespace
const ripple = HapticRipple.createHapticRipple({
    color: "rgba(255, 255, 255, 0.7)",
    size: 20,
    duration: 400,
});

ripple.enable("#my-button");
```

## Features

-   🎨 Fully customizable (color, size, duration, opacity, scale, easing)
-   📱 Mobile-first design with touch event support
-   🧩 Simple API with both class and factory function approaches
-   🪄 Multiple independent instances supported
-   🌈 CSS variable integration for theming

### Configuration Options

You can customize the ripple effect with these parameters:

| Property       | Type   | Default        | Description                              |
| -------------- | ------ | -------------- | ---------------------------------------- |
| color          | string | "rgb(0, 0, 0)" | CSS color value (supports CSS variables) |
| size           | number | 16             | Initial ripple diameter in pixels        |
| duration       | number | 300            | Animation duration in milliseconds       |
| initialOpacity | number | 0.3            | Starting opacity (0-1)                   |
| scale          | number | 4              | Growth multiplier during animation       |
| easing         | string | "ease-out"     | CSS animation timing function            |

### Common Use Cases

1. **Basic buttons**:

    ```javascript
    const buttonRipple = createHapticRipple({
        color: "rgba(255, 255, 255, 0.7)",
        size: 20,
    });

    buttonRipple.enable(".my-button");
    ```

2. **Larger UI elements** (cards, panels):

    ```javascript
    // Avoid extreme combinations
    createHapticRipple({
        size: 8, // Too small
        scale: 100, // Excessive scaling
    });
    ```

    ```javascript
    const cardRippleEffect = createHapticRipple({
        color: "rgba(0, 0, 200, 0.3)",
        size: 600,
        duration: 500,
        initialOpacity: 0.125,
        scale: 3,
    });

    cardRippleEffect.enable(".card-container");
    ```

    For larger UI elements like cards or panels, slower animations with larger initial sizes prevents the animation from appearing too aggressive or abrupt.

3. **Using CSS variables for theming**:

    ```css
    :root {
        --primary-ripple-color: rgba(76, 110, 245, 0.7);
        --danger-ripple-color: rgba(250, 82, 82, 0.5);
    }
    ```

    ```javascript
    createHapticRipple({
        color: "var(--primary-ripple-color)",
    }).enable(".primary-action");
    ```

4. **Dynamically updating properties**:

    ```javascript
    const adaptiveRipple = createHapticRipple();

    // Update properties later
    adaptiveRipple.update({
        color: "#ff000080",
        duration: 500,
        scale: 6,
    });
    ```

## API Reference

### createHapticRipple(options?)

Factory function returns controller object:

```typescript
function createHapticRipple(options?: HapticRippleOptions): {
    enable: (selector: string | HTMLElement | HTMLElement[]) => void;
    disable: (selector: string | HTMLElement | HTMLElement[]) => void;
    update: (newOptions: HapticRippleOptions) => void;
};
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
