"""Extract text from PDF and save as markdown for graphify to process."""
import subprocess, sys
from pathlib import Path

# Try installing PyPDF2 first
try:
    import PyPDF2
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'PyPDF2', '-q'])
    import PyPDF2

pdf_path = r'D:\romeaiapp\Rome_Travel_Agency_AI_Automation_Blueprint.pdf'
out_path = r'D:\romeaiapp\graphify-pdf\input\Rome_Travel_Agency_AI_Automation_Blueprint.md'

reader = PyPDF2.PdfReader(pdf_path)
lines = []
lines.append("# Rome Travel Agency AI Automation Blueprint\n")
lines.append(f"Source: {pdf_path}\n")
lines.append(f"Pages: {len(reader.pages)}\n\n---\n")

for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text:
        lines.append(f"\n## Page {i+1}\n\n")
        lines.append(text)
        lines.append("\n")

content = "".join(lines)
Path(out_path).write_text(content, encoding='utf-8')
print(f"Extracted {len(content)} chars to {out_path}")
print(f"Pages: {len(reader.pages)}")
