import { Search, Bell } from 'lucide-react';

const NAV_LINKS = ['Patients', 'Appointments', 'Doctors / Staff', 'Lab', 'Reports'];

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 px-8 h-16 flex items-center justify-between sticky top-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M12 2L9.5 8.5H3L8.5 12.5L6.5 19L12 15L17.5 19L15.5 12.5L21 8.5H14.5L12 2Z" />
          </svg>
        </div>
        <span className="text-[17px] font-bold text-gray-900 tracking-tight">Hlthare</span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-0.5">
        <button className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
          Dashboard
        </button>
        {NAV_LINKS.map((link) => (
          <button
            key={link}
            className="px-4 py-2 text-gray-500 text-sm font-medium rounded-full hover:text-gray-800 hover:bg-gray-50 transition-colors"
          >
            {link}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 min-w-[120px] justify-end">
        <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Search size={15} />
        </button>
        <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Bell size={15} />
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-100 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
      </div>
    </nav>
  );
}
