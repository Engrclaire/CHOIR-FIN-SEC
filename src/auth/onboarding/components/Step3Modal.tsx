interface Levy {
  name: string;
  amount: string;
  frequency: string;
  isCompulsory: boolean;
}

interface Event {
  name: string;
  committee: string;
  startDate: string;
  endDate: string;
}

interface TeamMember {
  fullName: string;
  email: string;
  role: string;
}

interface Step3ModalProps {
  showLevyModal: boolean;
  setShowLevyModal: (show: boolean) => void;
  showEventModal: boolean;
  setShowEventModal: (show: boolean) => void;
  levyForm: Levy;
  handleLevyFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddLevy: () => void;
  eventForm: Event;
  handleEventFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddEvent: () => void;
  showInviteModal: boolean;
  setShowInviteModal: (show: boolean) => void;
  inviteForm: TeamMember;
  handleInviteFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddMember: () => void;
}

const frequencies = ['Yearly', 'Monthly', 'Quarterly', 'Weekly', 'One-time'];

const Step3Modal = ({
  showLevyModal,
  setShowLevyModal,
  showEventModal,
  setShowEventModal,
  levyForm,
  handleLevyFormChange,
  handleAddLevy,
  eventForm,
  handleEventFormChange,
  handleAddEvent,
  showInviteModal,
  setShowInviteModal,
  inviteForm,
  handleInviteFormChange,
  handleAddMember,
}: Step3ModalProps) => {
  const roles = [
    'Financial Secretary',
    'Committee Lead',
    'Treasurer',
    'Choir Director',
    'Administrator',
    'Member',
  ];
  return (
    <>
      {/* Add Levy Modal */}
      {showLevyModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-8 max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-bold text-zinc-900 mb-6">Add Levy</h3>

            <div className="space-y-6">
              {/* Levy Name */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Levy Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={levyForm.name}
                  onChange={handleLevyFormChange}
                  placeholder="e.g., Annual Levy"
                  required
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-semibold">₦</span>
                  <input
                    type="number"
                    name="amount"
                    value={levyForm.amount}
                    onChange={handleLevyFormChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-xl pl-8 pr-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  name="frequency"
                  value={levyForm.frequency}
                  onChange={handleLevyFormChange}
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem'
                  }}
                >
                  {frequencies.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              {/* Is Compulsory Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-zinc-900">Is this compulsory?</label>
                  <p className="text-xs text-zinc-600">Unpaid compulsory levies become debts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isCompulsory"
                    checked={levyForm.isCompulsory}
                    onChange={handleLevyFormChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900"></div>
                </label>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLevyModal(false)}
                className="flex-1 px-4 py-2 text-sm md:text-md border border-zinc-300 rounded-xl font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLevy}
                className="flex-1 px-4 py-2 text-sm md:text-md bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Add Levy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-8 max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-bold text-zinc-900 mb-6">Add Event/Committee</h3>

            <div className="space-y-6">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={eventForm.name}
                  onChange={handleEventFormChange}
                  placeholder="e.g., 2026 Harvest"
                  required
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              {/* Committee Name (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Committee Name (Optional)
                </label>
                <input
                  type="text"
                  name="committee"
                  value={eventForm.committee}
                  onChange={handleEventFormChange}
                  placeholder="e.g., Harvest Committee"
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={eventForm.startDate}
                  onChange={handleEventFormChange}
                  required
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              {/* End Date (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={eventForm.endDate}
                  onChange={handleEventFormChange}
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-2 border border-zinc-300 rounded-xl font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer text-sm md:text-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEvent}
                className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors cursor-pointer text-sm md:text-md"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-8 max-w-md w-full">
            <h3 className="text-xl md:text-2xl font-bold text-zinc-900 mb-6">Invite User</h3>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={inviteForm.fullName}
                  onChange={handleInviteFormChange}
                  placeholder="Enter full name"
                  required
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={inviteForm.email}
                  onChange={handleInviteFormChange}
                  placeholder="email@example.com"
                  required
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={inviteForm.role}
                  onChange={handleInviteFormChange}
                  required
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-zinc-300 rounded-xl text-sm md:text-md font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMember}
                className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm md:text-md font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Step3Modal;
