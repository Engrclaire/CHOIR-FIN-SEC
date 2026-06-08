import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Header, Modal, Field, StatusBadge } from './pageHelpers';
import { events, transactions, formatCurrency } from './pageData';

export function EventsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  const filteredEvents = events.filter((event) => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalEvents = events.length;
  const totalIncome = filteredEvents.reduce((sum, event) => sum + event.income, 0);
  const totalNet = filteredEvents.reduce((sum, event) => sum + event.net, 0);

  return (
    <div className="p-8">
      <Header
        title="Events"
        subtitle="Manage event budgets and results"
        action="Create Event"
        actionOnClick={() => setShowAddEventModal(true)}
      />

      <Modal open={showAddEventModal} title="Create Event" onClose={() => setShowAddEventModal(false)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event name">
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="2026 Concert"
            />
          </Field>
          <Field label="Status">
            <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>Active</option>
              <option>Pending</option>
              <option>Reconciled</option>
            </select>
          </Field>
          <Field label="Income">
            <input
              type="number"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="250000"
            />
          </Field>
          <Field label="Expenses">
            <input
              type="number"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="130000"
            />
          </Field>
          <Field label="Start date">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowAddEventModal(false)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowAddEventModal(false)}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Create Event
          </button>
        </div>
      </Modal>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Events</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{totalEvents}</p>
          <p className="mt-2 text-sm text-gray-500">All scheduled events</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{formatCurrency(totalIncome)}</p>
          <p className="mt-2 text-sm text-gray-500">Income from filtered events</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Net Result</p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">{formatCurrency(totalNet)}</p>
          <p className="mt-2 text-sm text-gray-500">Combined profit/loss</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Search events..."
            />
          </div>
        </div>
        <div className="inline-flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {['all', 'Active', 'Pending', 'Reconciled'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value === 'all' ? 'all' : value)}
              className={`px-4 py-3 text-sm font-medium transition ${filter === (value === 'all' ? 'all' : value) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['Event', 'Status', 'Period', 'Net', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600"><StatusBadge status={event.status} /></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.period}</td>
                  <td className={`px-6 py-4 text-sm font-semibold ${event.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {event.net >= 0 ? '+' : ''}{formatCurrency(event.net)}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/dashboard/events/${event.id}`} className="text-blue-600 hover:text-blue-700">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No events match your search or filter.
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
