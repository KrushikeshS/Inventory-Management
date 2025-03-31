from flask import Blueprint, request, jsonify
from bson import ObjectId, json_util
import json
from models.inventory import Inventory
from middleware.auth_middleware import token_required

inventory = Blueprint('inventory', __name__)
db = None

@inventory.record
def record_params(setup_state):
    global db
    db = setup_state.options.get('db')

@inventory.route('/add', methods=['POST'])
@token_required
def add_item(current_user_id):
    data = request.get_json()
    inventory_model = Inventory(db)
    item_id = inventory_model.create(data)
    return jsonify({'message': 'Item added successfully', 'id': item_id}), 201

@inventory.route('/get/all', methods=['GET'])
@token_required
def get_all_items(current_user_id):
    inventory_model = Inventory(db)
    
    # Get query parameters
    search = request.args.get('search', '')
    severity = request.args.get('severity')
    stage = request.args.get('stage')
    applicationType = request.args.get('applicationType')
    deployment = request.args.get('deployment')

    # Build filter query
    query = {}
    if search:
        query['applicationName'] = {'$regex': search, '$options': 'i'}
    if severity:
        query['severity'] = severity
    if stage:
        query['stage'] = stage
    if applicationType:
        query['applicationType'] = applicationType
    if deployment:
        query['deployment'] = deployment

    items = inventory_model.get_filtered(query)
    return json.loads(json_util.dumps({'data': items})), 200

@inventory.route('/getById/<id>', methods=['GET'])
@token_required
def get_item(current_user_id, id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({'message': 'Invalid ID format'}), 400
            
        inventory_model = Inventory(db)
        item = inventory_model.get_by_id(id)
        if not item:
            return jsonify({'message': 'Item not found'}), 404
        return json.loads(json_util.dumps({'data': item})), 200
    except Exception as e:
        print("Error getting item:", str(e))  # For debugging
        return jsonify({'message': 'Error fetching item'}), 500

@inventory.route('/update/<id>', methods=['PUT'])
@token_required
def update_item(current_user_id, id):
    try:
        data = request.get_json()
        # Remove _id if it exists in the data
        if '_id' in data:
            del data['_id']
        
        inventory_model = Inventory(db)
        if inventory_model.update(id, data):
            return jsonify({'message': 'Item updated successfully'}), 200
        return jsonify({'message': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@inventory.route('/delete/<id>', methods=['DELETE'])
@token_required
def delete_item(current_user_id, id):
    try:
        inventory_model = Inventory(db)
        # Validate ObjectId
        if not ObjectId.is_valid(id):
            return jsonify({'message': 'Invalid ID format'}), 400
            
        if inventory_model.delete(id):
            return jsonify({'message': 'Item deleted successfully'}), 200
        return jsonify({'message': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'message': str(e)}), 500