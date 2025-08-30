# Retool-Like Edit Mode - Task Description

## 📋 Overview
Implement a drag-and-drop component editor similar to Retool, allowing users to add, position, and customize Text and Image components within a grid-based layout system.

## 🎯 Core Features

### 1. Component Types
- **Image Component**: Displays images with customizable properties
- **Text Component**: Renders markdown content in a single line format

### 2. Grid-Based Layout System
- **2-column grid** with equal width columns
- Components can be **half-width** (1 column) or **full-width** (2 columns)
- **Row-based positioning** with consistent height units
- **Snap-to-grid** behavior for predictable positioning

### 3. Component Management
- **Add components** via sidebar selection
- **Drag & drop** positioning with grid constraints
- **Resize** between half-width and full-width
- **Select & edit** component properties
- **Delete** components

## 🏗️ Technical Architecture

### State Management (Zustand)
```typescript
interface ComponentState {
  id: string;
  type: 'text' | 'image';
  position: { x: number; y: number }; // Grid coordinates (x: 0-1, y: 0-∞)
  size: { width: 'half' | 'full'; height: number }; // Height in grid units
  attributes: TextAttributes | ImageAttributes;
  styles: ComponentStyles;
}

interface EditStore {
  components: ComponentState[];
  selectedComponentId: string | null;
  gridConfig: { rows: number; cols: 2 };
  
  // Actions
  addComponent: (type: 'text' | 'image') => void;
  updateComponent: (id: string, updates: Partial<ComponentState>) => void;
  moveComponent: (id: string, newPosition: Position) => void;
  resizeComponent: (id: string, newSize: Size) => void;
  selectComponent: (id: string) => void;
  deleteComponent: (id: string) => void;
}
```

### Component Attributes
```typescript
// Image Component Attributes
interface ImageAttributes {
  src: string; // Image URL/path
  alt: string; // Alt text
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:2' | 'auto';
  objectFit: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

// Text Component Attributes  
interface TextAttributes {
  content: string; // Markdown content
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string; // Hex color or predefined colors
}
```

## 📝 Detailed Component Specifications

### Image Component
#### Initial State
- **Placeholder Image**: Display a default placeholder when no src is provided
- **Default Size**: Half-width (50% of container)
- **Default Attributes**:
  - `src: ""` (empty, shows placeholder)
  - `alt: "Image"`
  - `aspectRatio: "auto"`
  - `objectFit: "cover"`
  - `borderRadius: "none"`

#### Properties Sidebar
- **Image Source Input**: Text input for image URL/path
- **Aspect Ratio Selector**: Dropdown with predefined ratios
- **Object Fit Selector**: Dropdown for CSS object-fit values
- **Border Radius Selector**: Dropdown for border radius options
- **Alt Text Input**: Text input for accessibility

#### Behavior
- **Click to Edit**: Clicking the image opens the properties sidebar
- **Placeholder Handling**: Show placeholder when src is empty or invalid
- **Real-time Updates**: Properties update the image immediately

### Text Component
#### Initial State
- **Default Content**: "Click to edit text"
- **Default Size**: Half-width (50% of container)
- **Default Attributes**:
  - `content: "Click to edit text"`
  - `fontSize: "base"`
  - `fontWeight: "normal"`
  - `textAlign: "left"`
  - `color: "#000000"`

#### Properties Sidebar
- **Content Editor**: Textarea component for markdown input
- **Font Size Selector**: Dropdown with size options
- **Font Weight Selector**: Dropdown with weight options
- **Text Alignment**: Button group for alignment options
- **Color Picker**: Color input for text color

#### Behavior
- **Markdown Rendering**: Parse and render markdown syntax
- **Trim Whitespace**: Remove extra newlines and whitespace
- **Click to Edit**: Clicking the text opens the properties sidebar

#### Markdown Processing
```typescript
// Text processing rules:
// 1. Parse markdown syntax (bold, italic, links, etc.)
// 2. Convert to single line by replacing \n with spaces
// 3. Trim excessive whitespace
// 4. Render as inline HTML
```

## 🎮 User Interactions

### Component Addition Flow
1. User clicks component button in left sidebar
2. Component is added to the first available grid position
3. Left sidebar closes automatically
4. New component is automatically selected
5. Properties sidebar opens on the right

### Component Movement Rules
#### Half-Width Components
- **Horizontal**: Can move left (column 0) or right (column 1)
- **Vertical**: Can move up or down to any available row
- **Constraints**: Cannot move to occupied positions

#### Full-Width Components  
- **Horizontal**: Always positioned at column 0, spans both columns
- **Vertical**: Can move up or down to any available row
- **Constraints**: Cannot move to rows with existing components

### Component Resizing Rules
#### Half-Width → Full-Width
- **Condition**: No other components in the same row
- **Action**: Expand to span both columns
- **Position**: Automatically set x-coordinate to 0

#### Full-Width → Half-Width
- **Condition**: Always allowed
- **Action**: Shrink to single column
- **Position**: User chooses left (x=0) or right (x=1) column

