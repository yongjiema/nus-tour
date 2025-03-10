# Campus Tour Information Management Features

## Overview

We have added campus tour information management features that allow:
1. Users to view multiple notifications and events on the tour information page
2. Support for pinning important notifications and events
3. Administrators to add, edit, and manage notifications and events in the backend

## Feature Details

### Frontend User Interface
- Supports displaying multiple notifications, with pinned notifications shown first
- Supports displaying multiple events, with pinned events visually highlighted
- Notifications are displayed using an Accordion component for easy browsing of multiple items
- Events are displayed using a card grid layout for intuitive presentation

### Administrator Interface
- Access the management page via the "Manage Tour Information" button in the admin backend
- Supports adding, editing, and deleting notifications and events
- Supports pinning/unpinning functionality
- The management page uses a tabbed design to separately manage notifications and events

## Technical Implementation

### Data Storage Format
We use a special string format to store multiple notifications and events: