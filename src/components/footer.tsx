"use client";

import type React from 'react';

interface FooterProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTerms, onOpenPrivacy }) => {
  return (
    <footer className="mt-12 border-t bg-card">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} StudyGenius. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <button onClick={onOpenPrivacy} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Privacy Policy
            </button>
            <button onClick={onOpenTerms} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
