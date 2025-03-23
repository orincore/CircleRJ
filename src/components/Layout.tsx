import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pb-16">
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}