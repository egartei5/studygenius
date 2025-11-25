"use client";

import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl shadow-lg">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-foreground">Generating your study materials...</p>
      <p className="text-sm text-muted-foreground">This might take a moment.</p>
    </div>
  );
};
