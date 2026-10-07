"""Offline texture-only GLB derivative; requires Pillow, never changes the rig."""
import io, json, struct, gzip, sys
from pathlib import Path
from PIL import Image

source, destination = map(Path, sys.argv[1:3])
data = source.read_bytes()
json_size, _ = struct.unpack_from('<II', data, 12)
doc = json.loads(data[20:20 + json_size])
binary_size, _ = struct.unpack_from('<II', data, 20 + json_size)
binary = data[28 + json_size:28 + json_size + binary_size]
images = {image['bufferView']: image for image in doc['images']}
out, report = bytearray(), []
for index, view in enumerate(doc['bufferViews']):
    content = binary[view.get('byteOffset', 0):view.get('byteOffset', 0) + view['byteLength']]
    if index in images:
        image = Image.open(io.BytesIO(content))
        original_size = image.size
        image.thumbnail((1536, 1536), Image.Resampling.LANCZOS)
        encoded = io.BytesIO()
        image.save(encoded, format='WEBP', quality=92, method=6)
        content = encoded.getvalue()
        images[index]['mimeType'] = 'image/webp'
        report.append({'originalDimensions': original_size, 'deliveryDimensions': image.size,
                       'originalBytes': view['byteLength'], 'deliveryBytes': len(content)})
    while len(out) % 4: out.append(0)
    view['byteOffset'], view['byteLength'] = len(out), len(content)
    out.extend(content)
for texture in doc['textures']:
    texture.setdefault('extensions', {})['EXT_texture_webp'] = {'source': texture.pop('source')}
for key in ['extensionsUsed', 'extensionsRequired']:
    doc[key] = list(dict.fromkeys(doc.get(key, []) + ['EXT_texture_webp']))
doc['buffers'][0]['byteLength'] = len(out)
while len(out) % 4: out.append(0)
encoded = json.dumps(doc, separators=(',', ':')).encode()
while len(encoded) % 4: encoded += b' '
result = (struct.pack('<III', 0x46546c67, 2, 28 + len(encoded) + len(out)) +
          struct.pack('<II', len(encoded), 0x4e4f534a) + encoded +
          struct.pack('<II', len(out), 0x004e4942) + out)
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_bytes(result)
report = {'originalBytes': len(data), 'deliveryBytes': len(result), 'deliveryGzipBytes': len(gzip.compress(result)),
          'method': 'EXT_texture_webp, quality 92, at most 1536 px; geometry, skins, hierarchy and animation unchanged',
          'textures': report}
print(json.dumps(report, indent=2))
