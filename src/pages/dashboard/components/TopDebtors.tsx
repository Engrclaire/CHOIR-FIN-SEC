// pages/dashboard/components/TopDebtors.tsx
import { Users, AlertCircle } from 'lucide-react';

const debtors = [
  { name: "Joshua Okonkwo", amount: "₦15,000", status: "critical" },
  { name: "Agu Emmanuel", amount: "₦12,500", status: "owing" },
  { name: "Anamba Florence", amount: "₦8,000", status: "owing" },
];

export default function TopDebtors() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Top Debtors</h3>
          <p className="text-sm text-gray-500">Total Outstanding: ₦35,500</p>
        </div>
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
      </div>

      <div className="space-y-4">
        {debtors.map((debtor, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">{debtor.name}</p>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  debtor.status === 'critical' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-amber-100 text-amber-600'
                }`}>
                  {debtor.status}
                </span>
              </div>
            </div>
            <p className="font-semibold text-red-600">{debtor.amount}</p>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-2xl transition">
        View All Members
      </button>
    </div>
  );
}