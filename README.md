# WorkKar: Find Local Service Professionals

<div align="center">
  <img src="public/WorkKar%20icon.png" alt="WorkKar Logo" width="150"/>
</div>

<p align="center">
  A modern web application to help users find and connect with skilled and general service professionals in their local area.
</p>

---

## 🌟 Key Features

-   **Service Discovery**: Browse a wide range of professionals across various categories.
-   **Location-Based Search**: Filter professionals by their proximity to your location.
-   **Dynamic Filtering**: Easily filter services by category and search terms.
-   **Distance Calculation**: Instantly see how far away a professional is after providing your location.
-   **Direct Contact Info**: View contact details to connect with professionals directly.
-   **Responsive Design**: Fully functional and beautiful on both desktop and mobile devices.
-   **Light & Dark Mode**: Switch between themes for your viewing comfort.
-   **Worker Sign-up**: A streamlined form for new professionals to list their services.

---

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Mapping**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
-   **Backend & DB**: [Supabase](https.supabase.io/) (for database storage)
-   **Linting/Formatting**: ESLint & Prettier

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [bun](https://bun.sh/) (or `npm`/`yarn`)
-   A [Supabase](https://supabase.com/) account for the backend.

### Local Installation

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd wo-c-main
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```
    *(Or `npm install` if you are using npm)*

3.  **Set up Supabase:**
    -   Log in to your Supabase account and create a new project.
    -   Inside your project, go to the **SQL Editor** and run the SQL script located in `supabase/migrations/` to create the necessary tables (`workers`, `profiles`).
    -   Navigate to **Project Settings > API**.
    -   Find your **Project URL** and `anon` public key.
    -   Create a new file named `WorkKar.env` by copying the example. Add your Supabase credentials to it:
        ```
        VITE_SUPABASE_URL=YOUR_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    > **Note:** The project's sign-up form inserts data directly into the database and does not use Supabase Auth. Make sure your Row Level Security (RLS) policies on the `workers` and `profiles` tables allow for public inserts if you have RLS enabled.

4.  **Run the development server:**
    ```sh
    bun run dev
    ```

The application should now be running on [http://localhost:5173](http://localhost:5173).

---
## 🧹 Codebase Cleanup

The codebase has been cleaned to remove all mentions of placeholder names and has been standardized to use the "WorkKar" branding and iconography.
