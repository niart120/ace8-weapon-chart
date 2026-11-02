"""Read extracted Blueprint parents/CDO overrides, without executing the game."""
import sys, types, json, functools, struct, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[3];ref=root/'docs/initial/ref'
sys.path.insert(0,str(ref/'tools/python'))
def load(name, replacements=()):
    module=types.ModuleType(name);module.__file__=str(ref/'scripts'/f'{name}.py');sys.modules[name]=module
    source=Path(module.__file__).read_text(encoding='utf-8')
    for a,b in replacements:source=source.replace(a,b)
    exec(compile(source,module.__file__,'exec'),module.__dict__);return module
p=load('parse_tables',[("Path('_combat_analysis')",f'Path({str(ref)!r})'),("Path('Game/Binaries/Win64/AceCombat8.exe')",'Path(sys.argv[1])')])
if hashlib.sha256(p.exe).hexdigest()!='3e47fd42858d1f2b81e59d7f57394a014c0eb6aaf4c02ee3da351b6a42936be2':raise ValueError('EXE differs from the investigated build')
w=load('inspect_weapons')
w.classes=json.loads((root/'data/local/current-native/indexes/native_classes.json').read_text(encoding='utf-8'))
w.class_addresses={int(v['address'],16):k for k,v in w.classes.items()}
b=load('parse_blueprints',[("recover_native('Actor',0x14bbee080)",''),("recover_native('LiveBomb',0x14c5cdec0)",''),("recover_native('LiveBullet',0x14c5e83b0)",''),("[7,8,9]","[0,1,2,3,4,5,6,7,8,9]"),("'EnumProperty':30","'EnumProperty':30,'MulticastInlineDelegateProperty':26"),("if t=='EnumProperty':","if t=='MulticastInlineDelegateProperty':r.read('i')\n        if t=='EnumProperty':")])


b.recover_native('Pawn',0x14bde8dc0)
b.recover_native('Actor',0x14bbd95b0)
p.schemas.update(json.loads((root/'data/local/current-native/indexes/native_schema.json').read_text(encoding='utf-8')))
p.schemas.update(w.classes)
p.by_addr.update({int(v['address'],16):k for k,v in p.schemas.items()})
p.by_addr.update({int(v['address'],16)-24:k for k,v in p.schemas.items()})
original_ctor=p.resolve_ctor
def resolve_ctor(address):
    try:return original_ctor(address)
    except ValueError:pass
    address=int(address,16) if isinstance(address,str) else address
    pos=p.pe.get_offset_from_rva(address-p.base)
    for ins in p.md.disasm(p.exe[pos:pos+128],address):
        if ins.mnemonic=='jmp' and ins.operands[0].type==p.capstone.x86.X86_OP_IMM:
            name=resolve_ctor(ins.operands[0].imm);p.ctor_cache[address]=name;return name
        if ins.mnemonic=='lea' and ins.op_str.startswith('rdx, [rip'):
            record=ins.address+ins.size+ins.operands[1].mem.disp
            off=p.pe.get_offset_from_rva(record-p.base)
            na=struct.unpack_from('<Q',p.exe,off+24)[0];no=p.pe.get_offset_from_rva(na-p.base)
            name=p.exe[no:p.exe.index(b'\0',no)].decode('ascii')
            pointer=struct.unpack_from('<Q',p.exe,off+32)[0];count=struct.unpack_from('<H',p.exe,off+40)[0]
            props=[];po=p.pe.get_offset_from_rva(pointer-p.base)
            for i in range(count):
                a=struct.unpack_from('<Q',p.exe,po+i*8)[0];q=p.pe.get_offset_from_rva(a-p.base)
                nameptr=struct.unpack_from('<Q',p.exe,q)[0];n=p.pe.get_offset_from_rva(nameptr-p.base)
                prop={'name':p.exe[n:p.exe.index(b'\0',n)].decode(),'type':struct.unpack_from('<I',p.exe,q+24)[0],'dim':struct.unpack_from('<H',p.exe,q+48)[0],'offset':struct.unpack_from('<I',p.exe,q+50)[0]}
                if prop['type'] in [25,30]:prop['ctor']=hex(struct.unpack_from('<Q',p.exe,q+56)[0])
                props.append(prop)
            p.schemas[name]={'properties':props,'super_ctor':hex(struct.unpack_from('<Q',p.exe,off+8)[0])};p.ctor_cache[address]=name;return name
        if ins.mnemonic=='ret':break
    raise ValueError(f'Unresolved struct {address:x}')
p.resolve_ctor=resolve_ctor
original_normalized=p.normalized
def normalized(name):
    result=original_normalized(name)
    parent=int(p.schemas[name].get('super_ctor','0x0'),16)
    if parent:
        try:
            parent_name=resolve_ctor(parent)
            if parent_name!=name:
                fields=normalized(parent_name)
                if fields and [x['name'] for x in result[-len(fields):]] != [x['name'] for x in fields]:result.extend(fields)
        except (ValueError,KeyError):pass
    return result
p.normalized=normalized
original_value=b.BReader.value
def value(self,field,zero=False,container=False):
    if field['type'] in [26,28]:
        if zero:return []
        count=self.read('i');return [dict(object=self.read('i'),function=self.fname()) for _ in range(count)]
    return original_value(self,field,zero,container)
