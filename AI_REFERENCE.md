# Canary UI Component Library - AI Agent Reference

> **FOR AI AGENTS**: This document is your complete reference for building with the Canary UI component library. Read this file completely before generating any code. Do not guess component names, icon names, or color values - use ONLY what is documented here.

## Quick Start for AI Agents

1. **Install the library** (user should have done this already):
```bash
pnpm add git+https://github.com/msantana-canary/canary-prototype-foundation.git#v0.4.2
```

2. **Import styles** in root layout:
```tsx
import '@canary-ui/components/styles.css';
```

3. **Import components** as needed:
```tsx
import { CanaryButton, CanaryInput, CanaryCard } from '@canary-ui/components';
```

4. **Use enums for type-safe props**:
```tsx
import { ButtonType, ButtonSize, ButtonColor, IconPosition } from '@canary-ui/components';
```

---

## Component Inventory

### Buttons (1 component)
| Component | Import | Description |
|-----------|--------|-------------|
| `CanaryButton` | `import { CanaryButton } from '@canary-ui/components'` | Full-featured button with types, sizes, icons, loading states |

### Forms (16 components)
| Component | Import | Description |
|-----------|--------|-------------|
| `CanaryInput` | `import { CanaryInput } from '@canary-ui/components'` | Standard text input |
| `CanaryInputUnderline` | `import { CanaryInputUnderline } from '@canary-ui/components'` | Input with floating label |
| `CanaryTextArea` | `import { CanaryTextArea } from '@canary-ui/components'` | Multi-line text input |
| `CanaryTextAreaUnderline` | `import { CanaryTextAreaUnderline } from '@canary-ui/components'` | TextArea with floating label |
| `CanarySelect` | `import { CanarySelect } from '@canary-ui/components'` | Dropdown select |
| `CanarySelectUnderline` | `import { CanarySelectUnderline } from '@canary-ui/components'` | Select with floating label |
| `CanaryCheckbox` | `import { CanaryCheckbox } from '@canary-ui/components'` | Checkbox input |
| `CanaryRadio` | `import { CanaryRadio } from '@canary-ui/components'` | Single radio button |
| `CanaryRadioGroup` | `import { CanaryRadioGroup } from '@canary-ui/components'` | Radio button group container |
| `CanarySwitch` | `import { CanarySwitch } from '@canary-ui/components'` | Toggle switch |
| `CanaryInputPassword` | `import { CanaryInputPassword } from '@canary-ui/components'` | Password input with visibility toggle |
| `CanaryInputPasswordUnderline` | `import { CanaryInputPasswordUnderline } from '@canary-ui/components'` | Password with floating label |
| `CanaryInputSearch` | `import { CanaryInputSearch } from '@canary-ui/components'` | Search input with icon |
| `CanaryInputSearchUnderline` | `import { CanaryInputSearchUnderline } from '@canary-ui/components'` | Search with floating label |
| `CanaryInputCreditCard` | `import { CanaryInputCreditCard } from '@canary-ui/components'` | Credit card input with formatting |
| `CanaryInputCreditCardUnderline` | `import { CanaryInputCreditCardUnderline } from '@canary-ui/components'` | Credit card with floating label |
| `CanaryInputPhone` | `import { CanaryInputPhone } from '@canary-ui/components'` | International phone input |
| `CanaryInputPhoneUnderline` | `import { CanaryInputPhoneUnderline } from '@canary-ui/components'` | Phone with floating label |
| `CanaryInputDate` | `import { CanaryInputDate } from '@canary-ui/components'` | Date picker |
| `CanaryInputDateUnderline` | `import { CanaryInputDateUnderline } from '@canary-ui/components'` | Date with floating label |
| `CanaryInputDateRange` | `import { CanaryInputDateRange } from '@canary-ui/components'` | Date range picker |
| `CanaryInputDateRangeUnderline` | `import { CanaryInputDateRangeUnderline } from '@canary-ui/components'` | Date range with floating label |
| `CanarySegmentedControl` | `import { CanarySegmentedControl } from '@canary-ui/components'` | Segmented button group |

### Data Display (5 components)
| Component | Import | Description |
|-----------|--------|-------------|
| `CanaryTag` | `import { CanaryTag } from '@canary-ui/components'` | Status tags with color variants |
| `CanaryTable` | `import { CanaryTable } from '@canary-ui/components'` | Data table with sorting |
| `CanaryCard` | `import { CanaryCard } from '@canary-ui/components'` | Card container with header/footer |
| `CanaryList` | `import { CanaryList } from '@canary-ui/components'` | List container with drag-and-drop |
| `CanaryListItem` | `import { CanaryListItem } from '@canary-ui/components'` | Flexible list item |

### Layout (4 components)
| Component | Import | Description |
|-----------|--------|-------------|
| `CanaryContainer` | `import { CanaryContainer } from '@canary-ui/components'` | Responsive container |
| `CanaryGrid` | `import { CanaryGrid } from '@canary-ui/components'` | CSS Grid layout |
| `CanaryModal` | `import { CanaryModal } from '@canary-ui/components'` | Modal dialog with overlay |
| `CanaryAppShell` | `import { CanaryAppShell } from '@canary-ui/components'` | **Complete app scaffolding with sidebar + header + content area** |