## 🎨 UI/UX Requirements

### Grid Visualization
- **Grid Lines**: Subtle visual grid lines during development/debug mode
- **Drop Zones**: Highlight valid drop zones during drag operations
- **Occupied Spaces**: Visual indication of occupied grid positions

### Component Selection
- **Selection Indicator**: Border highlight around selected component
- **Hover State**: Subtle hover effect on components
- **Selection Persistence**: Maintain selection until user clicks elsewhere

### Sidebars
- **Left Sidebar**: Component selection (Sheet component)
- **Right Sidebar**: Properties editor (Sheet component)
- **Auto-close**: Left sidebar closes after component selection
- **Responsive**: Sidebars adapt to screen size

### Drag & Drop Feedback
- **Drag Preview**: Semi-transparent component preview during drag
- **Drop Indicators**: Visual feedback for valid drop positions
- **Snap Animation**: Smooth animation when component snaps to grid
- **Invalid Drop**: Visual feedback for invalid drop attempts

## 🛠️ Implementation Tasks

### Phase 1: Foundation
- [ ] Set up Zustand store with component state management
- [ ] Create grid layout system with 2-column configuration
- [ ] Implement basic component rendering (Text & Image)
- [ ] Add component selection functionality

### Phase 2: Component Logic
- [ ] Implement Image component with placeholder
- [ ] Implement Text component with markdown rendering
- [ ] Create properties sidebar for both component types
- [ ] Add form inputs for all component attributes

### Phase 3: Interactions
- [ ] Implement drag & drop with @dnd-kit/core
- [ ] Add movement constraints and validation
- [ ] Implement resize functionality (half ↔ full width)
- [ ] Add component deletion

### Phase 4: Polish
- [ ] Add animations and transitions
- [ ] Implement keyboard shortcuts
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Optimize performance and add error handling

## 🔧 Technical Dependencies

### Required Packages
```json
{
  "zustand": "^4.x.x",
  "@dnd-kit/core": "^6.x.x", 
  "@dnd-kit/sortable": "^8.x.x",
  "@dnd-kit/utilities": "^3.x.x",
  "react-markdown": "^9.x.x",
  "lucide-react": "^0.x.x"
}
```

### File Structure
```
src/modules/edit/
├── components/
│   ├── grid/
│   │   ├── GridLayout.tsx
│   │   ├── GridCell.tsx
│   │   └── DropZone.tsx
│   ├── draggable/
│   │   ├── DraggableComponent.tsx
│   │   └── ComponentWrapper.tsx
│   ├── editable/
│   │   ├── ImageComponent.tsx
│   │   ├── TextComponent.tsx
│   │   └── ComponentRenderer.tsx
│   └── sidebars/
│       ├── PropertiesSidebar.tsx
│       ├── ImageProperties.tsx
│       └── TextProperties.tsx
├── features/
│   ├── components-sidebar/ (existing)
│   ├── edit-content/ (existing)
│   └── properties-sidebar/
├── store/
│   ├── use-edit-store.ts
│   ├── types.ts
│   └── utils.ts
├── utils/
│   ├── grid-calculations.ts
│   ├── markdown-processor.ts
│   └── component-factory.ts
└── hooks/
    ├── use-drag-drop.ts
    ├── use-grid-position.ts
    └── use-component-selection.ts
```

## 🎯 Success Criteria

### Functional Requirements
- [ ] Users can add Image and Text components from sidebar
- [ ] Components can be positioned anywhere on the 2-column grid
- [ ] Components can be resized between half-width and full-width
- [ ] Image components display placeholder and accept custom src
- [ ] Text components render markdown as single-line content
- [ ] Properties can be edited via right sidebar
- [ ] All interactions feel smooth and responsive

### Technical Requirements
- [ ] State management through Zustand store
- [ ] Grid-based positioning system
- [ ] Drag & drop with collision detection
- [ ] Real-time property updates
- [ ] Proper TypeScript typing throughout
- [ ] Accessible UI components
- [ ] Clean, maintainable code structure

### Performance Requirements
- [ ] Smooth 60fps animations
- [ ] Responsive drag & drop (< 16ms frame time)
- [ ] Efficient re-renders (only affected components)
- [ ] Fast component addition/removal
- [ ] Minimal bundle size impact

---

## 📚 Additional Notes

### Markdown Processing for Text Component
The text component should process markdown but render everything inline:
- **Bold**: `**text**` → `<strong>text</strong>`
- **Italic**: `*text*` → `<em>text</em>`
- **Links**: `[text](url)` → `<a href="url">text</a>`
- **Code**: `` `code` `` → `<code>code</code>`
- **Line breaks**: Convert `\n` to spaces for single-line display

### Grid System Details
- **Container**: Full width of edit-content-feature
- **Columns**: 2 equal columns with gap
- **Rows**: Dynamic based on content, minimum height per row
- **Responsive**: Grid adapts to container size changes
- **Constraints**: Components cannot overlap or exceed boundaries

This task description serves as the complete specification for implementing the Retool-like edit mode feature.
