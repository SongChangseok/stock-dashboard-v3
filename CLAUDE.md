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

1. **Stock Holdings Page**: View current portfolio positions at a glance and track performance

   - Holdings table (symbol, quantity, average cost, total cost, market price, market value, unrealized P&L)
   - Portfolio Summary with 4 key metrics (Total Cost Basis, Total Market Value, Total Unrealized P&L, Total Positions)
   - Asset allocation pie chart visualization
   - Add/edit/delete positions functionality, manual current price updates

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
- ✅ **Phase 2 UI Components Completed**: All core components implemented and functional
- ✅ **Holdings Page Fully Implemented**: Complete CRUD operations, portfolio summary, and data visualization
- ✅ **Consistency Standards Established**: Terminology, design patterns, and component structure standardized
- 🎯 **Next Step**: Phase 3 additional features (Portfolio Management Page, Rebalancing Page)

### ⚠️ MANDATORY CONSISTENCY RULES

**Before implementing ANY new feature, ALWAYS follow the comprehensive consistency framework below:**

## 🎯 **PRODUCT CONSISTENCY FRAMEWORK**

### **1. 📝 TERMINOLOGY CONSISTENCY**
**Financial Terms - ALWAYS use these exact terms:**
- ✅ "Position" (not "Stock") for individual holdings
- ✅ "Holdings" for collections of positions
- ✅ "Market Value" (not "Current Value")
- ✅ "Cost Basis" (not "Purchase Price")
- ✅ "Unrealized P&L" (not "Profit/Loss")
- ✅ "Portfolio" for the entire collection
- ✅ "Target Allocation" (not "Target Weight")

**UI Terminology - Consistent labeling patterns:**
- ✅ "Total" prefix for summary metrics
- ✅ "Add Position" / "Edit Position" / "Delete Position"
- ✅ "Holdings Table" / "Portfolio Summary"
- ✅ Action buttons: "Edit" / "Delete" (not "Update" / "Remove")

### **2. 🎨 DESIGN SYSTEM CONSISTENCY**

**Typography Hierarchy:**
```css
/* Page Titles */
h1: text-3xl font-bold + gradient (bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent)

/* Section Titles */  
h2: text-2xl font-semibold

/* Card Titles */
CardTitle: text-xl font-bold + gradient (built-in)

/* Subsection Titles */
h3: text-lg font-medium

/* Body Text */
p: text-base (default)

/* Small Text */
small: text-sm opacity-70
```

**Color Usage - ALWAYS use CSS variables:**
```css
/* Primary Colors */
--primary: #2563EB (buttons, links, accents)
--success: #10B981 (gains, positive values)
--error: #EF4444 (losses, negative values, warnings)
--warning: #F59E0B (attention, caution)

/* Backgrounds */
--background: main background
--background-secondary: secondary areas
--muted: subtle backgrounds
--muted-foreground: subtle text

/* Interactive Elements */
hover:bg-blue-50 dark:hover:bg-blue-900/20 (edit actions)
hover:bg-red-50 dark:hover:bg-red-900/20 (delete actions)
```

**Button System - ALWAYS use these patterns:**
```tsx
/* Primary Actions */
<button className="btn btn-primary">
  <Icon className="h-4 w-4" />
  Action Text
</button>

/* Secondary Actions */
<button className="btn btn-secondary">
  <Icon className="h-4 w-4" />
  Action Text
</button>

/* Action Buttons (tables/grids) */
<button className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed">
  <Edit className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
</button>
```

**Icon Standards:**
- ✅ Edit actions: `Edit` (not `Edit2`)
- ✅ Delete actions: `Trash2`
- ✅ Add actions: `Plus`
- ✅ Settings: `Settings`
- ✅ Icon size: `h-4 w-4` (16px) for buttons, `h-5 w-5` (20px) for titles

### **3. 🏗️ COMPONENT ARCHITECTURE CONSISTENCY**

**Card Structure - ALWAYS follow this pattern:**
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      Title Text
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Modal Pattern - ALWAYS use consistent structure:**
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Action Title" size="md">
  <form onSubmit={handleSubmit} className="space-y-4">
    {/* Form fields */}
    <div className="flex justify-end gap-3 pt-4">
      <button type="button" className="btn btn-secondary">
        <X className="h-4 w-4" />
        Cancel
      </button>
      <button type="submit" className="btn btn-primary">
        <Save className="h-4 w-4" />
        Save Action
      </button>
    </div>
  </form>
</Modal>
```

**Page Layout Pattern:**
```tsx
<div className="space-y-6 animate-fade-in-scale">
  {/* Page Header */}
  <div className="flex justify-between items-center">
    <div className="space-y-1">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        Page Title
      </h1>
      <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
        Page description
      </p>
    </div>
    <button className="btn btn-primary">
      <Plus className="h-4 w-4" />
      Primary Action
    </button>
  </div>
  
  {/* Content */}
</div>
```

### **4. 💻 CODE PATTERN CONSISTENCY**

**State Management - ALWAYS use Zustand patterns:**
```tsx
const { 
  // Computed getters
  getCurrentHoldings,
  getTotalValue,
  // Actions
  addHolding,
  updateHolding,
  deleteHolding,
  // UI state
  ui,
  setLoading,
  setError
} = usePortfolioStore()
```

**Error Handling - ALWAYS follow this pattern:**
```tsx
const handleAction = async () => {
  try {
    setLoading(true)
    await performAction()
  } catch (error) {
    setError('Action failed')
  } finally {
    setLoading(false)
  }
}
```

**Form Validation - ALWAYS use consistent patterns:**
```tsx
const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

