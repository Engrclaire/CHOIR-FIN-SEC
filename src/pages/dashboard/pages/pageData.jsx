export const transactions = [];

export const debtors = [
  { name: 'Joshua Okonkwo', amount: 15000, status: 'critical' },
  { name: 'Agu Emmanuel', amount: 12500, status: 'owing' },
  { name: 'Anamba Florence', amount: 8000, status: 'owing' },
];

export const events = [
  {
    id: 1,
    name: '2026 Concert',
    status: 'Active',
    period: 'Feb 1, 2026 - Jun 30, 2026',
    income: 250000,
    expenses: 130000,
    net: 120000,
  },
  {
    id: 2,
    name: 'Carol Event',
    status: 'Pending',
    period: 'Nov 8, 2025 - Dec 24, 2025',
    income: 98000,
    expenses: 76000,
    net: 22000,
  },
  {
    id: 3,
    name: 'Harvest Festival',
    status: 'Pending',
    period: 'Nov 1, 2025 - Dec 18, 2025',
    income: 70000,
    expenses: 82000,
    net: -12000,
  },
  {
    id: 4,
    name: 'Evening of Hymns',
    status: 'Reconciled',
    period: 'Mar 1, 2025 - Aug 21, 2025',
    income: 190000,
    expenses: 160000,
    net: 30000,
  },
  {
    id: 5,
    name: '2024 Concert',
    status: 'Reconciled',
    period: 'Feb 1, 2024 - Jul 20, 2024',
    income: 260000,
    expenses: 210000,
    net: 50000,
  },
];

export const levies = [
  {
    id: 1,
    name: 'Harvest Levy',
    description: 'Mandatory levy for harvest event',
    amountPerMember: 2500,
    totalCollected: 145000,
    totalExpected: 200000,
    membersPaid: 58,
    totalMembers: 80,
    deadline: '30/04/2026',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Monthly Welfare',
    description: 'Recurring welfare support levy',
    amountPerMember: 1000,
    totalCollected: 82000,
    totalExpected: 80000,
    membersPaid: 80,
    totalMembers: 80,
    deadline: 'Monthly',
    status: 'Active',
  },
];

export const contributions = [
  {
    id: 1,
    date: '19/02/2026',
    description: 'Harvest event contribution',
    source: 'Anamba Florence',
    event: 'Harvest Committee',
    amount: 5000,
    mode: 'Transfer',
    type: 'Event',
  },
  {
    id: 2,
    date: '15/02/2026',
    description: 'General welfare contribution',
    source: 'Joshua Okonkwo',
    amount: 10000,
    mode: 'Cash',
    type: 'General',
  },
  {
    id: 3,
    date: '12/02/2026',
    description: 'Christmas carol contribution',
    source: 'Agu Emmanuel',
    event: 'Christmas Carol',
    amount: 7500,
    mode: 'Transfer',
    type: 'Event',
  },
];

export const members = [
  {
    id: 1,
    firstName: 'Joshua',
    lastName: 'Okonkwo',
    phone: '+234 801 234 5678',
    email: 'joshua@example.com',
    role: 'Tenor',
    debtStatus: 'critical',
    outstandingDebt: 15000,
    penalties: 2500,
    totalPaid: 120000,
    totalLevies: 80000,
    contributions: 25000,
  },
  {
    id: 2,
    firstName: 'Agu',
    lastName: 'Emmanuel',
    phone: '+234 802 345 6789',
    email: 'agu@example.com',
    role: 'Bass',
    debtStatus: 'owing',
    outstandingDebt: 12500,
    penalties: 1000,
    totalPaid: 74000,
    totalLevies: 36000,
    contributions: 18000,
  },
  {
    id: 3,
    firstName: 'Anamba',
    lastName: 'Florence',
    phone: '+234 803 456 7890',
    email: 'florence@example.com',
    role: 'Soprano',
    debtStatus: 'owing',
    outstandingDebt: 8000,
    penalties: 0,
    totalPaid: 69000,
    totalLevies: 29000,
    contributions: 15000,
  },
  {
    id: 4,
    firstName: 'Chioma',
    lastName: 'Nwosu',
    phone: '+234 804 567 8901',
    email: 'chioma@example.com',
    role: 'Alto',
    debtStatus: 'clear',
    outstandingDebt: 0,
    penalties: 0,
    totalPaid: 98000,
    totalLevies: 54000,
    contributions: 22000,
  },
  {
    id: 5,
    firstName: 'Peter',
    lastName: 'Adeyemi',
    phone: '+234 805 678 9012',
    email: 'peter.adeyemi@example.com',
    role: 'Baritone',
    debtStatus: 'clear',
    outstandingDebt: 0,
    penalties: 0,
    totalPaid: 104500,
    totalLevies: 50000,
    contributions: 14500,
  },
];

export const users = [
  {
    id: 1,
    name: 'Rev. Fr. Peter Okoro',
    email: 'peter.okoro@stcecilia.org',
    role: 'Admin',
    status: 'Active',
    added: '1/15/2026',
  },
  {
    id: 2,
    name: 'Anamba Florence',
    email: 'florence@example.com',
    role: 'Financial Secretary',
    status: 'Active',
    added: '9/12/2025',
  },
];

export const totalIncome = transactions
  .filter((transaction) => transaction.type === 'income')
  .reduce((total, transaction) => total + (transaction.amountPaid || 0), 0);

export const totalExpenses = transactions
  .filter((transaction) => transaction.type === 'expense')
  .reduce((total, transaction) => total + (transaction.amount || 0), 0);

export const cashBalance = transactions
  .filter((transaction) => transaction.mode === 'Cash')
  .reduce((total, transaction) => total + (transaction.amountPaid || 0) - (transaction.amount || 0), 0);

export const bankBalance = transactions
  .filter((transaction) => transaction.mode === 'Transfer')
  .reduce((total, transaction) => total + (transaction.amountPaid || 0) - (transaction.amount || 0), 0);

export function formatCurrency(amount) {
  return `₦${amount.toLocaleString()}`;
}
