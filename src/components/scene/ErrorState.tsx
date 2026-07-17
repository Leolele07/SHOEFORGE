import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        {/* 错误图标 */}
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-primary-text mb-2">
          加载失败
        </h3>
        <p className="text-sm text-primary-text-secondary mb-6">
          {message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-primary-accent text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            重新尝试
          </button>
        )}
      </div>
    </div>
  );
};
