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
objects={}
names=['BP_OP0044_norn_Wing_'+side+str(i)+'_Base_C' for side in ['L','R'] for i in [3,4]]
for initial in ['BP_OP0044_norn_MS12_01_CP_C','BP_OP0044_norn_MS25_CP_C']:
 current=initial
 while current not in w.classes and current not in names:
  names.append(current);current=b.decode(current)['parent']
names += ['BP_GR036_ldbs1_SubCat_C','BP_GR036_ldbs1_SubCat_Core_C']
for name in names:
    a=b.asset(name);records=[]
    for e in a.exports:
        cls=a.ref(e['cls'])
        if not re.search('State|Damage|Lock|Target|ChildActor|Collision|InducedExplosion',cls,re.I) and e['index']!=3:continue
        rec={'name':e['name'],'class':cls,'index':e['index']}
        try:
            r=a.export_reader(e);fields=b.fields(cls)
            rec['properties']={fields[i]['name']:r.value(fields[i],z) for i,z in r.header()}
            rec['guidFlag']=r.read('I');rec['remaining']=r.bytes(e['size']-r.p).hex()
            rec['complete']=rec['guidFlag']==0 and not any(bytes.fromhex(rec['remaining']))
        except Exception as ex:rec['error']=str(ex)
        records.append(rec)
    objects[name]=records
(OUT/'WING34_COMPONENTS.json').write_text(json.dumps(objects,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for name,recs in objects.items():
 print(name)
 for r in recs:print(json.dumps(r,ensure_ascii=False))
