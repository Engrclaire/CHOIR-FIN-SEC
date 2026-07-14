import { useState, useEffect, type ChangeEvent, type FC, type FormEvent } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import Step2Modal from './Step2Modal';

interface FinancialData {
  currentBankBalance: string;
  currentCashAtHand: string;
}

interface Member {
  fullName: string;
  phoneNumber: string;
  email: string;
  choirRole: string;
}

interface Step2Props {
  // Renamed callback to accurately mirror dynamic wizard baseline state tracking
  onDataChange?: (data: { financial: FinancialData; members: Member[]; isValid: boolean }) => void;
  onSubmit?: (data: { financial: FinancialData; members: Member[] }) => void;
}

const Step2: FC<Step2Props> = ({ onDataChange, onSubmit }) => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    currentBankBalance: '',
    currentCashAtHand: '',
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState<Member>({
    fullName: '',
    phoneNumber: '',
    email: '',
    choirRole: '',
  });

  // Safe number formatter guarding against structural NaN values
  const formatNumberWithCommas = (value: string): string => {
    if (!value) return '';
    const cleanValue = value.replace(/,/g, '');
    const numValue = parseFloat(cleanValue);
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('en-NG');
  };

  // Clean raw setter instead of synthetic browser input event mocking
  const updateFinancialField = (fieldName: keyof FinancialData, rawValue: string) => {
    // Strip everything except raw digits and single floating point periods
    const numericSanitized = rawValue.replace(/[^0-9.]/g, '');
    
    setFinancialData(prev => ({
      ...prev,
      [fieldName]: numericSanitized
    }));
  };

  const handleMemberFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMember = () => {
    if (memberForm.fullName && memberForm.phoneNumber && memberForm.choirRole) {
      setMembers([...members, memberForm]);
      setMemberForm({
        fullName: '',
        phoneNumber: '',
        email: '',
        choirRole: '',
      });
      setShowMemberModal(false);
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  // Keep parent form controller cleanly synced with layout parameters
  useEffect(() => {
    const hasValidBalances = 
      financialData.currentBankBalance.trim() !== '' && 
      financialData.currentCashAtHand.trim() !== '';

    if (onDataChange) {
      onDataChange({ 
        financial: financialData, 
        members,
        isValid: hasValidBalances
      });
    }
  }, [financialData, members, onDataChange]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        financial: financialData,
        members,
      });
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-12">
      {/* Financial Baseline Setup Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-2">Financial Baseline Setup</h2>
        <p className="text-sm md:text-md text-zinc-600 mb-6">Enter the balances currently held by the choir to start accurate tracking.</p>

        <div className="space-y-6">
          {/* Current Bank Balance */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Current Bank Balance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-semibold">₦</span>
              <input
                type="text"
                name="currentBankBalance"
                value={formatNumberWithCommas(financialData.currentBankBalance)}
                onChange={(e) => updateFinancialField('currentBankBalance', e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-100 border border-zinc-200 rounded-xl pl-8 pr-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Current Cash at Hand */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Current Cash at Hand
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-semibold">₦</span>
              <input
                type="text"
                name="currentCashAtHand"
                value={formatNumberWithCommas(financialData.currentCashAtHand)}
                onChange={(e) => updateFinancialField('currentCashAtHand', e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-100 border border-zinc-200 rounded-xl pl-8 pr-4 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Choir Members Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-2">Add Choir Members</h2>
        <p className="text-sm md:text-md text-zinc-600 mb-6">Build your member directory to track contributions</p>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowMemberModal(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-2.5 border border-zinc-300 rounded-xl font-semibold text-zinc-900 text-sm md:text-md hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <Plus size={20} />
            Add Member Manually
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-6 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl font-semibold text-zinc-900 text-sm md:text-md hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <Upload size={20} />
            Import from CSV/Excel
          </button>
        </div>

        {/* Members List Display */}
        {members.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-zinc-700 mb-3">Added Members ({members.length})</p>
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-900">{member.fullName}</p>
                    <p className="text-sm text-zinc-600">{member.phoneNumber} · {member.choirRole}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Step2Modal
        showMemberModal={showMemberModal}
        setShowMemberModal={setShowMemberModal}
        memberForm={memberForm}
        handleMemberFormChange={handleMemberFormChange}
        handleAddMember={handleAddMember}
      />
    </form>
  );
};

export default Step2;