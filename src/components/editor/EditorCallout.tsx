import type { ReactNode } from 'react';
import {
  editorCalloutErrorClass,
  editorCalloutErrorTextClass,
  editorCalloutInfoClass,
  editorCalloutInfoTextClass,
  editorCalloutSuccessClass,
  editorCalloutSuccessTextClass,
} from '../../lib/editorStyles';

const CALLOUT_STYLES = {
  info: { box: editorCalloutInfoClass, text: editorCalloutInfoTextClass },
  error: { box: editorCalloutErrorClass, text: editorCalloutErrorTextClass },
  success: { box: editorCalloutSuccessClass, text: editorCalloutSuccessTextClass },
} as const;

export function EditorCallout({
  variant,
  children,
}: {
  variant: keyof typeof CALLOUT_STYLES;
  children: ReactNode;
}) {
  const { box, text } = CALLOUT_STYLES[variant];
  return (
    <div className={box}>
      <p className={text}>{children}</p>
    </div>
  );
}
