import sys,zipfile,plistlib,struct,json,subprocess
from pathlib import PurePosixPath
p=sys.argv[1]
def macho_commands(data):
 magic=data[:4]
 if magic==b'\xca\xfe\xba\xbe':
  n=struct.unpack_from('>I',data,4)[0]
  for i in range(n):
   cpu,sub,off,size,align=struct.unpack_from('>IIIII',data,8+20*i)
   if cpu==0x100000c:return macho_commands(data[off:off+size])
  return None,[]
 if magic not in [b'\xcf\xfa\xed\xfe',b'\xce\xfa\xed\xfe']:return None,[]
 n=struct.unpack_from('<I',data,16)[0];off=32 if magic==b'\xcf\xfa\xed\xfe' else 28;commands=[]
 for _ in range(n):
  cmd,size=struct.unpack_from('<II',data,off);commands.append((cmd,data[off:off+size]));off+=size
 return data,commands
with zipfile.ZipFile(p) as z:
 names=set(z.namelist());infos=[n for n in names if n.startswith('Payload/') and n.count('/')==2 and n.endswith('.app/Info.plist')]
 assert len(infos)==1,infos
 info=plistlib.loads(z.read(infos[0]));base=infos[0][:-len('Info.plist')]
 assert info['CFBundleIdentifier']=='fr.lerepere.spot'
 assert info['CFBundleShortVersionString']=='1.5.2'
 meta=info['MWDAT'];assert str(meta['MetaAppID'])=='925152177347941'
 token=str(meta['ClientToken']);assert len(token)>10 and '$(' not in token
 assert meta['TeamID']=='LK3VLK532C'
 assert meta['AppLinkURLScheme'].endswith('/meta/callback')
 exe=base+info['CFBundleExecutable']
 for name in ['MWDATCore','MWDATCamera','LiveKit','LiveKitWebRTC']:
  assert base+'Frameworks/'+name+'.framework/'+name in names,'Framework missing: '+name
 binaries=[exe]
 for n in names:
  if n.startswith(base+'Frameworks/') and '.framework/' in n:
   framework=n.split('.framework/')[0].split('/')[-1]
   if n.endswith('.framework/'+framework):binaries.append(n)
 deps=0;actual_entitlements=None
 for n in binaries:
  data,commands=macho_commands(z.read(n));assert data is not None,n
  for cmd,blob in commands:
   if cmd in [0xc,0x80000018,0x8000001f,0x80000023]:
    offset=struct.unpack_from('<I',blob,8)[0];dep=blob[offset:].split(b'\0')[0].decode()
    if dep.startswith('@rpath/') and not dep.startswith('@rpath/libswift'):
     deps+=1
     suffix=dep[len('@rpath/'):]
     assert any(x.endswith('/'+suffix) for x in names),'Missing runtime dependency: '+dep+' used by '+n
   if n==exe and cmd==0x1d:
    off,size=struct.unpack_from('<II',blob,8);sig=data[off:off+size]
    magic,length,count=struct.unpack_from('>III',sig)
    if magic==0xfade0cc0:
     for i in range(count):
      slot,boff=struct.unpack_from('>II',sig,12+8*i)
      if slot==5:
       bmagic,blen=struct.unpack_from('>II',sig,boff)
       actual_entitlements=plistlib.loads(sig[boff+8:boff+blen])
 assert actual_entitlements is not None,'Signed entitlements absent'
 assert actual_entitlements['com.apple.developer.networking.HotspotConfiguration'] is True
 assert 'applinks:br-fragrant-lake-b9utxdv6-spotapi.compute.c-7.eu-central-1.aws.neon.tech' in actual_entitlements['com.apple.developer.associated-domains']
 profile=plistlib.loads(subprocess.run(['openssl','cms','-verify','-inform','DER','-noverify'],input=z.read(base+'embedded.mobileprovision'),capture_output=True,check=True).stdout)
 assert profile['Entitlements']['application-identifier']=='LK3VLK532C.fr.lerepere.spot'
 assert profile['Entitlements']['com.apple.developer.networking.HotspotConfiguration'] is True
 assert actual_entitlements.get('get-task-allow', False) is False
 result={'version':info['CFBundleShortVersionString'],'build':info['CFBundleVersion'],'bundle':info['CFBundleIdentifier'],'metaSettingsPresent':True,'frameworks':len(binaries)-1,'runtimeDependenciesVerified':deps,'signedCapabilitiesVerified':True,'distributionProfileVerified':True}
 print(json.dumps(result,ensure_ascii=False))
