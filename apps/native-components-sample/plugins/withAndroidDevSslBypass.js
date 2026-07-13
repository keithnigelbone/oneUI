/**
 * DEBUG ONLY: trust corporate SSL inspection certs for OkHttp + RN WebSocket (Convex).
 * Remove for production — prebuild regenerates MainApplication; this plugin re-applies.
 */
const { withMainApplication } = require('@expo/config-plugins');

const SETUP_CALL = '    DevSslBypass.setup()';
const IMPORT = 'import com.oneui.nativecomponents.DevSslBypass';

const KOTLIN_FILE = `package com.oneui.nativecomponents

import com.facebook.react.modules.network.CustomClientBuilder
import com.facebook.react.modules.network.NetworkingModule
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import com.facebook.react.modules.network.ReactCookieJarContainer
import com.facebook.react.modules.websocket.WebSocketModule
import okhttp3.OkHttpClient
import java.security.SecureRandom
import java.security.cert.X509Certificate
import javax.net.ssl.HostnameVerifier
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

/**
 * Dev-only TLS trust for corporate SSL inspection.
 * Convex uses RN WebSocket → OkHttp via [WebSocketModule], not [OkHttpClientProvider] alone.
 */
object DevSslBypass {
  fun setup() {
    if (!BuildConfig.DEBUG) return

    val trustManager =
      object : X509TrustManager {
        override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}

        override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}

        override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
      }
    val trustAll = arrayOf<TrustManager>(trustManager)
    val ssl = SSLContext.getInstance("TLS")
    ssl.init(null, trustAll, SecureRandom())
    val verifier = HostnameVerifier { _, _ -> true }

    val customBuilder =
      CustomClientBuilder { builder ->
        builder
          .sslSocketFactory(ssl.socketFactory, trustManager)
          .hostnameVerifier(verifier)
      }

    WebSocketModule.setCustomClientBuilder(customBuilder)
    NetworkingModule.setCustomClientBuilder(customBuilder)

    OkHttpClientProvider.setOkHttpClientFactory(
      object : OkHttpClientFactory {
        override fun createNewNetworkModuleClient(): OkHttpClient =
          OkHttpClient.Builder()
            .sslSocketFactory(ssl.socketFactory, trustManager)
            .hostnameVerifier(verifier)
            .cookieJar(ReactCookieJarContainer())
            .build()
      },
    )
  }
}
`;

/** @param {import('@expo/config-plugins').ExpoConfig} config */
function withAndroidDevSslBypass(config) {
  return withMainApplication(config, (cfg) => {
    const fs = require('node:fs');
    const path = require('node:path');
    const projectRoot = cfg.modRequest.projectRoot;
    const kotlinPath = path.join(
      projectRoot,
      'android/app/src/main/java/com/oneui/nativecomponents/DevSslBypass.kt',
    );
    fs.mkdirSync(path.dirname(kotlinPath), { recursive: true });
    fs.writeFileSync(kotlinPath, KOTLIN_FILE, 'utf8');

    let contents = cfg.modResults.contents;
    if (!contents.includes(IMPORT)) {
      contents = contents.replace(
        'import expo.modules.ApplicationLifecycleDispatcher',
        `${IMPORT}\nimport expo.modules.ApplicationLifecycleDispatcher`,
      );
    }
    if (!contents.includes('DevSslBypass.setup()')) {
      contents = contents.replace(
        '    loadReactNative(this)',
        `${SETUP_CALL}\n    loadReactNative(this)`,
      );
    }
    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withAndroidDevSslBypass;
