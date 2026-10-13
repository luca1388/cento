/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'CentoWidget',
  displayName: 'Cento',
  bundleIdentifier: '.widget',
  deploymentTarget: '17.0',
  colors: {
    $widgetBackground: '#10213f',
    $accent: '#f6e7b8',
    primary: '#10213f',
    onPrimary: '#f6e7b8',
    muted: '#a9b0c6',
    flame: '#f0a93b',
  },
  entitlements: {
    'com.apple.security.application-groups': ['group.app.cento'],
  },
};
