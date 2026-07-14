import { useEffect, useState } from 'react';
import { DollarSign, Plus, ArrowUpRight, ArrowDownLeft, FileText, Bookmark } from 'lucide-react';
import { supabase } from '../../../config/supabaseClient';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'debt' | 'pledge';
  date: string;
  referenceName?: string; 
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLiveActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('id, description, amount, type, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setActivities((data ?? []).map((t: any) => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount || 0),
        type: t.type,
        date: new Date(t.created_at).toLocaleDateString('en-NG'),
      })));
    } catch (error) {
      console.error('Error fetching recent operations stream:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveActivities();
  }, []);

  // Helper function to dynamically map status icons based on ledger record entry types
  const getActivityIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return <div className="p-2.5 bg-green-50 rounded-xl"><ArrowUpRight className="w-5 h-5 text-green-600" /></div>;
      case 'expense':
        return <div className="p-2.5 bg-red-50 rounded-xl"><ArrowDownLeft className="w-5 h-5 text-red-600" /></div>;
      case 'pledge':
        return <div className="p-2.5 bg-amber-50 rounded-xl"><Bookmark className="w-5 h-5 text-amber-600" /></div>;
      default:
        return <div className="p-2.5 bg-zinc-100 rounded-xl"><FileText className="w-5 h-5 text-zinc-600" /></div>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-zinc-100 p-6 my-5 text-center">
        <p className="text-sm text-zinc-500 animate-pulse py-12">Streaming latest dashboard activity...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-zinc-100 p-6 my-5 shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-zinc-50 pb-4">
        <h3 className="font-semibold text-lg text-zinc-900">Recent Activity</h3>
        {activities.length > 0 && (
          <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
            Live Stream
          </span>
        )}
      </div>

      {activities.length === 0 ? (
        /* Empty State Display Block */
        <div className="py-8 text-center">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <DollarSign className="w-10 h-10 text-gray-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">
            Start recording transactions to see activity here
          </p>

          <button 
            onClick={() => window.location.href = '/dashboard/transactions/new'}
            className="bg-black text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 mx-auto hover:bg-gray-800 transition cursor-pointer font-medium text-sm shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Record First Transaction
          </button>
        </div>
      ) : (
        /* Dynamic Feed Stream Block */
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-2 hover:bg-zinc-50/50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                {getActivityIcon(activity.type)}
                <div className="text-left">
                  <p className="font-medium text-zinc-900 text-sm md:text-base">{activity.description}</p>
                  <p className="text-xs text-zinc-500">
                    {activity.referenceName ? `${activity.referenceName} · ` : ''}{activity.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm md:text-base ${
                  activity.type === 'income' ? 'text-green-600' : activity.type === 'expense' ? 'text-red-600' : 'text-zinc-900'
                }`}>
                  {activity.type === 'income' ? '+' : activity.type === 'expense' ? '-' : ''}
                  ₦{activity.amount.toLocaleString('en-NG')}
                </p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  {activity.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}