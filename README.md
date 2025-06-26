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
-   **Worker Reporting**: Users can report workers for inappropriate behavior, spam, or other reasons.
-   **Admin Change Requests**: Users can request profile changes (e.g., email, category); admins can approve or reject these securely.
-   **Dynamic Categories & Subcategories**: Categories and subcategories are managed in the database and fetched live, with multi-select and "Select All" for subcategories.

---

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Mapping**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
-   **Backend & DB**: [Supabase](https.supabase.io/) (for database storage)
-   **Supabase Edge Functions**: For secure admin actions (e.g., approving change requests).
-   **Linting/Formatting**: ESLint & Prettier

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)
-   A [Supabase](https://supabase.com/) account for the backend.

### Local Installation

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd wo-c-main
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up Supabase:**
    -   Log in to your Supabase account and create a new project.
    -   Inside your project, go to the **SQL Editor** and run the SQL script located in `supabase/migrations/` to create the necessary tables (`workers`, `profiles`, etc.).
    -   Navigate to **Project Settings > API**.
    -   Find your **Project URL** and `anon` public key.
    -   Create a new file named `WorkKar.env` by copying the example. Add your Supabase credentials to it:
        ```
        VITE_SUPABASE_URL=YOUR_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    -   **Deploy Edge Functions for Admin Actions:**
        -   Install the Supabase CLI if you haven't already:  
            `npm install -g supabase`
        -   Log in:  
            `supabase login`
        -   Deploy the approval function:  
            `supabase functions deploy approve-change-request`
        -   Make sure your Supabase project has the `SUPABASE_SERVICE_ROLE_KEY` set for secure function access.

> **Note:** The admin panel's "Approve" button for change requests will not work unless the edge function is deployed.

    > **Note:** The project's sign-up form inserts data directly into the database and does not use Supabase Auth. Make sure your Row Level Security (RLS) policies on the `workers` and `profiles` tables allow for public inserts if you have RLS enabled.

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

The application should now be running on [http://localhost:5173](http://localhost:5173).

---

## 🔒 Security Notes

-   **Admin Actions:** Changing sensitive user data (like email) is only possible via secure Supabase Edge Functions, not from the client/browser.
-   **RLS Policies:** Ensure your Row Level Security (RLS) policies allow the necessary operations for your app to function (see Supabase docs).

---

## 🧹 Codebase Cleanup

The codebase has been cleaned to remove all mentions of placeholder names and has been standardized to use the "WorkKar" branding and iconography.

## 📍 Location Handling

When a user selects their location (either by pin-pointing on the map or using the "Use My Location" button):

- The app fetches the **full, human-readable address** using the Nominatim API and saves it as the `location_address` (text) in the database.
- The app saves the **coordinates** as a geometry value (WKT, e.g., `POINT(lng lat)`) in the `location_coordinates` (geometry) column.
- This is required for distance calculation and for users to find nearby workers.
- If either value is missing, the profile cannot be saved or updated.

**Example:**
- `location_address`: `Murad Nagar, Ward 70 Mehdipatnam, Greater Hyderabad Municipal Corporation Central Zone, Hyderabad, Asif Nagar mandal, Hyderabad, Telangana, 500264, India`
- `location_coordinates`: `0101000020E61000000009005B649C5340157C7159BC633140`

This logic applies to both profile updates and worker sign-up.
