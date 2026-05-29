// pages/dashboard/components/Sidebar.tsx

import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Users, 
  Calendar, 
  FileText, 
  UserCog, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-58 transform flex-col overflow-hidden border-r border-gray-100 bg-white transition duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100 lg:px-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-semibold">L</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-900">Ledgsy</span>
          </div>

          <button
            type="button"
            className="lg:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 pt-2">
          <nav className="space-y-1">
            {/* Dashboard - Active */}
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                  isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[13px]">Dashboard</span>
            </NavLink>

            {/* Transactions */}
            <div className="flex items-center justify-between px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="w-5 h-5" />
                <span className="text-[13px]">Transactions</span>
              </div>
              <span className="text-gray-400 text-xl leading-none group-hover:translate-x-0.5 transition">›</span>
            </div>

            {/* Members */}
            <NavLink
              to="/dashboard/members"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                  isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span className="text-[13px]">Members</span>
            </NavLink>

            {/* Events */}
            <div className="flex items-center gap-3 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
              <Calendar className="w-5 h-5" />
              <span className="text-[13px]">Events</span>
            </div>

            {/* Reports */}
            <div className="flex items-center justify-between px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span className="text-[13px]">Reports</span>
              </div>
              <span className="text-gray-400 text-xl leading-none group-hover:translate-x-0.5 transition">›</span>
            </div>
          </nav>

        </div>

        {/* Footer navigation */}
        <div className="mt-auto border-t border-gray-100 px-3 pb-5 pt-4">
          <nav className="space-y-2">
            <div className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-gray-700 transition-colors hover:bg-gray-100">
              <UserCog className="h-5 w-5" />
              <span className="text-[13px]">Users</span>
            </div>

            <div className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-gray-700 transition-colors hover:bg-gray-100">
              <Settings className="h-5 w-5" />
              <span className="text-[13px]">Settings</span>
            </div>

            <div className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-gray-700 transition-colors hover:bg-gray-100">
              <LogOut className="h-5 w-5" />
              <span className="text-[13px] font-semibold">Log out</span>
            </div>
          </nav>

          <p className="px-2 pt-2 text-sm text-gray-500">Ledgsy v1.0</p>
        </div>
      </div>
    </>
  );
}
