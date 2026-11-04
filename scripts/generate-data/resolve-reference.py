"""Resolve reviewed local source mappings into the typed generator's input.
No game installation or source extraction is needed to run tests/build.
"""
import json, struct, sys
import importlib.util
from pathlib import Path
root=Path(__file__).resolve().parents[2]
ref=Path(sys.argv[1]) if len(sys.argv)>1 else root/'docs/initial/ref'
local=root/'data/local'
def read(path):return json.loads(path.read_text(encoding='utf-8'))
def table(name):return {x['row']:x['values'] for x in read(ref/'tables'/f'{name}.json')['rows']}
def f32(x):return struct.unpack('<f',struct.pack('<f',x))[0]
def rate(x):return f32(f32(x)*f32(0.01))
def calculate_initial_hp(model_hp, npc_difference, mission_difference):
    return max(0, int(f32(f32(f32(model_hp)+f32(npc_difference))+f32(mission_difference))))
def choose_durability(npc_id, mission_id, rows):
    selected=mission_id if mission_id not in [None,'None'] else npc_id
    return rows[selected] if selected!='None' else None
def main():
    catalog=read(local/'catalog.json');npcs=table('DT_NPC');models=table('DT_NPC_Model');dur=table('DT_NPC_WeaponDurability');expl=table('DT_NPC_ExplosionDurability')
    weapons_table={x['WeaponID']:x for x in table('DT_LiveWeapon').values()}
    blueprints={x['blueprint']:x for x in read(ref/'tables/blueprint_weapons.json')}
    bindings={x['weapon_id']:x for x in read(ref/'reports/weapon_part_bindings.json')['weapons']}
    parts_table={x['PartsID']:x for x in table('DT_LiveParts').values()}
    parts=catalog['parts']
    part_values={x['key']:{v['ParameterLabel']:v['ParameterValue'] for v in parts_table[x['sourceId']]['PartsData']} for x in parts}
    roles_table=list(table('DT_CategoryDamageRateForPlayerDataTable').values())
    roles={}
    for label,attack in [('FIGHTER',0),('MULTIROLE',1),('ATTACKER',2),('ELECTRONIC WARFARE',3)]:
        row=next(x for x in roles_table if x['AttackCategory']==attack)
        roles[label]={key:rate(row[col]) for key,col in [('air','Category05'),('ground','Category07'),('ship','Category11')]}
    for row in roles.values():row['none']=1
    modifiers={'roles':roles,'parts':[{k:v for k,v in p.items() if k!='sourceId'} for p in parts]}
    weapons=[];multiplier_columns={}
    for definition in catalog['weapons']:
        identity={k:definition[k] for k in ['id','name','category','order','calculation']}
        wid=definition['weaponId'];record=blueprints.get(definition['blueprint']);props=record['effective_properties'] if record else {}
        damage=props.get('Damage')
        if definition.get('rookie'):damage=table('DT_WeaponSettings')['C.STORY']['Damage']
        # SFFS copies the parent's adjusted Damage into child 105 after initialization.
        # Keep the child base damage and durability source separate from its parts source.
        binding=bindings.get(definition.get('partsWeaponId',definition.get('damageWeaponId',wid)),{})
        labels=[v['power_label'] for field in ['group_power','individual_power'] if (v:=binding.get(field))]
        powers={p['key']:f32(__import__('functools').reduce(lambda a,b:f32(a*b),[part_values[p['key']][label] for label in labels if label in part_values[p['key']]],1)) for p in parts}
        powers={k:v for k,v in powers.items() if v!=1}
        if wid==2:powers.update(missileAirPower=f32(part_values['missileAirPower'][114]),missileGroundPower=f32(part_values['missileGroundPower'][115]))
        component={'baseDamage':damage,'partMultipliers':powers,'targetMultiplierKey':definition['multiplierKey']}
        if 'AntiShipDamageRate' in props:component['antiShipMultiplier']=rate(props['AntiShipDamageRate'])
        column='Category'+str(weapons_table[wid]['WeaponDurabilityCategory']).zfill(2)
        key=definition['multiplierKey']
        if key in multiplier_columns and multiplier_columns[key]!=column:
            raise ValueError(f'Conflicting durability columns for {key}')
        multiplier_columns[key]=column
        identity['primary']=component
        if wid in [17,18,19,24,33]:
            area=50.0 if wid==33 else props['AreaOfEffectDamage']
            key={17:'lacmBlast',18:'lagmBlast',19:'lasmBlast'}.get(wid,definition['multiplierKey'])
            identity['additional']={'baseDamage':area,'partMultipliers':{},'targetMultiplierKey':key}
            if 'antiShipMultiplier' in component:identity['additional']['antiShipMultiplier']=component['antiShipMultiplier']
        weapons.append(identity)
    mission_tables={}
    def resolve(source):
        t=source['table'];row=source['row'];mission=None
        if t.startswith('DT_NPC_Mission'):
            if t not in mission_tables:mission_tables[t]=table(t)
            mission=mission_tables[t][row];npc=npcs[mission['NpcId']];model=models[npc['ModelId']]
        elif t=='DT_NPC':npc=npcs[row];model=models[npc['ModelId']]
        else:raise ValueError(f'Unsupported source: {t}/{row}')
        hp=calculate_initial_hp(model['MaxHealth'],npc['MaxHealthDifference'],mission['MaxHealthDifference'] if mission else 0)
        durable_id=npc['WeaponDurabilityId']
        if mission and mission['WeaponDurabilityId']!='None':durable_id=mission['WeaponDurabilityId']
        durable=choose_durability(npc['WeaponDurabilityId'], mission['WeaponDurabilityId'] if mission else None, dur)
        explosion_id=npc['ExplosionDurabilityId'];explosion=expl[explosion_id] if explosion_id!='None' else None
        values={key:rate(durable[column]) if durable else None for key,column in multiplier_columns.items()}
        for name,column,normal in [('lacmBlast','PlayerLACM','groundMissile'),('lagmBlast','PlayerLAGM','groundMissile'),('lasmBlast','PlayerLASM','antiShipMissile')]:
            values[name]=rate(explosion[column]) if explosion else values[normal]
        attributes=catalog['modelAttributes'][npc['ModelId']]
        return {'hp':hp,'damageMultipliers':values,'isAir':attributes['isAir'],'roleGroup':attributes['roleGroup'],'standardDamage':attributes['standardDamage'] and (not mission or mission['MinHealth']==0)}
    sources={}
    for definition in catalog['targets']:
        for source in definition['sourceRefs']:
            key=source['table']+'/'+source['row']
            sources[key]=resolve(source)
    index_spec=importlib.util.spec_from_file_location('target_index',Path(__file__).with_name('target-index.py'))
    index_module=importlib.util.module_from_spec(index_spec);index_spec.loader.exec_module(index_module)
    all_missions={p.stem:table(p.stem) for p in (ref/'tables').glob('DT_NPC_Mission*.json') if index_module.mission_id(p.stem)}
    indexed,evidence=index_module.build_index(catalog['targets'],npcs,models,table('DT_LiveAircraft'),all_missions)
    (local/'target-browsing-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    result={'weapons':weapons,'targets':indexed,'sources':sources,'modifiers':modifiers}
    (local/'generation-input.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Resolved {len(sources)} source definitions')

if __name__=='__main__':main()
