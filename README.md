# 🏢 Interactive Organizational Hierarchy Generator

A modern, enterprise-grade, mobile-responsive web application for visualizing, managing, and exporting corporate organizational hierarchies, departmental reportings, and employee structures.

Built with **React 19**, **TypeScript**, **Vite**, **@xyflow/react (React Flow)**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🌟 Key Features

### 1. 📊 Interactive Org Chart Canvas
- **Dynamic Node Tree Visualization**: Powered by `@xyflow/react` with smooth pan, pinch-zoom, and auto-centering capabilities.
- **Node Expand & Collapse**: Toggle direct reportees and subtrees per employee node or use global **Expand All** / **Collapse All** controls.
- **Dual Layout Orientations**: Instantly switch between **Vertical** (Top-to-Bottom) and **Horizontal** (Left-to-Right) hierarchy layouts.
- **CEO & Executive Highlighting**: Automatic detection and badge highlighting for top-level executives (CEO / MD).

### 2. 📁 Excel Data Import & Instant Generator
- **Drag-and-Drop Excel Upload**: Supports `.xlsx` and `.xls` spreadsheets for automated org chart generation.
- **Built-in Hierarchy Validation Engine**: Automatically validates reporting cycles, missing manager codes, orphan nodes, and duplicate employee IDs.
- **Validation Report & Error Log**: Live stats (Valid records, Errors, Warnings) with downloadable `.CSV` error reports and instant data previews before publishing.
- **One-Click Excel Template Generator**: Download pre-formatted Excel templates (`.xlsx`) pre-populated with sample organizational structure.

### 3. 🔍 Multi-Filter Toolbar & Global Search
- **Instant Search**: Search across Employee Name, Employee Code (e.g. `EMP-001`), Department, Designation, Location, or Business Unit.
- **Multi-Parameter Dropdown Filters**: Filter hierarchy by Department, Business Unit, Location, and Employment Status (Active / Inactive) with real-time match indicators.
- **Collapsible Mobile Toolbar**: Compact search and expandable filter panel optimized for touchscreens.

### 4. 🗂️ Hierarchy Explorer Sidebar
- **Interactive Hierarchy Tree**: Browse full organizational reporting trees in a left panel with depth indicators and reportee count badges.
- **Quick Department Pills**: Filter hierarchy by department directly from the explorer bar.
- **Mobile Slide-Over Drawer**: Responsive overlay drawer with backdrop overlay for mobile phones and tablets.

### 5. 💳 Employee Details Drawer
- **Comprehensive Profile Card**: Click any employee card to view contact information (Email, Phone), Department, Location, Joining Date, Employment Type, and Active Status.
- **Interactive Hierarchy Navigation**: View direct Manager and list of Direct Reports with instant click-to-navigate.
- **Focus Node Control**: Instantly center and zoom to any selected employee on the interactive canvas.

### 6. 📄 Complete Chart Export Suite
Export 100% full uncropped org charts (zero collapsed nodes, zero cropping):
- **PNG High-Res Image**
- **JPEG Compressed Image**
- **SVG Scalable Vector Graphic**
- **PDF Printable Document**
- **Direct Printer Output**
- **Standalone Offline Interactive HTML Bundle** (Self-contained file for offline HR presentation)

### 7. 🎨 Admin Branding & Theme Customization
- Custom logo URL support & company name customization.
- Primary and secondary brand color pickers.
- Preset corporate themes: *Corporate Dark*, *Gallantt Group (Navy & Gold)*, *Executive Light*, *Midnight Cyan*.
- Custom footer text for confidentiality notices.

### 8. 📜 Version History & Snapshot Rollback
- Automatic version snapshots generated on every Excel file upload.
- One-click rollback to any previous version state with timestamp tracking.

### 9. 📱 100% Mobile Responsive & Dark Mode
- Full support for mobile phones (iOS & Android), tablets, and desktop displays.
- Touch-friendly controls and responsive dynamic height (`100dvh`).
- Seamless Light / Dark mode theme switcher.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 6.0](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 8.2](https://vitejs.dev/) |
| **Canvas Engine** | [@xyflow/react 12](https://reactflow.dev/) (React Flow) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Spreadsheet Engine** | [XLSX (SheetJS)](https://sheetjs.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Export Utilities** | `html-to-image`, `jspdf` |

---

## 📋 Excel Data Format / Schema

When uploading custom Excel spreadsheets (`.xlsx` / `.xls`), use the following column headers (case-insensitive):

| Column Name | Required | Example | Description |
| :--- | :---: | :--- | :--- |
| `EmployeeCode` | **Yes** | `EMP-001` | Unique employee identifier |
| `Name` | **Yes** | `Ram Pandey` | Full name of employee |
| `ManagerCode` | **No*** | `EMP-000` | EmployeeCode of reporting manager (*Blank for top executive/CEO*) |
| `Designation` | **Yes** | `Chief Executive Officer` | Job designation |
| `Department` | **Yes** | `Executive / Leadership` | Department name |
| `BusinessUnit` | No | `Corporate HQ` | Business unit or division |
| `Location` | No | `Gorakhpur Plant` | Work location |
| `Email` | No | `ram.pandey@gallantt.com` | Email address |
| `Phone` | No | `+91 98765 43210` | Contact phone number |
| `DateOfJoining` | No | `2020-01-15` | Date of joining |
| `EmploymentType` | No | `Full-Time` | Employment status type |
| `Status` | No | `Active` | Status (`Active` or `Inactive`) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js version `18.0` or higher
- `npm` package manager

### Installation

1. **Clone or navigate to the repository**:
   ```bash
   cd Org_Chart
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/` (or `http://localhost:5174/`).

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 📄 License

Internal Enterprise HR Application - Confidential & Proprietary.
