import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };

type State = { error: Error | null };

/** Surfaces render failures instead of a blank #root (common when a .ts file contains JSX). */
export class QaErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[QA Playground]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            margin: 'var(--Spacing-6)',
            padding: 'var(--Spacing-5)',
            borderRadius: 'var(--Shape-M)',
            border: 'var(--Stroke-M) solid var(--Negative-Stroke-Medium, var(--Border-Subtle))',
            background: 'var(--Surface-Default)',
            fontFamily: 'var(--Typography-Font-Primary)',
            maxWidth: '48rem',
          }}
        >
          <h1
            style={{
              margin: '0 0 var(--Spacing-3)',
              fontSize: 'var(--Title-M-FontSize)',
              lineHeight: 'var(--Title-M-LineHeight)',
              fontWeight: 'var(--Title-M-FontWeight)',
              color: 'var(--Text-High)',
            }}
          >
            QA Playground failed to load
          </h1>
          <p
            style={{
              margin: '0 0 var(--Spacing-4)',
              fontSize: 'var(--Body-S-FontSize)',
              lineHeight: 'var(--Body-S-LineHeight)',
              color: 'var(--Text-Medium)',
            }}
          >
            {this.state.error.message}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--Label-S-FontSize)',
              lineHeight: 'var(--Label-S-LineHeight)',
              color: 'var(--Text-Low)',
            }}
          >
            If you see a Vite error about JSX in a <code>.ts</code> file, delete{' '}
            <code>src/lib/qa/catalogPreviewSupport.ts</code> and restart <code>pnpm dev</code>.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
