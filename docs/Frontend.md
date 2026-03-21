# Frontend UI Guide

**FormCraft Frontend** is a professional, React-based web application built with Vite and Tailwind CSS. It is designed for high responsiveness, sleek aesthetics, and modular UI development.

---

## 🏗 Frontend Stack

- **Framework**: [React 18+](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: Radix UI, Headless UI (Shadcn pattern)
- **State Management**: [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- **API Communication**: [Axios](https://axios-http.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 🎨 Design System

FormCraft uses a **Dark Mode First** design system with vibrant, professional accents.

### Core Assets & Styles

- **`src/index.css`**: Defines global variables, custom scrollbars, and Tailwind base layers.
- **`tailwind.config.js`**: Custom color palettes, typography, and animation tokens.
- **`src/components/ui/`**: Reusable atomic components (Buttons, Inputs, Modals, Toasts).

---

## ⚙️ Dynamic UI Rendering: How it Works

The core of FormCraft is its ability to transform a JSON schema into a fully interactive, validated user interface. This happens primarily within the `FormViewer.jsx` component.

### 1. Schema Fetching & Initialization
When a user visits a form URL (`/f/:slug`), the application:
- Requests the form object from `/api/forms/s/:slug`.
- Extracts the `schema` object (JSONB).
- Initializes the `responses` state by mapping fields to their `defaultValue` (if any).

### 2. The Rendering Loop
The UI iterates through the `schema.fields` array. Each field object contains metadata that dictates the visual output:

| Schema Property | Role in Rendering |
| :--- | :--- |
| `type` | Determines the input component (`text`, `rating`, `dropdown`, etc.). |
| `label` | Used as the `<label>` text and the key in the response JSON. |
| `options` | Populates dropdowns, radio groups, or checkbox lists. |
| `themeColor` | Dynamically applied to borders, buttons, and focus states. |
| `required` | Appends a `*` to the label and enables a "required" validation check. |

### 3. Component Mapping Logic
The engine uses conditional rendering to swap between input types:
- **Standard Inputs**: `text`, `email`, `number`, `date`.
- **Selection Components**: `dropdown`, `radio`, `checkbox`.
- **Premium Components**: 
    - **Rating**: Renders interactive SVG stars with hover-intensity logic.
    - **Linear Scale**: Renders a custom horizontal range with min/max labels.

### 4. Interactive Feedback & Validation
- **Real-time Sanitization**: Inputs are sanitized based on type (e.g., `parseFloat` for numbers).
- **Blur Validation**: Field-level validation is triggered on the `onBlur` event, checking the value against the schema's constraints (`minLength`, `regex`, etc.).
- **Animated Errors**: Validation failures are rendered via `Framer Motion` for smooth entry/exit animations.

### 5. Final Assembly
The entire response object (a simple Key-Value map) is sent to the backend as a single JSON object, where it undergoes a second round of strict validation before being stored in PostgreSQL.

---

## 📂 Project Organization

- **`src/components/`**: Modularized UI elements used throughout the app.
- **`src/context/`**: Global state providers (Authentication, Sidebar state, etc.).
- **`src/lib/`**: External configurations (Axios instance, utility functions).
- **`src/pages/`**: View-level components representing application routes.
- **`src/services/`**: API interaction logic, including JWT interceptors.
- **`src/assets/`**: Static images, logos, and global CSS.

---

## 🔐 Auth Flow & State

Authentication is managed via an `AuthContext`.

1.  **Intercept**: The Axios interceptor automatically attaches the `Bearer` token to outgoing requests.
2.  **State Management**: `useAuth()` hook provides easy access to the current `user` object and `loading` state.
3.  **Token Refresh**: If a `401 Unauthorized` is returned by the backend, the interceptor attempts to refresh the token using the Refresh Token stored in local storage.

---

## 📝 Form Builder & Rendering

The heart of FormCraft is the **Dynamic Form Engine**.

1.  **Form Builder**: A drag-and-drop / AI-assisted interface that builds a JSON schema.
2.  **Form Viewer**: A component that consumes the JSON schema from the API and dynamically renders input fields, labels, and validation.
3.  **Schema Support**:
    - **Single Column**: Standard layout.
    - **Multi-Step**: Wizard-like form filling (planned).
    - **Gemini Integration**: A "magic button" to generate form structures.

---

## 📊 Analytics & Dashboard

- **Dashboard**: High-level statistical visualization (Form counts, submission trends).
- **Response Viewer**: A powerful table interface to view, filter, and export user submissions stored in the JSONB format.

---

## ⚡ Development Workflow

1.  **Run Dev Server**: `npm run dev` (starts on `http://localhost:5173`)
2.  **Build for Production**: `npm run build`
3.  **Linting**: `npm run lint`

---

## 🚀 Performance Optimization

- **Vite Bundling**: Optimized code-splitting and asset minification.
- **HMR (Hot Module Replacement)**: Fast development feedback cycle.
- **Lazy Loading**: Pages are loaded only when needed to reduce initial bundle size.
