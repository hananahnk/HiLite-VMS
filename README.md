# Hi-Lite Visitor Management System (VMS)

A robust, role-based Visitor Management System designed to digitize community security. It facilitates seamless visitor registration, real-time approval workflows for residents, and comprehensive data logging for administrators.

---

## System Requirements

### Functional Requirements

* **Role-Based Access Control (RBAC):** Distinct permissions for Admin, Security, and Residents.
* **Visitor Lifecycle Management:** Automated tracking from registration (Pending) to Entry, Exit, and final status (Approved/Rejected/Completed).
* **Data Integrity:** ID-based referential linking (`hostId`) ensures data consistency even during profile updates.
* **Reporting & Analytics:** Date-range filtering and CSV export capabilities for administrative auditing.

### Technical Requirements

* **Node.js:** v18.0.0 or higher
* **NPM:** v9.0.0 or higher
* **Framework:** React.js with TypeScript
* **UI Library:** Ant Design (Antd)
* **API Integration:** Axios
* **Mock Backend:** JSON Server
* **Browser:** Modern Chrome, Firefox, or Edge

---

## Demo

A full walkthrough of the application features and workflows can be viewed here: [[Link to Demo Video](https://drive.google.com/file/d/1Z6O-cX_91mz2c0fbSvf1qNvgVhRmGdvC/view?usp=sharing)]

---

## Getting Started

### 1. Installation

Clone the repository and install the project dependencies:

```bash
git clone <repository-url>
cd hi-lite-vms
npm install

```

### 2. Running the Application

The project requires two concurrent processes: the mock database server and the development frontend.

Open two separate terminal windows:

#### Terminal 1 (Mock Backend)

```bash
npm run server

```

This initializes the `json-server` on:

```text
http://localhost:5000

```

#### Terminal 2 (Frontend)

```bash
npm run dev

```

This launches the React development server. Open the displayed URL in your browser.

---

## Architecture Overview

The system employs a Cascade Synchronization Pattern to maintain referential integrity. When user profiles are modified, the application automatically synchronizes all associated historical records, ensuring that visitor history remains linked to the host regardless of account updates.

---

## Roles & Access

| Role | Capabilities |
| --- | --- |
| **Admin** | Manage residents, monitor total site traffic, and oversee security logs. |
| **Security** | Register new visitors and manage gate entry/exit logs. |
| **Resident** | Approve/Reject visitor requests and view personal visitor history. |

---

## Key Design Decisions

### ID-Based Relationship

Refactored from name-based strings to `hostId` unique keys to prevent data orphaning.

### State Management

Optimized with `useMemo` for high-performance filtering of visitor logs.

### UI/UX

Leveraged Ant Design’s component library to ensure a professional, consistent interface across all user roles.

### Data Synchronization

Implemented an explicit cascade update pattern in the EditProfile workflow to propagate profile changes to historical records.

---

## Future Improvements

### Real-time Notifications

Implement a push notification system to alert residents instantly when a visitor arrives at the gate.

### Real-time Engine

Integrate WebSockets (Socket.io) to provide live updates when security enters a new visitor, removing the need for manual page refreshes.

### Authentication

Transitioning from mock localStorage authentication to a secure JWT/OAuth2 flow with a professional backend (PostgreSQL/MongoDB).