### Navigation (5 components + utilities)
| Component | Import | Description |
|-----------|--------|-------------|
| `CanaryTabs` | `import { CanaryTabs } from '@canary-ui/components'` | Tabbed navigation |
| `CanarySidebar` | `import { CanarySidebar } from '@canary-ui/components'` | Side navigation |
| `CanaryHeader` | `import { CanaryHeader } from '@canary-ui/components'` | Generic application header |
| `CanaryPageHeader` | `import { CanaryPageHeader } from '@canary-ui/components'` | **Standard Canary page header with property selector, user profile, reservation status** |
| `CanaryLogo` | `import { CanaryLogo } from '@canary-ui/components'` | Canary logo component |

### Feedback (3 components)
| Component | Import | Description |
|-----------|--------|-------------|
| `CanaryAlert` | `import { CanaryAlert } from '@canary-ui/components'` | Inline alert messages |
| `CanaryToast` | `import { CanaryToast } from '@canary-ui/components'` | Toast notifications |
| `CanaryLoading` | `import { CanaryLoading } from '@canary-ui/components'` | Loading spinner |

---

## Enums Reference

Always import and use these enums for type safety:

```tsx
import {
  // Button
  ButtonType,
  ButtonSize,
  ButtonColor,
  IconPosition,

  // Input
  InputType,
  InputSize,

  // Tag
  TagColor,
  TagVariant,
  TagSize,

  // Sidebar
  SidebarVariant,
  NavigationItemState,

  // Alert
  AlertType
} from '@canary-ui/components';
```

### ButtonType
```tsx
ButtonType.PRIMARY        // Solid blue button (default)
ButtonType.OUTLINED       // Border-only button
ButtonType.SHADED         // Light background button
ButtonType.TEXT           // Text-only button
ButtonType.ICON_PRIMARY   // Icon-only, primary style
ButtonType.ICON_SECONDARY // Icon-only, secondary style
```

### ButtonSize
```tsx
ButtonSize.TABLET   // Largest
ButtonSize.LARGE    // Large
ButtonSize.NORMAL   // Default
ButtonSize.COMPACT  // Small
ButtonSize.TINY     // Smallest
```

### ButtonColor
```tsx
ButtonColor.NORMAL          // Blue (default)
ButtonColor.HEADING_TEXT    // Dark text color
ButtonColor.DANGER          // Red
ButtonColor.WARNING         // Yellow/Orange
ButtonColor.SUCCESS         // Green
ButtonColor.FONT            // Standard font color
ButtonColor.FONT_SECONDARY  // Secondary font color
ButtonColor.WHITE           // White (for dark backgrounds)
```

### IconPosition
```tsx
IconPosition.LEFT   // Icon on left of text
IconPosition.RIGHT  // Icon on right of text (default)
IconPosition.TOP    // Icon above text
```

### InputType
```tsx
InputType.TEXT           // Default text input
InputType.EMAIL          // Email input
InputType.PASSWORD       // Password input
InputType.NUMBER         // Number input
InputType.TEL            // Telephone input
InputType.URL            // URL input
InputType.SEARCH         // Search input
InputType.DATE           // Date input
InputType.TIME           // Time input
InputType.DATETIME_LOCAL // DateTime input
```

### InputSize
```tsx
InputSize.TABLET   // Largest
InputSize.LARGE    // Large (default)
InputSize.NORMAL   // Normal
InputSize.COMPACT  // Small
```

### TagColor
```tsx
TagColor.DEFAULT   // Gray
TagColor.SUCCESS   // Green
TagColor.WARNING   // Yellow/Orange
TagColor.ERROR     // Red
TagColor.INFO      // Blue
```

### TagVariant
```tsx
TagVariant.FILLED   // Solid background (default)
TagVariant.OUTLINE  // Border only
```

### TagSize
```tsx
TagSize.MEDIUM   // Default
TagSize.COMPACT  // Smaller
```

### SidebarVariant
```tsx
SidebarVariant.MAIN     // Main product sidebar
SidebarVariant.SETTINGS // Settings sidebar
SidebarVariant.CUSTOM   // Fully custom sidebar
```

### AlertType
```tsx
AlertType.SUCCESS  // Green success message
AlertType.ERROR    // Red error message
AlertType.WARNING  // Yellow warning message
AlertType.INFO     // Blue info message
```

---

## Component APIs

### CanaryButton

```tsx
interface CanaryButtonProps {
  children?: ReactNode;
  onClick?: (event: MouseEvent) => void;
  type?: ButtonType;              // PRIMARY | OUTLINED | SHADED | TEXT | ICON_PRIMARY | ICON_SECONDARY
  size?: ButtonSize;              // TABLET | LARGE | NORMAL | COMPACT | TINY
  color?: ButtonColor;            // NORMAL | HEADING_TEXT | DANGER | WARNING | SUCCESS | FONT | FONT_SECONDARY | WHITE
  icon?: ReactNode;               // Icon element
  iconPosition?: IconPosition;    // LEFT | RIGHT | TOP
  isDisabled?: boolean;
  isLoading?: boolean;
  isExpanded?: boolean;           // Full width
  isRounded?: boolean;            // Fully rounded corners
  href?: string;                  // Renders as <a> tag
  target?: string;                // Link target
  nativeType?: "button" | "submit" | "reset";
  className?: string;
}
```

