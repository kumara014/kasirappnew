/**
 * Haptic Feedback Utility
 * Uses navigator.vibrate() to provide tactile feedback on supported devices.
 */

const canVibrate = () => {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
};

export const haptic = {
    // Light tap for standard buttons like navigation, opening modals
    tap: () => {
        if (canVibrate()) navigator.vibrate(10);
    },

    // Medium tap for selecting items or toggles
    select: () => {
        if (canVibrate()) navigator.vibrate(20);
    },

    // Success vibration (double tap feel)
    success: () => {
        if (canVibrate()) navigator.vibrate([10, 30, 10]);
    },

    // Error or Delete vibration (longer buzz)
    error: () => {
        if (canVibrate()) navigator.vibrate([50, 50, 50]);
    },

    // Impact/Input vibration
    impact: () => {
        if (canVibrate()) navigator.vibrate(15);
    }
};

export default haptic;
