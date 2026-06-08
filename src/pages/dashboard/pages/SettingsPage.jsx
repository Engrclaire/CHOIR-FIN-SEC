import { useState } from 'react';
import { Header } from './pageHelpers';

const settingsToggles = [
  { label: 'Allow Backdated Transactions', description: 'Permit entry of older financial activity', enabled: true },
  { label: 'Require Approval for Expenses', description: 'Send expense requests for review before payment', enabled: false },
  { label: 'Members Directory', description: 'Show the directory to all choir members', enabled: true },
];

const accessControls = [
  { label: 'Admin access', description: 'Full permissions for system administration', enabled: true },
  { label: 'Finance team access', description: 'Access to financial reports and transactions', enabled: true },
  { label: 'Read-only access', description: 'View-only access for auditors and guests', enabled: false },
];

export function SettingsPage() {
  const [toggles, setToggles] = useState(settingsToggles);
  const [access, setAccess] = useState(accessControls);

  const toggleItem = (index) => {
    setToggles((current) =>
      current.map((item, idx) => (idx === index ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  const toggleAccess = (index) => {
    setAccess((current) =>
      current.map((item, idx) => (idx === index ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  return (
    <div className="p-8">
      <Header
        title="Settings"
        subtitle="Configure organization, permissions and financial controls"
        action="Save Settings"
        actionOnClick={() => window.alert('Settings saved successfully')}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,360px)_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Organization</h2>
                <p className="mt-2 text-sm text-gray-500">Update choir details and billing settings.</p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">Live</div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization name</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  defaultValue="St Cecilia Choir"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Financial year start</label>
                <select className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option>January</option>
                  <option>April</option>
                  <option>July</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default currency</label>
                <select className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option>Nigerian Naira (₦)</option>
                  <option>US Dollar ($)</option>
                  <option>Euro (€)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Workflow settings</h2>
            <p className="mt-2 text-sm text-gray-500">Adjust how your choir manages finances and member access.</p>
            <div className="mt-6 space-y-4">
              {toggles.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleItem(index)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${item.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Access controls</h2>
                <p className="mt-2 text-sm text-gray-500">Manage who can view and edit financial data.</p>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Standard</div>
            </div>
            <div className="space-y-4">
              {access.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAccess(index)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${item.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                <p className="mt-2 text-sm text-gray-500">Protect your choir’s financial information with secure access rules.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Two-factor authentication</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">Enabled</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Auto logout</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">30 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