b.BReader.value=value
b.paths.update({x.stem:x for x in (root/'data/local/npc-raw').rglob('*.uasset')})
models=json.loads((ref/'tables/DT_NPC_Model.json').read_text(encoding='utf-8'))['rows']

output={}
for model in models:
    name=model['values']['BlueprintClass']['asset']
    if name in output:continue
    entry={'chain':[], 'overrides':{},'errors':[]}
    current=name
    try:
        while current and current not in w.classes:
            asset=b.asset(current);e=next(x for x in asset.exports if x['name']==current)
            entry['chain'].append(current);parent=asset.ref(e['super'])
            try:
                decoded=b.decode(current)
                if decoded['error']:entry['errors'].append(decoded['error'])
                entry['overrides'] = {**{k:v for k,v in decoded['properties'].items() if k in ['bIsAir','GameObjectCategory','bDisableCategoryDamageRate']}, **entry['overrides']}
            except Exception as ex:entry['errors'].append(str(ex)[:180])
            current=parent
        while current:
            entry['chain'].append(current);current=w.get_parent(current)
    except Exception as ex:entry['errors'].append(f'{type(ex).__name__}: {ex}')
    output[name]=entry
(root/'data/local/npc-evidence.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8')
from collections import Counter
print('Blueprints',len(output),'native roots',Counter(next((n for n in v['chain'] if n.startswith('Live')),None) for v in output.values()))
print('override count',sum(bool(v['overrides']) for v in output.values()),'errors',sum(bool(v['errors']) for v in output.values()))

# Resolve UClass default-construction thunk through the registration parameter.
def instructions(addr,limit=0x3000):
    pos=p.pe.get_offset_from_rva(addr-p.base)
    return p.md.disasm(p.exe[pos:pos+limit],addr)
def block(addr):
    out=[]
    for ins in instructions(addr,0x300):
        out.append(ins)
        if ins.mnemonic in ['ret','jmp']:break
    return out
@functools.cache
def constructor(name):
    record=w.classes[name];reg=None;last=None
    for ins in block(int(record['getter'],16)):
        if ins.mnemonic=='lea' and ins.op_str.startswith('rax, [rip'):
            last=ins.address+ins.size+ins.operands[1].mem.disp
        if ins.mnemonic=='mov' and ins.op_str=='qword ptr [r11 - 0x30], rax':reg=last
    if reg is None:return None
    addr=reg
    for _ in range(8):
        code=block(addr)
        if not code or code[-1].mnemonic!='jmp':return addr
        target=code[-1].operands[0]
        if target.type!=p.capstone.x86.X86_OP_IMM:return addr
        addr=target.imm
        if len(code)>1:return addr
    return None
native={}
for name in sorted({x for v in output.values() for x in v['chain'] if x in w.classes} | {'LiveAttachedInstantWeapon','LiveTLSLaserWeapon','LiveWeaponUAV'}):
    try:
        addr=constructor(name)
        if not addr:continue
        regs={};writes={};vtable=None;last_pointer=None
        def alias(name):
            for family in ['a','b','c','d']:
                if name in [family+'l',family+'h',family+'x','e'+family+'x','r'+family+'x']:return 'r'+family+'x'
            for family in ['bp','sp','si','di']:
                if name in [family+'l',family,'e'+family,'r'+family]:return 'r'+family
            if name.startswith('r') and name[-1:] in ['b','w','d']:return name[:-1]
            return name
        for ins in instructions(addr):
            if ins.mnemonic=='ret':break
            ops=ins.operands
            if ins.mnemonic=='lea' and ins.op_str.startswith('rax, [rip'):
                last_pointer=ins.address+ins.size+ops[1].mem.disp
            if ins.mnemonic=='mov' and len(ops)==2 and ops[0].type==p.capstone.x86.X86_OP_MEM and ops[0].mem.disp==0 and ops[1].type==p.capstone.x86.X86_OP_REG and ins.reg_name(ops[1].reg)=='rax' and last_pointer is not None and vtable is None:
                vtable=last_pointer
            if len(ops)!=2:continue
            dst,src=ops
            if ins.mnemonic=='xor' and ins.op_str.split(', ')[0]==ins.op_str.split(', ')[1]:regs[alias(ins.reg_name(dst.reg))]=0
            elif ins.mnemonic=='mov':
                value=src.imm if src.type==p.capstone.x86.X86_OP_IMM else regs.get(alias(ins.reg_name(src.reg))) if src.type==p.capstone.x86.X86_OP_REG else None
                if dst.type==p.capstone.x86.X86_OP_REG:regs[alias(ins.reg_name(dst.reg))]=value
                elif dst.type==p.capstone.x86.X86_OP_MEM and dst.mem.disp in [0x10db,0x3ac]:
                    writes[hex(dst.mem.disp)]={'value':value,'address':hex(ins.address)}
        native[name]={'constructor':hex(addr),'writes':writes,'vtable':hex(vtable) if vtable else None}
        if vtable:
            native[name]['slots']={hex(slot):hex(struct.unpack_from('<Q',p.exe,p.pe.get_offset_from_rva(vtable-p.base)+slot)[0]) for slot in [0x938,0xa38,0xa40,0x8b8,0x8c0]}
    except Exception as ex:native[name]={'error':str(ex)}
(root/'data/local/native-constructors.json').write_text(json.dumps(native,indent=2),encoding='utf-8')
print('constructor flags', {k:v for k,v in native.items() if v.get('writes')})
