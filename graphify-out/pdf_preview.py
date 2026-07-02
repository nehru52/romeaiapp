import sys
try:
    import PyPDF2
    reader = PyPDF2.PdfReader(r'D:\romeaiapp\Rome_Travel_Agency_AI_Automation_Blueprint.pdf')
    print(f"Pages: {len(reader.pages)}")
    print(f"Metadata: {reader.metadata}")
    print()
    for i, page in enumerate(reader.pages[:5]):
        text = page.extract_text()
        if text:
            print(f"--- Page {i+1} ---")
            print(text[:800])
            print()
except ImportError:
    print("PyPDF2 not installed, trying pdfplumber...")
    try:
        import pdfplumber
        with pdfplumber.open(r'D:\romeaiapp\Rome_Travel_Agency_AI_Automation_Blueprint.pdf') as pdf:
            print(f"Pages: {len(pdf.pages)}")
            for i, page in enumerate(pdf.pages[:5]):
                text = page.extract_text()
                if text:
                    print(f"--- Page {i+1} ---")
                    print(text[:800])
                    print()
    except ImportError:
        print("No PDF library available. Install with: pip install PyPDF2")
