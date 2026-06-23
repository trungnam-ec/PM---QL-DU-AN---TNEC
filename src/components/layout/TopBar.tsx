import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="relative hidden lg:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
          <Input
            type="search"
            placeholder="Tìm kiếm dự án, hợp đồng..."
            className="w-full bg-surface-50 border-surface-200 pl-9 h-8 text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-lg"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </Button>
      </div>
    </header>
  );
}
