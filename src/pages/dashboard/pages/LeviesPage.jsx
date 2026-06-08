import { FileText, HandCoins } from 'lucide-react';
import { Header, SearchPanel, StatCard } from './pageHelpers';
import { levies, formatCurrency } from './pageData';

export function LeviesPage() {
  const totalCollected = levies.reduce((total, levy) => total + levy.totalCollected, 0);
  const totalExpected = levies.reduce((total, levy) => total + levy.totalExpected, 0);

  return (
    <div className="p-8">
      <Header
        title="Levies"
        subtitle="Manage member levies and collections"
        action="Record Levy Payment"
        actionLink="/dashboard/transactions?action=record"
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Collected" amount={totalCollected} icon={FileText} color="bg-green-600" />
        <StatCard title="Total Expected" amount={totalExpected} icon={FileText} color="bg-blue-600" />
        <StatCard title="Outstanding" amount={totalExpected - totalCollected} icon={FileText} color="bg-amber-500" />
      </div>
      <SearchPanel placeholder="Search levies..." />
      <div className="space-y-4">
        {levies.map((levy) => {
          const progress = Math.round((levy.totalCollected / levy.totalExpected) * 100);

          return (
            <div key={levy.id} className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{levy.name}</h3>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{levy.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">{levy.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount per member</p>
                  <p className="text-xl font-semibold text-gray-900">{formatCurrency(levy.amountPerMember)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Collected</p>
                  <p className="font-semibold text-green-600">{formatCurrency(levy.totalCollected)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expected</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(levy.totalExpected)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Members Paid</p>
                  <p className="font-semibold text-gray-900">{levy.membersPaid} / {levy.totalMembers}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="font-semibold text-gray-900">{levy.deadline}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Collection Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-green-600" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
