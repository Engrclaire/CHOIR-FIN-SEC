import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Step4Props {
  onboarData?: {
    members?: number;
    levies?: number;
    events?: number;
  };
}

const Step4 = ({ onboarData }: Step4Props) => {
  const navigate = useNavigate();

  return (
    <form className="flex flex-col items-center justify-center min-h-full text-center space-y-8">
      {/* Success Icon */}
      <div className="flex justify-center mb-2">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle size={60} className="text-green-600" />
        </div>
      </div>

      {/* Success Title */}
      <div>
        <h2 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-4">Your Choir Financial System is Ready!</h2>
        <p className="text-sm md:text-lg text-zinc-600">
          You've successfully set up Choir FinSec for your choir. You can now start managing your finances.
        </p>
      </div>

      {/* Setup Summary */}
      <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">What you've set up:</h3>
        <div className="space-y-3 text-left">
          {onboarData?.members && (
            <div className="flex items-center gap-3 text-blue-800">
              <CheckCircle size={20} className="text-blue-600 shrink-0" />
              <span>{onboarData.members} member{onboarData.members > 1 ? 's' : ''} added</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-blue-800">
            <CheckCircle size={20} className="text-blue-600 shrink-0" />
            <span>Financial baseline established</span>
          </div>
          <div className="flex items-center gap-3 text-blue-800">
            <CheckCircle size={20} className="text-blue-600 shrink-0" />
            <span>Your organization configured</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="w-full px-8 py-2 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Go to Dashboard
        </button>
        <button
          type="button"
          className="w-full px-8 py-2 border border-zinc-300 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          Record First Transaction.
        </button>
      </div>
    </form>
  );
};

export default Step4;
