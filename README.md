# Choir FinSec - St Cecilia Choir Financial Management

## Overview
Choir FinSec is a robust financial management dashboard built for the Financial Secretary of St Cecilia Choir. The application simplifies tracking income, expenses, member levies, and event-based financial performance. It provides a clean, interactive UI for monitoring the choir's overall financial health and ensuring debt accountability.

## Core Features

### 1. Dashboard & Analytics
- **Financial Summary**: High-level view of Bank Balance, Cash Balance, Total Income, and Total Expenses.
- **Top Debtors**: Identifies members with outstanding amounts, categorized by severity (Owing vs. Critical).
- **Event Performance**: Tracks the profitability of specific choir events (e.g., Harvest, Christmas Carol) by comparing income against expenses.
- **Recent Activity**: A stream of the most recent financial transactions for quick auditing.

### 2. Transaction Management
- **Global Records**: A central repository for every financial movement.
- **Categorization**: Transactions are labeled by category (Levy, Transport, Welfare, etc.) and mode (Cash vs. Transfer).
- **Filtering**: Users can toggle between Income, Expenses, or All Transactions.

### 3. Member & Levy Tracking
- **Member Directory**: A detailed list of choir members, including their roles and individual debt status.
- **Levy Progress**: Visual progress bars for active levies (like Monthly Welfare) showing collection percentages and deadlines.
- **Contributions**: Records voluntary member contributions, distinguishing between general donations and event-specific support.

### 4. Reporting
- **Visual Breakdowns**: Automated breakdown charts for Income and Expense categories to help identify major spending areas.

## Tech Stack
- **Framework**: [React](https://reactjs.org/) (TypeScript)
- **Routing**: [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Project Structure (Key Files)
- `src/pages/dashboard/dashboard.tsx`: The heart of the application. It contains the mock database, state management for navigation, and all functional pages (Home, Members, Levies, etc.).
- `src/pages/dashboard/components/Sidebar.tsx`: Handles the navigation layout for the dashboard.

## Component Architecture in `dashboard.tsx`

### UI Components
- `StatCard`: Reusable card for displaying big-number metrics with associated icons.
- `Header`: Standardized page header with a title, subtitle, and primary action button.
- `StatusBadge`: Dynamically styles status labels (e.g., `bg-green-100` for PAID, `bg-red-100` for Critical).
- `TransactionTable`: A flexible table component used across various pages to list financial records consistently.

### Navigation Pages
- `DashboardHome`: The "Overview" landing page.
- `MembersPage`: The directory for member data and debt oversight.
- `LeviesPage`: The hub for tracking mandatory collections.
- `ReportsPage`: Summarized financial breakdowns.

## Data Model
The project currently utilizes a centralized mock data structure at the top of `dashboard.tsx`:
- `transactions`: Array of `Transaction` objects.
- `members`: Detailed profiles including contact info and outstanding debt.
- `debtors` & `events`: Summarized views for dashboard alerts.
- `levies` & `contributions`: Tracking arrays for specific payment types.

## Collaboration & Development

### Interaction Design
- **Navigation**: Uses `useNavigate` from React Router for internal dashboard transitions.
- **Feedback**: Interactive elements like buttons and filters include the `cursor-pointer` class for a better user experience.

### How to contribute
1. **Logic Updates**: Financial calculations (like `totalIncome` or `bankBalance`) are performed using `.reduce()` methods on the mock data arrays. Update these selectors if the data schema changes.
2. **New Pages**: Create a new exported function in `dashboard.tsx`, then add the corresponding route to the `Outlet` structure and link it in the `Sidebar`.
3. **API Integration**: The next major step is replacing the `const` mock arrays with `useEffect` hooks that fetch from a backend API.

## Getting Started
1. Clone the repo.
2. Install dependencies: `npm install`
3. Start development: `npm run dev`

---
*Maintained by the St Cecilia Choir FinSec Team.*