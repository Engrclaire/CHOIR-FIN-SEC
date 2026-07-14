interface Member {
  fullName: string;
  phoneNumber: string;
  email: string;
  choirRole: string;
}

interface Step2ModalProps {
  showMemberModal: boolean;
  setShowMemberModal: (show: boolean) => void;
  memberForm: Member;
  handleMemberFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddMember: () => void;
}

const voiceParts = [
  'Soprano',
  'Alto',
  'Tenor',
  'Bass',
  'Baritone',
];

const Step2Modal = ({
  showMemberModal,
  setShowMemberModal,
  memberForm,
  handleMemberFormChange,
  handleAddMember,
}: Step2ModalProps) => {
  if (!showMemberModal) return null;

  // Handles inline validation right before moving member state to your main database payload context
  const onMemberSubmit = () => {
    if (!memberForm.fullName.trim() || !memberForm.phoneNumber.trim() || !memberForm.choirRole) {
      alert('Please fill out all required parameters (Name, Phone, and Voice Part role) to save to the database.');
      return;
    }
    handleAddMember();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-8 max-w-md w-full">
        <h3 className="text-xl md:text-2xl font-bold text-zinc-900 mb-6">Add Choir Member</h3>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={memberForm.fullName}
              onChange={memberFormChange => handleMemberFormChange(memberFormChange)}
              placeholder="Enter full name"
              required
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={memberForm.phoneNumber}
              onChange={memberFormChange => handleMemberFormChange(memberFormChange)}
              placeholder="+234 000 000 0000"
              required
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={memberForm.email}
              onChange={memberFormChange => handleMemberFormChange(memberFormChange)}
              placeholder="email@example.com"
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
            />
          </div>

          {/* Choir Role */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Choir Role <span className="text-red-500">*</span>
            </label>
            <select
              name="choirRole"
              value={memberForm.choirRole}
              onChange={memberFormChange => handleMemberFormChange(memberFormChange)}
              required
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">Select voice part</option>
              {voiceParts.map((part) => (
                <option key={part} value={part}>
                  {part}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Action Options */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => setShowMemberModal(false)}
            className="flex-1 px-4 py-2 border border-zinc-300 rounded-xl text-sm md:text-md font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onMemberSubmit}
            className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm md:text-md font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2Modal;