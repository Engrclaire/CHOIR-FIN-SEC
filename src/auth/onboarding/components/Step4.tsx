import { CheckCircle } from 'lucide-react';

interface Step4Props {
  onboarData?: {
    members?: number;
    levies?: number;
    events?: number;
  };
  isSubmitting?: boolean;
  onComplete?: () => void | Promise<void>;
}

const Step4 = ({ onboarData, isSubmitting = false, onComplete }: Step4Props) => {
  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        if (onComplete) void onComplete();
      }}
      className="flex flex-col items-center justify-center min-h-full text-center space-y-8"
    >
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
          You've successfully compiled your workspace parameters. Click below to commit your configuration to the server workstation.
        </p>
      </div>

      {/* Setup Summary */}
      <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">What you've configured:</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3 text-blue-800">
            <CheckCircle size={20} className="text-blue-600 shrink-0" />
            <span>Organization settings & workspace privileges</span>
          </div>

          <div className="flex items-center gap-3 text-blue-800">
            <CheckCircle size={20} className="text-blue-600 shrink-0" />
            <span>Financial baseline tracking balances</span>
          </div>

          {Boolean(onboarData?.members) && (
            <div className="flex items-center gap-3 text-blue-800">
              <CheckCircle size={20} className="text-blue-600 shrink-0" />
              <span>{onboarData?.members} initial singer{onboarData!.members! > 1 ? 's' : ''} staged</span>
            </div>
          )}

          {Boolean(onboarData?.levies) && (
            <div className="flex items-center gap-3 text-blue-800">
              <CheckCircle size={20} className="text-blue-600 shrink-0" />
              <span>{onboarData?.levies} custom church levies template structured</span>
            </div>
          )}

          {Boolean(onboarData?.events) && (
            <div className="flex items-center gap-3 text-blue-800">
              <CheckCircle size={20} className="text-blue-600 shrink-0" />
              <span>{onboarData?.events} choir event projection calendars logged</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-8 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isSubmitting ? 'Writing to Ledger Workstation...' : 'Complete Setup & Open System'}
        </button>
      </div>
    </form>
  );
};

export default Step4;