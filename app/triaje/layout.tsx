import TriajeNavbar from '@/components/TriajeNavbar';

export default function TriajeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f0f5]">
      <TriajeNavbar />
      <main className="px-6 py-6 max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  );
}
