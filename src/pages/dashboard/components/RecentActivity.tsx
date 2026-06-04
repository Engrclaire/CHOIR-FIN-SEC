// pages/dashboard/components/RecentActivity.tsx
import { DollarSign, Plus } from 'lucide-react';

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl text-center py-4 my-5">
      <div className="flex mb-6 border-b border-gray-100 pb-4 gap-3 p-4">
        <div>
          <h3 className="font-semibold text-lg">Recent Activity</h3>
        </div>
      </div>

      <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <DollarSign className="w-10 h-10 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto">
        Start recording transactions to see activity here
      </p>

      <button className="bg-black text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 mx-auto hover:bg-gray-800 transition cursor-pointer">
        <Plus className="w-5 h-5" />
        Record First Transaction
      </button>
    </div>
  );
}