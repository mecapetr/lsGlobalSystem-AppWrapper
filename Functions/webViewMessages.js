import { 
    SetAuthToken,
    ClearAuthToken
} from "./auth"
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export const WebViewMessages = async (message) => {
          
    if(message.type === 'SAVE_AUTH_TOKEN') 
        await SetAuthToken(message.token); 
    
    if(message.type === 'CLEAR_AUTH_TOKEN') 
        await ClearAuthToken(); 

    if(message.type === 'OPEN_SOCIAL_NETWORK_OAUTH') 
    {
        const url = message?.url;
        if (!url || typeof url !== 'string') return null;

        const appReturnUrl = 'astralportal://auth';
        try 
        {
            const response = await WebBrowser.openAuthSessionAsync(url, appReturnUrl, {
                showInRecents: true,
                enableBarCollapsing: true,
                dismissButtonStyle: 'close',
            });

            const newResponse = {...response,provider: message.provider};
            return newResponse;

            // Výsledek přijde přes Linking listener v App.js po redirectu na astralportal://auth
        } catch (e) {
            console.warn('openAuthSessionAsync selhalo, padám na Linking.openURL:', e);
            try {
                await Linking.openURL(url);
            } catch (e2) {
                console.warn('Nepodařilo se otevřít URL ani přes Linking:', url, e2);
            }
        }
        return null;
    }
}
