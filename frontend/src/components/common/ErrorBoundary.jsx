import React from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import Button from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-muted/30 p-8 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-charcoal mb-3">Oops! Something went wrong.</h1>
            <p className="text-secondary mb-8">
              We encountered an unexpected error while loading this page.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.reload()} className="w-full gap-2 justify-center bg-teal hover:bg-bright">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
              <a href="/dashboard">
                <Button variant="outline" className="w-full gap-2 justify-center">
                  <Home className="w-4 h-4" /> Return to Dashboard
                </Button>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
