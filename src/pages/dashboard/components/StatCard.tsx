import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string | number;
  icon: LucideIcon;
  color: string;
  loading?: boolean; // Protects UI from layout shifting while backend resolves data
}

export default function StatCard({ title, amount, icon: Icon, color, loading = false }: StatCardProps) {
  // Gracefully handle raw numbers passed straight out of Axios database responses
  const formattedAmount = typeof amount === 'number' 
    ? `₦${amount.toLocaleString('en-NG')}` 
    : amount;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-sm transition-shadow shadow-sm/5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-zinc-600 text-sm font-medium">{title}</p>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      
      {loading ? (
        <div className="h-10 w-32 bg-zinc-100 rounded-xl animate-pulse mt-1" />
      ) : (
        <p className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight">
          {formattedAmount}
        </p>
      )}
    </div>
  );
}