import { useEffect, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'system' | 'payment';
  is_read: boolean;
  created_at: string;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, type, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!mounted) return;
      if (!error) setNotifications((data ?? []) as NotificationRow[]);
      setLoading(false);
    };

    void load();

    const channel = supabase
      .channel(`notifications-live-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => void load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const typeStyles: Record<NotificationRow['type'], string> = {
    assignment: 'bg-indigo-100 text-indigo-700',
    system: 'bg-amber-100 text-amber-700',
    payment: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-xs text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50 cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {loading ? (
                <div className="px-5 py-8 text-center text-sm text-gray-500">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-500">
                  <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 border-b border-gray-100 px-5 py-4 transition ${notification.is_read ? 'bg-white' : 'bg-blue-50/50'}`}
                  >
                    <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${typeStyles[notification.type]}`}>
                      <Bell className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-gray-900">{notification.title || 'Notification'}</p>
                        <span className="shrink-0 text-[10px] text-gray-400">{formatTime(notification.created_at)}</span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{notification.message}</p>
                    </div>
                    {!notification.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-1 text-xs font-medium text-gray-500 transition hover:text-gray-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" /> Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
