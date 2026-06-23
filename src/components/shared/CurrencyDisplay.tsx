import React from 'react';
import { formatVND } from '@/lib/format';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
}

export function CurrencyDisplay({ amount, className, ...props }: CurrencyDisplayProps) {
  return (
    <span className={cn('font-mono', className)} {...props}>
      {formatVND(amount)}
    </span>
  );
}
