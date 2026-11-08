"""Resolve selected state virtual methods and wing damage methods, read-only."""
import json,struct,functools
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4];OUT=Path(__file__).resolve().parent
bootstrap=OUT/'inspect_target_flags.py';s={'__file__':str(bootstrap),'__name__':'trace_core_wings'}
exec(compile(bootstrap.read_text(encoding='utf8').split('\nsetters={}')[0],str(bootstrap),'exec'),s)
p,w,code,render=s['p'],s['w'],s['code'],s['render']
helper=(ROOT/'docs/analysis/calculation/collect_npc_evidence.py').read_text(encoding='utf8')
exec(helper[helper.index('def instructions('):helper.index('\nnative={}')])
def ptr(a):return struct.unpack_from('<Q',p.exe,p.pe.get_offset_from_rva(a-p.base))[0]
def vt(name):
    ctor=constructor(name);c=code(ctor);last=None
    for _ in range(5):
        jump=next((i for i in c if i.mnemonic in ['jne','jmp'] and i.operands[0].type==p.capstone.x86.X86_OP_IMM),None) if len(c)<=5 else None
        if not jump:break
        ctor=jump.operands[0].imm;c=code(ctor)
    for i in c:
        if i.mnemonic=='lea' and i.op_str.startswith('rax, [rip'):last=i.address+i.size+i.operands[1].mem.disp
        if i.mnemonic=='mov' and i.op_str in ['qword ptr [rdi], rax','qword ptr [rbx], rax','qword ptr [rsi], rax','qword ptr [rcx], rax'] and last:return ctor,last
    raise ValueError(name)
methods={};classes={}
for name in ['LiveInducedExplosionSystemPodargeWing','LiveInducedExplosionSystemPodargeBase','LiveUniqueStateMachine_StateCommonDead']:
 try:
  ctor,v=vt(name);parent=w.get_parent(name);pc,pv=vt(parent)
  slots={}
  for off in range(0x180,0x300 if name.startswith("LiveUnique") else 0x360,8):
   a=ptr(v+off)
   if a==ptr(pv+off):continue
   if not p.base<a<p.base+0x20000000:continue
   slots[hex(off)]=hex(a);methods[hex(a)]=render(code(a))
  classes[name]={'parent':parent,'constructor':hex(ctor),'vtable':hex(v),'slots':slots,'properties':w.classes[name]['properties']}
  methods[hex(ctor)]=render(code(ctor))
 except Exception as ex:
  classes[name]={'error':str(ex)}
  for n in [name,w.get_parent(name)]:
   if n not in w.classes:continue
   addr=constructor(n)
   if addr:methods[n+' '+hex(addr)]=render(code(addr))
for a in [0x147c28dc0,0x147c20120,0x147cd8890,0x147e38290,0x147c1ffa0,0x147c20250,0x15c68ef20,0x14738e690,0x147c7e6b0,0x147d0bd90,0x147d177b0,0x147e37d70,0x147e35f90]:methods[hex(a)]=render(code(a))
native=json.loads((ROOT/'data/local/native-constructors.json').read_text(encoding='utf8'))
for name in ['LiveGameObject','LiveAIGameObject','LiveAIUniquetTargetObject']:
 v=int(native[name]['vtable'],16)
 for off in [0x8e0,0x8e8]:
  a=ptr(v+off);methods[name+hex(off)+' '+hex(a)]=render(code(a))
import re
for off in [0xec0,0x11b2]:
 for sec in p.pe.sections:
  if not sec.Characteristics & 0x20000000:continue
  lo=sec.PointerToRawData;hi=lo+sec.SizeOfRawData
  for m in re.finditer(re.escape(struct.pack('<I',off)),p.exe[lo:hi]):
   a=p.base+p.pe.get_rva_from_offset(lo+m.start());fn=s['x']['function'](a)
   if not fn:continue
   addr=p.base+fn[0]
   if not (0x147000000<addr<0x148000000 or addr>0x150000000):continue
   c=code(addr)
   if any(any(o.type==p.capstone.x86.X86_OP_MEM and o.mem.base not in [p.capstone.x86.X86_REG_RIP,p.capstone.x86.X86_REG_RSP] and o.mem.disp==off for o in i.operands) for i in c):methods[hex(addr)]=render(c)
(OUT/'INDUCED_LOCK_NATIVE.json').write_text(json.dumps({'classes':classes,'methods':methods},indent=2)+'\n',encoding='utf8')
for n,r in classes.items():print(n,{k:v for k,v in r.items() if k!='properties'})
for a,c in methods.items():print(a,len(c))

