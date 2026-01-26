const PREFIX = 'fp_';

/**
 * Saves data to localStorage with a project-specific prefix.
 * @param {string} key
 * @param {any} value
 */
export const saveToStorage = (key, value) => {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(PREFIX + key, serializedValue);
    } catch (e) {
        console.error(`Error saving to storage [${key}]:`, e);
    }
};

/**
 * Loads data from localStorage with a project-specific prefix.
 * @param {string} key
 * @param {any} defaultValue
 * @returns {any}
 */
export const loadFromStorage = (key, defaultValue = null) => {
    try {
        const serializedValue = localStorage.getItem(PREFIX + key);
        if (serializedValue === null) return defaultValue;
        return JSON.parse(serializedValue);
    } catch (e) {
        console.warn(`Error loading from storage [${key}]. Returning default.`, e);
        return defaultValue;
    }
};

/**
 * Removes a specific key from localStorage.
 */
export const removeFromStorage = (key) => {
    localStorage.removeItem(PREFIX + key);
};
