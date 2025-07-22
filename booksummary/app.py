import os
from flask import Flask, render_template, request, jsonify, session
from werkzeug.utils import secure_filename
import google.generativeai as genai
from dotenv import load_dotenv
import PyPDF2
from ebooklib import epub
import io
import json
from datetime import datetime
import requests  # Add this import for API requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configure Gemini API
try:
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    genai.configure(api_key=api_key)
    
    # Use the latest Gemini Pro model
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    print(f"Using model: gemini-1.5-pro-latest")
        
except Exception as e:
    print(f"Error configuring Gemini API: {str(e)}")
    raise

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def extract_text_from_pdf(file):
    """Extract text from PDF file."""
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_epub(file):
    """Extract text from EPUB file."""
    book = epub.read_epub(file)
    text = ""
    for item in book.get_items():
        if item.get_type() == epub.ITEM_DOCUMENT:
            text += item.get_content().decode('utf-8')
    return text

def generate_summary_from_title(book_title, summary_type="comprehensive"):
    """Generate summary based on book title."""
    prompt = f"""
    Generate a comprehensive summary of the book "{book_title}" with the following structure:
    
    1. Elaborate Summary
    [Provide a detailed yet concise summary of the book, covering main plot points, themes, and character development. Keep it engaging and informative, under 500 words.]

    2. Key Points
    - [First key point]
    - [Second key point]
    - [Third key point]
    - [Fourth key point]
    - [Fifth key point]
    - [Sixth key point]
    - [Seventh key point]

    3. Key Insights
    - [First insight]
    - [Second insight]
    - [Third insight]
    - [Fourth insight]
    - [Fifth insight]

    Please maintain this exact formatting with section numbers and bullet points.
    Ensure each section starts with its number and title exactly as shown.
    Use bullet points (-) for all list items.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def generate_summary_from_content(content, summary_type="comprehensive"):
    """Generate summary based on book content."""
    prompt = f"""
    Analyze and summarize the following book content with the following structure:
    
    1. Elaborate Summary
    [Provide a detailed yet concise summary of the content, covering main points, themes, and key ideas. Keep it engaging and informative, under 500 words.]

    2. Key Points
    - [First key point]
    - [Second key point]
    - [Third key point]
    - [Fourth key point]
    - [Fifth key point]
    - [Sixth key point]
    - [Seventh key point]

    3. Key Insights
    - [First insight]
    - [Second insight]
    - [Third insight]
    - [Fourth insight]
    - [Fifth insight]

    4. Areas of Improvement
    - [First improvement area]
    - [Second improvement area]
    - [Third improvement area]
    - [Fourth improvement area]
    - [Fifth improvement area]

    Please maintain this exact formatting with section numbers and bullet points.
    Ensure each section starts with its number and title exactly as shown.
    Use bullet points (-) for all list items.

    Content:
    {content[:5000]}  # Limit content to first 5000 characters for better response
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def is_valid_book_title(book_title):
    """Check if the book title is valid using Google Books API."""
    try:
        api_url = f"https://www.googleapis.com/books/v1/volumes?q=intitle:{book_title}"
        response = requests.get(api_url)
        if response.status_code == 200:
            data = response.json()
            return data.get('totalItems', 0) > 0  # Check if any books are found
        return False
    except Exception as e:
        print(f"Error validating book title: {str(e)}")
        return False

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize():
    """Handle summary requests."""
    data = request.json
    mode = data.get('mode')
    summary_type = data.get('summary_type', 'comprehensive')
    
    if mode == 'title':
        book_title = data.get('book_title')
        if not book_title:
            return jsonify({'error': 'Book title is required'}), 400
        
        # Validate the book title
        if not is_valid_book_title(book_title):
            return jsonify({'error': 'The entered book title is not a valid or real book'}), 400
        
        summary = generate_summary_from_title(book_title, summary_type)
        return jsonify({'summary': summary})
    
    elif mode == 'content':
        content = data.get('content')
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        summary = generate_summary_from_content(content, summary_type)
        return jsonify({'summary': summary})
    
    return jsonify({'error': 'Invalid mode'}), 400

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file uploads."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    # Extract text based on file type
    if filename.lower().endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif filename.lower().endswith('.epub'):
        text = extract_text_from_epub(file_path)
    else:
        text = file.read().decode('utf-8')
    
    # Clean up the uploaded file
    os.remove(file_path)
    
    return jsonify({'content': text})

if __name__ == '__main__':
    app.run(debug=True)