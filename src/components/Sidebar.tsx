import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Settings, 
  FolderTree, 
  RefreshCcw, 
  CalendarDays, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  History, 
  LogOut,
  Bell,
  ShieldCheck,
  User,
  ShieldAlert,
  Users
} from 'lucide-react';

interface SidebarProps {
  currentScreen: string;
  setScreen: (screen: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, setScreen }) => {
  const { currentUser, logout, notifications } = useApp();

  if (!currentUser) return null;

  const unreadCount = notifications.filter(n => !n.read && (n.userId === currentUser.id || n.userId === 'all')).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
    { id: 'org_setup', label: 'Organization Setup', icon: Settings, roles: ['admin'] },
    { id: 'assets', label: 'Asset Directory', icon: FolderTree, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
    { id: 'allocations', label: 'Allocations & Transfers', icon: RefreshCcw, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
    { id: 'bookings', label: 'Resource Bookings', icon: CalendarDays, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
    { id: 'maintenance', label: 'Maintenance Hub', icon: Wrench, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
    { id: 'audits', label: 'Asset Audits', icon: ClipboardCheck, roles: ['admin', 'asset_manager', 'employee'] }, // Employees can be auditors
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'asset_manager', 'department_head'] },
    { id: 'logs', label: 'Activity Logs', icon: History, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  ];

  const getRoleIcon = (role: string) => {
    return null; // Keep layout completely clean and text-focused
  };

  return (
    <aside className="w-64 bg-[#E4E3E0] text-[#141414] flex flex-col min-h-screen border-r border-[#141414]">
      {/* Brand Logo */}
      <div className="p-6 border-b border-[#141414] flex items-center space-x-3 shrink-0 bg-white">
        <div className="p-1.5 bg-[#141414] text-[#E4E3E0]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="text-xl font-extrabold tracking-tighter uppercase italic text-[#141414]" style={{ fontFamily: 'Georgia, serif' }}>
          AssetFlow
        </span>
      </div>

      {/* Current User Card */}
      <div className="p-4 border-b border-[#141414] bg-white shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-8 w-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-bold text-xs border border-[#141414] font-mono">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#141414] uppercase tracking-wider truncate">{currentUser.name}</h4>
            <p className="text-[10px] text-[#141414]/70 font-mono truncate">{currentUser.email}</p>
          </div>
        </div>
        <div className="inline-flex items-center px-2 py-0.5 border border-[#141414] bg-[#E4E3E0] text-[#141414] text-[9px] font-bold uppercase tracking-wider font-mono">
          <span>{currentUser.role.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto bg-[#E4E3E0]">
        {menuItems.map((item) => {
          const isAllowed = item.roles.includes(currentUser.role);
          const isAuditAndAllowed = item.id === 'audits' && currentUser.role === 'employee';
          
          if (!isAllowed && !isAuditAndAllowed) return null;

          const IconComponent = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 border-b border-[#141414] text-xs font-bold uppercase tracking-widest transition-all duration-150 cursor-pointer text-left ${
                isActive 
                  ? 'bg-[#141414] text-[#E4E3E0]' 
                  : 'text-[#141414] hover:bg-[#141414]/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              
              {item.id === 'logs' && unreadCount > 0 && (
                <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold font-mono border ${
                  isActive ? 'bg-[#E4E3E0] text-[#141414] border-[#E4E3E0]' : 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-[#141414] shrink-0 bg-white">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 border border-[#141414] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors cursor-pointer font-mono"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit ERP System</span>
        </button>
      </div>
    </aside>
  );
};
