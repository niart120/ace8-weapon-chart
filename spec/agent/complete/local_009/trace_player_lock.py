"""Trace player target filtering using validated native references."""
import json,re,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4];OUT=Path(__file__).resolve().parent
bootstrap=OUT/'inspect_target_flags.py';s={'__file__':str(bootstrap),'__name__':'player_lock'}
exec(compile(bootstrap.read_text(encoding='utf8').split('\nsetters={}')[0],str(bootstrap),'exec'),s)
p,w,code,render=s['p'],s['w'],s['code'],s['render']
methods={};refs=[]
for sec in p.pe.sections:
 if not sec.Characteristics & 0x20000000:continue
 lo=sec.PointerToRawData;hi=lo+sec.SizeOfRawData;data=p.exe[lo:hi];base=p.base+sec.VirtualAddress
 for m in re.finditer(b'\xe8',data):
  k=m.start()
  if k+5>len(data):continue
  a=base+k;target=a+5+struct.unpack_from('<i',data,k+1)[0]
  if target not in [0x147286eb0,0x14738e690,0x14738e2f0,0x147d13950]:continue
  fn=s['x']['function'](a)
  if not fn:continue
  c=code(p.base+fn[0])
  if not any(i.address==a and i.mnemonic=='call' for i in c):continue
  refs.append({'call':hex(a),'target':hex(target),'function':hex(c[0].address)})
  methods[hex(c[0].address)]=render(c)
 for m in re.finditer(re.escape(struct.pack('<I',0x117a)),data):
  a=base+m.start();fn=s['x']['function'](a)
  if not fn:continue
  c=code(p.base+fn[0])
  if any(any(o.type==p.capstone.x86.X86_OP_MEM and o.size==1 and o.mem.disp==0x117a and o.mem.base not in [p.capstone.x86.X86_REG_RIP,p.capstone.x86.X86_REG_RSP] for o in i.operands) for i in c):methods[hex(c[0].address)]=render(c)
for a in [0x147286eb0,0x147287040]:methods[hex(a)]=render(code(a))
native=json.loads((ROOT/'data/local/native-constructors.json').read_text())
for name in ['LiveAIPodargeWing','LiveAIGameObject']:
 v=int(native[name]['vtable'],16)
 for off in [0xa90,0xa98,0xae8]:
  a=struct.unpack_from('<Q',p.exe,p.pe.get_offset_from_rva(v+off-p.base))[0]
  methods[name+hex(off)+' '+hex(a)]=render(code(a))
for addr in [0x1472843e0,0x1472855c0]:methods[hex(addr)]=render(code(addr))
for sec in p.pe.sections:
 if not sec.Characteristics & 0x20000000:continue
 lo=sec.PointerToRawData;data=p.exe[lo:lo+sec.SizeOfRawData];base=p.base+sec.VirtualAddress
 for m in re.finditer(re.escape(struct.pack('<I',0x128)),data):
  a=base+m.start()
  if not 0x147380000<a<0x1473b0000:continue
  fn=s['x']['function'](a)
  if fn:
   c=code(p.base+fn[0]);methods[hex(c[0].address)]=render(c)
registration_slots={}
for name in ['LiveGameObject','LiveAIGameObject','LiveAIPodargeWing']:
 v=int(native[name]['vtable'],16)
 registration_slots[name]=[hex(off) for off in range(0x200,0xd00,8) if struct.unpack_from('<Q',p.exe,p.pe.get_offset_from_rva(v+off-p.base))[0]==0x147d13950]
methods['registration_slots']=registration_slots
(OUT/'PLAYER_LOCK_NATIVE.json').write_text(json.dumps({'references':refs,'methods':methods},indent=2)+'\n',encoding='utf8')
print(refs)
for a,c in methods.items():print(a,len(c))

