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
    for i in c:
        if i.mnemonic=='lea' and i.op_str.startswith('rax, [rip'):last=i.address+i.size+i.operands[1].mem.disp
        if i.mnemonic=='mov' and i.op_str in ['qword ptr [rdi], rax','qword ptr [rbx], rax','qword ptr [rsi], rax'] and last:return ctor,last
    raise ValueError(name)
methods={};states={}
for name in ['LiveUniqueStateMachine_StateCoreDead','LiveUniqueStateMachine_StateDefault']:
    parent=w.get_parent(name);ctor,v=vt(name);pc,pv=vt(parent)
    slots={}
    for off in range(0x180,0x300,8):
        a=ptr(v+off)
        if a==ptr(pv+off):continue
        if not (p.base<a<p.base+0x20000000):continue
        c=code(a)
        if c:methods[hex(a)]=render(c);slots[hex(off)]=hex(a)
    states[name]={'parent':parent,'constructor':hex(ctor),'vtable':hex(v),'slots':slots}
native=json.loads((ROOT/'data/local/native-constructors.json').read_text(encoding='utf8'))
wings={}
for name in ['LiveAILadonWing','LiveAIPodargeWing','LiveAIUniquetTargetObject','LiveAIGameObject']:
    v=int(native[name]['vtable'],16);slots={}
    for off in [0x938,0x970,0xa38,0xa40,0x8b8,0x8c0]:
        a=ptr(v+off);methods[hex(a)]=render(code(a));slots[hex(off)]=hex(a)
    wings[name]=slots
for a in [0x147d14770,0x147d0fde0]:methods[hex(a)]=render(code(a))
import re
sec=p.pe.sections[0];lo=sec.PointerToRawData;hi=lo+sec.SizeOfRawData
for m in re.finditer(re.escape(struct.pack('<I',0xcbc)),p.exe[lo:hi]):
    a=p.base+p.pe.get_rva_from_offset(lo+m.start());fn=s['x']['function'](a)
    if not fn:continue
    addr=p.base+fn[0];c=code(addr)
    if any(any(o.type==p.capstone.x86.X86_OP_MEM and o.size==4 and o.mem.base not in [p.capstone.x86.X86_REG_RIP,p.capstone.x86.X86_REG_RSP] and o.mem.disp==0xcbc for o in i.operands) for i in c):methods[hex(addr)]=render(c)
(OUT/'CORE_WING_NATIVE.json').write_text(json.dumps({'states':states,'wings':wings,'methods':methods},indent=2)+'\n',encoding='utf8')
print(states);print(wings)
for a,c in methods.items():print(a,len(c))


