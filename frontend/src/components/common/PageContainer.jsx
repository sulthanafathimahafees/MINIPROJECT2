import React from 'react';

/**
 * Reusable Global Page Container for OptiBuy
 * Enforces standardized max-width (1440px), responsive horizontal padding, and centering.
 */
const PageContainer = ({ children, className = '', maxWidth = 'max-w-[1440px]' }) => {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 md:px-8 lg:px-10 box-border ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
