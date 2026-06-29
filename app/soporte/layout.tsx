import SoporteNavbar from '@/components/SoporteNavbar';

export default function SoporteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f0f5]">
      <SoporteNavbar />
      <main className="px-6 py-6 max-w-[1400px] mx-auto">{children}</main>
    </div>
  );
}
