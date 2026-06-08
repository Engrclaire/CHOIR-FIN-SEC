import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { Header, Modal, Field, MemberStat, SearchPanel, StatusBadge, Detail } from './pageHelpers';
import { members, formatCurrency } from './pageData';

export function MembersPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const filteredMembers = members.filter((member) => {
    const matchesFilter = filter === 'all' || member.debtStatus === filter;
    const query = `${member.firstName} ${member.lastName} ${member.phone} ${member.email}`.toLowerCase();
    return matchesFilter && query.includes(search.toLowerCase());
  });

  const stats = {
    total: members.length,
    clear: members.filter((member) => member.debtStatus === 'clear').length,
    owing: members.filter((member) => member.debtStatus === 'owing').length,
    critical: members.filter((member) => member.debtStatus === 'critical').length,
  };

  return (
    <div className="p-8">
      <Header
        title="Members"
        subtitle="Every choir member and their financial position"
        action="Add Member"
        actionOnClick={() => setShowAddMemberModal(true)}
      />

      <Modal open={showAddMemberModal} title="Add Member" onClose={() => setShowAddMemberModal(false)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Joshua"
            />
          </Field>
          <Field label="Last name">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Okonkwo"
            />
          </Field>
          <Field label="Phone">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="+234 801 234 5678"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="joshua@example.com"
            />
          </Field>
          <Field label="Role">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Tenor"
            />
          </Field>
          <Field label="Debt status">
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>clear</option>
              <option>owing</option>
              <option>critical</option>
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowAddMemberModal(false)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowAddMemberModal(false)}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Add Member
          </button>
        </div>
      </Modal>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MemberStat label="Total Members" value={stats.total.toString()} helper="Choir headcount" icon={Users} />
        <MemberStat label="Clear" value={stats.clear.toString()} helper="No outstanding debts" icon={CheckCircle2} />
        <MemberStat label="Owing" value={stats.owing.toString()} helper="Have some debts" icon={AlertCircle} color="text-amber-600" />
        <MemberStat label="Critical" value={stats.critical.toString()} helper="High debt levels" icon={AlertCircle} color="text-red-600" />
      </div>

      <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search members..."
            />
          </div>
          <div className="grid w-full grid-cols-4 gap-2 sm:w-auto sm:grid-cols-4">
            {[
              { key: 'all', label: `All (${stats.total})` },
              { key: 'clear', label: `Clear (${stats.clear})` },
              { key: 'owing', label: `Owing (${stats.owing})` },
              { key: 'critical', label: `Critical (${stats.critical})` },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${filter === item.key ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredMembers.map((member) => (
          <Link
            key={member.id}
            to={`/dashboard/members/${member.id}`}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700 text-xl font-semibold">
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
                  <p className="mt-1 text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <StatusBadge status={member.debtStatus} />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
              <Detail label="Paid" value={formatCurrency(member.totalPaid)} />
              <Detail label="Debt" value={formatCurrency(member.outstandingDebt)} className="text-red-600" />
              <Detail label="Penalty" value={formatCurrency(member.penalties)} />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-3xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Levies paid</p>
                <p className="mt-2 font-semibold text-gray-900">{formatCurrency(member.totalLevies)}</p>
              </div>
              <div className="rounded-3xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Contributions</p>
                <p className="mt-2 font-semibold text-gray-900">{formatCurrency(member.contributions)}</p>
              </div>
            </div>
          </Link>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full rounded-3xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            No members match your search and filter selection.
          </div>
        )}
      </div>
    </div>
  );
}
