import bcrypt
from datetime import datetime

class User:
    def __init__(self, db):
        self.collection = db.users

    def create(self, data):
        user = {
            'email': data['email'],
            'password': self._hash_password(data['password']),
            'full_name': data['fullName'],
            'created_at': datetime.utcnow()
        }
        result = self.collection.insert_one(user)
        return str(result.inserted_id)

    def get_by_email(self, email):
        return self.collection.find_one({'email': email})

    def _hash_password(self, password):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt)

    def check_password(self, password, hashed):
        return bcrypt.checkpw(password.encode('utf-8'), hashed)