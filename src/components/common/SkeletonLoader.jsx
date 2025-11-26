import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1, className = '' }) => {
  const skeletons = Array(count).fill(0);

  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {skeletons.map((_, index) => {
        if (type === 'card') {
          return (
            <div key={index} className="rounded-2xl bg-white/40 border border-white/30 p-4 h-32 w-full" />
          );
        }
        if (type === 'table-row') {
          return (
            <div key={index} className="flex gap-4 items-center py-3 border-b border-white/10">
              <div className="h-4 w-1/4 bg-gray-300/30 rounded" />
              <div className="h-4 w-1/4 bg-gray-300/30 rounded" />
              <div className="h-4 w-1/4 bg-gray-300/30 rounded" />
              <div className="h-4 w-1/4 bg-gray-300/30 rounded" />
            </div>
          );
        }
        // Default text line
        return <div key={index} className="h-4 bg-gray-300/30 rounded w-full" />;
      })}
    </div>
  );
};

export default SkeletonLoader;
