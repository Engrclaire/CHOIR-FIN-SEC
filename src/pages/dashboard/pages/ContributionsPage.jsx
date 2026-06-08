import { HandCoins } from 'lucide-react';
import { Header, SearchPanel, StatCard, StatusBadge } from './pageHelpers';
import { contributions, formatCurrency } from './pageData';

export function ContributionsPage() {
  const total = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
  const eventTotal = contributions
    .filter((contribution) => contribution.type === 'Event')
    .reduce((sum, contribution) => sum + contribution.amount, 0);

  return (
    <div className="p-8">
      <Header
        title="Contributions"
        subtitle="Voluntary contributions from members"
        action="Record Contribution"
        actionLink="/dashboard/transactions?action=record"
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Contributions" amount={total} icon={HandCoins} color="bg-blue-600" />
        <StatCard title="Event Contributions" amount={eventTotal} icon={HandCoins} color="bg-purple-600" />
        <StatCard title="General Contributions" amount={total - eventTotal} icon={HandCoins} color="bg-green-600" />
      </div>
      <SearchPanel placeholder="Search contributions..." />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {['Date', 'Description', 'Contributor', 'Type', 'Amount'].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contributions.map((contribution) => (
                <tr key={contribution.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{contribution.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <p className="font-medium">{contribution.description}</p>
                    {contribution.event && <p className="mt-0.5 text-xs text-gray-500">{contribution.event}</p>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{contribution.source}</td>
                  <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={contribution.type} /></td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-blue-600">{formatCurrency(contribution.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
