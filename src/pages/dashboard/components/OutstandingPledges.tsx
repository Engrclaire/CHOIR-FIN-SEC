// pages/dashboard/components/OutstandingPledges.tsx
import { Wallet } from 'lucide-react';

export default function OutstandingPledges() {
  return (
    <div className="bg-[#fff9e6] border border-[#ffe8b3] p-6 rounded-3xl flex items-center justify-between">
      <div>
        <p className="text-amber-700 text-sm font-medium">Outstanding Pledges</p>
        <p className="text-4xl font-semibold text-amber-900 mt-1">₦0</p>
      </div>
      <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center">
        <Wallet className="w-6 h-6 text-amber-900" />
      </div>
    </div>
  );
}