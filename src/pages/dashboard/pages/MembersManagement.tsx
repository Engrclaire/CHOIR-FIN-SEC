import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { supabase } from '../../../config/supabaseClient';

/* =========================================
   INTERFACES
   ========================================= */

interface MemberFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface SavedMember extends MemberFormData {
  id: string | number;
  leviesPaid: number;
  contributions: number;
  outstanding: number;
  penalties: number;
}

/* =========================================
   HELPERS
   ========================================= */

function formatCurrency(amount: number): string {
  return `\u20A6${(amount || 0).toLocaleString('en-NG')}`;
}

function getInitials(first: string, last: string): string {
  return `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}`;
}

/* =========================================
   COMPONENTS
   ========================================= */

function AddMemberModal({
  open,
  onClose,
  onMemberSaved,
}: {
  open: boolean;
  onClose: () => void;
  onMemberSaved: (member: SavedMember) => void;
}) {
  const [form, setForm] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);

  const update = (field: keyof MemberFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('members')
        .insert([{
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          email: form.email,
        }])
        .select()
        .single();

      if (error) throw error;

      onMemberSaved({
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        email: data.email,
        leviesPaid: 0,
        contributions: 0,
        outstanding: 0,
        penalties: 0,
      });
    } catch (err) {
      console.error('Error saving member:', err);
      alert('Failed to save member. Please try again.');
    } finally {
      setSaving(false);
      setForm({ firstName: '', lastName: '', phone: '', email: '' });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Add New Member</h3>
            <p className="mt-1 text-sm text-gray-500">Fill in member details below.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">First Name</span>
              <input
                required
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                placeholder="Enter first name"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Last Name</span>
              <input
                required
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                placeholder="Enter last name"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Phone Number</span>
              <input
                required
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+234 000 000 0000"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Email Address</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberProfileCard({
  member,
  onClose,
}: {
  member: SavedMember;
  onClose: () => void;
}) {
  const totalPaid = member.leviesPaid + member.contributions;
  const totalDebt = member.outstanding + member.penalties;

  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
          {getInitials(member.firstName, member.lastName)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-gray-900">
            {member.firstName} {member.lastName}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">{member.phone}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-yellow-300 bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
          <AlertTriangle className="h-3.5 w-3.5" />
          Owing
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-2 gap-4 px-6 pt-5">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-4">
          <p className="text-sm text-red-500">Total Debt</p>
          <p className="mt-1 text-xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="px-6 pb-6 pt-5">
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-600">Levies Paid:</span>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(member.leviesPaid)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-600">Contributions:</span>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(member.contributions)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-600">Outstanding:</span>
            <span className="text-sm font-bold text-red-600">{formatCurrency(member.outstanding)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-600">Penalties:</span>
            <span className="text-sm font-bold text-red-600">{formatCurrency(member.penalties)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   EXPORTED PAGE
   ========================================= */

export default function MembersManagement() {
  const [showModal, setShowModal] = useState(false);
  const [savedMember, setSavedMember] = useState<SavedMember | null>(null);

  const handleMemberSaved = (member: SavedMember) => {
    setShowModal(false);
    setSavedMember(member);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Members Management</h1>
          <p className="mt-1 text-gray-600">Add members and view their financial profiles</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
        >
          Add New Member
        </button>
      </div>

      {/* Profile Card (shown after save) */}
      {savedMember && (
        <div className="mb-8">
          <MemberProfileCard member={savedMember} onClose={() => setSavedMember(null)} />
        </div>
      )}

      {!savedMember && (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-sm text-gray-500">No member selected. Click &quot;Add New Member&quot; to get started.</p>
        </div>
      )}

      <AddMemberModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onMemberSaved={handleMemberSaved}
      />
    </div>
  );
}
