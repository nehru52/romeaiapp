import json
from graphify.detect import detect
from pathlib import Path

result = detect(Path('D:/romeaiapp'))
Path('D:/romeaiapp/graphify-out/.graphify_detect.json').write_text(
    json.dumps(result, ensure_ascii=False), encoding='utf-8'
)
print("OK")
