# 📚 Book Summary AI

An AI-powered web application built with **Flask** and **Gemini API** that generates detailed book summaries in seconds. Whether you have a book title or the full content, this app intelligently summarizes it and gives you key insights — all through a clean, responsive interface.

---

## 🚀 Features

- **🔍 Two Summary Modes**
  - **Book Title Lookup**: Just type the book name to fetch a smart summary.
  - **Content Analysis**: Upload a PDF/EPUB or paste content directly.

- **📄 File Support**
  - PDF (`.pdf`)
  - EPUB (`.epub`)
  - Plain Text (`.txt`)

- **📝 Summary Types**
  - Comprehensive
  - Concise
  - Theme-focused
  - Character Analysis

- **💡 Output Includes**
  - Elaborate Summary
  - Key Points
  - Key Insights
  - Areas of Improvement (for content mode)

- **🎨 Clean UI**
  - Drag & drop upload
  - Loading indicators
  - Proper error handling

---

## ⚙️ Tech Stack

- **Backend**: Python, Flask, Google Gemini API
- **Frontend**: HTML, CSS, JavaScript (with Tailwind)
- **Libraries**: `PyPDF2`, `ebooklib`, `Flask-Session`, `dotenv`

---

## 🛠 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/booksummary.git
cd booksummary
