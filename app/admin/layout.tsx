import AdminNavbar from '@/components/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f0f5]">
      <AdminNavbar />
      <main className="px-6 py-6 max-w-[1400px] mx-auto">{children}</main>
    </div>
  );
}
