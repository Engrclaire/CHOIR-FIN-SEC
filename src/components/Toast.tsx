import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number; // in milliseconds
}

const Toast = ({ message, type, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: {
      bg: 'bg-emerald-600',
      icon: <CheckCircle className="w-5 h-5" />,
      border: 'border-emerald-500',
    },
    error: {
      bg: 'bg-red-600',
      icon: <XCircle className="w-5 h-5" />,
      border: 'border-red-500',
    },
    info: {
      bg: 'bg-blue-600',
      icon: <Info className="w-5 h-5" />,
      border: 'border-blue-500',
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`
        fixed top-6 right-6 z-50 flex items-center gap-3 
        ${currentStyle.bg} text-white 
        border ${currentStyle.border}
        rounded-2xl shadow-2xl px-5 py-4 min-w-[320px]
        animate-slide-in
      `}
      role="alert"
    >
      <div className="flex-shrink-0">
        {currentStyle.icon}
      </div>

      <div className="flex-1 text-sm font-medium pr-2">
        {message}
      </div>

      <button
        onClick={onClose}
        className="shrink-0 text-white/70 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default Toast;