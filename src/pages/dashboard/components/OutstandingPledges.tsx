import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { supabase } from '../../../config/supabaseClient';

interface PledgeMetrics {
  totalOutstanding: number;
}

export default function OutstandingPledges() {
  const [metrics, setMetrics] = useState<PledgeMetrics>({ totalOutstanding: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOutstandingPledges = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pledges')
          .select('amount, status');
        if (error) throw error;
        const totalOutstanding = (data ?? [])
          .filter((p: any) => p.status !== 'fulfilled' && p.status !== 'paid')
          .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
        setMetrics({ totalOutstanding });
      } catch (error) {
        console.error('Error fetching outstanding pledges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutstandingPledges();
  }, []);

  return (
    <div className="bg-[#fff9e6] border border-[#ffe8b3] p-6 rounded-3xl flex items-center justify-between shadow-sm">
      <div>
        <p className="text-amber-700 text-sm font-medium">Outstanding Pledges</p>
        <p className="text-4xl font-semibold text-amber-900 mt-1">
          {loading ? (
            <span className="text-2xl text-amber-600/70 animate-pulse">Fetching...</span>
          ) : (
            `₦${metrics.totalOutstanding.toLocaleString('en-NG')}`
          )}
        </p>
      </div>
      <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shrink-0">
        <Wallet className="w-6 h-6 text-amber-900" />
      </div>
    </div>
  );
}