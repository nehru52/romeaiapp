"""
Full graphify pipeline for a single PDF input.
Runs entirely through graphify's Python API — no LLM subagents needed for 1 file.
"""
import json, sys, os
from pathlib import Path
from datetime import datetime, timezone

INPUT_DIR = Path('D:/romeaiapp/graphify-pdf/input')
OUTPUT_DIR = Path('D:/romeaiapp/graphify-pdf/graphify-out')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Step 1: Detect ──────────────────────────────────────────────────────────
print("=" * 60)
print("STEP 1: Detect files")
print("=" * 60)

from graphify.detect import detect
result = detect(INPUT_DIR)
detection = result

print(f"  Files detected: {detection['total_files']}")
for k, v in detection.get('files', {}).items():
    if v:
        print(f"    {k}: {len(v)}")

if detection['total_files'] == 0:
    print("ERROR: No supported files found.")
    sys.exit(1)

(OUTPUT_DIR / '.graphify_detect.json').write_text(
    json.dumps(detection, ensure_ascii=False), encoding='utf-8'
)

# ── Step 2: Extract (semantic — PDF needs LLM extraction) ──────────────────
print()
print("=" * 60)
print("STEP 2: Extract entities & relationships")
print("=" * 60)

# Check for Gemini key for semantic extraction
has_gemini = bool(os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY'))

from pathlib import Path as P

# For a single PDF, we use graphify's built-in extraction if available,
# otherwise we dispatch via the LLM subagent approach
# Try graphify's own extract first (works for all file types via LLM backend)
try:
    from graphify.extract import extract as graphify_extract
    # This is the AST-based extractor for code — won't work for PDF
    # Fall through to LLM-based extraction
    use_builtin = False
except ImportError:
    use_builtin = False

if has_gemini:
    print("  Using Gemini for semantic extraction...")
    from graphify.llm import extract_corpus_parallel
    files_list = [INPUT_DIR / f for f in detection.get('files', {}).get('paper', [])]
    extraction = extract_corpus_parallel(files_list, backend="gemini")
else:
    print("  No GEMINI_API_KEY — will use Claude subagent for extraction.")
    print("  For a single PDF, writing extraction prompt for subagent...")
    extraction = None

if extraction is None:
    # Write extraction data for subagent to process
    # For a PDF, graphify needs to read it via LLM vision/text extraction
    # We'll prepare the chunk file and prompt
    chunk_path = OUTPUT_DIR / '.graphify_chunk_01.json'

    # Write input metadata for the subagent
    papers = detection.get('files', {}).get('paper', [])
    uncached_path = OUTPUT_DIR / '.graphify_uncached.txt'
    uncached_path.write_text('\n'.join(papers), encoding='utf-8')

    # Write detection cache (empty — nothing cached yet)
    (OUTPUT_DIR / '.graphify_cached.json').write_text(
        json.dumps({'nodes': [], 'edges': [], 'hyperedges': []}, ensure_ascii=False),
        encoding='utf-8'
    )
    (OUTPUT_DIR / '.graphify_uncached.txt').write_text('\n'.join(papers), encoding='utf-8')

    print(f"  Papers to extract: {len(papers)}")
    print(f"  Written uncached list to {uncached_path}")
    print()
    print("NEEDS_SUBAGENT: PDF requires LLM-based semantic extraction")
    sys.exit(42)  # Special exit code — needs subagent

# Save extraction
(OUTPUT_DIR / '.graphify_extract.json').write_text(
    json.dumps(extraction, ensure_ascii=False, indent=2), encoding='utf-8'
)

print(f"  Extracted: {len(extraction.get('nodes', []))} nodes, {len(extraction.get('edges', []))} edges")

# ── Step 3: Build graph ────────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 3: Build graph")
print("=" * 60)

from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate as generate_report
from graphify.export import to_json as export_json

G = build_from_json(extraction, root=str(INPUT_DIR))
communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: f'Community {cid}' for cid in communities}
questions = suggest_questions(G, communities, labels)

report = generate_report(G, communities, cohesion, labels, gods, surprises, detection, tokens, '.', suggested_questions=questions)
(OUTPUT_DIR / 'GRAPH_REPORT.md').write_text(report, encoding='utf-8')
export_json(G, communities, str(OUTPUT_DIR / 'graph.json'))

analysis = {
    'communities': {str(k): v for k, v in communities.items()},
    'cohesion': {str(k): v for k, v in cohesion.items()},
    'gods': gods,
    'surprises': surprises,
    'questions': questions,
}
(OUTPUT_DIR / '.graphify_analysis.json').write_text(json.dumps(analysis, indent=2, ensure_ascii=False), encoding='utf-8')

print(f"  Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities")

# ── Step 4: Label communities ──────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 4: Label communities")
print("=" * 60)
print("  (Will be done by the orchestrator after reviewing node labels)")

# ── Step 5: Export HTML ────────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 5: Export")
print("=" * 60)

from graphify.export import html as export_html
export_html(G, communities, str(OUTPUT_DIR / 'graph.html'), labels)
print("  HTML exported to graph.html")

# ── Step 6: Cost tracker ───────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 6: Cost tracker")
print("=" * 60)

cost_path = OUTPUT_DIR / 'cost.json'
cost = {
    'runs': [{
        'date': datetime.now(timezone.utc).isoformat(),
        'input_tokens': extraction.get('input_tokens', 0),
        'output_tokens': extraction.get('output_tokens', 0),
        'files': detection['total_files'],
    }],
    'total_input_tokens': extraction.get('input_tokens', 0),
    'total_output_tokens': extraction.get('output_tokens', 0),
}
cost_path.write_text(json.dumps(cost, indent=2, ensure_ascii=False), encoding='utf-8')
print("  Cost saved")

print()
print("=" * 60)
print("DONE")
print("=" * 60)
print(f"Outputs in {OUTPUT_DIR}/")
