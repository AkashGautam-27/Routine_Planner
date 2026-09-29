# Routine Planner

Routine Planner is a simple, Excel-style web application built with React and Tailwind CSS that helps you track your daily habits and routines over time.

## Features
- 📊 **Excel-style Grid:** Easily add rows (routines) and columns (dates) to track completions.
- 📈 **Visual Analytics:** View your performance over time with a dedicated charts view.
- 💾 **Local Storage:** All your data is saved automatically in your browser's local storage.
- 🖨️ **PDF Export:** Generate and download high-quality printable reports for your tracked routines.
- 🗓️ **Flexible Dates:** Shift start or end dates dynamically to adjust your tracking timeline.

## Tech Stack
- **React (Vite)**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **TypeScript**

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:3000`).

## Usage
- Click **"Add Row"** to track a new habit or routine.
- Click **"Add Date"** to add a new tracking day.
- Click any **Date header** to modify its value.
- Click **"Visual"** in the top bar to switch from the spreadsheet view to the analytics dashboard.
- Click the **"Report"** button to view and save a PDF summary of your current progress.
