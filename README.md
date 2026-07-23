# Smart Campus Maintenance Complaint Management System

A production-ready full-stack campus repair request management web application. It connects students, campus administrators, and maintenance repair technicians.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Axios, React Hook Form, React Toastify, Recharts, Lucide Icons.
- **Backend**: Django REST Framework, PyMongo (direct MongoDB Atlas connections), JWT (pyjwt), bcrypt, Pillow.
- **Database**: MongoDB Atlas.

---

## 🛠️ Installation & Setup

### 1. Database Seeding & Backend Configuration

1. Open a terminal in the `backend/` folder.
2. Verify you have a `.env` file containing:
   ```env
   MONGO_URI=mongodb+srv://Darshini:2005@cluster0.mqrxkbv.mongodb.net/?appName=Cluster0
   JWT_SECRET=super-secret-key-12345-campus-maintenance
   DEBUG=True
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with indices and demo accounts:
   ```bash
   python seed.py
   ```
5. Launch the Django API server:
   ```bash
   python manage.py runserver
   ```
   The API will run on `http://127.0.0.1:8000/`.

---

### 2. Frontend Configuration

1. Open a terminal in the `frontend/` folder.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000/`.

---

## 🔑 Demo Access Credentials

The database seeder automatically creates the following test profiles:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campus.com` | `Password123` | Can view statistics, assign staff, reject complaints, view feedacks |
| **Maintenance Staff** | `staff@campus.com` | `Password123` | Can view assigned tasks, update work to In Progress / Resolved |
| **Student User** | `student@campus.com` | `Password123` | Can raise complaints, upload files, view timelines, submit feedbacks |

*Note: You can register custom student accounts via the Register page, and administrators can register additional staff technicians via the User Management panel.*

---

## 📂 Features Implemented

1. **Student Workspace**:
   - File maintenance requests with details (building, room, priority, description).
   - Multi-file image uploading to local storage `media/complaints/`.
   - Table containing search, pagination, status badges, and details.
   - Timelines stepper auditing progress status history logs.
   - Five-star rating feedback reviews for Resolved complaints.
2. **Admin Console**:
   - Status tracking cards (Total, Pending, In Progress, Resolved, Rejected).
   - Recharts visual charts for counts by Category, Status, Priorities, and Monthly trends.
   - Main manager dashboard allowing assignment of technicians to tasks and overriding statuses.
   - Staff creation panels.
3. **Staff Desk**:
   - Technician task tracking board.
   - Status updating ("In Progress", "Resolved") with completion remarks.
   - Support for attaching resolution verification images.
4. **Security Controls**:
   - Custom JWT DRF Authentication middleware querying MongoDB collections.
   - Encryption of credentials via bcrypt hashes.
   - Sparse index enforcement preventing duplicate student roll numbers.

---

## 🔮 Future Enhancements (Viva Scope)

- **QR Code integration**: QR sticker labels inside classrooms that link directly to the Raise Complaint form with pre-filled room numbers.
- **Automated Notifications**: Direct email alerts and WhatsApp warnings when status history transitions.
- **AI Categorization**: Fine-tuned classification models grouping descriptions into maintenance categories.
- **Spatial Heatmaps**: Mapping campus building locations with complaint volume densities.
