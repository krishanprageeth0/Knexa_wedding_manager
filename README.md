# Knexa Wedding Manager 💍

Knexa Wedding Manager is a premium, modern, and comprehensive B2B Wedding Management System (SaaS) built to help couples manage their special day effortlessly. Designed with a luxury aesthetic and a highly intuitive user interface, it keeps everything from budgets to bridal parties interconnected in one centralized dashboard.

## 🌟 Key Features

*   **📊 Smart Dashboard**: A beautifully designed overview with real-time aggregates of budget spent, RSVPs, and pending tasks.
*   **💸 Budget Planner**: Track estimated costs, advance payments, and real-time balances.
*   **👥 Guest Management**: Add guests, track RSVPs, and automatically send WhatsApp digital invitations.
*   **🪑 Seating Plan**: Create tables, define capacities, and visually assign your guests to seats.
*   **✅ Interactive Checklist**: Pre-populated with essential Sri Lankan wedding milestones, featuring inline editing and deadline tracking.
*   **⏰ Smart Timeline**: Plan your wedding day schedule down to the minute.
*   **👑 Bridal Party & VIPs**: Keep track of your closest crew, their roles, attire measurements, and assigned tasks.
*   **🏬 Vendor Hub**: Manage your suppliers, contact details, and contracts.
*   **💳 Payment Reminders**: Track upcoming payments with automatic overdue alerts and payment status toggles.
*   **🎵 Music Playlist**: Curate your "Must Play" and "Do Not Play" lists for the DJ.
*   **📸 Memories Vault**: Save links to your mood boards, venue inspiration, and engagement photos.

## 💻 Tech Stack

*   **Frontend**: Next.js 15 (App Router), React, TypeScript
*   **Styling**: Tailwind CSS v4, Framer Motion (Animations)
*   **Icons**: Lucide React
*   **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Magic Links & Passwords)

## 🔒 Security & Architecture

Knexa Wedding Manager is built as a true multi-tenant SaaS. 
*   **Role-Based Access**: Only the Super Admin can create workspaces and invite couples. Couples cannot register themselves.
*   **Row Level Security (RLS)**: Supabase RLS policies ensure that users can only read and write data belonging to their own unique `workspace_id`.
*   **JWT Claims**: Custom SQL functions enforce strict data isolation between couples.

## 🚀 Getting Started (Local Development)

1.  **Clone the repository**
    ```bash
    git clone https://github.com/krishanprageeth0/Knexa_wedding_manager.git
    cd Knexa_wedding_manager
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🌐 Deployment (Vercel)

This Next.js app is optimized for deployment on Vercel:
1. Import this repository into your Vercel dashboard.
2. Add the 3 environment variables listed above in the Vercel project settings.
3. Click Deploy!

---
*Powered by Knexa System*
