interface HapticRippleOptions {
    color?: string;
    size?: number;
    duration?: number;
    initialOpacity?: number;
    scale?: number;
    easing?: string;
}
declare class HapticRipple {
    private static idCounter;
    private static commonStylesInjected;
    private static readonly COMMON_STYLE_ID;
    private static lastInteractionTime;
    private static INTERACTION_THRESHOLD;
    private options;
    private styleElement;
    private styleId;
    private instances;
    constructor(options?: HapticRippleOptions);
    private injectCommonStyles;
    private injectInstanceStyles;
    create(element: HTMLElement, event: MouseEvent | TouchEvent): void;
    updateOptions(options: HapticRippleOptions): void;
    enable(selector: string | HTMLElement | HTMLElement[]): void;
    disable(selector: string | HTMLElement | HTMLElement[]): void;
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
declare function createHapticRipple(options?: HapticRippleOptions): {
    enable: (selector: string | HTMLElement | HTMLElement[]) => void;
    disable: (selector: string | HTMLElement | HTMLElement[]) => void;
    update: (newOptions: HapticRippleOptions) => void;
};
export default HapticRipple;
export { HapticRipple, createHapticRipple };
export type { HapticRippleOptions };
