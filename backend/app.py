from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from config.config import Config
from routes.auth import auth
from routes.inventory import inventory

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Connect to MongoDB
client = MongoClient(Config.MONGODB_URI)
db = client.inventory_db

# Modified: Pass db to blueprints
app.register_blueprint(auth, url_prefix='/api', db=db)
app.register_blueprint(inventory, url_prefix='/inventory', db=db)

# Add a test route
@app.route('/')
def index():
    return jsonify({"message": "Server is running"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=3000)