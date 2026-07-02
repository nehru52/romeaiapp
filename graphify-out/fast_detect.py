"""Fast file detection without word counting - classifies files by extension and walks the tree."""
import json, os, sys
from pathlib import Path

# Paths to scan
scan_roots = [Path(p).resolve() for p in sys.argv[1:]]
if not scan_roots:
    scan_roots = [Path('D:/romeaiapp').resolve()]

output_dir = Path('D:/romeaiapp/graphify-out')

# Noise directories to prune
noise_dirs = {
    'node_modules', '.git', 'dist', '.turbo', '.next', '.nuxt',
    '__pycache__', '.cache', 'vendor', 'bin', 'obj', 'wwwroot',
    'generated', '.venv', 'venv', '.gradle', '.maven',
    '.idea', '.vscode', '.vs',
}

# File type mappings
CODE_EXTS = {'.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java',
             '.c', '.cpp', '.h', '.hpp', '.cs', '.rb', '.php', '.swift',
             '.kt', '.kts', '.scala', '.mjs', '.cjs', '.cts', '.mts',
             '.sol', '.sh', '.bash', '.ps1', '.bat', '.cmd', '.lua',
             '.dart', '.vim', '.el', '.clj', '.ex', '.exs', '.erl'}

DOC_EXTS = {'.md', '.mdwn', '.txt', '.rst', '.adoc', '.org', '.wiki'}
PAPER_EXTS = {'.pdf'}
IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
              '.bmp', '.tiff', '.avif', '.heic', '.heif'}
VIDEO_EXTS = {'.mp4', '.mkv', '.avi', '.mov', '.webm', '.mp3', '.wav',
              '.flac', '.ogg', '.m4a', '.opus'}

# Binary/source formats that look like text but aren't code/docs
SKIP_EXTS = {'.json', '.jsonl', '.yaml', '.yml', '.toml', '.ini', '.cfg',
             '.lock', '.po', '.pot', '.stl', '.step', '.obj', '.sql',
             '.wasm', '.ttf', '.otf', '.woff', '.woff2', '.eot',
             '.pyc', '.pyo', '.so', '.dll', '.dylib', '.o', '.a',
             '.zip', '.tar', '.gz', '.bz2', '.xz', '.7z', '.rar',
             '.exe', '.dmg', '.pkg', '.deb', '.rpm', '.msi'}

SKIP_FILES = {'package-lock.json', 'bun.lock', 'bun.lockb', 'yarn.lock',
              'pnpm-lock.gradle', '.DS_Store', 'Thumbs.db'}

files = {
    'code': [],
    'document': [],
    'paper': [],
    'image': [],
    'video': [],
}

# Track which root each file belongs to for relativization
primary_root = scan_roots[0]

for root in scan_roots:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames
                       if d not in noise_dirs and not d.startswith('.')]
        dp = Path(dirpath)
        for fname in filenames:
            if fname in SKIP_FILES:
                continue
            p = dp / fname
            ext = p.suffix.lower()
            if ext in SKIP_EXTS or ext == '':
                continue
            try:
                rel = str(p.relative_to(primary_root))
            except ValueError:
                rel = str(p)
            if ext in CODE_EXTS:
                files['code'].append(rel)
            elif ext in DOC_EXTS:
                files['document'].append(rel)
            elif ext in PAPER_EXTS:
                files['paper'].append(rel)
            elif ext in IMAGE_EXTS:
                files['image'].append(rel)
            elif ext in VIDEO_EXTS:
                files['video'].append(rel)

total_files = sum(len(v) for v in files.values())
result = {
    'scan_root': str(primary_root),
    'total_files': total_files,
    'total_words': 0,
    'files': files,
    'skipped_sensitive': [],
}

output_dir.mkdir(parents=True, exist_ok=True)
(output_dir / '.graphify_detect.json').write_text(
    json.dumps(result, ensure_ascii=False), encoding='utf-8'
)

print(f"Corpus: {total_files} files")
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
