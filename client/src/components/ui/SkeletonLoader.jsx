import React from 'react';

export default function SkeletonLoader({ variant = 'single-card' }) {
  if (variant === 'stat-cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-5 h-[100px] flex flex-col justify-center gap-3">
            <div className="animate-pulse bg-slate-200 rounded w-[40%] h-[12px]"></div>
            <div className="animate-pulse bg-slate-200 rounded w-[70%] h-[10px]"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="w-full bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-200 rounded h-[12px] w-full"></div>
          ))}
        </div>
        <div>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div 
              key={rowIndex} 
              className={`grid grid-cols-5 gap-4 px-4 py-4 border-b border-[#E2E8F0] ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
            >
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="animate-pulse bg-slate-200 rounded h-[12px] w-full"
                  style={{ animationDelay: `${rowIndex * 75}ms` }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'case-cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 h-[140px] flex flex-col justify-between">
            <div className="animate-pulse bg-slate-200 rounded w-[60%] h-[14px]"></div>
            <div className="animate-pulse bg-slate-200 rounded-full w-[80px] h-[20px] my-2"></div>
            <div className="space-y-2 mt-auto">
              <div className="animate-pulse bg-slate-200 rounded w-[40%] h-[10px]"></div>
              <div className="animate-pulse bg-slate-200 rounded w-[50%] h-[10px]"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'calendar') {
    return (
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 42 }).map((_, i) => {
          const hasPill1 = i % 3 === 0;
          const hasPill2 = i % 5 === 0;
          return (
            <div key={i} className="min-h-[80px] bg-white border border-[#E2E8F0] rounded-md p-1 flex flex-col gap-1">
              <div className="animate-pulse bg-slate-200 rounded-full w-[24px] h-[24px]"></div>
              {hasPill1 && <div className="animate-pulse bg-slate-200 rounded w-full h-[12px]"></div>}
              {hasPill2 && <div className="animate-pulse bg-slate-200 rounded w-3/4 h-[12px]"></div>}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className="animate-pulse bg-slate-200 rounded-full w-[12px] h-[12px] shrink-0"></div>
            <div className="animate-pulse bg-slate-200 rounded w-[70%] h-[12px]"></div>
            <div className="animate-pulse bg-slate-200 rounded w-[30%] h-[12px] ml-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  // default: single-card
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 w-full">
      <div className="animate-pulse bg-slate-200 rounded w-[30%] h-[20px] mb-6"></div>
      <div className="space-y-3 mb-6">
        <div className="animate-pulse bg-slate-200 rounded w-full h-[12px]"></div>
        <div className="animate-pulse bg-slate-200 rounded w-full h-[12px]"></div>
        <div className="animate-pulse bg-slate-200 rounded w-[90%] h-[12px]"></div>
      </div>
      <div className="animate-pulse bg-slate-200 rounded w-[50%] h-[16px]"></div>
    </div>
  );
}
