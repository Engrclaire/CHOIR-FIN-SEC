import { Link } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { formatCurrency } from './pageData';

export function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
    >
      {children}
    </button>
  );
}

export function Header({ title, subtitle, action, actionOnClick, actionLink }) {
  const ButtonContent = (
    <>
      <Plus className="mr-2 h-4 w-4" />
      {action}
    </>
  );

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-gray-600">{subtitle}</p>
      </div>
      {action && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {ButtonContent}
          </Link>
        ) : (
          <PrimaryButton type="button" onClick={actionOnClick}>
            {ButtonContent}
          </PrimaryButton>
        )
      )}
    </div>
  );
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">Complete the required fields and save to continue.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ title, amount, icon: Icon, color }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(amount)}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export function SearchPanel({ placeholder }) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    PAID: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-amber-100 text-amber-700',
    PLEDGE: 'bg-blue-100 text-blue-700',
    owing: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
    clear: 'bg-green-100 text-green-700',
    Event: 'bg-purple-100 text-purple-700',
    General: 'bg-green-100 text-green-700',
    Profit: 'bg-green-100 text-green-700',
    Loss: 'bg-red-100 text-red-700',
    Active: 'bg-green-100 text-green-700',
    Pending: 'bg-amber-100 text-amber-700',
    Reconciled: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export function TransactionTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {['Date', 'Description', 'Category', 'Mode', 'Amount', 'Status'].map((heading) => (
                <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((transaction) => {
              const amount = transaction.type === 'income' ? transaction.amountPaid || 0 : transaction.amount || 0;

              return (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{transaction.source}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{transaction.category}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{transaction.mode}</td>
                  <td className={`whitespace-nowrap px-6 py-4 text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(amount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {transaction.status ? <StatusBadge status={transaction.status} /> : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RecordTransactionPanel({ onClose }) {
  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Record Transaction</h2>
          <p className="mt-1 text-sm text-gray-600">Frontend form ready for backend API integration</p>
        </div>
        <button
          type="button"
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Transaction Type">
          <select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
            <option>Income</option>
            <option>Expense</option>
          </select>
        </Field>
        <Field label="Category">
          <select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
            <option>Levy</option>
            <option>Contribution</option>
            <option>Donation</option>
            <option>Transport</option>
            <option>Welfare</option>
          </select>
        </Field>
        <Field label="Description">
          <input className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="Enter description" />
        </Field>
        <Field label="Amount">
          <input className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="0.00" type="number" />
        </Field>
        <Field label="Payment Mode">
          <select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
            <option>Transfer</option>
            <option>Cash</option>
          </select>
        </Field>
        <Field label="Date">
          <input className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" type="date" />
        </Field>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Save as Draft
        </button>
        <PrimaryButton>
          <Plus className="mr-2 h-4 w-4" />
          Record Transaction
        </PrimaryButton>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export function Detail({ label, value, className = 'text-gray-900' }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-semibold ${className}`}>{value}</p>
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

export function ReportBar({ label, value, total, danger = false }) {
  const width = Math.round((value / total) * 100);

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200">
        <div className={`h-2 rounded-full ${danger ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function MemberStat({ label, value, helper, icon: Icon, color = 'text-green-600', danger = false }) {
  return (
    <div className={`rounded-lg border p-4 ${danger ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-sm ${danger ? 'text-red-700' : 'text-gray-600'}`}>{label}</span>
        <Icon className={`h-5 w-5 ${danger ? 'text-red-600' : color}`} />
      </div>
      <p className={`text-2xl font-semibold ${danger ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
      <p className={`mt-1 text-xs ${danger ? 'text-red-600' : 'text-gray-500'}`}>{helper}</p>
    </div>
  );
}
