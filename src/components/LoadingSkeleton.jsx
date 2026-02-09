import React from 'react';

// Base skeleton component
const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    {...props}
  />
);

// Card skeleton
export const CardSkeleton = ({ count = 1 }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="ml-4 flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Header */}
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-48" />
    </div>
    
    {/* Stats Cards */}
    <CardSkeleton count={4} />
    
    {/* Chart Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton = ({ fields = 4 }) => (
  <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
    <Skeleton className="h-6 w-48 mb-6" />
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <div className="flex justify-end space-x-3 mt-6">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

// List skeleton
export const ListSkeleton = ({ items = 5 }) => (
  <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
    <div className="p-4 border-b border-gray-200">
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="p-4 flex items-center space-x-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
    <div className="flex items-center space-x-6 mb-6">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton = ({ title = true }) => (
  <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
    {title && <Skeleton className="h-6 w-48 mb-4" />}
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <Skeleton className="h-4 w-3/6" />
      <Skeleton className="h-4 w-2/6" />
    </div>
    <Skeleton className="h-32 w-full mt-4" />
  </div>
);

export default Skeleton;