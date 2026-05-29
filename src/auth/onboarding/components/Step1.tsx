import { useState } from 'react';

interface OrganizationFormData {
  parishName: string;
  choirName: string;
  location: string;
  financialYearStartMonth: string;
  preferredCurrency: string;
}

interface OrganizationFormProps {
  onSubmit?: (data: OrganizationFormData) => void;
}

const OrganizationForm = ({ onSubmit }: OrganizationFormProps) => {
  const [formData, setFormData] = useState<OrganizationFormData>({
    parishName: '',
    choirName: '',
    location: '',
    financialYearStartMonth: '',
    preferredCurrency: 'NGN',
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currencies = [
    { code: 'NGN', name: 'NGN - Nigerian Naira' },
    { code: 'USD', name: 'USD - United States Dollar' },
    { code: 'EUR', name: 'EUR - Euro' },
    { code: 'GBP', name: 'GBP - British Pound' },
    { code: 'ZAR', name: 'ZAR - South African Rand' },
    { code: 'KES', name: 'KES - Kenyan Shilling' },
    { code: 'GHS', name: 'GHS - Ghanaian Cedi' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900">Choir Information</h2>
        <p className="text-sm md:text-md text-zinc-600 mt-2">Tell us about your choir organization</p>
      </div>

      {/* Parish Name Field */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">
          Parish Name
        </label>
        <input
          type="text"
          name="parishName"
          value={formData.parishName}
          onChange={handleInputChange}
          placeholder="e.g., St. Michael's Catholic Church"
          required
          className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
        />
      </div>

      {/* Choir Name Field */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">
          Choir Name
        </label>
        <input
          type="text"
          name="choirName"
          value={formData.choirName}
          onChange={handleInputChange}
          placeholder="e.g., St. Cecilia Choir"
          required
          className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
        />
      </div>

      {/* Location Field */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="e.g., Lagos, Nigeria"
          required
          className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
        />
      </div>

      {/* Financial Year Start Month */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">
          Financial Year Start Month
        </label>
        <select
          name="financialYearStartMonth"
          value={formData.financialYearStartMonth}
          onChange={handleInputChange}
          required
          className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            paddingRight: '2.5rem'
          }}
        >
          <option value="">Select month</option>
          {months.map((month, index) => (
            <option key={index} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Preferred Currency */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-2">
          Preferred Currency
        </label>
        <select
          name="preferredCurrency"
          value={formData.preferredCurrency}
          onChange={handleInputChange}
          required
          className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            paddingRight: '2.5rem'
          }}
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
};

export default OrganizationForm;
