# 全掲載対象の機械抽出結果

2026-11-06。判断・制約は [調査報告](NORMALIZATION_REVIEW.md) を参照。

## 同じ基本名・計算属性が完全一致する候補

| 基本名 | ID | HP | 残るメタデータ差 |
| --- | --- | --- | --- |
| MSL PALLET | 201, 202 | 20 | なし |
| WING SPAR | 102, 189 | 150 | partOf, missionVariant, missionIds |
| AA GUN | 378, 311 | 35 | category, partOf, missionIds |
| CIWS | 374, 107, 368 | 35 | category, partOf, missionIds |
| DISP. RAIL GUN | 380, 313, 314 | 35 | category, partOf, missionIds |
| LAND AEGIS | 373, 106, 367 | 200 | category, subcategory, partOf, missionIds |
| LAND DESTROYER | 377, 310 | 200 | category, subcategory, partOf, missionIds |
| SHUTTER | 375, 108, 369 | 80 | category, partOf, missionIds |
| SSM LAUNCHER | 379, 312 | 80 | category, partOf, missionIds |
| VLS | 184, 383 | 40 | category, missionIds |
| VLS | 376, 109, 370 | 35 | category, partOf, missionIds |
| AA GUN | 148, 248, 227 | 40 | partOf, missionIds |
| AIRBURST GUN | 150, 257, 229 | 70 | partOf, missionIds |
| VLS | 155, 254 | 40 | partOf, missionIds |
| AA GUN | 244, 124, 126, 64, 60, 58, 53 | 20 | partOf, missionIds |
| AA GUN | 343, 362, 366 | 20 | partOf |
| NAVAL GUN | 243, 127, 63, 61, 57 | 20 | partOf, missionIds |
| NAVAL GUN | 342, 363, 365 | 20 | partOf |
| VLS | 246, 129 | 20 | partOf, missionIds |
| SAM | 128, 65, 309 | 20 | partOf, missionIds |
| BUILDING | 80, 136 | 90 | missionVariant, missionIds |
| PILLAR (Front) | 420, 419 | 100 | missionVariant |
| PILLAR (EV) | 422, 421 | 200 | missionVariant |

## 同じ基本名で残す計算差

