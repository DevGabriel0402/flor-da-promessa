/**
 * Utility to safely render potentially complex objects (like Firestore Timestamps)
 * or null/undefined values as strings.
 */
export const safeString = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);

    // Handle Firestore Timestamps safely
    if (typeof val === 'object' && val !== null) {
        if ('seconds' in val && 'nanoseconds' in val) {
            try {
                return new Date(val.seconds * 1000).toLocaleString('pt-BR');
            } catch (e) {
                return '';
            }
        }

        // For other objects, we return empty to avoid [object Object] in the UI
        return '';
    }

    return String(val);
};
