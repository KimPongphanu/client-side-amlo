# AMLO Frontend Project

This is the frontend application for the AMLO website and administrative dashboard. It is built using modern web technologies focusing on performance, scalability, and an excellent user experience.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Charts & Data Viz**: [ECharts](https://echarts.apache.org/)
- **Multi-language Support**: [i18next](https://www.i18next.com/)

## 📦 Features

- **Public Website**: Homepage, news, public announcements, and contact forms.
- **Admin Dashboard**: Comprehensive dashboard for system administrators and supervisors.
- **Role-Based Access Control**: Secure routing ensuring users only see what they are authorized to see.
- **Responsive Design**: Fully mobile-responsive interface.
- **Rich Text Editing**: Integrated `react-quill-new` for managing content.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd AMLO_website/internship-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (based on `.env.example` if available) and configure your environment variables:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

### Running the Development Server

Start the Vite development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:
```bash
npm run build
```
The optimized static files will be generated in the `dist` folder. You can preview the production build using:
```bash
npm run preview
```

## 📂 Project Structure

- `/src/pages/` - Main page components (Dashboard, Login, Homepage, etc.)
- `/src/components/` - Reusable UI components
- `/src/stores/` - Zustand global state stores
- `/src/services/` - API integration and data fetching
- `/src/utils/` - Helper functions and utilities

## 🌐 API Integration
All API calls are routed through the Axios instance configured in the `utils/api.ts` file, which automatically handles JWT token injection and refresh logic.