**Examples:**
```tsx
// Primary button
<CanaryButton type={ButtonType.PRIMARY}>Submit</CanaryButton>

// Button with icon
<CanaryButton
  type={ButtonType.PRIMARY}
  icon={<Icon path={mdiPlusOutline} size={1} />}
  iconPosition={IconPosition.LEFT}
>
  Add Item
</CanaryButton>

// Danger button
<CanaryButton type={ButtonType.PRIMARY} color={ButtonColor.DANGER}>
  Delete
</CanaryButton>

// Loading button
<CanaryButton type={ButtonType.PRIMARY} isLoading>
  Saving...
</CanaryButton>

// Back button (for dark backgrounds like sidebar)
<CanaryButton
  type={ButtonType.TEXT}
  color={ButtonColor.WHITE}
  icon={<Icon path={mdiArrowLeft} size={1} />}
  iconPosition={IconPosition.LEFT}
>
  Back
</CanaryButton>
```

### CanaryInput

```tsx
interface CanaryInputProps {
  label?: string;
  type?: InputType;               // TEXT | EMAIL | PASSWORD | NUMBER | TEL | URL | SEARCH | DATE | TIME
  size?: InputSize;               // TABLET | LARGE | NORMAL | COMPACT
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  isReadonly?: boolean;
  isRequired?: boolean;
  error?: string;                 // Error message
  helperText?: string;            // Helper text below input
  leftAddon?: ReactNode;          // Element on left
  rightAddon?: ReactNode;         // Element on right
  className?: string;
}
```

**Examples:**
```tsx
// Basic input
<CanaryInput
  label="Email"
  type={InputType.EMAIL}
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Input with error
<CanaryInput
  label="Password"
  type={InputType.PASSWORD}
  error="Password must be at least 8 characters"
/>

// Input with addons
<CanaryInput
  placeholder="Search..."
  leftAddon={<Icon path={mdiMagnify} size={0.8} />}
/>
```

### CanarySelect

```tsx
interface CanarySelectProps {
  label?: string;
  options: CanarySelectOption[];
  placeholder?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  size?: InputSize;
  isDisabled?: boolean;
  isRequired?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

interface CanarySelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
```

**Example:**
```tsx
<CanarySelect
  label="Country"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
/>
```

### CanaryCard

```tsx
interface CanaryCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;      // Buttons/actions in header
  footer?: ReactNode;
  padding?: "none" | "small" | "medium" | "large";
  hasShadow?: boolean;
  hasBorder?: boolean;
  className?: string;
  onClick?: () => void;
}
```

**Examples:**
```tsx
// Simple card
<CanaryCard title="User Profile">
  <CanaryInput label="Name" />
</CanaryCard>

// Card with actions
<CanaryCard
  title="Payment Info"
  headerActions={<CanaryButton type={ButtonType.TEXT}>Edit</CanaryButton>}
  footer={<CanaryButton type={ButtonType.PRIMARY}>Save</CanaryButton>}
>
  {/* content */}
</CanaryCard>
```

### CanaryModal

```tsx
interface CanaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "small" | "medium" | "large" | "full";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}
```

**Example:**
```tsx
const [isOpen, setIsOpen] = useState(false);

<CanaryModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure?</p>
  <div className="flex gap-2 mt-4">
    <CanaryButton type={ButtonType.OUTLINED} onClick={() => setIsOpen(false)}>
      Cancel
    </CanaryButton>
    <CanaryButton type={ButtonType.PRIMARY}>
      Confirm
    </CanaryButton>
  </div>
</CanaryModal>
```

### CanaryPageHeader

The standard Canary page header with property selector, reservation status badge, and user profile.

```tsx
interface CanaryPageHeaderProps {
  propertyName: string;                    // Property/Hotel name (left side)
  onPropertyClick?: () => void;            // Property selector click handler
  userProfile?: {
    name: string;
    role: string;
    avatarUrl?: string;                    // Optional - shows initials if not provided
  };
  onUserProfileClick?: () => void;
  reservationStatus?: {
    label: string;                         // e.g., "Reservations"
    isConnected: boolean;                  // Green when true, gray when false
  };
  onReservationStatusClick?: () => void;
  actions?: ReactNode;                     // Additional actions before user profile
  className?: string;
}
```

**Example:**
```tsx
<CanaryPageHeader
  propertyName="Statler New York"
  onPropertyClick={() => openPropertySelector()}
  reservationStatus={{
    label: "Reservations",
    isConnected: true
  }}
  userProfile={{
    name: "Theresa Webb",
    role: "Front Desk",
    avatarUrl: "https://..."
  }}
  onUserProfileClick={() => openUserMenu()}
/>
```

### CanaryAppShell

