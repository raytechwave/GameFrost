"""Package public source/output only; exclude credentials, dependencies and QA state."""
import hashlib,json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'outputs/releases';OUT.mkdir(parents=True,exist_ok=True)
SOURCE=OUT/'GAME-FROST-Source-Review.zip';DROP=OUT/'GAME-FROST-Netlify-Drop-Review.zip';PREVIEW=OUT/'GAME-FROST-Preview-Evidence.zip'
skip={'.git','node_modules','.wrangler','.sites-runtime','.vinext','.next','dist','outputs','deliverables','.agents','.codex'}
with zipfile.ZipFile(SOURCE,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
 for file in sorted(ROOT.rglob('*')):
  relative=file.relative_to(ROOT)
  if not file.is_file() or any(part in skip for part in relative.parts):continue
  if file.name in {'tsconfig.tsbuildinfo','.DS_Store'} or file.suffix in {'.log','.pem'}:continue
  if file.name.startswith('.env') and file.name!='.env.example':continue
  if relative.as_posix()=='public/store-content.json':continue
  archive.write(file,'GAME-FROST/'+relative.as_posix())
with zipfile.ZipFile(DROP,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
 for file in sorted((ROOT/'netlify-dist').rglob('*')):
  if file.is_file() and '.vite' not in file.parts:archive.write(file,file.relative_to(ROOT/'netlify-dist').as_posix())
with zipfile.ZipFile(PREVIEW,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
 for file in sorted((ROOT/'outputs/preview').iterdir()):
  if file.is_file() and file.suffix in {'.mp4','.jpg','.png','.html'} and file.name not in {'poster-source.png','wolverine-stage.png','reviews-overflow-before.png','text-resize-before.png','hosted-product-inspection.png','mobile-recording-frames.jpg','combined-desktop-review.mp4','combined-mobile-review.mp4'}:archive.write(file,file.name)
 for name in ['QA-REPORT.md','ADMIN-GUIDE-CURRENT.md','completion-audit.md','SCENE-RECOVERY.md','scroll-showroom-verification.json','corrective-route-verification.json','upload-inventory.json','motion-envelope-verification.json','corrective-package-verification.json','vector-motion-verification.json','five-scene-preview.json','2D-ASSET-RESEARCH.md','asset-manifest.json','final-performance.json','build-revision.json']:archive.write(ROOT/'docs'/name,name)
result=[]
for file in [SOURCE,DROP,PREVIEW]:
 with zipfile.ZipFile(file) as archive:assert archive.testzip() is None
 result.append({'file':file.name,'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
(OUT/'SHA256SUMS.txt').write_text('\n'.join(item['sha256']+'  '+item['file'] for item in result)+'\n')
print(json.dumps(result,indent=2))
