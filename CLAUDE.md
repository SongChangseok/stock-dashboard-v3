# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stock Portfolio Dashboard v3** is a React + TypeScript based portfolio management web application for individual investors (beginner to intermediate).

### Core Value Proposition

- **Simple and Intuitive Interface**: Easy to understand even for users unfamiliar with financial terminology
- **User-Driven Data Management**: Based on user manual input without real-time API integration
- **Data Privacy through Local Storage**: Complete client-side app using LocalStorage

### Constraints

- No real-time stock price data (user manual input)
- No external API integration
- No multi-user support (local single user)

## Development Commands

### Basic Development Workflow

```bash
npm run dev        # Start development server (http://localhost:5173)
npm run build      # TypeScript compilation and production build
npm run lint       # Run ESLint (TypeScript errors checked during build)
npm run preview    # Preview production build
```

### Code Quality

- **TypeScript**: `tsc` included in build process for type checking
- **ESLint**: Basic JavaScript rules applied (TypeScript rules handled by compiler)
- **Prettier**: Code formatting configured (see `.prettierrc` file)

## Token Usage Optimization

### File Reading Optimization

- **Read only necessary files**: Type definitions are concentrated in `src/types/portfolio.ts`
- **Core logic files**: `src/stores/portfolioStore.ts`, `src/utils/calculations.ts`, `src/utils/dataTransform.ts`
- **Config files**: `package.json`, `tailwind.config.js`, `tsconfig.json` etc. are already configured

### Search Optimization

- **Use Glob patterns**: Limit scope with `src/components/**/*.tsx`, `src/utils/*.ts` etc.
- **Find functions/variables with Grep**: Locate exact positions using specific function or type names
- **Use Task tool**: Only when complex search or multi-file analysis is needed

### Efficient Development Patterns

- **Reuse existing patterns**: Type definitions, calculation logic, data transformation patterns already established
- **Extend Store actions**: New features can be added by extending existing `portfolioStore.ts` actions
- **Component structure**: Utilize `src/components/ui/`, `portfolio/`, `charts/` folder structure

### Prevent Unnecessary Work

- **No documentation generation**: Use existing structure without creating README or additional .md files
- **Avoid excessive refactoring**: Modify working code only when necessary
- **Prevent duplicate type definitions**: Maximize use of existing types in `src/types/portfolio.ts`

## Page Structure and Features

### 3 Main Pages

1. **Stock Holdings Page**: View current stock holdings at a glance and track period-based returns

   - Holdings table (symbol, quantity, average price, current price, unrealized gain/loss, return rate)
   - Total portfolio value and profit/loss summary
   - Asset allocation pie chart visualization
   - Add/edit/delete stocks functionality, manual current price updates

2. **Portfolio Management Page**: Portfolio composition and target allocation management

   - Set target portfolio weights
   - Current vs target weight comparison visualization (bar chart)
   - Stock classification through tag system
   - Portfolio performance tracking

3. **Rebalancing Management Page**: Portfolio rebalancing planning and execution support
   - Calculate current vs target weight differences
   - Rebalancing simulation (buy/sell quantity and amount suggestions)
   - Display stocks requiring rebalancing based on fixed 5% threshold

### Common Features

- **Data Management**: JSON/CSV file upload/download, automatic LocalStorage saving
- **UI**: Responsive design, dark/light mode support, loading states and error handling

## Architecture Overview

### State Management - Zustand Store

The core is a single Zustand store in `src/stores/portfolioStore.ts`:

```typescript
interface PortfolioStore {
  // State: Portfolio history, target weights, settings, UI state
  portfolioHistory: PortfolioSnapshot[] // Time-based portfolio snapshots
  targets: TargetAllocation[] // Target asset allocation
  settings: Settings // App settings like dark mode
  ui: UIState // Loading, error states

  // Computed values: Real-time calculation of current portfolio state
  getCurrentSnapshot: () => PortfolioSnapshot | null
  getCurrentHoldings: () => Holding[]
  getTotalValue: () => number
  getCurrentWeights: () => Record<string, number>
  getRebalancingSuggestions: () => RebalancingSuggestion[]

  // Actions: CRUD operations and data management
  addHolding
  updateHolding
  deleteHolding
  loadFromJson
  exportToJson
  exportToCsv
  importFromCsv
}
```