**RECOMMENDED FOR PROTOTYPES** - Complete application scaffolding that combines sidebar, page header, and content area. Use this as your starting point.

```tsx
interface CanaryAppShellProps {
  children: ReactNode;                     // Your page content goes here

  // Sidebar props
  sidebarVariant?: SidebarVariant;         // MAIN | SETTINGS | CUSTOM
  sidebarSections?: SidebarSection[];      // Custom sections (optional)
  selectedSidebarItemId?: string;
  onSidebarItemClick?: (itemId: string) => void;
  sidebarTitle?: string;                   // For SETTINGS variant
  sidebarBackButton?: ReactNode;           // For SETTINGS variant
  hideSidebar?: boolean;                   // Hide sidebar entirely

  // Header props
  propertyName?: string;                   // Default: "Property Name"
  onPropertyClick?: () => void;
  userProfile?: { name: string; role: string; avatarUrl?: string };
  onUserProfileClick?: () => void;
  reservationStatus?: { label: string; isConnected: boolean };
  onReservationStatusClick?: () => void;
  headerActions?: ReactNode;
  hideHeader?: boolean;                    // Hide header entirely

  // Content area props
  contentPadding?: "none" | "small" | "medium" | "large";  // Default: "medium"
  contentBackground?: string;              // Default: colorBlack7 (#F0F0F0)
  contentClassName?: string;

  className?: string;
}
```

**Basic Example:**
```tsx
<CanaryAppShell
  propertyName="My Hotel"
  userProfile={{ name: "John Doe", role: "Manager" }}
  reservationStatus={{ label: "Reservations", isConnected: true }}
  onSidebarItemClick={(id) => router.push(`/${id}`)}
>
  <YourPageContent />
</CanaryAppShell>
```

**Settings Page Example:**
```tsx
<CanaryAppShell
  sidebarVariant={SidebarVariant.SETTINGS}
  sidebarTitle="Settings"
  sidebarBackButton={
    <CanaryButton
      type={ButtonType.TEXT}
      color={ButtonColor.WHITE}
      icon={<Icon path={mdiArrowLeft} size={1} />}
      iconPosition={IconPosition.LEFT}
    >
      Back
    </CanaryButton>
  }
  propertyName="My Hotel"
  userProfile={{ name: "Admin", role: "Administrator" }}
>
  <SettingsContent />
</CanaryAppShell>
```

**Custom Sidebar Example:**
```tsx
<CanaryAppShell
  sidebarVariant={SidebarVariant.CUSTOM}
  sidebarSections={[
    createCustomSection([
      sidebarTabs.dashboard,
      sidebarTabs.properties,
      sidebarTabs.analytics
    ], { title: 'Overview' })
  ]}
  propertyName="Corporate HQ"
  contentPadding="none"
>
  <DashboardContent />
</CanaryAppShell>
```

### CanaryTag

```tsx
interface CanaryTagProps {
  label: string;
  color?: TagColor;               // DEFAULT | SUCCESS | WARNING | ERROR | INFO
  variant?: TagVariant;           // FILLED | OUTLINE
  size?: TagSize;                 // MEDIUM | COMPACT
  customColor?: {
    backgroundColor?: string;
    borderColor?: string;
    fontColor?: string;
    iconColor?: string;
  };
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  uppercase?: boolean;
  className?: string;
}
```

**Examples:**
```tsx
<CanaryTag label="Active" color={TagColor.SUCCESS} />
<CanaryTag label="Pending" color={TagColor.WARNING} variant={TagVariant.OUTLINE} />
<CanaryTag label="Error" color={TagColor.ERROR} />
```

### CanaryAlert

```tsx
interface CanaryAlertProps {
  message: string;
  type?: AlertType;               // SUCCESS | ERROR | WARNING | INFO
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
  className?: string;
}
```

**Example:**
```tsx
<CanaryAlert
  type={AlertType.SUCCESS}
  title="Success!"
  message="Your changes have been saved."
  onClose={() => setShowAlert(false)}
/>
```

### CanaryList

```tsx
interface CanaryListProps {
  children: ReactNode;
  items?: any[];                  // For controlled drag-and-drop
  isDraggable?: boolean;
  onReorder?: (items: any[]) => void;
  hasOuterBorder?: boolean;
  isLoading?: boolean;
  loadingContent?: ReactNode;
  isEmpty?: boolean;
  emptyContent?: ReactNode;
  hasError?: boolean;
  errorContent?: ReactNode;
  className?: string;
}
```

### CanaryListItem

```tsx
interface CanaryListItemProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  children?: ReactNode;           // Custom structure (overrides all convenience props)
  onClick?: () => void;
  href?: string;
  isClickable?: boolean;
  isDraggable?: boolean;
  isSelected?: boolean;
  padding?: "normal" | "compact";
  alignment?: "start" | "center";
  allowTextWrap?: boolean;
  className?: string;
}
```

