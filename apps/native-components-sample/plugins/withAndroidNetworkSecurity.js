/**
 * Android network security for Convex on corporate networks (SSL inspection).
 * Trusts system + user CAs; optional bundled corporate root at assets/certs/corporate-root.crt.
 */
const fs = require('node:fs');
const path = require('node:path');
const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require('@expo/config-plugins');

const CORP_CERT = 'corporate_root.crt';

function buildNetworkSecurityXml({ includeCorpCert }) {
  const corpAnchor = includeCorpCert
    ? `      <certificates src="@raw/${CORP_CERT.replace('.crt', '')}" />\n`
    : '';

  return `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true">
    <trust-anchors>
${corpAnchor}      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </base-config>
  <domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="true">convex.cloud</domain>
    <trust-anchors>
${corpAnchor}      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </domain-config>
  <debug-overrides>
    <trust-anchors>
${corpAnchor}      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </debug-overrides>
</network-security-config>`;
}

/** @param {import('@expo/config-plugins').ExpoConfig} config */
function withAndroidNetworkSecurity(config) {
  const projectRoot = config._internal?.projectRoot ?? process.cwd();
  const corpSource = path.join(projectRoot, 'assets', 'certs', 'corporate-root.crt');
  const includeCorpCert = fs.existsSync(corpSource);

  config = withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return cfg;
  });

  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const xmlDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app/src/main/res/xml',
      );
      const rawDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app/src/main/res/raw',
      );
      await fs.promises.mkdir(xmlDir, { recursive: true });
      await fs.promises.writeFile(
        path.join(xmlDir, 'network_security_config.xml'),
        buildNetworkSecurityXml({ includeCorpCert }),
        'utf8',
      );
      if (includeCorpCert) {
        await fs.promises.mkdir(rawDir, { recursive: true });
        await fs.promises.copyFile(
          corpSource,
          path.join(rawDir, CORP_CERT),
        );
      }
      return cfg;
    },
  ]);

  return config;
}

module.exports = withAndroidNetworkSecurity;
