from pathlib import Path
import os,json,zipfile,hashlib
root=Path(__file__).resolve().parents[1]
out=root.parents[1]/'deliverables'/'LE_REPERE_PERMIS_iOS_1_6_0_REFONTE_PEDAGOGIQUE.zip'
ignore={'node_modules','.git','.expo','Pods','dist','dist-ios','build','__pycache__'}
files=[]
for base,dirs,names in os.walk(root):
 dirs[:]=sorted(d for d in dirs if d not in ignore)
 for name in sorted(names):
  p=Path(base)/name
  if p.is_symlink() or not p.is_file():continue
  if name.startswith('.env') and name!='.env.example':continue
  if name in {'credentials.json','.test-runtime.json','.learning-test-env.json'} or name.startswith('.auth-'):continue
  if p.suffix in {'.p8','.p12','.ipa','.mobileprovision','.log','.tsbuildinfo','.pyc'}:continue
  files.append(p)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files:z.write(p,Path(root.name)/p.relative_to(root))
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for needed in ['apps/mobile/src/screens/Pedagogy.tsx','apps/mobile/src/pedagogy/courses.ts','apps/mobile/src/screens/MapScreen.tsx','db/migrations/014-route-exam-centers.sql','docs/AUDIT_UI_UX_1_6_0.md','apps/mobile/ios/LeReperePermis/Info.plist']:
  assert f'{root.name}/{needed}' in z.namelist(),needed
 assert json.loads(z.read(f'{root.name}/package.json'))['version']=='1.6.0'
 for n in z.namelist():
  assert '/node_modules/' not in n and not n.endswith(('.p8','.p12','.ipa','.mobileprovision'))
print(json.dumps({'file':str(out),'files':len(files),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
