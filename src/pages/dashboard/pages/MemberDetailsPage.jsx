import { useParams, Link } from 'react-router-dom';
import { AlertCircle, HandCoins, Users, FileText } from 'lucide-react';
import { StatCard, StatusBadge, InfoRow } from './pageHelpers';
import { members, transactions, formatCurrency } from './pageData';

export function MemberDetailsPage() {
  const { id } = useParams();
  const member = members.find((item) => item.id.toString() === id) || members[0];
  const memberTransactions = transactions.filter((transaction) => transaction.source === `${member.firstName} ${member.lastName}`);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link to="/dashboard/members" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to Members
        </Link>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{member.firstName} {member.lastName}</h1>
              <p className="mt-1 text-gray-600">{member.role} member profile</p>
            </div>
          </div>
          <StatusBadge status={member.debtStatus} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Outstanding Debt" amount={member.outstandingDebt + member.penalties} icon={AlertCircle} color="bg-red-600" />
        <StatCard title="Levies Paid" amount={member.totalLevies} icon={FileText} color="bg-blue-600" />
        <StatCard title="Contributions" amount={member.contributions} icon={HandCoins} color="bg-green-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Member Information</h2>
          <div className="space-y-3 text-sm">
            <InfoRow label="Phone" value={member.phone} />
            <InfoRow label="Email" value={member.email} />
            <InfoRow label="Choir Role" value={member.role} />
            <InfoRow label="Debt Status" value={member.debtStatus} />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Recent Member Activity</h2>
          {memberTransactions.length === 0 ? (
            <p className="text-sm text-gray-600">No recorded transactions for this member yet.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {memberTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <p className="font-semibold text-green-600">{formatCurrency(transaction.amountPaid || 0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
