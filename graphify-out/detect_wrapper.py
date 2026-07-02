import json, sys, os
os.chdir('D:/romeaiapp')
sys.path.insert(0, 'D:/romeaiapp')

from graphify.detect import detect
from pathlib import Path

result = detect(Path('D:/romeaiapp'))
out_path = Path('D:/romeaiapp/graphify-out/.graphify_detect.json')
out_path.write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')

# Print summary
files = result.get('files', {})
total = result.get('total_files', 0)
words = result.get('total_words', 0)
print(f"Corpus: {total} files, ~{words:,} words")
for k in ['code', 'document', 'paper', 'image', 'video']:
    v = files.get(k, [])
    if v:
        exts = set()
        for f in v:
            ext = os.path.splitext(f)[1]
            if ext:
                exts.add(ext)
        ext_str = ' '.join(sorted(exts)) if exts else ''
        print(f"  {k}: {len(v)} files ({ext_str})")
skipped = result.get('skipped_sensitive', [])
if skipped:
    print(f"  skipped_sensitive: {len(skipped)} files")