const validateForm = (): boolean => {
  const newErrors: Partial<Record<keyof FormData, string>> = {}
  
  if (!formData.field) {
    newErrors.field = 'Field is required'
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### **5. 🎨 STYLING CONSISTENCY**

**ALWAYS prefer CSS variables over hardcoded values:**
```tsx
// ✅ Correct
style={{ color: 'var(--success)' }}
style={{ backgroundColor: 'var(--muted)' }}

// ❌ Avoid
className="text-green-600"
style={{ color: '#10B981' }}
```

**Loading States - ALWAYS use consistent patterns:**
```tsx
{ui.isLoading && (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  </div>
)}
```

**Grid Layouts - ALWAYS use responsive patterns:**
```tsx
/* 2-column responsive */
className="grid grid-cols-1 md:grid-cols-2 gap-6"

/* 4-column responsive */  
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

/* 3-column with priority */
className="grid grid-cols-1 lg:grid-cols-3 gap-6"
```

### **6. 🔧 DEVELOPMENT WORKFLOW CONSISTENCY**

**File Naming - ALWAYS use PascalCase:**
- Components: `ComponentName.tsx`
- Pages: `PageName.tsx`
- Utilities: `utilityName.ts`
- Types: `typeName.ts`

**Import Organization - ALWAYS group in this order:**
```tsx
// 1. React and external libraries
import React from 'react'
import { SomeIcon } from 'lucide-react'

// 2. Internal hooks and stores
import { usePortfolioStore } from '../stores/portfolioStore'

// 3. Components (UI first, then feature-specific)
import { Card, CardHeader, CardContent } from '../ui/Card'
import ComponentName from '../components/ComponentName'

// 4. Types
import type { TypeName } from '../types/portfolio'
```

**Component Props - ALWAYS use consistent patterns:**
```tsx
interface ComponentNameProps {
  // Data props first
  data: DataType[]
  
  // Event handlers
  onAction: (param: Type) => void
  
  // Optional configurations
  isLoading?: boolean
  className?: string
}
```

## 🚨 **CONSISTENCY CHECKLIST**

Before submitting any code, verify:
- [ ] **Terminology**: All financial terms follow the standard
- [ ] **Typography**: Headings use the correct hierarchy
- [ ] **Colors**: All colors use CSS variables
- [ ] **Buttons**: Follow the established button patterns
- [ ] **Icons**: Use consistent icon types and sizes
- [ ] **Layout**: Page/component structure matches patterns
- [ ] **State**: Zustand store usage is consistent
- [ ] **Error Handling**: Follows the standard pattern
- [ ] **Styling**: CSS variables over hardcoded values
- [ ] **Loading States**: Consistent loading indicators
- [ ] **File Names**: PascalCase naming convention
- [ ] **Imports**: Proper organization and grouping

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
6. **⚠️ CRITICAL**: ALWAYS maintain consistency in terminology, design patterns, and component structure
   - Review existing components for naming conventions before implementing
   - Use consistent button styles, color schemes, and card layouts
   - Follow established patterns for error handling and loading states

### Component Structure

```
src/components/
├── ui/          # Reusable basic UI (Button, Input, Card, Modal, Table) ✅
├── charts/      # Recharts-based chart components (PieChart) ✅
├── portfolio/   # Business logic components (HoldingsTable, PortfolioSummary, StockModal) ✅
└── layout/      # Layout components (Header, Sidebar, Layout) - TODO
```

### Tailwind CSS Styling

- **Predefined classes**: `.card`, `.btn`, `.btn-primary` etc. (`src/index.css`)
- **Dark mode**: Use `dark:` prefix, controlled by `settings.darkMode`
- **IMPORTANT**: ALWAYS use predefined CSS classes for consistency

```tsx
// Recommended: Use predefined classes and consistent terminology
<div className="card">
  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Portfolio Status</h2>
  <button className="btn btn-primary">Add Position</button>
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

- For positions where current weight vs target weight difference is 5% or more
- Calculate buy/sell quantities and amounts to generate `RebalancingSuggestion`

## Development Priorities

### Phase 1 (MVP) - Completed ✅

Project initialization and foundation building completed

### Phase 2 (Basic UI Components) - Completed ✅

**Completed Components**:

1. **UI Components**: `Button`, `Input`, `Card`, `Modal`, `Table` basic components
2. **HoldingsTable**: Complete holdings display with sorting, filtering, and CRUD operations
3. **PortfolioSummary**: 4-card metrics display (Cost Basis, Market Value, P&L, Positions)
4. **StockModal**: Position add/edit form with real-time validation and preview
5. **PieChart**: Portfolio allocation visualization with Recharts

**Implemented Features**:

1. **Stock Holdings Page**: Complete implementation with position CRUD, portfolio summary, and allocation chart
2. **Terminology Standardization**: Unified use of "Position" instead of "Stock", financial terminology consistency
3. **Design System**: Consistent button styles, color coding (green/red for gains/losses), unified Card layouts
4. **Data Management**: LocalStorage persistence, form validation, error handling

### Phase 3 - Additional Features

1. Line chart for return trend display
2. CSV upload/download
3. Period-based return calculations (1 month, 3 months, 1 year)
4. Stock classification through tag system
5. Dark mode support

### User Stories (Development Reference)

- **Holdings Status**: Individual investors view portfolio positions at a glance and quickly assess portfolio status
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
