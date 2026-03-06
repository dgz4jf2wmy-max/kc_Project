import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
          <div className="bg-slate-900 border border-red-500/50 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-red-500/30 bg-red-500/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                应用程序运行时错误
              </h2>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
              >
                刷新页面
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto font-mono text-sm">
              <div className="mb-4">
                <h3 className="text-slate-400 mb-2 text-xs uppercase tracking-wider">Error Message</h3>
                <div className="bg-black/50 p-4 rounded border border-slate-700 text-red-300 break-words">
                  {this.state.error && this.state.error.toString()}
                </div>
              </div>

              {this.state.errorInfo && (
                <div>
                  <h3 className="text-slate-400 mb-2 text-xs uppercase tracking-wider">Component Stack</h3>
                  <div className="bg-black/50 p-4 rounded border border-slate-700 text-slate-300 whitespace-pre-wrap overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-xs text-slate-500 text-center">
              请截图此页面并发送给开发人员以进行修复。
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
