// pages/dashboard/components/EventPerformance.tsx
import { Calendar } from 'lucide-react';

export default function EventPerformance() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Event Performance</h3>
        <div className="w-9 h-9 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Harvest Committee */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium">Harvest Committee</p>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Profit</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Income</p>
            <p className="font-semibold text-green-600">₦120,000</p>
          </div>
          <div>
            <p className="text-gray-500">Expenses</p>
            <p className="font-semibold text-red-600">₦95,000</p>
          </div>
          <div>
            <p className="text-gray-500">Net</p>
            <p className="font-semibold text-green-600">+₦25,000</p>
          </div>
        </div>
      </div>

      {/* Christmas Carol */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium">Christmas Carol</p>
          <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">Loss</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Income</p>
            <p className="font-semibold text-green-600">₦85,000</p>
          </div>
          <div>
            <p className="text-gray-500">Expenses</p>
            <p className="font-semibold text-red-600">₦92,000</p>
          </div>
          <div>
            <p className="text-gray-500">Net</p>
            <p className="font-semibold text-red-600">-₦7,000</p>
          </div>
        </div>
      </div>

      <button className="w-full mt-8 py-3.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 rounded-2xl transition">
        View All Events
      </button>
    </div>
  );
}