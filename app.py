from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

class LibraryManagementSystem:
    def __init__(self, filename="library_data.json"):
        self.filename = os.path.join(os.path.dirname(__file__), filename)
        self.books = {}
        self.issued_books = {}
        self.load_data()
    
    def load_data(self):
        if os.path.exists(self.filename):
            with open(self.filename, 'r') as f:
                data = json.load(f)
                self.books = data.get("books", {})
                self.issued_books = data.get("issued_books", {})
    
    def save_data(self):
        with open(self.filename, 'w') as f:
            json.dump({"books": self.books, "issued_books": self.issued_books}, f, indent=2)
    
    def add_book(self, book_id, title, author):
        if book_id in self.books:
            return False, "Book ID already exists!"
        self.books[book_id] = {"title": title, "author": author, "available": True}
        self.save_data()
        return True, f"Book '{title}' added successfully!"
    
    def issue_book(self, book_id, member_name):
        if book_id not in self.books:
            return False, "Book ID not found!"
        if not self.books[book_id]["available"]:
            return False, "Book is not available!"
        self.books[book_id]["available"] = False
        self.issued_books[book_id] = {"member": member_name, "date": datetime.now().strftime("%Y-%m-%d")}
        self.save_data()
        return True, f"Book issued to {member_name}!"
    
    def return_book(self, book_id):
        if book_id not in self.books:
            return False, "Book ID not found!"
        if self.books[book_id]["available"]:
            return False, "Book is already available!"
        self.books[book_id]["available"] = True
        if book_id in self.issued_books:
            del self.issued_books[book_id]
        self.save_data()
        return True, "Book returned successfully!"
    
    def get_all_books(self):
        return self.books

    def search_book(self, title):
        return {bid: book for bid, book in self.books.items() if title.lower() in book['title'].lower()}

library = LibraryManagementSystem()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/books', methods=['GET'])
def get_books():
    query = request.args.get('q', '')
    if query:
        books = library.search_book(query)
    else:
        books = library.get_all_books()
    return jsonify(books)

@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.json
    success, msg = library.add_book(data.get('id'), data.get('title'), data.get('author'))
    return jsonify({"success": success, "message": msg})

@app.route('/api/issue', methods=['POST'])
def issue_book():
    data = request.json
    success, msg = library.issue_book(data.get('id'), data.get('member'))
    return jsonify({"success": success, "message": msg})

@app.route('/api/return', methods=['POST'])
def return_book():
    data = request.json
    success, msg = library.return_book(data.get('id'))
    return jsonify({"success": success, "message": msg})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
