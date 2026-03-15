# Mednex Enterprise — Frontend

> A modern, multi-portal Hospital Management System (HMS) built with **React + Vite + TypeScript**.

---

## 🏥 Overview

Mednex Enterprise is a comprehensive HMS platform with dedicated portals for every hospital role:

| Portal | Role | Key Features |
|--------|------|--------------|
| **Admin Console** | Hospital Admin | Branch & staff management, subscriptions |
| **Doctor Portal** | Doctor | OPD dashboard, Patient EMR, IPD management, OT scheduling |
| **Nurse Portal** | Nurse | Patient triage, vitals, waiting-room queue |
| **Receptionist Portal** | Receptionist | Ward management, billing, OT scheduling |
| **Lab Portal** | Lab Technician | Pathology worklist, result entry |
| **Radiology Portal** | Radiologist | Radiology worklist, image result entry |
| **Pharmacy Portal** | Pharmacist | Inventory, dispensing station, supplier management |
| **Patient Portal** | Patient | Profile, appointment booking, medical records |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/virajmahagavakar/mednex-enterprise.git
cd mednex-enterprise

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🛠️ Tech Stack

- **React 18** — UI library
- **Vite 7** — Build tool & dev server
- **TypeScript** — Type safety
- **React Router v7** — Client-side routing
- **Axios** — HTTP client
- **Lucide React** — Icon library

---

## 📁 Project Structure

```
src/
├── components/          # Role-specific layout components
│   ├── admin/
│   ├── doctor/
│   ├── nurse/
│   ├── receptionist/
│   ├── lab/
│   ├── radiology/
│   ├── pharmacist/
│   └── patient/
├── pages/               # Page components per portal
│   ├── admin/
│   ├── doctor/
│   ├── nurse/
│   ├── receptionist/
│   ├── diagnostics/     # Lab + Radiology dashboards
│   ├── surgery/         # OT Dashboard
│   ├── pharmacy/
│   ├── patient/
│   └── auth/
├── services/            # API service layer
│   ├── api.client.ts    # Axios instance with auth interceptor
│   ├── api.types.ts     # All TypeScript DTOs
│   └── *.service.ts     # Per-module service files
└── styles/              # Theme CSS files
```

---

## ⚙️ Backend

This frontend connects to the **Mednex Enterprise Spring Boot backend** running on `http://localhost:8080`.

All API calls go through `src/services/api.client.ts` which automatically attaches the JWT token from `localStorage`.

---

## 📝 License

MIT
