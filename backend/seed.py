import os
import datetime
import bcrypt
import random
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://darshiniramthu_db_user:2005@cluster0.289biyt.mongodb.net/?appName=Cluster0")
client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
db = client['campus_complaints']

def seed_database(target_db=None):
    active_db = target_db if target_db is not None else db
    print("--- SMART CAMPUS MAINTENANCE SYSTEM SEEDER ---")
    print(f"Connecting to database: {active_db.name}")

    # Dropping collections deletes all documents AND all indexes, allowing a clean rebuild.
    users_col = active_db['users']
    complaints_col = active_db['complaints']
    feedback_col = active_db['feedback']
    history_col = active_db['status_history']

    users_col.drop()
    complaints_col.drop()
    feedback_col.drop()
    history_col.drop()
    print("Dropped existing collections to reset data and index schemas.")

    # Recreate Indexes
    print("Creating indexes on 'users' and 'complaints'...")
    users_col.create_index([("email", ASCENDING)], unique=True)
    users_col.create_index([("roll_number", ASCENDING)], unique=True, sparse=True)
    complaints_col.create_index([("complaint_number", ASCENDING)], unique=True)
    print("Sparse indexes created successfully.")

    # Create demo accounts
    password_plain = "Password123"
    hashed_pw = bcrypt.hashpw(password_plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Seed 1 Admin
    admin_doc = {
        "name": "Campus Administrator",
        # roll_number is completely omitted for Admin
        "email": "admin@campus.com",
        "password": hashed_pw,
        "phone": "9876543210",
        "department": "Administration",
        "year": "N/A",
        "role": "admin",
        "profile_image": "",
        "created_at": datetime.datetime.now(datetime.UTC),
        "updated_at": datetime.datetime.now(datetime.UTC),
        "created_by": None,
        "updated_by": None
    }
    admin_id = users_col.insert_one(admin_doc).inserted_id
    print("Seeded Admin: admin@campus.com")

    # Seed 6 Maintenance Staff with realistic names
    staff_depts = [
        ("Rajesh Kumar (Senior Electrician)", "Electrical Maintenance", "Electrical", "staff@campus.com"),
        ("Suresh Sharma (Lead Plumber)", "Plumbing Maintenance", "Plumbing", "staff2@campus.com"),
        ("Anita Verma (IT & Network Tech)", "Network Support", "Internet", "staff3@campus.com"),
        ("Vikram Singh (Carpentry Specialist)", "Furniture & Carpentry", "Furniture", "staff4@campus.com"),
        ("Ramesh Patel (Sanitation Lead)", "Sanitation & Cleaning", "Cleaning", "staff5@campus.com"),
        ("Deepak Verma (HVAC & AC Tech)", "HVAC & Cooling", "Electrical", "staff6@campus.com")
    ]
    staff_ids = []
    staff_docs = []
    for idx, (staff_name, dept_name, cat, email) in enumerate(staff_depts):
        num = idx + 1
        staff_doc = {
            "name": staff_name,
            # roll_number is completely omitted for Staff
            "email": email,
            "password": hashed_pw,
            "phone": f"987654321{num}",
            "department": dept_name,
            "year": "N/A",
            "role": "staff",
            "profile_image": "",
            "created_at": datetime.datetime.now(datetime.UTC),
            "updated_at": datetime.datetime.now(datetime.UTC),
            "created_by": admin_id,
            "updated_by": admin_id
        }
        sid = users_col.insert_one(staff_doc).inserted_id
        staff_ids.append(sid)
        staff_docs.append({
            "id": sid,
            "name": staff_doc["name"],
            "category": cat
        })
        print(f"Seeded Staff: {staff_name} ({email})")

    # Seed 20 Students
    departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Chemical"]
    years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    student_ids = []
    student_docs = []
    
    for i in range(1, 21):
        email = "student@campus.com" if i == 1 else f"student{i}@campus.com"
        roll = f"STU-2026-{i:04d}"
        student_doc = {
            "name": f"Student Scholar {i}",
            "roll_number": roll,
            "email": email,
            "password": hashed_pw,
            "phone": f"76543210{i:02d}",
            "department": random.choice(departments),
            "year": random.choice(years),
            "role": "student",
            "profile_image": "",
            "created_at": datetime.datetime.now(datetime.UTC),
            "updated_at": datetime.datetime.now(datetime.UTC),
            "created_by": None,
            "updated_by": None
        }
        sid = users_col.insert_one(student_doc).inserted_id
        student_ids.append(sid)
        student_docs.append({
            "id": sid,
            "name": student_doc["name"],
            "roll_number": roll,
            "department": student_doc["department"]
        })
        print(f"Seeded Student: {email} ({roll})")

    # Seed 50 Sample Complaints
    categories = ["Electrical", "Plumbing", "Internet", "Furniture", "Cleaning", "Laboratory", "Classroom", "Hostel", "Civil", "Water Supply", "Others"]
    buildings = ["Main Block", "Science Block", "Library", "Ramanujan Hostel", "Tagore Hostel", "Newton Lab", "Academic Hall"]
    priorities = ["Low", "Medium", "High", "Emergency"]
    statuses = ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"]
    
    titles_by_cat = {
        "Electrical": ["Broken ceiling fan", "Tube light flickering", "Short circuit in power socket", "AC remote not working"],
        "Plumbing": ["Water leak in sink faucet", "Washroom flush leaking", "Tap broken in drinking station", "Drainage clog in floor grid"],
        "Internet": ["Wi-Fi router offline", "Ethernet port broken in lab", "High latency connection", "DNS resolving failure"],
        "Furniture": ["Study desk leg broken", "Lecture hall bench split", "Office chair wheels damaged", "Hostel wardrobe lock jammed"],
        "Cleaning": ["Dustbins overflowing in lobby", "Unswept corridor", "Spill clean-up required in cafeteria", "Washrooms dirty"],
        "Laboratory": ["Fume hood exhaust motor failure", "Gas connection leaking in chem lab", "Lab projector out of focus"],
        "Classroom": ["Whiteboard frame loose", "Smart board touch failure", "Window glass cracked", "Lectern missing keys"],
        "Hostel": ["Hot water geyser not heating", "Room balcony door issue", "Balcony exhaust rattling", "Corridor light broken"],
        "Civil": ["Cracked wall tiles in gallery", "Ceiling plaster peeling off", "Roof water logging", "Main gate hinge broken"],
        "Water Supply": ["Water filter needs cartridge swap", "Low water pressure on top floor", "Tanks dry during daytime"],
        "Others": ["Signboard fallen", "Corridor lock jammed", "Fire extinguisher pin missing", "Garden tap malfunctioning"]
    }

    descriptions_by_cat = {
        "Electrical": "The ceiling fan makes an irritating noise and rotates slowly. Needs capacitor replacement.",
        "Plumbing": "Continuous dripping water has filled the bucket and is overflowing onto the floor. Please fix urgently.",
        "Internet": "Cannot connect to the campus Wi-Fi network. It says authenticating and then fails. It affects 20+ students.",
        "Furniture": "One of the legs of the main wooden desk is cracked. It wobbles when writing and might collapse.",
        "Cleaning": "The trash has not been cleared for past three days. It emits bad smell and blocks the walkway.",
        "Laboratory": "The projector in the computer lab is showing distorted green colors. Hard to read code scripts.",
        "Classroom": "The whiteboard is falling off on one corner. Mounting screw has come loose from the wall.",
        "Hostel": "The geyser in the hostel washroom is not heating the water at all. Extremely difficult in the mornings.",
        "Civil": "Cracks have appeared along the beam columns in Room 102. Please inspect structural stability.",
        "Water Supply": "The water purifier on the second floor is serving cloudy water. Filter maintenance overdue.",
        "Others": "The hallway fire extinguisher seal is broken. Need safety inspection and refilling."
    }

    print("Generating 50 sample complaints...")
    now = datetime.datetime.now(datetime.UTC)
    
    for i in range(1, 51):
        student = random.choice(student_docs)
        cat = random.choice(categories)
        title = random.choice(titles_by_cat[cat]) + f" #{i}"
        desc = descriptions_by_cat[cat] + f" Checked on campus area."
        building = random.choice(buildings)
        floor = f"{random.randint(0, 4)}rd Floor" if random.randint(0,4) > 0 else "Ground Floor"
        room = f"Room {random.randint(101, 499)}"
        priority = random.choice(priorities)
        
        status_val = random.choice(statuses)
        
        assigned_staff_id = None
        assigned_staff_name = None
        resolution_notes = None
        resolution_date = None
        resolved_by = None
        
        if status_val != "Pending":
            matching_staff = [s for s in staff_docs if s["category"] == cat]
            staff = random.choice(matching_staff) if matching_staff else random.choice(staff_docs)
            assigned_staff_id = staff["id"]
            assigned_staff_name = staff["name"]

        if status_val == "Resolved":
            resolution_notes = f"Completed the repair. Replaced the faulty parts and verified operation."
            resolution_date = now - datetime.timedelta(hours=random.randint(2, 24))
            resolved_by = assigned_staff_id
            
        comp_number = f"CMP-2026-{i:04d}"
        created_time = now - datetime.timedelta(days=random.randint(1, 30), hours=random.randint(1, 23))

        complaint_doc = {
            "complaint_number": comp_number,
            "student_id": student["id"],
            "student_name": student["name"],
            "roll_number": student["roll_number"],
            "department": student["department"],
            "title": title,
            "description": desc,
            "category": cat,
            "building": building,
            "floor": floor,
            "room_number": room,
            "location": f"Near the corridor entrance of {building}",
            "priority": priority,
            "images": [
                {
                    "image_path": "complaints/sample_default.jpg",
                    "original_filename": "broken_equipment.jpg",
                    "uploaded_at": created_time,
                    "uploaded_by": student["id"]
                }
            ] if random.random() > 0.4 else [],
            "status": status_val,
            "assigned_staff_id": assigned_staff_id,
            "assigned_staff_name": assigned_staff_name,
            "resolution_notes": resolution_notes,
            "resolution_date": resolution_date,
            "resolved_by": resolved_by,
            "is_read_by_student": False,
            "is_read_by_admin": False,
            "is_read_by_staff": False,
            "is_deleted": False,
            "created_at": created_time,
            "updated_at": created_time + datetime.timedelta(hours=random.randint(1, 12)) if status_val != "Pending" else created_time,
            "created_by": student["id"],
            "updated_by": student["id"]
        }

        cid = complaints_col.insert_one(complaint_doc).inserted_id

        # Seed timeline history
        history_col.insert_one({
            "complaint_id": cid,
            "status": "Pending",
            "remarks": "Complaint filed via online campus system.",
            "updated_by": student["id"],
            "updated_by_name": student["name"],
            "updated_at": created_time
        })

        if status_val != "Pending":
            history_col.insert_one({
                "complaint_id": cid,
                "status": "Assigned",
                "remarks": f"Assigned to {assigned_staff_name} for repair.",
                "updated_by": admin_id,
                "updated_by_name": "Campus Administrator",
                "updated_at": created_time + datetime.timedelta(hours=random.randint(1, 3))
            })

        if status_val in ["In Progress", "Resolved"]:
            history_col.insert_one({
                "complaint_id": cid,
                "status": "In Progress",
                "remarks": "Work started. Repair technician is resolving the issue.",
                "updated_by": assigned_staff_id,
                "updated_by_name": assigned_staff_name,
                "updated_at": created_time + datetime.timedelta(hours=random.randint(4, 6))
            })

        if status_val == "Resolved":
            history_col.insert_one({
                "complaint_id": cid,
                "status": "Resolved",
                "remarks": resolution_notes,
                "updated_by": assigned_staff_id,
                "updated_by_name": assigned_staff_name,
                "updated_at": resolution_date
            })

            if random.random() > 0.4:
                feedback_col.insert_one({
                    "complaint_id": cid,
                    "student_id": student["id"],
                    "student_name": student["name"],
                    "rating": random.choice([4, 5]),
                    "comment": random.choice(["Great work!", "Fixed very fast, thank you.", "Super responsive service.", "Staff was very polite."]),
                    "created_at": resolution_date + datetime.timedelta(hours=random.randint(1, 5))
                })

        if status_val == "Rejected":
            history_col.insert_one({
                "complaint_id": cid,
                "status": "Rejected",
                "remarks": "Rejected: Duplicate ticket or incorrect information provided.",
                "updated_by": admin_id,
                "updated_by_name": "Campus Administrator",
                "updated_at": created_time + datetime.timedelta(hours=random.randint(2, 4))
            })

    print(f"Successfully seeded 50 sample complaints into the 'complaints' collection.")
    print("Database seeding process complete!")

if __name__ == '__main__':
    seed_database()
