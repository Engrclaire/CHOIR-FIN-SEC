import { useState } from 'react';
import { Search as SearchIcon, Users } from 'lucide-react';
import { Header, Modal, Field, StatusBadge } from './pageHelpers';
import { users } from './pageData';

export function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const roleCards = [
    { title: 'Admin', description: 'Full system access and user management' },
    { title: 'Financial Secretary', description: 'Record transactions, view reports' },
    { title: 'Treasurer', description: 'View financial reports and balances' },
    { title: 'Committee Head', description: 'Manage committee events and finances' },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const query = `${user.name} ${user.email} ${user.role}`.toLowerCase();
    return matchesStatus && query.includes(search.toLowerCase());
  });

  return (
    <div className="p-8">
      <Header
        title="User Management"
        subtitle="Invite and manage team access"
        action="Invite User"
        actionOnClick={() => setShowInviteUserModal(true)}
      />

      <Modal open={showInviteUserModal} title="Invite User" onClose={() => setShowInviteUserModal(false)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Rev. Fr. Peter Okoro"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="peter.okoro@stcecilia.org"
            />
          </Field>
          <Field label="Role">
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>Admin</option>
              <option>Financial Secretary</option>
              <option>Treasurer</option>
              <option>Committee Head</option>
            </select>
          </Field>
          <Field label="Status">
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>Active</option>
              <option>Invited</option>
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowInviteUserModal(false)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowInviteUserModal(false)}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Send Invite
          </button>
        </div>
      </Modal>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {roleCards.map((card) => (
          <div key={card.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search users..."
            />
          </div>
        </div>
        <div className="inline-flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {['all', 'Active', 'Invited'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`px-4 py-3 text-sm font-medium transition ${statusFilter === value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {value === 'all' ? 'All' : value}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['User', 'Role', 'Status', 'Added', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        {user.name
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.added}</td>
                  <td className="px-6 py-4">
                    <button type="button" className="text-blue-600 hover:text-blue-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No users match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
