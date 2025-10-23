import * as SecureStore from 'expo-secure-store';

// Jednotné jméno klíče pro uložení tokenu
export const TOKEN_KEY = 'authToken';

/**
 * Ověří dostupnost SecureStore (iOS Keychain / Android Keystore).
 * Pokud není k dispozici (např. web), vyhodí srozumitelnou chybu.
 */
export const EnsureAvailable = async () => {

    let available = false;
    try 
    {
        available = await SecureStore.isAvailableAsync();
    } 
    catch (e) 
    {
        available = false;
    }

    if(!available)
        throw new Error('SecureStore is not available on this platform.');
}

/**
 * Uloží (nebo aktualizuje) auth token do SecureStore.
 * Pokud token === null nebo undefined, klíč se smaže.
 * @param {string|null|undefined} token
 */
export const SetAuthToken = async (token) => {

    await EnsureAvailable();

    if (token == null)
    {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        return;
    }
    // Volitelné: přidej options, např. biometrické ověření při čtení
    // const options = { requireAuthentication: true, authenticationPrompt: 'Přihlaste se' };
    await SecureStore.setItemAsync(TOKEN_KEY, String(token));
}

/**
 * Načte auth token ze SecureStore.
 * @returns {Promise<string|null>}
 */

export const GetAuthToken = async () => {
    await EnsureAvailable();
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Smaže auth token ze SecureStore.
 */
export const ClearAuthToken = async () => {
    await EnsureAvailable();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}