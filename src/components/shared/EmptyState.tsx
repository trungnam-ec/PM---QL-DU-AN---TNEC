import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-surface-200 rounded-xl bg-white text-center">
      <div className="w-12 h-12 bg-surface-50 text-surface-400 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-medium text-surface-900 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 mb-6 max-w-sm">{description}</p>
      
      {action && action.href && (
        <Link href={action.href}>
          <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">{action.label}</Button>
        </Link>
      )}
      {action && action.onClick && (
        <Button onClick={action.onClick} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
          {action.label}
        </Button>
      )}
      {action && !action.href && !action.onClick && (
        <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">
          {action.label}
        </Button>
      )}
    </div>
  );
}
