import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

mongo_uri = os.getenv("MONGO_URI")

client = None
db = None

if mongo_uri:
    # 1. Try certifi SSL CA bundle first
    try:
        c = MongoClient(mongo_uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=4000)
        c.admin.command('ping')
        client = c
        db = client['campus_complaints']
        print("Connected successfully to MongoDB Atlas database via certifi!")
    except Exception:
        # 2. Try tlsAllowInvalidCertificates fallback
        try:
            c = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=4000)
            c.admin.command('ping')
            client = c
            db = client['campus_complaints']
            print("Connected successfully to MongoDB Atlas database via TLS fallback!")
        except Exception as e:
            print(f"MongoDB connection notice: {e}")

if db is None:
    # Fallback to local MongoDB or persistent mongomock store
    try:
        c = MongoClient("mongodb://127.0.0.1:27017/campus_complaints", serverSelectionTimeoutMS=2000)
        c.admin.command('ping')
        client = c
        db = client['campus_complaints']
    except Exception:
        import mongomock
        import pickle
        from pathlib import Path

        db_dir = Path(__file__).resolve().parent / "db_data"
        db_dir.mkdir(exist_ok=True)
        store_file = db_dir / "local_db.pkl"

        client = mongomock.MongoClient()
        db = client['campus_complaints']

        # Load persisted collections if store file exists
        if store_file.exists():
            try:
                with open(store_file, "rb") as f:
                    saved_data = pickle.load(f)
                    for col_name, docs in saved_data.items():
                        if docs:
                            db[col_name].insert_many(docs)
                print(f"Loaded persistent local MongoDB mock state from {store_file}")
            except Exception as e:
                print(f"Notice: Could not load local_db.pkl: {e}")

        # Helper to persist database state
        def persist_db():
            try:
                data_to_save = {}
                for col_name in db.list_collection_names():
                    data_to_save[col_name] = list(db[col_name].find())
                with open(store_file, "wb") as f:
                    pickle.dump(data_to_save, f)
            except Exception as e:
                print(f"Notice: Could not persist local_db.pkl: {e}")

        # Attach persist method to db
        db.persist_db = persist_db
        print("Using persistent local MongoDB database.")



def get_collection(name):
    """
    Helper to fetch a collection from active MongoDB connection.
    """
    return db[name]

def check_connection():
    try:
        client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB connection check failed: {e}")
        return False

