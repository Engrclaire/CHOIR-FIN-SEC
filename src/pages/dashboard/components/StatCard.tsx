// pages/dashboard/components/StatCard.tsx
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ title, amount, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-4xl font-semibold text-gray-900">{amount}</p>
    </div>
  );
}