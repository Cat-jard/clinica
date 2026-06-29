import RadiologoNavbar from '@/components/RadiologoNavbar';

export default function RadiologoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f0f5]">
      <RadiologoNavbar />
      {children}
    </div>
  );
}
