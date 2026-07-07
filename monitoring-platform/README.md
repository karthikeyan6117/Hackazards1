# AI-Powered Monitoring Platform - Frontend

A modern, professional Next.js dashboard for monitoring endpoints and analyzing incidents with AI-generated root cause analysis.

## Overview

This is the frontend application for the **AI-Powered Monitoring and Incident Intelligence Platform** - a system that transforms monitoring from passive alerting into active incident intelligence. The platform helps developers quickly understand why services failed and how to fix them.

## Features

### 🎯 Real-Time Monitoring Dashboard
- **Endpoint Status Cards**: View health status, uptime, and latency for all monitored endpoints
- **Key Metrics**: Total endpoints, overall uptime, active incidents, and average latency
- **Active Incidents List**: See ongoing incidents with AI-generated confidence scores
- **Quick Navigation**: Easy access to detailed views and configuration

### 📋 Incident History & Management
- **Detailed Incident View**: Comprehensive incident information including:
  - AI-generated root cause analysis
  - Supporting evidence and data
  - Timeline of incident events
  - Recommended remediation actions
- **Incident Filtering**: View active, investigating, or resolved incidents
- **Confidence Scoring**: AI confidence in the root cause analysis

### 🌐 Public Status Page
- **Service Status Overview**: All monitored endpoints at a glance
- **Health Metrics**: Latency and uptime percentages per service
- **Real-Time Updates**: Status information updated continuously
- **Professional Appearance**: Public-facing status page for customers

### ⚙️ Alert Configuration
- **Multiple Channels**: Email, Slack, and Discord notifications
- **Smart Filtering**: Configure which incidents trigger which alerts
- **Advanced Settings**:
  - Alert delays for false positive reduction
  - Quiet hours to avoid overnight notifications
  - Critical incident escalation
  - Alert aggregation for reduction of noise

## Technology Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks
- **UI Components**: Custom components with Tailwind CSS

## Project Structure

```
monitoring-platform/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Dashboard page
│   ├── incidents/
│   │   ├── page.tsx            # Incident list
│   │   └── [id]/
│   │       └── page.tsx        # Incident detail view
│   ├── status/
│   │   └── page.tsx            # Public status page
│   ├── settings/
│   │   └── page.tsx            # Alert configuration
│   └── globals.css             # Global styles
├── components/
│   ├── badges.tsx              # Status and severity badges
│   └── endpoint-card.tsx       # Endpoint card component
├── types/
│   └── index.ts                # TypeScript interfaces
├── public/                      # Static assets
├── package.json
└── tsconfig.json
```

## Key Components

### Dashboard (`app/page.tsx`)
The main entry point showing:
- Metrics grid with key statistics
- Active incidents with AI analysis highlights
- Monitored endpoints overview

### Incident Details (`app/incidents/[id]/page.tsx`)
Detailed view of a single incident featuring:
- AI-generated root cause analysis
- Evidence supporting the analysis
- Recommended actions to resolve
- Timeline of incident events
- Incident metadata and status

### Status Page (`app/status/page.tsx`)
Public-facing service status page with:
- All endpoint statuses
- Performance metrics
- Clean, professional design

### Settings (`app/settings/page.tsx`)
Alert configuration interface with:
- Notification channel management
- Alert condition customization
- Advanced settings and escalation policies

### Reusable Components
- `StatusBadge`: Visual status indicator (up/down/degraded)
- `SeverityBadge`: Incident severity indicator
- `EndpointCard`: Reusable endpoint status card

## Data Types

All data types are defined in `types/index.ts`:
- `Endpoint`: Monitored service
- `Incident`: Detected incident with AI analysis
- `TimelineEvent`: Event in incident timeline
- `Alert`: Notification channel configuration
- `DashboardMetrics`: Key statistics
- `Report`: Generated incident report

## Getting Started

### Installation

```bash
cd monitoring-platform
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Pages Overview

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/` | Main monitoring view with metrics and incidents |
| Incidents | `/incidents` | List of all incidents |
| Incident Detail | `/incidents/[id]` | Detailed view with AI analysis |
| Status Page | `/status` | Public status page for all services |
| Settings | `/settings` | Alert configuration and management |

## UI/UX Features

### Design Principles
- **Clean & Professional**: Minimal, focused design
- **Accessibility**: Semantic HTML, proper color contrast
- **Responsive**: Mobile-friendly design that works on all devices
- **Intuitive**: Clear navigation and information hierarchy

### Color Scheme
- **Status**: Green (up), Red (down), Yellow (degraded)
- **Severity**: Red (critical), Orange (warning), Blue (info)
- **Primary Action**: Blue (#2563EB)
- **Neutral**: Gray scale for backgrounds and text

### Interactive Elements
- Hover effects on clickable elements
- Smooth transitions and animations
- Loading states (where applicable)
- Clear visual feedback for user actions

## Mock Data

The application currently uses mock data for demonstration:
- 4+ monitored endpoints
- 2 active incidents with full AI analysis
- Multiple alert configurations
- Complete incident timelines and recommendations

To connect to the backend API:
1. Create API service layer in `services/api.ts`
2. Replace mock data with API calls
3. Update types as needed for backend responses

## Customization

### Styling
All styling uses Tailwind CSS utility classes. Modify `app/globals.css` to customize the theme.

### Endpoints & Data
Update mock data in each page component or connect to the FastAPI backend.

### Alert Channels
Extend the `AlertType` in `types/index.ts` to add new notification channels.

## Performance

- Static page generation where possible
- Optimized images and assets
- TypeScript for compile-time error checking
- Minimal dependencies

## Future Enhancements

- Real-time updates using WebSockets
- Historical charts and trend analysis
- Advanced filtering and search
- User authentication and role-based access
- Integration with backend API
- Dark mode support
- Mobile app version

## Architecture Notes

### Frontend-Backend Integration
The frontend is designed to work with a FastAPI backend providing:
- Endpoint status data
- Incident information
- AI analysis results (from PydanticAI)
- Alert configurations

### State Management
Currently uses React hooks for local state. For complex state management, consider adding:
- Context API for global state
- TanStack Query for server state
- Zustand or Redux for complex state

### Real-Time Updates
The status page and dashboard are ready for WebSocket integration to show real-time updates.

## Development Workflow

1. Create new page components in `app/`
2. Define data types in `types/index.ts`
3. Create reusable components in `components/`
4. Use mock data for initial development
5. Connect to API when backend is ready

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Contributing

When adding new features:
1. Maintain TypeScript type safety
2. Follow the existing component structure
3. Keep styles consistent with Tailwind CSS utilities
4. Add mock data for new features
5. Update this README with changes

## License

This project is part of the Hackazards monitoring platform initiative.
#   H a c k a z a r d s  
 