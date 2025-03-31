from flask import Blueprint, request, jsonify
import jwt
from datetime import datetime, timedelta
from functools import wraps
from models.user import User
from config.config import Config

auth = Blueprint('auth', __name__)
db = None

@auth.record
def record_params(setup_state):
    global db
    db = setup_state.options.get('db')

@auth.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    user_model = User(db)
    
    if user_model.get_by_email(data['email']):
        return jsonify({'message': 'Email already exists'}), 400

    user_id = user_model.create(data)
    token = create_token(user_id)
    
    return jsonify({'token': token}), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_model = User(db)
    
    user = user_model.get_by_email(data['email'])
    if not user or not user_model.check_password(data['password'], user['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = create_token(str(user['_id']))
    return jsonify({'token': token}), 200

def create_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')