**Examples:**
```tsx
// Static list
<CanaryList hasOuterBorder>
  <CanaryListItem
    title="John Doe"
    subtitle="john@example.com"
    icon={<Icon path={mdiAccountOutline} size={1} />}
  />
  <CanaryListItem
    title="Jane Smith"
    subtitle="jane@example.com"
    icon={<Icon path={mdiAccountOutline} size={1} />}
  />
</CanaryList>

// Draggable list
const [items, setItems] = useState([
  { id: '1', name: 'Task 1' },
  { id: '2', name: 'Task 2' }
]);

<CanaryList isDraggable items={items} onReorder={setItems} hasOuterBorder>
  {items.map(item => (
    <CanaryListItem key={item.id} title={item.name} isDraggable />
  ))}
</CanaryList>
```

### CanarySidebar

```tsx
interface CanarySidebarProps {
  variant?: SidebarVariant;       // MAIN | SETTINGS | CUSTOM
  sections?: SidebarSection[];
  logo?: ReactNode;
  title?: string;                 // For SETTINGS variant
  backButton?: ReactNode;         // For SETTINGS variant
  selectedItemId?: string;
  onItemClick?: (itemId: string) => void;
  width?: number;
  className?: string;
}

interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarNavigationItem[];
}

interface SidebarNavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
  badge?: string | number;
}
```

---

## Pre-built Sidebar Sections

Import ready-to-use sidebar configurations:

```tsx
import {
  standardMainSidebarSections,     // Main product sidebar
  standardSettingsSidebarSections  // Settings sidebar
} from '@canary-ui/components';
```

**Usage:**
```tsx
// Main sidebar
<CanarySidebar sections={standardMainSidebarSections} />

// Settings sidebar
<CanarySidebar
  variant={SidebarVariant.SETTINGS}
  sections={standardSettingsSidebarSections}
  title="Settings"
  backButton={
    <CanaryButton
      type={ButtonType.TEXT}
      color={ButtonColor.WHITE}
      icon={<Icon path={mdiArrowLeft} size={1} />}
      iconPosition={IconPosition.LEFT}
    >
      Back
    </CanaryButton>
  }
/>
```

---

## Pre-built Sidebar Tabs ("Lego Pieces")

Import individual tabs for custom sidebars:

```tsx
import { sidebarTabs } from '@canary-ui/components';
```

### Available Tabs

**Main Product Tabs:**
| Tab ID | Label | Icon |
|--------|-------|------|
| `sidebarTabs.upsells` | Upsells | mdiTagOutline |
| `sidebarTabs.checkIn` | Check-in | mdiLoginVariant |
| `sidebarTabs.checkout` | Checkout | mdiLogoutVariant |
| `sidebarTabs.messages` | Messages | mdiMessageOutline |
| `sidebarTabs.calls` | Calls | mdiPhoneOutline |
| `sidebarTabs.digitalTips` | Digital Tips | mdiCashMultiple |
| `sidebarTabs.authorizations` | Authorizations | mdiCreditCardOutline |
| `sidebarTabs.contracts` | Contracts | mdiFileDocumentOutline |
| `sidebarTabs.idVerification` | ID Verification | mdiCardAccountDetailsOutline |
| `sidebarTabs.clientsOnFile` | Clients on File | mdiAccountGroupOutline |
| `sidebarTabs.amenities` | Amenities | mdiRoomServiceOutline |
| `sidebarTabs.paymentLinks` | Payment Links | mdiLinkVariant |
| `sidebarTabs.settings` | Settings | mdiCogOutline |

**Settings Tabs:**
| Tab ID | Label | Icon |
|--------|-------|------|
| `sidebarTabs.propertyInfo` | Property Info | mdiDomain |
| `sidebarTabs.branding` | Branding | mdiPalette |
| `sidebarTabs.billingPayment` | Billing & Payment | mdiCreditCardOutline |
| `sidebarTabs.staffMembers` | Staff Members | mdiAccountMultipleOutline |
| `sidebarTabs.security` | Security | mdiShieldAccountOutline |
| `sidebarTabs.pms` | PMS | mdiConnection |
| `sidebarTabs.devices` | Devices | mdiTablet |
| `sidebarTabs.compendium` | Compendium | mdiBookOpenPageVariant |
| `sidebarTabs.areaInfo` | Area Info | mdiMapMarkerOutline |
| `sidebarTabs.chat` | Chat | mdiChatOutline |

**Above-Property / Custom Tabs:**
| Tab ID | Label | Icon |
|--------|-------|------|
| `sidebarTabs.insights` | Insights | mdiChartBoxOutline |
| `sidebarTabs.properties` | Properties | mdiOfficeBuildingOutline |
| `sidebarTabs.analytics` | Analytics | mdiChartLineVariant |
| `sidebarTabs.surveys` | Surveys | mdiClipboardTextOutline |
| `sidebarTabs.dashboard` | Dashboard | mdiViewDashboardOutline |
| `sidebarTabs.tasks` | Tasks | mdiCheckboxMarkedOutline |
| `sidebarTabs.calendar` | Calendar | mdiCalendarOutline |
| `sidebarTabs.reports` | Reports | mdiFileChartOutline |
| `sidebarTabs.performance` | Performance | mdiTrendingUp |
| `sidebarTabs.fraudOverview` | Fraud Overview | mdiShieldAlertOutline |

