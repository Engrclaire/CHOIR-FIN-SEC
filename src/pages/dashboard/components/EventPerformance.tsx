import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../config/supabaseClient';

interface BackendEvent {
  id?: string;
  name: string;
  committee_lead_id?: string;
  financial_year_id?: string;
  // Fallbacks to handle display calculations smoothly
  income?: number;
  expenses?: number;
}

export default function EventPerformance() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventPerformance = async () => {
      try {
        setLoading(true);
        setError(null);

        // Directly queries your live database using the wildcard selector to prevent column mismatches
        const { data, error: supabaseError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;

        setEvents(data || []);
      } catch (err: any) {
        console.error('Error fetching event metrics from Supabase:', err);
        setError(err.message || 'Failed to fetch event data');
      } finally {
        setLoading(false);
      }
    };

    fetchEventPerformance();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-zinc-900">Event Performance</h3>
        <div className="w-9 h-9 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-sm text-zinc-500">
          Loading events performance metrics...
        </div>
      )}

      {error && (
        <div className="py-8 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="py-8 text-center text-sm text-zinc-500">
          No events created yet. Set up one in your settings.
        </div>
      )}

      <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1">
        {!loading && !error && events.map((event, index) => {
          // Dynamic calculation fallbacks to keep UI functional for freshly made events
          const income = event.income || 0;
          const expenses = event.expenses || 0;
          const net = income - expenses;
          const isProfit = net >= 0;

          return (
            <div key={event.id || index} className="pb-4 border-b border-zinc-50 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-zinc-900">{event.name}</p>
                  {event.committee_lead_id && (
                    <p className="text-xs text-zinc-500">Lead ID: {event.committee_lead_id.slice(0, 8)}...</p>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  isProfit 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {isProfit ? 'Profit' : 'Loss'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500 text-xs">Income</p>
                  <p className="font-semibold text-green-600">
                    ₦{income.toLocaleString('en-NG')}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Expenses</p>
                  <p className="font-semibold text-red-600">
                    ₦{expenses.toLocaleString('en-NG')}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Net</p>
                  <p className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {isProfit ? '+' : ''}₦{net.toLocaleString('en-NG')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/dashboard/events')}
        className="w-full mt-6 py-3.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 rounded-2xl transition cursor-pointer text-zinc-800"
      >
        View All Events
      </button>
    </div>
  );
}