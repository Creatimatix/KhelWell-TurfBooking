# Turf Booking Frontend

A modern React application for turf booking with Material-UI design and TypeScript.

## Features

- **Responsive Design**: Mobile-first approach with Material-UI
- **User Authentication**: Login/Register with role-based access
- **Turf Search & Booking**: Advanced search with filters
- **Dashboard**: Role-specific dashboards (User, Owner, Admin)
- **Event Management**: View upcoming and ongoing events
- **Modern UI**: Clean, intuitive interface with Material Design

## Tech Stack

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **State Management**: React Context + React Query
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Yup validation
- **Notifications**: React Hot Toast
- **Charts**: Recharts (for analytics)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── user/           # User-specific pages
│   ├── owner/          # Owner-specific pages
│   └── admin/          # Admin-specific pages
├── context/            # React Context providers
├── services/           # API service functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main app component
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

## Features by User Role

### Public Users
- Browse turfs (limited information)
- View events
- Register/Login

### Regular Users
- Full turf browsing and search
- Book turf slots
- View booking history
- Access user dashboard

### Turf Owners
- All user features
- Manage their turfs
- View turf bookings
- Update booking statuses

### Admins
- All features
- Manage users and turfs
- Create and manage events
- Access comprehensive analytics

## Development Notes

- The app uses React Query for server state management
- Material-UI theme is customized for sports/turf theme
- All API calls are handled through service functions
- Authentication state is managed through React Context
- Responsive design works on all device sizes 