| 基本名 | ID | 差のある属性 |
| --- | --- | --- |
| AIRSHIP | 177, 319 | damageMultipliers.gun, damageMultipliers.uavg, damageMultipliers.uavp, damageMultipliers.uavt |
| VLS | 178, 281, 184, 376, 109, 155, 254, 246, 345, 129, 472, 370, 383 | hp, isAir, roleGroup, damageMultipliers.antiShipMissile, damageMultipliers.bomb, damageMultipliers.groundMissile, damageMultipliers.guidedBomb, damageMultipliers.gun, damageMultipliers.lacmBlast, damageMultipliers.lagmBlast, damageMultipliers.laser, damageMultipliers.lasmBlast, damageMultipliers.mpbm, damageMultipliers.rocket, damageMultipliers.uavg, damageMultipliers.uavp, damageMultipliers.uavt |
| AA GUN | 278, 183, 378, 32, 483, 148, 248, 227, 311, 382, 244, 343, 124, 126, 64, 60, 362, 58, 366, 53 | hp, isAir, roleGroup, damageMultipliers.antiShipMissile, damageMultipliers.bomb, damageMultipliers.groundMissile, damageMultipliers.guidedBomb, damageMultipliers.gun, damageMultipliers.lacmBlast, damageMultipliers.lagmBlast, damageMultipliers.laser, damageMultipliers.lasmBlast, damageMultipliers.mpbm, damageMultipliers.rocket, damageMultipliers.uavg, damageMultipliers.uavp, damageMultipliers.uavt |
| EXPLOSIVE UAV | 216, 224 | hp |
| LADON | 98, 212, 99 | hp, damageMultipliers.airMissile, damageMultipliers.antiShipMissile, damageMultipliers.bomb, damageMultipliers.fuelAirBomb, damageMultipliers.groundMissile, damageMultipliers.guidedBomb, damageMultipliers.gun, damageMultipliers.lacmBlast, damageMultipliers.lagmBlast, damageMultipliers.laser, damageMultipliers.lasmBlast, damageMultipliers.mpbm, damageMultipliers.rocket, damageMultipliers.uavg, damageMultipliers.uavp, damageMultipliers.uavt |
| CIWS | 101, 374, 414, 107, 252, 245, 344, 368 | hp, isAir, roleGroup, damageMultipliers.bomb, damageMultipliers.guidedBomb, damageMultipliers.gun, damageMultipliers.laser, damageMultipliers.rocket |
| MAIN ENGINE | 100, 473 | hp, damageMultipliers.airMissile, damageMultipliers.antiShipMissile, damageMultipliers.bomb, damageMultipliers.fuelAirBomb, damageMultipliers.groundMissile, damageMultipliers.guidedBomb, damageMultipliers.lacmBlast, damageMultipliers.lagmBlast, damageMultipliers.lasmBlast, damageMultipliers.mpbm, damageMultipliers.railgun, damageMultipliers.rocket |
| VARIABLE WING | 214, 103 | damageMultipliers.airMissile, damageMultipliers.gun, damageMultipliers.mpbm |
| WING SPAR | 213, 215, 102, 104, 181, 185, 186, 188, 189, 190, 191, 476 | hp, damageMultipliers.airMissile, damageMultipliers.bomb, damageMultipliers.guidedBomb, damageMultipliers.gun, damageMultipliers.laser, damageMultipliers.mpbm, damageMultipliers.uavg, damageMultipliers.uavp, damageMultipliers.uavt |
| MAIN PROPELLER | 474, 182 | hp, damageMultipliers.bomb, damageMultipliers.guidedBomb, damageMultipliers.gun, damageMultipliers.laser, damageMultipliers.mpbm, damageMultipliers.uavg, damageMultipliers.uavp, damageMultipliers.uavt |
| PODARGE | 179, 381 | isAir |
| CARGO MODULE | 180, 192 | hp |
| DISP. RAIL GUN | 380, 484, 313, 314 | hp, damageMultipliers.antiShipMissile, damageMultipliers.bomb, damageMultipliers.groundMissile, damageMultipliers.guidedBomb, damageMultipliers.lacmBlast, damageMultipliers.lagmBlast, damageMultipliers.lasmBlast, damageMultipliers.rocket |
| LAND AEGIS | 373, 106, 315, 367 | damageMultipliers.antiShipMissile, damageMultipliers.bomb, damageMultipliers.fuelAirBomb, damageMultipliers.groundMissile, damageMultipliers.guidedBomb, damageMultipliers.gun, damageMultipliers.mpbm, damageMultipliers.uavg, damageMultipliers.uavp, damageMultipliers.uavt |
| SHUTTER | 375, 108, 369, 426 | hp, roleGroup, damageMultipliers.bomb, damageMultipliers.guidedBomb, damageMultipliers.mpbm, damageMultipliers.rocket |
| SUB PROPELLER | 187, 475 | hp, damageMultipliers.bomb, damageMultipliers.guidedBomb, damageMultipliers.gun, damageMultipliers.laser, damageMultipliers.mpbm, damageMultipliers.uavg, damageMultipliers.uavp, damageMultipliers.uavt |
| AIRBURST GUN | 79, 150, 257, 229 | hp, roleGroup, damageMultipliers.bomb, damageMultipliers.guidedBomb, damageMultipliers.rocket |
| BATTLECRUISER | 416, 125 | roleGroup, damageMultipliers.antiShipMissile, damageMultipliers.lacmBlast |
| FUEL TRUCK | 34, 415 | hp |
| NAVAL GUN | 327, 243, 342, 127, 63, 61, 363, 57, 365, 485 | hp, roleGroup, damageMultipliers.antiShipMissile, damageMultipliers.bomb, damageMultipliers.groundMissile, damageMultipliers.guidedBomb, damageMultipliers.gun, damageMultipliers.lacmBlast, damageMultipliers.lagmBlast, damageMultipliers.laser, damageMultipliers.lasmBlast, damageMultipliers.rocket |
| MAIN GUN | 372, 255, 228 | hp, roleGroup, damageMultipliers.antiShipMissile, damageMultipliers.groundMissile, damageMultipliers.lacmBlast, damageMultipliers.lagmBlast, damageMultipliers.lasmBlast |
| THRUSTER | 488, 153 | damageMultipliers.antiShipMissile, damageMultipliers.groundMissile |
| SAM | 256, 33, 128, 65, 309 | hp, roleGroup, damageMultipliers.bomb, damageMultipliers.guidedBomb, damageMultipliers.rocket |
| PILLBOX | 90, 325, 326 | hp |
| AEGIS | 242, 341 | damageMultipliers.gun, damageMultipliers.laser |
| DESTROYER | 59, 361 | damageMultipliers.gun, damageMultipliers.laser |
| FRIGATE | 56, 364 | damageMultipliers.gun, damageMultipliers.laser |
| BUILDING | 157, 80, 136 | damageMultipliers.gun, damageMultipliers.laser |
| BUNKER | 91, 92 | hp |
| PILLAR (Front) | 420, 500, 419 | damageMultipliers.bomb |
| PILLAR (EV) | 422, 501, 421 | damageMultipliers.bomb |
| TURRET BASE | 502, 425 | damageMultipliers.bomb, damageMultipliers.guidedBomb, damageMultipliers.mpbm, damageMultipliers.rocket |

