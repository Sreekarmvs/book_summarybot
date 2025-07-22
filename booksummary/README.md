# Book Summary AI

A Flask-based AI-powered book summary chatbot that provides comprehensive summaries of books using the Gemini API. The application supports two modes: book title lookup and content analysis.

## Features

- **Dual Summary Modes**:
  - Book Title Lookup: Generate summaries by entering just the book title
  - Content Analysis: Upload or paste book content for analysis
- **Multiple Summary Types**:
  - Comprehensive
  - Concise
  - Themes Focused
  - Character Analysis
- **File Support**:
  - PDF
  - EPUB
  - TXT
- **Modern UI**:
  - Clean, responsive design
  - Drag-and-drop file upload
  - Loading indicators
  - Error handling

## Prerequisites

- Python 3.8 or higher
- Gemini API key
- Virtual environment (recommended)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd booksummary
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

## Usage

1. Start the Flask application:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

3. Choose your preferred mode:
   - Enter a book title for quick summaries
   - Upload a file or paste content for detailed analysis

4. Select your desired summary type and click "Generate Summary"

## Project Structure

```
booksummary/
├── app.py              # Main Flask application
├── requirements.txt    # Project dependencies
├── static/
│   ├── css/
│   │   └── style.css  # Custom styles
│   └── js/
│       └── main.js    # Frontend functionality
├── templates/
│   └── index.html     # Main template
└── uploads/           # Temporary file storage
```

## API Integration

The application uses the Gemini API for generating summaries. The integration includes:

- Proper error handling
- Rate limit management
- Content chunking for large inputs
- Optimized prompts for different summary types

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Flask for the web framework
- Google Gemini for the AI capabilities
- Tailwind CSS for the UI components 