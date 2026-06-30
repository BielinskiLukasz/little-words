import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';

export function RootLayout() {
  return (
    <div className="flex flex-col h-[100dvh]">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
