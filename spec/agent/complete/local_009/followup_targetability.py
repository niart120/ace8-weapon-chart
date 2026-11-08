"""Read target-state subobjects and native lock-flag references; no game execution."""
import json
import re
import struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
bootstrap=OUT/'inspect_target_flags.py'
scope={'__file__':str(bootstrap),'__name__':'followup_targetability'}
exec(compile(bootstrap.read_text(encoding='utf8').split('\nsetters={}')[0],str(bootstrap),'exec'),scope)
p,w,x=scope['p'],scope['w'],scope['x']
b=scope['scope']['b']
for label,address in [('AuditChildActorParent',0x14bc5a820),('AuditStateMachineParent',0x14bc4f150),('AuditSceneComponent',0x14bb99040)]:
    b.recover_native(label,address)
p.schemas.update(w.classes)
code=scope['code'];render=scope['render']
sec=p.pe.sections[0];lo=sec.PointerToRawData;hi=lo+sec.SizeOfRawData
parent_setter=code(0x146cfea60)
parent_offsets=[o.mem.disp for i in parent_setter for o in i.operands if o.type==p.capstone.x86.X86_OP_MEM and o.mem.base==p.capstone.x86.X86_REG_RCX]
assert len(parent_offsets)==1,parent_offsets
functions={}
for off in [0x117a,0x11b2,*parent_offsets]:
    for m in re.finditer(re.escape(struct.pack('<I',off)),p.exe[lo:hi]):
        a=p.base+p.pe.get_rva_from_offset(lo+m.start());f=x['function'](a)
        if not f:continue
        addr=p.base+f[0];c=code(addr)
        if any(any(o.type==p.capstone.x86.X86_OP_MEM and o.size==1 and o.mem.base not in [p.capstone.x86.X86_REG_RIP,p.capstone.x86.X86_REG_RSP] and o.mem.disp==off for o in i.operands) for i in c):
            functions[hex(addr)]=render(c)
objects={}
names=['BP_GR036_ldbs1_SubCat_C','BP_GR036_ldbs1_SubCat_Core_C','BP_GR037_ldbs2_Bridge_C','BP_GR037_ldbs2_MainCore_C']
for name in names:
    a=b.asset(name);records=[]
    for e in a.exports:
        cls=a.ref(e['cls'])
        if not re.search('State|Damage|Lock|Target|ChildActor',cls,re.I) and e['index']!=3:continue
        rec={'name':e['name'],'class':cls,'index':e['index']}
        try:
            r=a.export_reader(e);fields=b.fields(cls)
            rec['properties']={fields[i]['name']:r.value(fields[i],z) for i,z in r.header()}
            rec['guidFlag']=r.read('I');rec['remaining']=r.bytes(e['size']-r.p).hex()
            rec['complete']=rec['guidFlag']==0 and not any(bytes.fromhex(rec['remaining']))
        except Exception as ex:rec['error']=str(ex)
        records.append(rec)
    objects[name]=records
(OUT/'TARGETABILITY_FOLLOWUP.json').write_text(json.dumps({'parentDestroySetter':render(parent_setter),'parentDestroyOffset':parent_offsets[0],'flagFunctions':functions,'stateObjects':objects},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for addr,lines in functions.items():
    print(addr,len(lines))
    for i,l in enumerate(lines):
        if '0x117a' in l or '0x11b2' in l:print('\n'.join(lines[max(0,i-3):i+5]))
for name,recs in objects.items():
    print(name)
    for r in recs:print(json.dumps(r,ensure_ascii=False))
