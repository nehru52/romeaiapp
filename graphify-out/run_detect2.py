import json, sys, os
from pathlib import Path
from graphify.detect import detect
import threading

# Set a timeout
result = [None]
error = [None]

def do_detect():
    try:
        result[0] = detect(Path('D:/romeaiapp'))
    except Exception as e:
        error[0] = str(e)

t = threading.Thread(target=do_detect)
t.daemon = True
t.start()
t.join(timeout=300)  # 5 minute timeout

if t.is_alive():
    print("TIMEOUT: detect took more than 5 minutes", file=sys.stderr)
    sys.exit(1)

if error[0]:
    print(f"ERROR: {error[0]}", file=sys.stderr)
    sys.exit(1)

r = result[0]
Path('D:/romeaiapp/graphify-out/.graphify_detect.json').write_text(
    json.dumps(r, ensure_ascii=False), encoding='utf-8'
)

files = r.get('files', {})
total = r.get('total_files', 0)
words = r.get('total_words', 0)
print(f"Corpus: {total} files, ~{words:,} words")
for k in ['code', 'document', 'paper', 'image', 'video']:
    v = files.get(k, [])
    if v:
        exts = set(os.path.splitext(f)[1] for f in v if os.path.splitext(f)[1])
        ext_str = ' '.join(sorted(exts)) if exts else ''
        print(f"  {k}: {len(v)} files ({ext_str})")
skipped = r.get('skipped_sensitive', [])
if skipped:
    print(f"  skipped_sensitive: {len(skipped)} files")
