High-Level Design (HLD) Document: Hi-Lite VMS

1. Application Architecture
The Hi-Lite VMS utilizes a decoupled Client-Server architecture:

  Frontend: A React SPA built with TypeScript, emphasizing modular component design and type safety.

  Backend: A RESTful simulation provided by json-server, enabling rapid prototyping and data persistence via db.json.

2. Component Hierarchy & State Management
  Component Structure: The application follows a top-down hierarchy: App.tsx (Router) -> AppHeader (Global UI) -> Role-Specific Dashboards -> Reusable components (VisitorTable, AddVisitorModal).

  Centralized State: We utilize localStorage for session management (simulating authentication) and useState for component-level UI state.

  Performance Optimization: useMemo hooks are employed to cache filtered datasets, ensuring the interface remains responsive as the logs grow.

3. Data Integrity & Authorization
  Identity-Based Authorization: The application has evolved from a name-based logic to an ID-based model. Visitors are strictly linked to hosts via hostId.

   Cascade Synchronization: To prevent data fragmentation, an explicit cascade update pattern is implemented in the EditProfile workflow. When a host updates their profile (e.g., changes fullName or flatNumber), the application initiates a synchronous batch update to all historical visitor records linked to that hostId.

4. Key Design Decisions & Critical Assumptions
   Primary Identification: Every visitor record is uniquely identified by a UUID (id).

   Logical Filtering: flatNumber is treated as a filter attribute rather than a database primary key, allowing for flexible visitor searching.

   Host-Linked Records: Visitors are mapped via hostId to ensure data isolation. A resident can only view their own visitor list, preventing unauthorized viewing of roommate activity.

5. Challenges & Resolutions
   Challenge: Orphaned Data. Updating user profiles did not automatically reflect in historical visitor records.

   Resolution: Implemented an automated PATCH cascade in the profile update service to propagate changes instantly across the visitors collection.

   Challenge: KPI/Table Synchronization.

   Resolution: Standardized on parent-level filtering using useMemo to ensure that summary statistics always align with the visible rows in the table.

6. Future Improvements
   Real-time Notifications: Implement a push notification system to alert residents instantly when a visitor arrives at the gate. This would shift the experience from a "pull" model (residents manually checking the dashboard) to a "push" model, significantly improving visitor processing time.

   Real-time Engine: Integrating WebSockets (Socket.io) to eliminate the need for manual page refreshes.

   Authentication: Transitioning from mock localStorage auth to a secure JWT/OAuth2 flow with a professional backend (PostgreSQL/MongoDB).