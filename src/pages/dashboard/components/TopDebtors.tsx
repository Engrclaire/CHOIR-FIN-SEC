import { useEffect, useState } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../config/supabaseClient';

interface Debtor {
  id?: string;
  name: string;
  amount: number;
}

export default function TopDebtors() {
  const navigate = useNavigate();
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebtors = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('members')
          .select('id, first_name, last_name, outstanding_debt')
          .gt('outstanding_debt', 0)
          .order('outstanding_debt', { ascending: false })
          .limit(10);
        if (error) throw error;
        setDebtors((data ?? []).map((d: any) => ({
          id: d.id,
          name: `${d.first_name} ${d.last_name}`,
          amount: Number(d.outstanding_debt || 0),
        })));
      } catch (err) {
        console.error('Error fetching debtors list:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchDebtors();
  }, []);

  // Compute the absolute live aggregated sum across the returned debt list array
  const totalOutstanding = debtors.reduce((sum, debtor) => sum + (debtor.amount || 0), 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg text-zinc-900">Top Debtors</h3>
          <p className="text-sm text-zinc-500">
            {loading ? (
              <span className="animate-pulse">Calculating...</span>
            ) : (
              `Total Outstanding: ₦${totalOutstanding.toLocaleString('en-NG')}`
            )}
          </p>
        </div>
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-sm text-zinc-500 animate-pulse">
          Streaming active member balances...
        </div>
      )}

      {error && (
        <div className="py-8 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && debtors.length === 0 && (
        <div className="py-8 text-center text-sm text-green-600 font-medium">
          ✓ Great job! No active member debts recorded.
        </div>
      )}

      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
        {!loading && !error && debtors.map((debtor, i) => {
          // Dynamic classification based on threshold values
          const status = debtor.amount >= 15000 ? 'critical' : 'owing';

          return (
            <div key={debtor.id || i} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 text-sm md:text-base">{debtor.name}</p>
                  <span className={`text-[10px] md:text-xs px-2.5 py-0.5 rounded-full font-medium capitalize inline-block mt-0.5 ${
                    status === 'critical' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
              <p className="font-semibold text-red-600 text-sm md:text-base">
                ₦{debtor.amount.toLocaleString('en-NG')}
              </p>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/dashboard/members')}
        className="w-full mt-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-2xl transition cursor-pointer border border-gray-100"
      >
        View All Members
      </button>
    </div>
  );
}