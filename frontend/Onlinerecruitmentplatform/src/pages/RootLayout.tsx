import { Outlet } from 'react-router';
import { Navbar } from '../components/Navbar';
import { VantaBackground } from '../components/VantaBackground';
import { ScrollToTop } from '../components/ScrollToTop';
import { Toaster } from 'sonner';

export function RootLayout() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <ScrollToTop />
      <VantaBackground />
      <Navbar />
      <div className="pt-14 sm:pt-16 flex-1">
        <Outlet />
      </div>
      <Toaster position="top-center" closeButton richColors />
    </div>
  );
}
