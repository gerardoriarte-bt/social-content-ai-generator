import React from 'react';
import { ChevronRightIcon } from './icons';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center text-sm font-medium text-slate-600 mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              )}
              {item.onClick ? (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    item.onClick?.();
                  }}
                  className="hover:text-premium-red-600"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-slate-800 font-semibold">{item.label}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};