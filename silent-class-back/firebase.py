import firebase_admin
from firebase_admin import credentials

# Initialize Firebase Admin SDK
cred = credentials.Certificate("D:\SECURESERVER-P\silentclass\silent-class-back\silent-class-d86a7-firebase-adminsdk-b4tqp-48e8e02542.json")
firebase_app = firebase_admin.initialize_app(cred)

def get_firebase_app():
    return firebase_app