各属性の ID ごとの正確な値は `CANDIDATES.json` の `differences` に記録。丸めずに比較した。

## 親タグ省略の候補

| 基本名 | ID |
| --- | --- |
| MSL PALLET | 201, 202 |
| GENERATOR | 280 |
| RADOME | 279 |
| AAM | 105 |
| LAND DESTROYER | 377, 310 |
| SSM LAUNCHER | 379, 312 |
| LASER DESIGNATOR | 460 |
| CASEMATE GUN | 149 |
| BREACH | 251 |
| CORE UNIT | 250 |
| HEAT VENT | 253 |
| RAIL GUN TURRET | 424 |
| LAUNCH TUBE | 486 |
| FUSION REACTOR | 430 |

## 異なる基本名で計算属性が一致する組

別名の対象をまとめる許可ではない。名称・種類・所属を失うため、計算属性の共有候補としてのみ扱う。

| 組 | ID・表示名 |
| --- | --- |
| 1 | 273 A-10C; 307 F-22A |
| 2 | 2 A-50; 263 B-2; 200 C-130; 118 IL-78; 335 SU-57 |
| 3 | 5 A-6E; 26 F-16C; 70 GRIPEN E; 4 MIRAGE 2000-5 |
| 4 | 434 B-1; 180 CARGO MODULE《PODARGE》 |
| 5 | 278 AA GUN《CELAENO》; 281 VLS《CELAENO》; 476 WING SPAR《CELAENO》 |
| 6 | 280 GENERATOR《CELAENO》; 474 MAIN PROPELLER《CELAENO》; 475 SUB PROPELLER《CELAENO》 |
| 7 | 230 CH-47; 29 MI-24; 69 V-22 |
| 8 | 274 EA-18G; 334 EA-36; 6 F-14D; 7 F-4E; 241 F/A-18E; 197 F/A-18F; 306 FA-36; 67 MIG-29A; 186 WING SPAR《PODARGE》; 232 RAFALE M; 27 SU-25SM; 207 SU-47; 95 TYPHOON; 411 UNKNOWN UAV [M26] |
| 9 | 120 EA-6B; 30 F/A-18C |
| 10 | 224 EXPLOSIVE UAV [M16]; 183 AA GUN《PODARGE》 |
| 11 | 266 F-14D (SHADOW) [M20]; 28 MIG-29A (SHADOW) [M3]; 236 SU-47 (SHADOW) [M18]; 333 TYPHOON (SHADOW) [M25] |
| 12 | 66 F-15C; 233 F-15J; 409 F-35C; 182 MAIN PROPELLER《PODARGE》 |
| 13 | 134 F-15E (SHADOW) [M8]; 193 MIG-31B (SHADOW) [M11] |
| 14 | 272 F-15E; 73 MIG-31B |
| 15 | 133 F-16C (SHADOW) [M8]; 332 GRIPEN E (SHADOW) [M25]; 135 MIRAGE 2000-5 (SHADOW) [M8] |
| 16 | 74 F-2A; 68 SU-33; 265 SU-35S |
| 17 | 93 IL-76; 102 WING SPAR《LADON》 [M7]; 189 WING SPAR《PODARGE》; 8 TU-95 |
| 18 | 146 INTERCEPTOR UAV; 464 MARKER UAV; 3 MQ-19 |
| 19 | 101 CIWS《LADON》; 31 TU-160 |
| 20 | 104 WING SPAR《LADON》 [M7]; 459 X-40 NOSE UNIT |
| 21 | 378 AA GUN《PODARGE》; 374 CIWS《PODARGE》; 376 VLS《PODARGE》; 107 CIWS《LAND AEGIS》; 109 VLS《LAND AEGIS》; 311 AA GUN《LAND DESTROYER》; 368 CIWS《LAND AEGIS》; 52 GUNBOAT; 308 MSL BOAT; 370 VLS《LAND AEGIS》 |
| 22 | 380 DISP. RAIL GUN《PODARGE》; 327 NAVAL GUN《LAND AEGIS》; 313 DISP. RAIL GUN《LAND DESTROYER》; 314 DISP. RAIL GUN《LAND DESTROYER》; 96 HANGAR; 114 PIPELINE; 113 REFINERY |
| 23 | 373 LAND AEGIS《PODARGE》; 377 LAND DESTROYER《PODARGE》; 106 LAND AEGIS; 310 LAND DESTROYER; 367 LAND AEGIS |
| 24 | 375 SHUTTER《PODARGE》; 379 SSM LAUNCHER《PODARGE》; 108 SHUTTER《LAND AEGIS》; 312 SSM LAUNCHER《LAND DESTROYER》; 369 SHUTTER《LAND AEGIS》 |
| 25 | 184 VLS《PODARGE》; 190 WING SPAR《PODARGE》; 383 VLS《PODARGE》 |
| 26 | 181 WING SPAR《PODARGE》; 382 AA GUN《PODARGE》 |
| 27 | 336 SU-33 (SHADOW) [M25]; 305 SU-35S (VENTUS) [M23] |
| 28 | 460 LASER DESIGNATOR《X-40 NOSE UNIT》; 264 BVRAAM |
| 29 | 32 AA GUN; 79 AIRBURST GUN; 50 APC; 414 CIWS; 415 FUEL TRUCK; 76 HOWITZER; 432 LONG-RANGE SAM; 36 RADAR VEHICLE; 131 RKT LAUNCHER; 33 SAM |
| 30 | 483 AA GUN《TRIUMPHANT》; 472 VLS《TRIUMPHANT》 |
| 31 | 318 COMMAND POST; 39 RADAR TOWER; 117 CONTROL TOWER; 110 CSP TOWER; 17 GAS TANK; 16 OIL TANK; 328 STRONGPOINT; 89 TENT; 38 WATCHTOWER |
| 32 | 484 DISP. RAIL GUN《TRIUMPHANT》; 485 NAVAL GUN《TRIUMPHANT》 |
| 33 | 225 EX-SAM; 78 LINKED SAM; 77 MSL CMD POST; 88 RADAR SITE |
| 34 | 34 FUEL TRUCK; 208 MANPADS; 35 TRUCK |
| 35 | 148 AA GUN《LAND BATTLESHIP 1》; 149 CASEMATE GUN《LAND BATTLESHIP 1》; 151 SUB CATERPILLAR; 155 VLS《LAND BATTLESHIP 1》; 248 AA GUN《LAND BATTLESHIP 2》; 252 CIWS《LAND BATTLESHIP 2》; 253 HEAT VENT《LAND BATTLESHIP 2》; 255 MAIN GUN《LAND BATTLESHIP 2》; 256 SAM《LAND BATTLESHIP 2》; 254 VLS《LAND BATTLESHIP 2》; 227 AA GUN《LAND BATTLESHIP 3》 |
| 36 | 251 BREACH《LAND BATTLESHIP 2》; 250 CORE UNIT《LAND BATTLESHIP 2》 |
| 37 | 244 AA GUN《AEGIS》; 245 CIWS《AEGIS》; 243 NAVAL GUN《AEGIS》; 246 VLS《AEGIS》; 124 AA GUN《AIRCRAFT CARRIER》; 126 AA GUN《BATTLECRUISER》; 127 NAVAL GUN《BATTLECRUISER》; 128 SAM《BATTLECRUISER》; 129 VLS《BATTLECRUISER》; 64 AA GUN《CRUISER》; 63 NAVAL GUN《CRUISER》; 65 SAM《CRUISER》; 60 AA GUN《DESTROYER》; 61 NAVAL GUN《DESTROYER》; 58 AA GUN《FRIGATE》; 57 NAVAL GUN《FRIGATE》; 53 AA GUN《GUNBOAT》; 309 SAM《MSL BOAT》 |
| 38 | 343 AA GUN《AEGIS》 [M25]; 344 CIWS《AEGIS》 [M25]; 342 NAVAL GUN《AEGIS》 [M25]; 345 VLS《AEGIS》 [M25]; 362 AA GUN《DESTROYER》 [M25]; 363 NAVAL GUN《DESTROYER》 [M25]; 366 AA GUN《FRIGATE》 [M25]; 365 NAVAL GUN《FRIGATE》 [M25] |
| 39 | 12 CONTAINER SHIP; 56 FRIGATE; 413 GAS CARRIER; 54 OIL TANKER |
| 40 | 115 BARRACKS; 116 WAREHOUSE |
| 41 | 111 HELIOSTAT; 112 SOLAR PANEL |
