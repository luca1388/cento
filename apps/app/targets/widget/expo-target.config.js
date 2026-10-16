/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'CentoWidget',
  displayName: 'Cento',
  bundleIdentifier: '.widget',
  deploymentTarget: '17.0',
  colors: {
    $widgetBackground: '#14203F',
    $accent: '#F5C66D',
    primary: '#14203F',
    onPrimary: '#F4E7C2',
    muted: '#A9B3CF',
    flame: '#F5C66D',
  },
  entitlements: {
    'com.apple.security.application-groups': ['group.app.cento'],
  },
};
