import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';
import { AddEntryFAB } from '@/features/add-entry/components/AddEntryFAB';
import { AddEntrySheet } from '@/features/add-entry/components/AddEntrySheet';

export function RootLayout() {
  return (
    <div className="flex flex-col h-[100dvh]">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <AddEntryFAB />
      <AddEntrySheet />
      <BottomNav />
    </div>
  );
}
