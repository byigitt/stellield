# Transactions Page

Real-time monitoring dashboard for cross-chain yield transactions.

## Features

### 📊 Live Statistics Dashboard
- **Total Transactions**: Count of transactions in the last 24 hours
- **Total Volume**: USD value of all transactions
- **Total Yield**: Cumulative yield earned across all transactions
- **Success Rate**: Percentage of successfully completed transactions

### 🔄 Real-Time Updates
- Automatic refresh every 2 seconds for transaction list
- Statistics update every 5 seconds
- Live progress bars for active transactions
- Instant status changes

### 🎯 Transaction Filtering
Filter transactions by status:
- **All**: View all transactions
- **Pending**: Transactions waiting to start
- **Processing**: Currently executing transactions
- **Completed**: Successfully finished transactions
- **Failed**: Transactions that encountered errors

### 📱 Transaction Cards
Each transaction card displays:
- Unique transaction ID (shortened for readability)
- Time since creation (e.g., "2m ago", "1h ago")
- Status badge with color coding:
  - 🔵 **Pending** (Blue)
  - 🟡 **Processing** (Yellow, animated)
  - 🟢 **Completed** (Green)
  - 🔴 **Failed** (Red)
- Amount breakdown:
  - XLM deposited
  - USDC value
  - Yield earned
- Progress bar for active transactions
- Current step indicator

### 🔍 Transaction Details Modal
Click any transaction card to view:
- Full transaction ID
- User wallet address
- Creation timestamp
- Complete amount breakdown:
  - XLM deposited
  - USDC after swap
  - Yield earned
  - XLM returned
- **Interactive Timeline**: Visual representation of all 13 transaction steps
  - Completed steps (green check)
  - Current step (blue spinner)
  - Pending steps (gray circle)
  - Transaction hashes for each step
  - Timestamps
  - Copy to clipboard functionality
  - External explorer links

## Transaction Flow

The page tracks the complete 13-step cross-chain yield flow:

1. ✅ XLM Received
2. 🔄 Swap XLM → USDC (Stellar)
3. 🔥 Burn USDC on Stellar
4. 🌉 Bridge Attestation (Stellar → Ethereum)
5. ⚡ Mint USDC on Ethereum
6. 💰 Supply to Aave
7. 📈 Yield Accumulation
8. 💸 Withdraw from Aave
9. 🔥 Burn USDC on Ethereum
10. 🌉 Bridge Attestation (Ethereum → Stellar)
11. ⚡ Mint USDC on Stellar
12. 🔄 Swap USDC → XLM
13. ✅ XLM Returned

## Usage

### Starting a Transaction
1. Navigate to the Dashboard or Yields page
2. Click "Deposit" to start a yield flow
3. Enter the XLM amount
4. Confirm the transaction
5. Watch it appear on the Transactions page in real-time

### Monitoring Progress
1. Go to `/dashboard/transactions`
2. View all active transactions
3. Watch progress bars update as steps complete
4. Click any card for detailed timeline

### Filtering Transactions
1. Use the tabs at the top to filter by status
2. Each tab shows the count in parentheses
3. Filter persists during page refresh

## Technical Details

### Data Source
- Backend: `StellarYieldService` (in-memory storage)
- API: tRPC endpoints for queries
- Real-time: React Query with polling

### Performance
- Efficient polling (2s for transactions, 5s for stats)
- Memoized filtering
- Lazy-loaded detail modal
- Optimized re-renders

### Components
- `page.tsx`: Main page with stats and list
- `transaction-card.tsx`: Individual transaction display
- `transaction-timeline.tsx`: Step-by-step visualization

## Styling

Follows the platform's design system:
- Glass-morphism effects
- Blue/Purple gradient accents
- Consistent spacing and typography
- Responsive grid layout
- Smooth transitions and animations
