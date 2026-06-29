import RecepcionistaNavbar from '@/components/RecepcionistaNavbar';

export default function RecepcionistaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f0f5]">
      <RecepcionistaNavbar />
      <main className="px-6 py-6 max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  );
}
