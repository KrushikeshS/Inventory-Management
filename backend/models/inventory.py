from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

class Inventory:
    def __init__(self, db):
        self.collection = db.inventory

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        result = self.collection.insert_one(data)
        return str(result.inserted_id)

    def get_all(self):
        items = list(self.collection.find())
        # Convert ObjectId to string
        for item in items:
            item['_id'] = str(item['_id'])
        return items

    def get_filtered(self, query=None):
        if query is None:
            query = {}
        items = list(self.collection.find(query))
        # Convert ObjectId to string
        for item in items:
            item['_id'] = str(item['_id'])
        return items

    def get_by_id(self, id):
        try:
            item = self.collection.find_one({'_id': ObjectId(id)})
            if item:
                item['_id'] = str(item['_id'])
            return item
        except InvalidId:
            return None

    def update(self, id, data):
        data['updated_at'] = datetime.utcnow()
        result = self.collection.update_one(
            {'_id': ObjectId(id)},
            {'$set': data}
        )
        return result.modified_count > 0

    def delete(self, id):
        try:
            if not ObjectId.is_valid(id):
                return False
            result = self.collection.delete_one({'_id': ObjectId(id)})
            return result.deleted_count > 0
        except InvalidId:
            return False