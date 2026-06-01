import fitz  # PyMuPDF — for PDF files
from docx import Document  # for Word files

def extract_text(file_path: str, file_type: str) -> str:
    if file_type == 'pdf':
        doc = fitz.open(file_path)  # open the PDF
        text = ''
        for page in doc:  # loop every page
            text += page.get_text()  # extract text from that page
        return text
    elif file_type == 'docx':
        doc = Document(file_path)  # open the Word doc
        return '\n'.join(p.text for p in doc.paragraphs)
    return ''  # unsupported file type