**Usage:**
```tsx
import { sidebarTabs, createCustomSection } from '@canary-ui/components';

const customSections = [
  createCustomSection('main', 'Main', [
    sidebarTabs.dashboard,
    sidebarTabs.properties,
    sidebarTabs.analytics
  ]),
  createCustomSection('tools', 'Tools', [
    sidebarTabs.reports,
    sidebarTabs.calendar
  ])
];

<CanarySidebar variant={SidebarVariant.CUSTOM} sections={customSections} />
```

---

## Sidebar Utility Functions

```tsx
import {
  hideProducts,
  addProduct,
  reorderProducts,
  createCustomSection,
  mergeWithStandard,
  updateProduct,
  addBadge,
  removeBadge,
  disableProduct,
  enableProduct,
  createSidebarTab
} from '@canary-ui/components';
```

### Function Signatures

```tsx
// Hide specific products from sidebar
hideProducts(sections: SidebarSection[], productIds: string[]): SidebarSection[]

// Add a new product at a specific position
addProduct(
  sections: SidebarSection[],
  product: SidebarNavigationItem,
  options?: { sectionId?: string; position?: number; after?: string; before?: string }
): SidebarSection[]

// Reorder products by ID
reorderProducts(sections: SidebarSection[], productOrder: string[]): SidebarSection[]

// Create a new custom section
createCustomSection(id: string, title: string, items: SidebarNavigationItem[]): SidebarSection

// Merge custom sections with standard ones
mergeWithStandard(
  customSections: SidebarSection[],
  variant: SidebarVariant
): SidebarSection[]

// Update a product's properties
updateProduct(
  sections: SidebarSection[],
  productId: string,
  updates: Partial<SidebarNavigationItem>
): SidebarSection[]

// Add/remove badges
addBadge(sections: SidebarSection[], productId: string, badge: string | number): SidebarSection[]
removeBadge(sections: SidebarSection[], productId: string): SidebarSection[]

// Enable/disable products
disableProduct(sections: SidebarSection[], productId: string): SidebarSection[]
enableProduct(sections: SidebarSection[], productId: string): SidebarSection[]

// Create a new sidebar tab
createSidebarTab(
  id: string,
  label: string,
  icon: ReactNode,
  options?: Partial<SidebarNavigationItem>
): SidebarNavigationItem
```

**Examples:**
```tsx
import {
  standardMainSidebarSections,
  hideProducts,
  addBadge,
  sidebarTabs
} from '@canary-ui/components';

// Hide products customer doesn't have
const limitedSidebar = hideProducts(standardMainSidebarSections, [
  'digital-tips',
  'amenities',
  'payment-links'
]);

// Add notification badge
const withBadge = addBadge(limitedSidebar, 'messages', 5);

<CanarySidebar sections={withBadge} />
```

---

## Icons

### Using Material Design Icons (Recommended)

Always use icons from `@mdi/js` with the `Icon` component from `@mdi/react`:

```tsx
import Icon from '@mdi/react';
import { mdiHomeOutline, mdiAccountOutline, mdiCogOutline } from '@mdi/js';

<Icon path={mdiHomeOutline} size={1} />
<Icon path={mdiAccountOutline} size={1} color="#2858C4" />
```

**Icon naming convention:** Use **outline variants** (ending in `Outline`) by default.

### Common Icons Reference

**Navigation:**
```tsx
import { mdiHomeOutline, mdiMenuOutline, mdiCloseOutline, mdiArrowLeft, mdiArrowRight, mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiChevronUp } from '@mdi/js';
```

**User/Account:**
```tsx
import { mdiAccountOutline, mdiAccountCircleOutline, mdiAccountGroupOutline, mdiAccountMultipleOutline, mdiAccountCheckOutline } from '@mdi/js';
```

**Actions:**
```tsx
import { mdiPlusOutline, mdiMinusOutline, mdiPencilOutline, mdiDeleteOutline, mdiCheckOutline, mdiCloseOutline, mdiRefresh, mdiDownloadOutline, mdiUploadOutline } from '@mdi/js';
```

**Communication:**
```tsx
import { mdiEmailOutline, mdiMessageOutline, mdiPhoneOutline, mdiChatOutline } from '@mdi/js';
```

**Files/Documents:**
```tsx
import { mdiFileOutline, mdiFileDocumentOutline, mdiFolderOutline, mdiClipboardTextOutline } from '@mdi/js';
```

**Status:**
```tsx
import { mdiAlertOutline, mdiInformationOutline, mdiHelpCircleOutline, mdiCheckCircleOutline } from '@mdi/js';
```

**Business:**
```tsx
import { mdiCreditCardOutline, mdiCashMultiple, mdiChartLineVariant, mdiTrendingUp, mdiTrendingDown } from '@mdi/js';
```

**Settings:**
```tsx
import { mdiCogOutline, mdiDotsVertical, mdiTuneOutline } from '@mdi/js';
```

### Pre-configured Icons (Alternative)

