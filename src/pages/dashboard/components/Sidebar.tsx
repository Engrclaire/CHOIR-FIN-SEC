import {
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  FileText,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  UserCog,
  Users,
  X,
  CalendarDays,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { MouseEvent } from 'react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type SubmenuItem = {
  name: string;
  href: string;
  icon: typeof Receipt;
  description: string;
  primary?: boolean;
};

const mainItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight, hasSubmenu: true },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Events', href: '/dashboard/events', icon: CalendarDays },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, hasSubmenu: true },
];

const transactionItems: SubmenuItem[] = [
  {
    name: 'All Transactions',
    href: '/dashboard/transactions',
    icon: Receipt,
    description: 'View all transactions',
  },
  {
    name: 'Record Transaction',
    href: '/dashboard/transactions?action=record',
    icon: CircleDollarSign,
    description: 'Quick entry for any transaction',
    primary: true,
  },
  {
    name: 'Income',
    href: '/dashboard/income',
    icon: CircleDollarSign,
    description: 'View income records',
  },
  {
    name: 'Expenses',
    href: '/dashboard/expenses',
    icon: Receipt,
    description: 'View expense records',
  },
  {
    name: 'Levies',
    href: '/dashboard/levies',
    icon: FileText,
    description: 'Manage member levies',
  },
  {
    name: 'Contributions',
    href: '/dashboard/contributions',
    icon: HandCoins,
    description: 'Track contributions',
  },
];

const reportItems: SubmenuItem[] = [
  {
    name: 'Financial Summary',
    href: '/dashboard/reports/financial-summary',
    icon: BarChart3,
    description: 'View financial summary',
  },
  {
    name: 'Member Activity',
    href: '/dashboard/reports/member-activity',
    icon: Users,
    description: 'View member activity',
  },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [submenu, setSubmenu] = useState<'Transactions' | 'Reports' | null>(null);
  const submenuItems = submenu === 'Transactions' ? transactionItems : reportItems;

  const openSubmenu = (
    event: MouseEvent<HTMLAnchorElement>,
    item: (typeof mainItems)[number],
  ) => {
    if (!item.hasSubmenu) {
      onClose?.();
      return;
    }

    event.preventDefault();
    setSubmenu(item.name as 'Transactions' | 'Reports');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-50 transform flex-col border-r border-gray-200 bg-white transition duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                <span className="text-sm font-semibold text-white">L</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Ledgsy</span>
            </div>

            <button
              type="button"
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden cursor-pointer"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {mainItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/dashboard'}
              onClick={(event) => openSubmenu(event, item)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {item.hasSubmenu && (
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <NavLink
            to="/dashboard/user-management"
            className={({ isActive }) =>
              `mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <UserCog className="h-5 w-5" />
            <span>Users</span>
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>

          <div className="mt-2 px-3 text-xs text-gray-500">Ledgsy v1.0</div>
        </div>
      </aside>

      {submenu && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={() => setSubmenu(null)}>
          <aside
            className="flex h-full w-[90%] max-w-[320px] flex-col bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    {submenu === 'Transactions' ? (
                      <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{submenu}</h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {submenu === 'Transactions'
                        ? 'Manage all financial activities'
                        : 'View insights and reports'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSubmenu(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <nav className="space-y-1 p-3">
                {submenuItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      setSubmenu(null);
                      onClose?.();
                    }}
                    className={({ isActive }) =>
                      `group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors ${
                        item.primary
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className={`mt-0.5 h-5 w-5 shrink-0 ${item.primary ? 'text-white' : ''}`} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium ${item.primary ? 'text-white' : ''}`}>{item.name}</div>
                      <p className={`mt-0.5 text-xs ${item.primary ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                    {!item.primary && (
                      <ChevronRight className="mt-1 h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-4 border-t border-gray-200 px-6 py-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Quick Overview
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Income</span>
                    <span className="font-semibold text-green-600">GHS 45,000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Expenses</span>
                    <span className="font-semibold text-red-600">GHS 12,500</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                    <span className="font-medium text-gray-900">Net Balance</span>
                    <span className="font-bold text-blue-600">GHS 32,500</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
