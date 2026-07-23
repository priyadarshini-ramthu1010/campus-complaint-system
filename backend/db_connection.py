import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

MONGO_URIS = [
    os.getenv("MONGO_URI", "mongodb+srv://darshiniramthu_db_user:2005@cluster0.289biyt.mongodb.net/?appName=Cluster0"),
    "mongodb+srv://Darshini:2005@cluster0.mqrxkbv.mongodb.net/?appName=Cluster0"
]

client = None
db = None

for uri in MONGO_URIS:
    try:
        # Try without certifi first (avoids Windows Python TLS alert bug)
        c = MongoClient(uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=4000)
        c.admin.command('ismaster')
        client = c
        db = client['campus_complaints']
        print(f"Connected successfully to MongoDB Atlas database!")
        break
    except Exception as e:
        try:
            # Try with certifi fallback
            c = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=4000)
            c.admin.command('ismaster')
            client = c
            db = client['campus_complaints']
            print(f"Connected successfully to MongoDB Atlas database with certifi!")
            break
        except Exception:
            continue

if db is None:
    # Final fallback client
    client = MongoClient(MONGO_URIS[0], tlsAllowInvalidCertificates=True)
    db = client['campus_complaints']

def get_collection(name):
    """
    Helper to fetch a collection from active MongoDB connection.
    """
    return db[name]

def check_connection():
    try:
        client.admin.command('ismaster')
        return True
    except Exception as e:
        print(f"MongoDB connection check failed: {e}")
        return False
