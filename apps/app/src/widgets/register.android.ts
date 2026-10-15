import React from 'react';
import { registerWidgetTaskHandler, type WidgetTaskHandlerProps } from 'react-native-android-widget';
import { CentoWidget } from './CentoWidget';
import { readWidgetSnapshot } from './snapshotStore';

/**
 * Runs headless when a widget is added, resized, or on the periodic refresh. Reads the snapshot the
 * app wrote last and picks today's entry, so the countdown ticks at midnight without the app.
 */
async function handler(props: WidgetTaskHandlerProps) {
  const snapshot = await readWidgetSnapshot().catch(() => null);
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(React.createElement(CentoWidget, {
        snapshot,
        width: props.widgetInfo.width,
        height: props.widgetInfo.height,
      }));
      break;
    default:
      break;
  }
}

export function registerWidgets(): void {
  registerWidgetTaskHandler(handler);
}