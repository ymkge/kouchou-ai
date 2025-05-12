import React from "react";

export const AllViewIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="18" cy="6" r="2" fill="currentColor" />
    <circle cx="6" cy="18" r="2" fill="currentColor" />
    <circle cx="18" cy="18" r="2" fill="currentColor" />
  </svg>
);

export const DenseViewIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="3" fill="currentColor" />
    <circle cx="16" cy="8" r="3" fill="currentColor" />
    <circle cx="8" cy="16" r="3" fill="currentColor" />
    <circle cx="16" cy="16" r="3" fill="currentColor" />
  </svg>
);

export const HierarchyViewIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="6" height="6" transform="rotate(-10 4 4)" fill="currentColor" />
    <rect x="14" y="4" width="6" height="6" transform="rotate(-10 14 4)" fill="currentColor" />
    <rect x="9" y="14" width="6" height="6" transform="rotate(-10 9 14)" fill="currentColor" />
  </svg>
);