### Data Persistence - LocalStorage Integration

- **Auto-save**: Automatically save to localStorage when store changes (`subscribeToStore()`)
- **Initialization**: Load data from localStorage on app start (`loadFromLocalStorage()`)
- **Backup/Restore**: Full data backup and restore support with JSON/CSV files

### Data Backup Formats

**JSON Backup**: Complete portfolio history and settings data included

```json
{
  "portfolioHistory": [...],
  "targets": [...],
  "settings": { "darkMode": boolean, "lastUpdated": "datetime" }
}
```

**CSV Backup**: Flattened format for analysis in external tools like Excel

```csv
date,symbol,name,quantity,avgPrice,currentPrice,marketValue,unrealizedGain,unrealizedGainPercent,targetWeight,tag
```

### Data Model - Time-based Snapshot System

**Core Concept**: Portfolio is stored as an array of time-based snapshots (`PortfolioSnapshot`).

```typescript
PortfolioSnapshot {
  date: string              // ISO date
  holdings: Holding[]       // Holdings at that point in time
  totalValue: number        // Total portfolio value
  totalGain: number         // Total gain/loss
  totalGainPercent: number  // Total return rate
}
```

**Data Usage Patterns**:

- **Latest date data**: Displayed as current holdings status
- **Historical date data**: Used for period-based return calculations (1 month, 3 months, 1 year)
- **New data input**: Added as new date entries to maintain history

Each `Holding` includes real-time calculated `marketValue`, `unrealizedGain`, `unrealizedGainPercent`.

### Calculation Logic - utils/calculations.ts

Core financial calculation functions:

- `calculateUnrealizedGain()`: Individual stock gain/loss calculation
- `calculatePortfolioTotals()`: Total portfolio gain/loss calculation
- `calculateWeights()`: Stock weight calculation within portfolio
- `generateRebalancingSuggestions()`: Rebalancing suggestions based on 5% threshold
- `calculatePerformanceMetrics()`: Period-based performance metrics (returns, volatility, Sharpe ratio, etc.)

### Data Transformation - utils/dataTransform.ts

- **CSV Conversion**: Convert/restore portfolio history to/from flat CSV format
- **Form Data Processing**: Transform UI form data to internal data structures
- **File Processing**: File upload/download and validation
- **Validation**: Input data validation and error handling

## Design System

### Design Principles

- **Minimalism**: Remove unnecessary elements, focus on core functionality
- **Intuitiveness**: Easy to understand even for users unfamiliar with financial terms
- **Consistency**: Apply consistent design patterns across all pages

### Color Palette and Layout

