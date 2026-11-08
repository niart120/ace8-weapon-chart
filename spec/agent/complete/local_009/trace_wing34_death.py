"""Read-only follow-up of Podarge wings and SubCat damage/death paths."""
import json,struct,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4];OUT=Path(__file__).resolve().parent
bootstrap=OUT/'inspect_target_flags.py';s={'__file__':str(bootstrap),'__name__':'wing34'}
exec(compile(bootstrap.read_text(encoding='utf8').split('\nsetters={}')[0],str(bootstrap),'exec'),s)
p,w,code,render=s['p'],s['w'],s['code'],s['render'];b=s['scope']['b']
native=json.loads((ROOT/'data/local/native-constructors.json').read_text(encoding='utf8'))
def ptr(a):return struct.unpack_from('<Q',p.exe,p.pe.get_offset_from_rva(a-p.base))[0]
methods={};slots={}
v=int(native['LiveAIPodargeWing']['vtable'],16);parent=int(native['LiveAIGameObject']['vtable'],16)
for off in range(0x800,0xd00,8):
 a=ptr(v+off)
 if a==ptr(parent+off):continue
 if not p.base<a<p.base+0x20000000:continue
 slots[hex(off)]=hex(a);methods[hex(a)]=render(code(a))
for a in [0x147cda4f0,0x147d1b070,0x147cd70f0,0x147cd9ce0,0x147cd9620,0x147d10820,0x147c7cf40]:methods[hex(a)]=render(code(a))
for name in ['LiveGameObject','LiveAIGameObject','LiveAIUniqueObjectBase','LiveAIUniquetTargetObject']:
 vbase=int(native[name]['vtable'],16)
 for off in [0x9c0,0x9c8,0xa20,0xa70,0xa78,0x8d0]:
  a=ptr(vbase+off);methods[hex(a)]=render(code(a));slots[name+hex(off)]=hex(a)
props={}
for name in ['LiveGameObject','LiveAIGameObject','LiveAIPodargeWing']:
 props[name]=[z for z in w.classes[name]['properties'] if re.search('parent|child|lock|fcs|destroy|damage',z['name'],re.I)]
(OUT/'WING34_DEATH_NATIVE.json').write_text(json.dumps({'slots':slots,'properties':props,'methods':methods},indent=2)+'\n',encoding='utf8')
print(slots)
for a,c in methods.items():print(a,len(c))
