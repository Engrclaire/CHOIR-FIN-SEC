import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import OrganizationForm from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Progress calculation
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Progress Bar Section - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 px-6 py-6 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Step Counter */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-zm font-semibold text-zinc-900">Step {currentStep} of {totalSteps}</h2>
            <span className="text-sm font-medium text-zinc-600">{Math.round(progressPercentage)}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-zinc-900 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className={`mt-28 ${currentStep === totalSteps ? 'mb-6' : 'mb-32'} overflow-y-auto scrollbar-hide flex-1 flex items-center justify-center p-4 md:p-6`}>
        <div className="w-full max-w-2xl">
          {/* Step content */}
          <div className="bg-white rounded-3xl shadow-lg p-5 md:p-12">
            {currentStep === 1 && <OrganizationForm />}
            {currentStep === 2 && <Step2 />}
            {currentStep === 3 && <Step3 />}
            {currentStep === 4 && <Step4 />}
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Fixed */}
      {currentStep !== totalSteps && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-6">
          <div className="max-w-4xl mx-auto flex gap-4 justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex cursor-pointer items-center gap-2 px-6 py-3 border border-zinc-300 rounded-xl font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={currentStep === totalSteps}
              className="px-8 py-3 cursor-pointer bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Onboarding;