- **Colors**: Primary(#2563EB), Success(#10B981), Warning(#F59E0B), Error(#EF4444)
- **Typography**: Headings (bold font 700), body text (normal font 400), numbers (monospace)
- **Layout**: Header (logo, navigation), sidebar (menu), main content, footer (data management)

## Performance Goals

- Page loading time < 2 seconds
- Major action completion rate > 90%
- Support for all major browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## Recommended Development Patterns

### Current Project Status

- ✅ **Complete Foundation Infrastructure**: Type system, Zustand store, utility functions all completed
- ❌ **UI Components Not Implemented**: `src/components/` folder is empty, awaiting Phase 2 development
- 🎯 **Next Step**: Focus only on UI component development for quick completion

### Type-First Development Pattern

```typescript
// Recommended: Maximize use of existing types
import { Holding, HoldingFormData, ButtonProps } from '../types/portfolio'

// Prohibited: Duplicate type definitions ❌
// interface MyHolding { ... }
```

### Zustand Store-Centered Development

```typescript
// Recommended: Use store's computed values
const { getCurrentHoldings, getTotalValue, getRebalancingSuggestions } = usePortfolioStore()

// Recommended: Change state through store actions
const { addHolding, updateHolding, deleteHolding } = usePortfolioStore()

// Prohibited: Direct state manipulation ❌
// Managing portfolio data with useState
```

### Development Workflow

```typescript
// Step 1: Check existing types
import { Holding, HoldingFormData } from '../types/portfolio'

// Step 2: Check existing utility functions
import { calculateUnrealizedGain } from '../utils/calculations'

// Step 3: Use store actions
const { addHolding } = usePortfolioStore()

// Step 4: Implement component
const StockForm = () => {
  const handleSubmit = (formData: HoldingFormData) => {
    addHolding(formData) // Store automatically handles calculations
  }
}
```

### Adding New Features (Token-Efficient Approach)

1. **Check existing code first**: Use `Grep` or `Glob` to check for similar functionality
2. **Type definitions**: Extend existing types in `src/types/portfolio.ts` or add new interfaces
3. **Calculation logic**: Implement business logic in `src/utils/calculations.ts`
4. **Store actions**: Add actions following existing patterns in `src/stores/portfolioStore.ts`
5. **UI components**: Prioritize reusing existing `src/components/ui/` components, create new ones only when necessary

### Component Structure

```
src/components/
├── ui/          # Reusable basic UI (Button, Input, Card, Modal, Table)
├── charts/      # Recharts-based chart components (PieChart, LineChart, BarChart)
├── portfolio/   # Business logic components (HoldingsTable, PortfolioSummary, StockModal)
└── layout/      # Layout components (Header, Sidebar, Layout)
```

### Tailwind CSS Styling

- **Predefined classes**: `.card`, `.btn`, `.btn-primary` etc. (`src/index.css`)
- **Dark mode**: Use `dark:` prefix, controlled by `settings.darkMode`

```tsx
// Recommended: Use predefined classes
<div className="card">
  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Portfolio Status</h2>
  <button className="btn btn-primary">Add Stock</button>
  <button className="btn btn-secondary">Cancel</button>
</div>
```

### Performance Optimization Patterns

```typescript
// Recommended: Prevent unnecessary re-renders with React.memo
const HoldingsTable = React.memo(({ holdings }: { holdings: Holding[] }) => {
  // ...
})

// Recommended: Function memoization with useCallback
const handleAddHolding = useCallback(
  (formData: HoldingFormData) => {
    addHolding(formData)
  },
  [addHolding]
)
```

### Data Flow Pattern

```
User Input → HoldingFormData → Store.addHolding() → Auto Calculation → UI Update
                                     ↓
                            Auto LocalStorage Save
```

## Data Structure Understanding

### Portfolio History vs Current State

- **portfolioHistory**: Array of time-based portfolio snapshots (including historical records)
- **getCurrentSnapshot()**: Most recent snapshot (current portfolio state)
- **updateCurrentHoldings()**: Used when updating current holdings (modifies last snapshot)
- **addPortfolioSnapshot()**: Adds snapshot at new point in time

### CSV Data Structure

CSV is a flattened form of portfolio history:

```csv
date,symbol,name,quantity,avgPrice,currentPrice,marketValue,unrealizedGain,unrealizedGainPercent,targetWeight,tag
2024-01-01,AAPL,Apple Inc.,100,150.00,155.00,15500,500,3.33,30,Tech
```

### Rebalancing Logic

Based on 5% threshold:

- For stocks where current weight vs target weight difference is 5% or more
- Calculate buy/sell quantities and amounts to generate `RebalancingSuggestion`

## Development Priorities

### Phase 1 (MVP) - Completed ✅

Project initialization and foundation building completed

### Phase 2 (Next Step) - Basic UI Component Development

**Development Priorities**:

1. **UI Components First**: `Button`, `Input`, `Card`, `Modal` basic components
2. **HoldingsTable**: Most important business component
3. **StockModal**: Stock add/edit form
4. **Chart Components**: `PieChart` (stock allocation)
5. **Layout**: `Header`, `Sidebar` structure

**Implementation Content**:

1. **Stock Holdings Page**: Stock add/edit/delete, current portfolio status table, stock allocation pie chart
2. **Portfolio Management Page**: Target weight settings, current vs target weight comparison (bar chart)
3. **Rebalancing Management Page**: Rebalancing suggestions (fixed 5% threshold)
4. **Data Management**: JSON upload/download, LocalStorage saving

### Phase 3 - Additional Features

1. Line chart for return trend display
2. CSV upload/download
3. Period-based return calculations (1 month, 3 months, 1 year)
4. Stock classification through tag system
5. Dark mode support

### User Stories (Development Reference)

- **Holdings Status**: Individual investors view stock holdings at a glance and quickly assess portfolio status
- **Portfolio Management**: Investors set target portfolio weights and compare with current to determine rebalancing needs
- **Rebalancing**: Investors receive rebalancing suggestions to adjust portfolio to target allocation

Refer to `docs/development-plan.md` and `docs/prd.md` for detailed information on each development phase.

## Development Efficiency Guide

### Code Reuse Priority

- **Calculation functions**: Utilize existing functions like `calculateUnrealizedGain`, `calculateWeights`, `generateRebalancingSuggestions`
- **Data transformation**: Use existing utilities like `formDataToHolding`, `portfolioToCsv`, `validatePortfolioData`
- **Store patterns**: Follow patterns of existing actions (`addHolding`, `updateHolding`, `deleteHolding`)

### Core Files for Rapid Development

- **Type reference**: `src/types/portfolio.ts` - All interface definitions
- **State management**: `src/stores/portfolioStore.ts` - Global state and actions
- **Business logic**: `src/utils/calculations.ts` - Financial calculations
- **Style guide**: `src/index.css` - Predefined CSS classes

### Prevent Unnecessary Token Usage

- Search for existing similar functionality before implementing new features to prevent duplicate work
- Config files are already completed, no modification needed
- Keep documentation minimal, code itself serves as documentation

## 2025 Web Design Trends and Best Practices

This section covers 2025 web design trends that can be referenced during Stock Portfolio Dashboard v3 development.

### Major Design Trends

1. **Micro Interactions**

   - Subtle animations for user feedback
   - Enhanced engagement through interaction elements like hover effects
   - Implementation of intuitive and human-like digital experiences

2. **Retro Style Design**

   - Utilize bold colors, pixel art, and nostalgic visual elements
   - Combine 80s, 90s, and early 2000s aesthetics with modern web functionality
   - Offer fun alternatives instead of overly polished designs

3. **Interactive 3D Elements**

   - Add depth and realism to websites
   - Evolve into AR/VR-like experiences
   - Implement immersive and engaging digital interactions

4. **Scrapbook Aesthetics**

   - Layered and asymmetrical designs
   - Include textures, washi tape, stickers, and handmade elements
   - Emphasize authenticity and personal creativity

5. **Bold Minimalism**

   - Clean layouts with strong typography
   - Maximize white space
   - Focus on content clarity and visual appeal

6. **AI-Generated Visuals**

   - Rapidly create unique and customized content
   - Improve design workflows
   - Maintain creative control while leveraging automation

7. **Dark Theme Design**

   - Customizable interfaces that reduce eye strain
   - High-contrast layouts
   - Consider user convenience and preferences

8. **Hyper-Personalized Interfaces**

   - Adapt content and layout to individual users
   - Build deeper connections
   - Enhance usability through customized experiences

9. **Accessibility**

   - Ensure websites are usable by all users
   - Implement high contrast, keyboard navigation, ARIA labels
   - Comply with inclusivity standards

10. **Sustainable Web Design**
    - Reduce environmental impact through efficient coding
    - Optimize images and hosting
    - Meet expectations of environmentally conscious consumers

### Project Application Recommendations

Applicable trends for **Stock Portfolio Dashboard v3**:

- **Bold Minimalism**: Aligns with existing design principles
- **Dark Theme Design**: Already planned dark/light mode support
- **Micro Interactions**: Add subtle animations to button and chart interactions
- **Accessibility**: Utilize high-contrast colors important for financial data visualization
- **Hyper-Personalization**: Interface customization based on user settings

These trends align well with the project's **simple and intuitive interface** goals and **data privacy through local storage** principles.
