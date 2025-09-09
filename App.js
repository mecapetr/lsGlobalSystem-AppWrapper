import { useState,useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';
import { WebViewMessages } from './Functions/webViewMessages';
import { GetAuthToken,ClearAuthToken } from './Functions/auth';
import * as WebBrowser from 'expo-web-browser';
import md5 from 'md5';

export const tokenName = md5("ls_glPo_apttp_!@~`|=-rT98QhmZm713Dhfgk'aL§_-11!§_sys");

// Důležité pro správné uzavření prohlížeče po redirectu
WebBrowser.maybeCompleteAuthSession();

export default function App() {

	const [token, SetToken] = useState(null);
	const webViewRef = useRef(null);

	useEffect(() => {
		const LoadToken = async () => {
			const storedToken = await GetAuthToken();
			if(storedToken)
				SetToken(storedToken);
		};
		LoadToken();
	}, []);
	  
	const injectedJavaScript = `
		(function() {
			if ('${token}') {
				localStorage.setItem('${tokenName}', '${token}');
			}
			else
			{
				localStorage.removeItem('${tokenName}');
				widow.reload();
			}
		})();
		true;
	`;

	const HandleWebViewMessage = async (event) => {
		try 
		{
			const message = JSON.parse(event.nativeEvent.data);
			const result = await WebViewMessages(message);

			if (result?.url && webViewRef.current) 
			{
				const url = result.url;
				var u = new URL(url);
      
                var params = {};
                u.searchParams.forEach(function (v, k) { params[k] = v; });
                
				var code = params.code;

				const js = `
					(function() {
						if(window['onNativeOAuthResult' + '${result.provider}'])
							window['onNativeOAuthResult' + '${result.provider}']({ok:true,code:"${code}",provider:"${result.provider}"});
					})();
					true;
				`;
				webViewRef.current.injectJavaScript(js);
			}
		} 
		catch (error) 
		{
		  	console.log("Chyba při parsování zprávy:", error);
		}
	};

	return (
		<>
			<WebView
				ref={webViewRef}
				style={styles.webView}
				source={{ uri: 'http://localhost:3001' }}
				injectedJavaScript={injectedJavaScript}
				onMessage={HandleWebViewMessage}
			/>
			<StatusBar style="dark" /> 
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	webView: {
		flex: 1,
		marginTop: Constants.statusBarHeight,
	},
});
