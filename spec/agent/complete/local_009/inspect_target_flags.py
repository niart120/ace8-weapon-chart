"""Disassemble flag setters and target native constructors, read-only."""
import json
import struct
from pathlib import Path
ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
bootstrap = ROOT/'docs/analysis/calculation/investigate_target_attributes.py'
scope = {'__file__':str(bootstrap),'__name__':'flag_inspection'}
exec(compile(bootstrap.read_text(encoding='utf8').split('\ndef table(')[0],str(bootstrap),'exec'),scope)
p,w=scope['p'],scope['w']
xp=ROOT/'docs/initial/ref/scripts/code_xrefs.py'
x={'__file__':str(xp),'__name__':'flag_xrefs','p':p}
exec(compile(xp.read_text(encoding='utf8').split("if __name__=='__main__':")[0].replace("data=Path('Game/Binaries/Win64/AceCombat8.exe').read_bytes()","data=p.exe"),str(xp),'exec'),x)

def code(a):
    c=x['disasm_full'](a)
    if not c:
        pos=p.pe.get_offset_from_rva(a-p.base);c=[]
        for i in p.md.disasm(p.exe[pos:pos+4096],a):
            c.append(i)
            if i.mnemonic in ['jmp','ret']:break
    return c

def render(c):return [f'{i.address:#x} {i.mnemonic} {i.op_str}' for i in c]

setters={}
for f in w.classes['LiveAIGameObject']['properties']:
    if f['name'] in ['bShowHUDBox','bIsNotLockonTarget','bIsNotFCSTargets']:
        a=struct.unpack_from('<Q',bytes.fromhex(f['raw']),56)[0]
        setters[f['name']]=render(code(a))
native=json.loads((ROOT/'data/local/native-constructors.json').read_text(encoding='utf8'))
names=['LiveGameObject','LiveAIGameObject','LiveAILadonWing','LiveAIPodargeWing','LiveAIPodargeFlap','LiveAIPodargeAirIntake','LiveAICelaenoInsideWing','LiveAICollapseBuildingObject','LiveAIUniqueObjectBase','LiveAIUniquetTargetObject']
constructors={}
for name in names:
    a=int(native[name]['constructor'],16);c=code(a);chain=[]
    while c[0].mnemonic=='jmp' and c[0].operands[0].type==p.capstone.x86.X86_OP_IMM and len(chain)<6:
        chain.append(hex(a));a=c[0].operands[0].imm;c=code(a)
    constructors[name]={'entry':native[name]['constructor'],'redirects':chain,'code':render(c)}
(OUT/'TARGET_FLAGS_NATIVE.json').write_text(json.dumps({'setters':setters,'constructors':constructors},indent=2)+'\n',encoding='utf8')
print(setters)
for name,v in constructors.items():
    print(name, 'instructions', len(v['code']))
