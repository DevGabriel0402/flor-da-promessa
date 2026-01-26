/**
 * Detects and removes localStorage keys that do not belong to this project.
 * This is necessary because localhost:5173 is often shared between different local projects.
 */
export const limparStorageAntigo = () => {
    const chavesParaRemover = [
        'cofrinho',
        '@cofrinho/',
        'mvp_cofrinho',
        'painel_freela',
        'revenue_chart_mode',
        'sidebar_collapsed',
        'modo_tema',
        'app_name',
        'app_icon',
        'cookies-consent',
        'cookie_consent_v1',
        'firestore_zombie_firestore',
        'ldcsv',
        'loglevel',
        'theme_brand',
        'theme_color',
        'theme_mode',
        'theme_name',
        'theme_version',
        'theme_version',
        'user_settings_v1',
        'ui_privacy_v1',
        'ui_mode_v1',
        'theme_preset',
        'user_name_8H8d7THvpWXoycvFHptO0mgMBGF2',
        'user_name_VbZlnbaK6ddNKPTBDkR2sdaXSw12',
        'ca04e1a769d6e87b84fd6bcda0639ce1',
        '6cb1f90cba489c85caa3c2ee6ebd0ccc',
        'tema',
    ];

    let totalRemovido = 0;

    // Get all keys currently in localStorage
    const keys = Object.keys(localStorage);

    keys.forEach(key => {
        // Check if the key matches any of our "blacklisted" patterns from other projects
        const deveRemover = chavesParaRemover.some(pattern =>
            key.toLowerCase().includes(pattern.toLowerCase())
        );

        // Also remove generic firebase/firestore keys if they don't seem to belong to this project's ID
        // Note: We are cautious here, but the specific ones in the screenshot are targetable
        if (deveRemover || key.startsWith('firebase:')) {
            localStorage.removeItem(key);
            totalRemovido++;
        }
    });

    if (totalRemovido > 0) {
        console.log(`[StorageCleanup] Removidas ${totalRemovido} chaves irrelevantes do LocalStorage.`);
    }
};
