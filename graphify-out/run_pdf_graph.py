"""Full graphify pipeline for the Rome Travel Agency PDF."""
import json, sys, os
from pathlib import Path
from datetime import datetime, timezone

INPUT_DIR = Path('D:/romeaiapp/graphify-pdf/input')
OUTPUT_DIR = Path('D:/romeaiapp/graphify-pdf/graphify-out')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Detect ──────────────────────────────────────────────────────────────────
print("STEP 1: Detect")
from graphify.detect import detect
detection = detect(INPUT_DIR)
print(f"  {detection['total_files']} files")
for k, v in detection.get('files', {}).items():
    if v:
        print(f"    {k}: {len(v)}")

if detection['total_files'] == 0:
    print("ERROR: No files found"); sys.exit(1)

(OUTPUT_DIR / '.graphify_detect.json').write_text(
    json.dumps(detection, ensure_ascii=False), encoding='utf-8'
)

# ── Extract ─────────────────────────────────────────────────────────────────
print("\nSTEP 2: Extract")
# Check for Gemini
has_gemini = bool(os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY'))

# Get paper files
all_papers = []
for f in detection.get('files', {}).get('paper', []):
    all_papers.append(INPUT_DIR / f)

print(f"  Papers: {len(all_papers)}")
print(f"  Gemini available: {has_gemini}")

if has_gemini:
    from graphify.llm import extract_corpus_parallel
    extraction = extract_corpus_parallel(all_papers, backend="gemini")
else:
    # No Gemini — we need to prepare for subagent extraction
    # Write the uncached list
    uncached = [str(p.relative_to(INPUT_DIR)) for p in all_papers]
    (OUTPUT_DIR / '.graphify_uncached.txt').write_text('\n'.join(uncached), encoding='utf-8')
    (OUTPUT_DIR / '.graphify_cached.json').write_text(
        json.dumps({'nodes': [], 'edges': [], 'hyperedges': []}, ensure_ascii=False), encoding='utf-8'
    )
    # Write empty semantic file — subagent will fill the chunk
    (OUTPUT_DIR / '.graphify_semantic.json').write_text(
        json.dumps({'nodes': [], 'edges': [], 'hyperedges': [], 'input_tokens': 0, 'output_tokens': 0}, ensure_ascii=False), encoding='utf-8'
    )
    print("  No Gemini — extraction needs LLM subagent")
    print("  Prepared uncached list for subagent dispatch")
    # Write a marker
    (OUTPUT_DIR / '.needs_subagent').write_text('1', encoding='utf-8')
    sys.exit(42)

(OUTPUT_DIR / '.graphify_extract.json').write_text(
    json.dumps(extraction, ensure_ascii=False, indent=2), encoding='utf-8'
)
print(f"  Extracted: {len(extraction.get('nodes',[]))} nodes, {len(extraction.get('edges',[]))} edges")
