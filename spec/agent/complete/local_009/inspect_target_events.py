"""Reuse existing bytecode decoder for the ambiguous land-battleship parts."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
parser=ROOT/'docs/analysis/calculation/investigate_core_pillar.py'
source=parser.read_text(encoding='utf8')
scope={'__file__':str(parser),'__name__':'target_event_inspection'}
exec(compile(source.split('\nout = {}')[0],str(parser),'exec'),scope)
loop=source.split('\nout = {}')[1].split('\n# Verify all explicit')[0]
start=loop.index('    asset = b.asset(name)')
body=loop[start:]
body='\n'.join(line[4:] if line.startswith('    ') else line for line in body.splitlines())
out={};scope['out']=out;errors={}
for name in ['BP_GR036_ldbs1_SubCat_Core_C','BP_GR037_ldbs2_Bridge_C','BP_GR037_ldbs2_MainCore_C','BP_GR037_ldbs2_MainCannon_C','BP_GR038_ldbs3_MainCannon_C']:
    scope['name']=name
    try:exec(compile(body,'<existing function decoder>','exec'),scope)
    except Exception as ex:errors[name]=str(ex)
(OUT/'TARGET_EVENTS.json').write_text(json.dumps({'blueprints':out,'errors':errors},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('errors',errors)
for name,r in out.items():
    for fn,rec in r['functions'].items():
        print(name,fn)
        for n in rec['trace']:print(n['vm'],n['expression'])