```tsx
import { CanaryIcon } from '@canary-ui/components';

// Available icons on CanaryIcon object:
CanaryIcon.Home
CanaryIcon.Menu
CanaryIcon.Close
CanaryIcon.ChevronDown
CanaryIcon.ChevronUp
CanaryIcon.ChevronLeft
CanaryIcon.ChevronRight
CanaryIcon.ArrowLeft
CanaryIcon.ArrowRight
CanaryIcon.Account
CanaryIcon.AccountCircle
CanaryIcon.AccountGroup
CanaryIcon.AccountCheck
CanaryIcon.AccountMultiple
CanaryIcon.Login
CanaryIcon.Logout
CanaryIcon.Settings
CanaryIcon.Palette
CanaryIcon.Puzzle
CanaryIcon.File
CanaryIcon.FileDocument
CanaryIcon.Folder
CanaryIcon.Newspaper
CanaryIcon.BookOpen
CanaryIcon.Currency
CanaryIcon.Cash
CanaryIcon.CreditCard
CanaryIcon.Email
CanaryIcon.Message
CanaryIcon.MessageProcessing
CanaryIcon.Chat
CanaryIcon.Phone
CanaryIcon.Plus
CanaryIcon.Minus
CanaryIcon.Pencil
CanaryIcon.Delete
CanaryIcon.Copy
CanaryIcon.Download
CanaryIcon.Upload
CanaryIcon.Refresh
CanaryIcon.Check
CanaryIcon.CheckCircle
CanaryIcon.Alert
CanaryIcon.Information
CanaryIcon.Help
CanaryIcon.TrendingUp
CanaryIcon.TrendingDown
CanaryIcon.Chart
CanaryIcon.Shield
CanaryIcon.ShieldAccount
CanaryIcon.ShieldCheck
CanaryIcon.Restaurant
CanaryIcon.Location
CanaryIcon.Tablet
CanaryIcon.Cellphone
CanaryIcon.Laptop
CanaryIcon.Monitor

// Usage:
<CanaryIcon.Home size={24} color="#000" />
```

---

## Color Tokens

Import color values directly:

```tsx
import { colors } from '@canary-ui/components';
```

### Primary Colors

| Token | Value | Usage |
|-------|-------|-------|
| `colors.colorBlueDark1` | `#2858C4` | Primary action color |
| `colors.colorBlueDark2` | `#5E82D3` | Primary hover |
| `colors.colorBlueDark3` | `#93ABE1` | Primary light |
| `colors.colorBlueDark4` | `#C9D5F0` | Primary lighter |
| `colors.colorBlueDark5` | `#EAEEF9` | Primary lightest |

### Canary Blue (Brand)

| Token | Value |
|-------|-------|
| `colors.colorBlueCanary1` | `#1C91FA` |
| `colors.colorBlueCanary2` | `#55ACFB` |
| `colors.colorBlueCanary3` | `#8DC8FC` |
| `colors.colorBlueCanary4` | `#C6E3FE` |
| `colors.colorBlueCanary5` | `#E8F4FF` |

### Grayscale

| Token | Value | Usage |
|-------|-------|-------|
| `colors.colorBlack1` | `#000000` | Darkest text |
| `colors.colorBlack2` | `#333333` | Primary text |
| `colors.colorBlack3` | `#666666` | Secondary text |
| `colors.colorBlack4` | `#999999` | Placeholder text |
| `colors.colorBlack5` | `#CCCCCC` | Disabled text |
| `colors.colorBlack6` | `#E5E5E5` | Borders |
| `colors.colorBlack7` | `#F0F0F0` | Light backgrounds |
| `colors.colorBlack8` | `#FAFAFA` | Lightest backgrounds |
| `colors.colorWhite` | `#FFFFFF` | White |

### Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `colors.colorOk` | `#008040` | Success/OK |
| `colors.colorWarning` | `#FAB541` | Warning |
| `colors.colorDanger` | `#E40046` | Error/Danger |

### Additional Palettes

**Green:**
```tsx
colors.colorLightGreen1  // #008040
colors.colorLightGreen2  // #40A673
colors.colorLightGreen3  // #80CCA6
colors.colorLightGreen4  // #BFE5D2
colors.colorLightGreen5  // #CCE6D9
```

**Red:**
```tsx
colors.colorRed1  // #E40046
colors.colorRed2  // #EC4076
colors.colorRed3  // #F380A6
colors.colorRed4  // #F9BFD2
colors.colorRed5  // #FCE6ED
```

**Yellow/Wheat:**
```tsx
colors.colorWheat1  // #FAB541
colors.colorWheat2  // #FBCA74
colors.colorWheat3  // #FCDFA7
colors.colorWheat4  // #FEF4D9
colors.colorWheat5  // #FFF8EC
```

**Purple:**
```tsx
colors.colorPurple1  // #3304AD
colors.colorPurple2  // #6F4CC9
colors.colorPurple3  // #A894E0
colors.colorPurple4  // #D4C9F0
colors.colorPurple5  // #E3DCF6
```

**Pink:**
```tsx
colors.colorPink1  // #F16682
colors.colorPink2  // #F591A4
colors.colorPink3  // #F9BBC7
colors.colorPink4  // #FCE5E9
colors.colorPink5  // #FEF0F3
```

