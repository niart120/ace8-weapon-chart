"""Build browsing metadata from reviewed source references, without changing combat values."""
import re

ROLE_NAMES = {0: 'FIGHTER', 1: 'MULTIROLE', 2: 'ATTACKER', 3: 'ELECTRONIC WARFARE'}


def mission_id(table):
    match = re.fullmatch(r'DT_NPC_Mission(\d+)(day[12])?', table)
    return str(int(match[1])) + (match[2] or '') if match else None


def build_index(definitions, npcs, models, aircraft, mission_tables):
    roles = {}
    for row in aircraft.values():
        key = row['PlaneNameTextID'].removeprefix('Aircraft_Name_').lower()
        role = ROLE_NAMES[row['Category']]
        if key in roles and roles[key] != role:
            raise ValueError(f'Conflicting aircraft category: {key}')
        roles[key] = role
    memberships = {d['id']: set() for d in definitions}
    child_occurrences = {}
    for table_name, rows in mission_tables.items():
        mid = mission_id(table_name)
        if not mid:
            continue
        for row in rows.values():
            # Only descendants: a base NPC must not absorb a distinct mission variant.
            pending = list(npcs[row['NpcId']]['ChildNPCId'])
            seen = set()
            while pending:
                child = pending.pop()
                if child in seen or child == 'None':
                    continue
                seen.add(child)
                if child not in npcs:
                    raise ValueError(f'Unknown child NPC: {child}')
                child_occurrences.setdefault(child, set()).add(mid)
                pending.extend(npcs[child]['ChildNPCId'])
    evidence = []
    output = []
    for d in definitions:
        mids = memberships[d['id']]
        npc_ids = []
        for source in d['sourceRefs']:
            table_name, row = source['table'], source['row']
            mid = mission_id(table_name)
            if mid:
                mids.add(mid)
                npc_ids.append(mission_tables[table_name][row]['NpcId'])
            elif table_name == 'DT_NPC':
                npc_ids.append(row)
                mids.update(child_occurrences.get(row, set()))
        if d['missionVariant']:
            mids.intersection_update({d['missionVariant']['missionId']})
        model_keys = {
            models[npcs[npc]['ModelId']]['GameObjectDisplayName01']
            .removeprefix('ContainerAircraft_Name_').lower()
            for npc in npc_ids
        }
        matched = {roles[key] for key in model_keys if key in roles}
        if d['partOf']:
            group, basis = 'PARTS', 'parent-part'
        elif d['category'] == 'AIRCRAFT' and matched:
            if len(matched) != 1:
                raise ValueError(f'Conflicting target category: {d["id"]}')
            group, basis = next(iter(matched)), 'DT_LiveAircraft.Category'
        else:
            group, basis = editorial_group(d), 'editorial'
        output.append({**d, 'subcategory': group, 'missionIds': []})
        evidence.append({'id': d['id'], 'name': d['name'], 'category': d['category'], 'subcategory': group, 'basis': basis})
    # Parent references also cover separately defined breakable parts. Explicit
    # mission variants remain confined to their own mission.
    for _ in definitions:
        changed = False
        for d in definitions:
            if not d['partOf'] or d['missionVariant']:
                continue
            mids = memberships[d['id']]
            before = len(mids)
            mids.update(memberships[d['partOf']])
            changed |= len(mids) != before
        if not changed:
            break
    order = ['1'] + [str(n) for n in range(2, 25)] + ['25day1', '25day2'] + [str(n) for n in range(26, 31)]
    for row in output:
        unknown = memberships[row['id']] - set(order)
        if unknown:
            raise ValueError(f'Unknown mission IDs: {unknown}')
        row['missionIds'] = sorted(memberships[row['id']], key=order.index)
    return output, evidence


def editorial_group(d):
    name, category = d['name'], d['category']
    if category == 'AIRCRAFT':
        if name in ['B-1', 'B-2', 'TU-160', 'TU-95']:
            return 'BOMBER'
        if name in ['AH-64', 'CH-47', 'MI-24', 'V-22']:
            return 'ROTORCRAFT'
        if name in ['A-50', 'C-130', 'IL-76', 'IL-78', 'KC-10']:
            return 'SUPPORT'
        if 'UAV' in name or name in ['MQ-19', 'QUADCOPTER']:
            return 'UAV'
        if name == 'AV-8B':
            return 'ATTACKER'
        return 'OTHER'
    if category == 'GROUND':
        if any(word in name for word in ['SAM', 'AA GUN', 'AIRBURST', 'CIWS', 'AD TANK', 'AEGIS', 'MANPADS']):
            return 'AIR DEFENSE'
        if name in ['TANK', 'APC']:
            return 'ARMOR'
        if name in ['HOWITZER', 'RKT LAUNCHER']:
            return 'ARTILLERY'
        if name == 'PILLBOX':
            return 'FORTIFICATION'
        if any(word in name for word in ['BATTLECRUISER', 'DESTROYER']):
            return 'LAND WARSHIP'
        if any(word in name for word in ['RADAR', 'COMMAND', 'CMD POST', 'EPP', 'JTAC']):
            return 'COMMAND & RADAR'
        if any(word in name for word in ['TRUCK', 'VEHICLE']):
            return 'SUPPORT'
        return 'OTHER'
    if category == 'SHIP':
        if any(word in name for word in ['CONTAINER', 'OIL TANKER', 'GAS CARRIER', 'LCAC']):
            return 'TRANSPORT'
        if name in ['GUNBOAT', 'MSL BOAT']:
            return 'SMALL CRAFT'
        if name in ['AEGIS', 'AIRCRAFT CARRIER', 'BATTLECRUISER', 'CRUISER', 'DESTROYER', 'FRIGATE']:
            return 'WARSHIP'
        return 'OTHER'
    if category == 'STRUCTURE':
        if any(word in name for word in ['GAS', 'OIL', 'PIPELINE', 'REFINERY', 'SMOKESTACK', 'SOLAR', 'HELIOSTAT', 'CSP']):
            return 'INDUSTRIAL'
        if any(word in name for word in ['BUNKER', 'BARRACKS', 'HANGAR', 'DEPOT', 'AIR BASE', 'STRONGPOINT', 'CONTROL', 'WATCHTOWER']):
            return 'MILITARY'
        return 'OTHER'
    if category == 'OTHER':
        if any(word in name for word in ['MSL', 'BVRAAM', 'SLCM']):
            return 'MISSILE'
        if 'DRONE' in name:
            return 'UAV'
    return 'OTHER'
