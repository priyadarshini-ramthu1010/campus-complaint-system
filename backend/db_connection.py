import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://darshiniramthu_db_user:2005@cluster0.289biyt.mongodb.net/?appName=Cluster0")

try:
    client = MongoClient(
        MONGO_URI,
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=5000
    )
    # The ismaster command verifies Atlas connection
    client.admin.command('ismaster')
    db = client['campus_complaints']
    print("Connected successfully to MongoDB Atlas database!")
except Exception as e:
    print(f"MongoDB Atlas primary connection error ({e}). Retrying fallback configuration...")
    client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
    db = client['campus_complaints']

def get_collection(name):
    """
    Helper to quickly fetch a collection from the active MongoDB connection.
    """
    return db[name]

# Helper connection check
def check_connection():
    try:
        client.admin.command('ismaster')
        return True
    except Exception as e:
        print(f"MongoDB connection check failed: {e}")
        return False
