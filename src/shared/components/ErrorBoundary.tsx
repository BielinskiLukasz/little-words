import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-background p-6">
          <h1 className="text-2xl font-bold text-foreground">Little Words</h1>
          {import.meta.env.DEV && (
            <pre className="rounded bg-muted p-4 text-sm text-destructive">
              {this.state.error?.message}
            </pre>
          )}
          {!import.meta.env.DEV && (
            <p className="text-muted-foreground">Something went wrong</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
