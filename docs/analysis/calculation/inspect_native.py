"""Read native code from an explicitly named EXE; output stays in data/local.
Requires the bundled pefile/capstone under docs/initial/ref/tools/python.
"""
import sys, types, re, struct, json
from pathlib import Path
root = Path(__file__).resolve().parents[3]
ref = root / 'docs/initial/ref'
sys.path.insert(0, str(ref / 'tools/python'))
source = (ref / 'scripts/code_xrefs.py').read_text(encoding='utf-8')
source = source.replace("Path('Game/Binaries/Win64/AceCombat8.exe')", 'Path(sys.argv[1])')
c = types.ModuleType('native_inspection')
c.__file__ = str(ref / 'scripts/code_xrefs.py')
exec(compile(source, c.__file__, 'exec'), c.__dict__)
out = root / 'data/local/native'
out.mkdir(parents=True, exist_ok=True)
def dump(addr):
    instructions = c.disasm_full(addr)
    lines = []
    for ins in instructions:
        suffix = ''
        for op in ins.operands:
            if op.type == c.capstone.x86.X86_OP_MEM and op.mem.base == c.capstone.x86.X86_REG_RIP:
                target = ins.address + ins.size + op.mem.disp
                if ins.mnemonic.endswith('ss'):
                    try: suffix += f' ; {target:#x} f32={struct.unpack_from("<f", c.data, c.pe.get_offset_from_rva(target-c.base))[0]}'
                    except (ValueError, struct.error): pass
        lines.append(f'{ins.address:#x} {ins.mnemonic} {ins.op_str}{suffix}')
    (out / f'{addr:x}.txt').write_text('\n'.join(lines), encoding='utf-8')
    return instructions
if sys.argv[2] == 'offset':
    section = c.pe.sections[0]; lo=section.PointerToRawData; hi=lo+section.SizeOfRawData
    funcs=set()
    for m in re.finditer(re.escape(struct.pack('<I',int(sys.argv[3],16))),c.data[lo:hi]):
        addr=c.base+c.pe.get_rva_from_offset(lo+m.start());f=c.function(addr)
        if f:funcs.add(c.base+f[0])
    print('functions',len(funcs))
    for addr in sorted(funcs):
        code=dump(addr)
        relevant=[f'{i.address:#x} {i.mnemonic} {i.op_str}' for i in code if sys.argv[3].lower().lstrip('0') in i.op_str.lower()]
        print(hex(addr),len(code),'; '.join(relevant)[:800])
elif sys.argv[2] == 'function':
    code=dump(int(sys.argv[3],16)); print('\n'.join((out/f'{int(sys.argv[3],16):x}.txt').read_text(encoding='utf-8').splitlines()))