---

## Typography Tokens

```tsx
import { typography } from '@canary-ui/components';
```

### Font Sizes

| Token | Value |
|-------|-------|
| `typography.fontSize.displayTitleLg` | `3.5rem` (56px) |
| `typography.fontSize.displayTitle` | `3rem` (48px) |
| `typography.fontSize.displayTitleSm` | `2rem` (32px) |
| `typography.fontSize.titleLg` | `1.75rem` (28px) |
| `typography.fontSize.title` | `1.5rem` (24px) |
| `typography.fontSize.subtitleLg` | `1.25rem` (20px) |
| `typography.fontSize.subtitle` | `1.125rem` (18px) |
| `typography.fontSize.body` | `1rem` (16px) |
| `typography.fontSize.bodySm` | `0.875rem` (14px) |
| `typography.fontSize.caption` | `0.75rem` (12px) |
| `typography.fontSize.captionSm` | `0.625rem` (10px) |

### Font Weights

| Token | Value |
|-------|-------|
| `typography.fontWeight.regular` | `400` |
| `typography.fontWeight.medium` | `500` |
| `typography.fontWeight.semibold` | `600` |
| `typography.fontWeight.bold` | `700` |

---

## Spacing Tokens

```tsx
import { spacing } from '@canary-ui/components';
```

| Token | Value |
|-------|-------|
| `spacing[0]` | `0` |
| `spacing[1]` | `0.25rem` (4px) |
| `spacing[2]` | `0.5rem` (8px) |
| `spacing[3]` | `0.75rem` (12px) |
| `spacing[4]` | `1rem` (16px) |
| `spacing[5]` | `1.25rem` (20px) |
| `spacing[6]` | `1.5rem` (24px) |
| `spacing[8]` | `2rem` (32px) |
| `spacing[10]` | `2.5rem` (40px) |
| `spacing[12]` | `3rem` (48px) |
| `spacing[16]` | `4rem` (64px) |
| `spacing[20]` | `5rem` (80px) |
| `spacing[24]` | `6rem` (96px) |

---

## Common Patterns

### Full Page Layout with Sidebar

```tsx
import { CanarySidebar, standardMainSidebarSections } from '@canary-ui/components';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">
      <CanarySidebar sections={standardMainSidebarSections} />
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
```

### Form with Validation

```tsx
import {
  CanaryCard,
  CanaryInput,
  CanarySelect,
  CanaryButton,
  InputType,
  ButtonType
} from '@canary-ui/components';
import { useState } from 'react';

export default function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = () => {
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email');
      return;
    }
    // Submit form
  };

  return (
    <CanaryCard title="Register">
      <div className="space-y-4">
        <CanaryInput
          label="Email"
          type={InputType.EMAIL}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          error={emailError}
          isRequired
        />
        <CanaryButton type={ButtonType.PRIMARY} onClick={handleSubmit}>
          Submit
        </CanaryButton>
      </div>
    </CanaryCard>
  );
}
```

### Data Table with Tags

```tsx
import { CanaryTable, CanaryTag, TagColor } from '@canary-ui/components';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => (
      <CanaryTag
        label={value}
        color={value === 'Active' ? TagColor.SUCCESS : TagColor.DEFAULT}
      />
    )
  }
];

const data = [
  { name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' }
];

<CanaryTable columns={columns} data={data} />
```

### Custom Sidebar for Above-Property Dashboard

```tsx
import {
  CanarySidebar,
  SidebarVariant,
  sidebarTabs,
  createCustomSection
} from '@canary-ui/components';

const abovePropertySections = [
  createCustomSection('overview', 'Overview', [
    sidebarTabs.dashboard,
    sidebarTabs.insights,
    sidebarTabs.analytics
  ]),
  createCustomSection('management', 'Management', [
    sidebarTabs.properties,
    sidebarTabs.reports,
    sidebarTabs.performance
  ]),
  createCustomSection('tools', 'Tools', [
    sidebarTabs.calendar,
    sidebarTabs.tasks,
    sidebarTabs.settings
  ])
];

<CanarySidebar
  variant={SidebarVariant.CUSTOM}
  sections={abovePropertySections}
  title="Corporate Dashboard"
/>
```

---

## Do's and Don'ts

### Do's
- Always import enums for type-safe props (`ButtonType`, `InputType`, etc.)
- Use pre-built `sidebarTabs` for sidebar items
- Use `standardMainSidebarSections` or `standardSettingsSidebarSections` as starting points
- Use outline variants of icons (`mdiHomeOutline`, not `mdiHome`)
- Import colors from `colors` object, not hardcode hex values
- Use `className` prop for additional styling with Tailwind

### Don'ts
- Don't guess component names - only use what's listed here
- Don't guess icon names - use the exact names from @mdi/js
- Don't create custom sidebar items from scratch - use `sidebarTabs` or `createSidebarTab`
- Don't hardcode colors - use the color tokens
- Don't use filled icons - use outline variants by default
- Don't create new components when existing ones work

---

## Version

**Current Version:** v0.4.2

Last updated: December 2024
