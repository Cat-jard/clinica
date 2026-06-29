import MedicoNavbar from '@/components/MedicoNavbar';

export default function MedicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f0f5]">
      <MedicoNavbar />
      <main className="px-6 py-6 max-w-[1400px] mx-auto">{children}</main>
    </div>
  );
}
