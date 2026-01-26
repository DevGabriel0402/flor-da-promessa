import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { saveToStorage, loadFromStorage } from '../utils/persistence';

/**
 * Hook to persist and restore scroll position based on the current location.
 */
export const useScrollRestoration = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Restore scroll position when pathname changes
        const savedPosition = loadFromStorage(`scroll_${pathname}`, 0);
        window.scrollTo(0, savedPosition);

        const handleScroll = () => {
            // Save scroll position with a slight debounce or just on scroll
            saveToStorage(`scroll_${pathname}`, window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);
};
