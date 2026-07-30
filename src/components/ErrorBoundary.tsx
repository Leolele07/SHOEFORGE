import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>3D场景加载失败</h3>
            <p>{this.state.error?.message || '发生未知错误'}</p>
            <button onClick={this.handleRetry} className="btn btn-primary btn-md">
              重试
            </button>
          </div>

          <style>{`
            .error-boundary {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: var(--sf-bg-overlay);
              z-index: 20;
            }

            .error-boundary-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: var(--sf-space-8);
              background-color: var(--sf-bg-primary);
              border-radius: var(--sf-radius-xl);
              box-shadow: var(--sf-shadow-xl);
              max-width: 400px;
            }

            .error-boundary-content svg {
              color: var(--sf-color-error);
              margin-bottom: var(--sf-space-4);
            }

            .error-boundary-content h3 {
              font-size: var(--sf-text-lg);
              font-weight: var(--sf-font-semibold);
              color: var(--sf-text-primary);
              margin-bottom: var(--sf-space-2);
            }

            .error-boundary-content p {
              font-size: var(--sf-text-sm);
              color: var(--sf-text-secondary);
              margin-bottom: var(--sf-space-6);
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
