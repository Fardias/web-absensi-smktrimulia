import React from 'react';

const Loading = ({ 
  size = 'large', 
  text = 'Memuat...', 
  fullScreen = true,
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const LoadingSpinner = () => (
    <div className="text-center">
      <div className={`animate-spin rounded-full border-b-2 border-[#003366] mx-auto ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-600">{text}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <LoadingSpinner />;
};

// Button loading state
export const LoadingButton = ({ 
  loading, 
  children, 
  className = "", 
  disabled,
  ...props 
}) => (
  <button
    className={`relative ${className} ${loading ? 'cursor-not-allowed opacity-75' : ''}`}
    disabled={loading || disabled}
    {...props}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      </div>
    )}
    <span className={loading ? 'invisible' : 'visible'}>
      {children}
    </span>
  </button>
);

export default Loading;
