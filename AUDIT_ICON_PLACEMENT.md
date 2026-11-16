# TranZit icon placement — exhaustive source and coordinate audit

**Audit date:** 2026-11-16. **Repository:** `hdog960/BO2-map`. **Scope:** all 130 data entries plus 10 world-site anchors and their placement semantics.

## Certification status

**NOT 100% EXACT-CERTIFIED.** The world map is an original schematic visually aligned to the user-supplied **Afrochubman TranZit Map Key**, credited there to BradyGames. It is **not** a rasterized/surveyed extraction of original BO2 scene geometry. The user source labels major sites and a handful of symbols; it does not identify the measured XYZ of every wall gun, part spawn, perk, bench, or door.

An earlier version of `app.js` placed item icons using `MAP_SLOTS[zone][index]`, which assigned unrelated item types to arbitrary coordinates according to a sort order. **Those fake item locations have been eliminated**. The current map shows 10 site anchor pins and dashed-line **category callouts** connected to the associated site, while the user's tap opens the named building/room, costs and spawn alternatives. This means the category callout is **not itself a claimed in-game coordinate**.

Only records with a grounded static site are offered as category callouts. Mobile, map-wide, action-only, dynamic portal and sound/achievement records remain searchable in **Find**, without an invented fixed map pin.

## Coverage

- **10** major/off-road site anchors; all x/y values within 720 × 580 drawing bounds.
- **130** item and stop records audited; **130** unique IDs.
- **91** location-linked items displayable through site/category callouts, with room notes and *no assertion of exact XY*.
- **39** stop/non-spatial references have no invented item pin (the 5 bus stops have independent named site markers).
- **3** entries explicitly have alternate zones, producing **4** alternate site associations.

### Site anchor placement and confidence

| Site | App schematic XY | Source alignment | Precision gate |
|---|---:|---|---|
| Bus Depot | (566, 321) | DEPOT near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |
| Tunnel | (647, 157) | TUNNEL near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |
| Diner & Garage | (502, 48) | DINER near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |
| Farm | (161, 87) | FARM near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |
| The Prototype / Nacht der Untoten | (52, 210) | NACHT near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |
| Obelisk Tower / Pylon | (216, 220) | PYLON near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |
| Power Station | (78, 433) | POWER near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |
| Hunter's Cabin | (240, 320) | CABIN near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |
| Town | (348, 206) | TOWN near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |
| Bridge | (494, 209) | BRIDGE near the matching landmark or highway section in provided Afrochubman map | *Broad region only; source not survey-grade* |

### Location corrections / structural deficiencies

1. **CRITICAL FIXED:** Item icons previously selected a preset slot based on sorted item order. Therefore their displayed positions changed when filters, counts, or zoom changed. The app no longer claims those are exact pickup coordinates.
2. **FIXED:** The B23R is purchased inside the **moving bus**, so it has no stationary depot gun marker.
3. **FIXED:** Cross-game persistent upgrades, achievement objectives, ambience, dynamic Denizen portals and potential EMP lamps cannot legitimately be pinned as static items at an invented point.
4. **FIXED:** NAV radio, wooden board, and electrical box now list their alternative sites. Alternates are options, not three distinct copies of those parts.
5. **NOT VERIFIED:** Every indoor item, individual door hinge, perk wall position, staircase or part spawn remains unmeasured. Detailed floor plans are explicitly schematic. A real exact-floor map needs screenshots/video frame validation or original geometry coordinate extraction with a provenance ledger.
6. **SOURCE CONFLICT:** TranZit-specific guides agree that the **Town bar entrance** costs **750 points**, but a TrueAchievements all-door walkthrough lists **1000**. The app retains 750 with this disagreement recorded; no unwarranted 100% claim.
7. **SOURCE CAUTION:** Sources describing the separate **Town Survival/Grief** variant include different weapon/perk positions, and must not be used to place pins in the bus-route TranZit mode.

### Core primary and secondary references

- User's attached *TranZit Map Key by Afrochubman; original map layout by BradyGames* (image). Broad world geography, not precise individual object coordinates.
- [ZFRR TranZit locations](https://zfrr.me/hub/tranzit-locations/) — site content and room references.
- [ZFRR TranZit weapons](https://zfrr.me/hub/tranzit-weapons/) — in-mode wall weapons and Mystery Box areas.
- [ZFRR TranZit perks/power](https://zfrr.me/hub/tranzit-perks-and-power/) — six machines and floor/room notes.
- [ZFRR TranZit buildables](https://zfrr.me/hub/tranzit-buildables/) — component distribution and benches.
- [Call of Duty Zombies 2016 buildables archive](https://www.callofdutyzombies.com/zombie-library/zombies-library/black-ops_ii/tranzit/buildables-r283/) — component alternate spawns and benches.
- [Neoseeker original-era door guide](https://www.neoseeker.com/call-of-duty-black-ops-ii/faqs/272171-call-of-duty-bo2.html) — multi-type door counts and prices.
- [Steam TranZit in-depth community guide](https://steamcommunity.com/sharedfiles/filedetails/?id=897802526) — alternate NAV sites, bus upgrades and route.

## All 130 data entries — audit ledger

**Legend:** *Site/room callout* means the area is supported; the badge's display offset is purely layout. *Variable spawn* may move within its area. *Multi-site* may appear at one of the listed areas. *No fixed pin* is accessible through Find; not a world coordinate.

| # | Category | Name | Area / possible alternate(s) | In-game location note | Map status | Coordinate confidence |
|---:|---|---|---|---|---|---|
| 1 | stop | Bus Depot | Bus Depot | Bus stop 1 | Site anchor (schematic) | non-spatial |
| 2 | stop | Diner & Garage | Diner & Garage | Bus stop 2 | Site anchor (schematic) | non-spatial |
| 3 | stop | Farm | Farm | Bus stop 3 | Site anchor (schematic) | non-spatial |
| 4 | stop | Power Station | Power Station | Bus stop 4 | Site anchor (schematic) | non-spatial |
| 5 | stop | Town | Town | Bus stop 5 | Site anchor (schematic) | non-spatial |
| 6 | perk | Quick Revive | Bus Depot | Depot hall, hallway near main door | Site/room callout | verified general site / unmeasured room |
| 7 | perk | Speed Cola | Diner & Garage | Diner interior by MP5 | Site/room callout | verified general site / unmeasured room |
| 8 | perk | Double Tap Root Beer | Farm | Barn upper level | Site/room callout | verified general site / unmeasured room |
| 9 | perk | Tombstone Soda | Power Station | Power exit / catwalk | Site/room callout | verified general site / unmeasured room |
| 10 | perk | Juggernog | Town | Burning building upper floor | Site/room callout | verified general site / unmeasured room |
| 11 | perk | Stamin-Up | Town | Bar ground floor | Site/room callout | verified general site / unmeasured room |
| 12 | weapon | M14 | Bus Depot | Starting hall | Site/room callout | verified general site / unmeasured room |
| 13 | weapon | Olympia | Bus Depot | Starting hall | Site/room callout | verified general site / unmeasured room |
| 14 | weapon | B23R | Bus Depot | Inside the moving bus | No fixed pin | non-spatial |
| 15 | weapon | Colt M16A1 | Tunnel | Tunnel maintenance ramp | Site/room callout | verified general site / unmeasured room |
| 16 | weapon | MP5 | Diner & Garage | Diner interior near Speed Cola | Site/room callout | verified general site / unmeasured room |
| 17 | weapon | Galvaknuckles | Diner & Garage | Diner roof | Site/room callout | verified general site / unmeasured room |
| 18 | weapon | Remington 870 MCS | Farm | Barn ground floor | Site/room callout | verified general site / unmeasured room |
| 19 | weapon | Claymores | Farm | Farm shed (Turbine) | Site/room callout | verified general site / unmeasured room |
| 20 | weapon | AK-74u | Power Station | Exterior of Power Station outhouse | Site/room callout | verified general site / unmeasured room |
| 21 | weapon | Bowie Knife | Hunter's Cabin | Hunter's Cabin interior | Site/room callout | verified general site / unmeasured room |
| 22 | weapon | Semtex | Town | Rare Books / Turbine room | Site/room callout | verified general site / unmeasured room |
| 23 | bench | Turbine bench | Bus Depot | Depot hall | Site/room callout | verified general site / unmeasured room |
| 24 | bench | Zombie Shield bench | Diner & Garage | Garage | Site/room callout | verified general site / unmeasured room |
| 25 | bench | Turret bench | Farm | Farmhouse ground level | Site/room callout | verified general site / unmeasured room |
| 26 | bench | Power switch bench | Power Station | Reactor | Site/room callout | verified general site / unmeasured room |
| 27 | bench | Electric Trap bench | Power Station | Exit catwalk / top of stairs | Site/room callout | verified general site / unmeasured room |
| 28 | bench | Jet Gun bench | Town | Town bar next to Stamin-Up | Site/room callout | verified general site / unmeasured room |
| 29 | bench | Pack-a-Punch bench | Town | Bank underground hallway | Site/room callout | verified general site / unmeasured room |
| 30 | bench | NAV Table bench | Obelisk Tower / Pylon | Under the pylon | Site/room callout | verified general site / unmeasured room |
| 31 | paid | Depot main door | Bus Depot | Hall exit | Site/room callout | verified general site / unmeasured room |
| 32 | paid | Diner entrance | Diner & Garage | Diner | Site/room callout | verified general site / unmeasured room |
| 33 | paid | Garage entrance | Diner & Garage | Gas station garage | Site/room callout | verified general site / unmeasured room |
| 34 | paid | Farm gate | Farm | Farm perimeter | Site/room callout | verified general site / unmeasured room |
| 35 | paid | Farmhouse door | Farm | Farmhouse ground floor | Site/room callout | verified general site / unmeasured room |
| 36 | paid | Power Station outhouse | Power Station | Outdoor outhouse | Site/room callout | verified general site / unmeasured room |
| 37 | paid | Bank door | Town | Bank ground floor | Site/room callout | verified general site / unmeasured room |
| 38 | paid | Bar door | Town | Town bar | Site/room callout | verified general site / unmeasured room |
| 39 | paid | Burning building door | Town | Building near Bank | Site/room callout | verified general site / unmeasured room |
| 40 | turbine | Depot power door A | Bus Depot | Side garage | Site/room callout | verified general site / unmeasured room |
| 41 | turbine | Depot power door B | Bus Depot | Side garage exit | Site/room callout | verified general site / unmeasured room |
| 42 | turbine | Diner shed | Diner & Garage | Beyond gas station | Site/room callout | verified general site / unmeasured room |
| 43 | turbine | Farm shed doors | Farm | Between farmhouse and barn | Site/room callout | verified general site / unmeasured room |
| 44 | turbine | Remote Pack-a-Punch door | Power Station | Under Power Station / lightning symbol | Site/room callout | verified general site / unmeasured room |
| 45 | turbine | Rare Books store | Town | Turbine room in Town | Variable-spawn site callout | variable within site |
| 46 | special | Station shutter | Power Station | Power exit / catwalk | Site/room callout | verified general site / unmeasured room |
| 47 | special | Bank vault outer door | Town | Bank interior | Site/room callout | verified general site / unmeasured room |
| 48 | special | Bank vault inner door | Town | Bank inner vault | Site/room callout | verified general site / unmeasured room |
| 49 | special | Pack-a-Punch passage door | Town | Below the Bank | Site/room callout | verified general site / unmeasured room |
| 50 | part | Turbine mannequin | Bus Depot | By wall route map | Site/room callout | verified general site / unmeasured room |
| 51 | part | Turbine fan | Bus Depot | Waiting room seats | Site/room callout | verified general site / unmeasured room |
| 52 | part | Turbine tail | Bus Depot | Depot hall floor / pay phones | Site/room callout | verified general site / unmeasured room |
| 53 | part | Shield car door | Diner & Garage | Garage, restroom, car on lift or bench-side table | Variable-spawn site callout | variable within site |
| 54 | part | Shield hand trolley | Diner & Garage | Diner behind counter or far booth | Variable-spawn site callout | variable within site |
| 55 | part | Turret unusable RPD | Farm | Barn upper or farmhouse | Variable-spawn site callout | variable within site |
| 56 | part | Turret ammo bag | Farm | Farmhouse ground or upper shelves | Variable-spawn site callout | variable within site |
| 57 | part | Turret lawn mower | Farm | Behind farmhouse | Site/room callout | verified general site / unmeasured room |
| 58 | part | Electric Trap battery | Power Station | Upstairs / catwalk room | Site/room callout | verified general site / unmeasured room |
| 59 | part | Electric Trap coil | Power Station | Upstairs / catwalk room | Site/room callout | verified general site / unmeasured room |
| 60 | part | Electric Trap TV screen | Power Station | Upstairs / catwalk room | Site/room callout | verified general site / unmeasured room |
| 61 | part | Power board | Power Station | Reactor area | Site/room callout | verified general site / unmeasured room |
| 62 | part | Power lever | Power Station | Reactor area | Site/room callout | verified general site / unmeasured room |
| 63 | part | Zombie arm | Power Station | Reactor area | Site/room callout | verified general site / unmeasured room |
| 64 | part | Jet Gun engine | Tunnel | Tunnel cars / M16 railing area | Variable-spawn site callout | variable within site |
| 65 | part | Jet Gun wires | Power Station | Near Tombstone / power exit room | Site/room callout | verified general site / unmeasured room |
| 66 | part | Jet Gun handbrake | The Prototype / Nacht der Untoten | Nacht bunker | Site/room callout | verified general site / unmeasured room |
| 67 | part | Jet Gun gauge | Hunter's Cabin | Hunter's Cabin | Site/room callout | verified general site / unmeasured room |
| 68 | part | NAV meteorite | Bus Depot | Wall opening outside Depot near Box | Site/room callout | verified general site / unmeasured room |
| 69 | part | NAV radio | The Prototype / Nacht der Untoten; OR Diner & Garage | Nacht bunker or Diner garage tall cabinet | Multi-site callout | multiple possible sites |
| 70 | part | NAV wooden board | Tunnel; OR Power Station | Tunnel by M16 or Power Station catwalk | Multi-site callout | multiple possible sites |
| 71 | part | NAV electrical box | Farm; OR Town, Bus Depot | Farm fridge area or Town back alley | Multi-site callout | multiple possible sites |
| 72 | part | Pack-a-Punch parts | Town | Bank underground | Site/room callout | verified general site / unmeasured room |
| 73 | part | Bus upgrade candidate | Bus Depot | Depot powered room | Site/room callout | verified general site / unmeasured room |
| 74 | part | Bus upgrade candidate | Diner & Garage | Diner shed powered room | Site/room callout | verified general site / unmeasured room |
| 75 | part | Bus upgrade candidate | Farm | Farm powered shed | Site/room callout | verified general site / unmeasured room |
| 76 | part | Bus upgrade candidate | Town | Rare Books Turbine room | Site/room callout | verified general site / unmeasured room |
| 77 | box | Mystery Box (initial) | Diner & Garage | Garage | Site/room callout | verified general site / unmeasured room |
| 78 | box | Mystery Box spawn | Bus Depot | Outside Bus Depot | Variable-spawn site callout | variable within site |
| 79 | box | Mystery Box spawn | Farm | Farmhouse balcony | Variable-spawn site callout | variable within site |
| 80 | box | Mystery Box spawn | Power Station | Power room | Variable-spawn site callout | variable within site |
| 81 | box | Mystery Box spawn | Town | Bar upstairs | Variable-spawn site callout | variable within site |
| 82 | box | Mystery Box spawn | Town | Town back alley | Variable-spawn site callout | variable within site |
| 83 | goal | Tower of Babble Pylon | Obelisk Tower / Pylon | Beneath electric tower | Site/room callout | verified general site / unmeasured room |
| 84 | goal | Streetlight / possible EMP target | Bus Depot | By Bus Depot | No fixed pin | non-spatial |
| 85 | goal | Streetlight / possible EMP target | Diner & Garage | Diner outskirts | No fixed pin | non-spatial |
| 86 | goal | Streetlight / possible EMP target | Farm | Farm road | No fixed pin | non-spatial |
| 87 | goal | Streetlight / possible EMP target | Hunter's Cabin | Hunter's Cabin road | No fixed pin | non-spatial |
| 88 | secret | Carrion teddy bear 1 | Bus Depot | Bench outside Bus Depot | Site/room callout | verified general site / unmeasured room |
| 89 | secret | Carrion teddy bear 2 | Farm | Farmhouse upstairs mattress | Site/room callout | verified general site / unmeasured room |
| 90 | secret | Carrion teddy bear 3 | Town | Town bar | Site/room callout | verified general site / unmeasured room |
| 91 | secret | Weapon storage fridge | Farm | Farmhouse | Site/room callout | verified general site / unmeasured room |
| 92 | secret | Bank deposits and withdrawals | Town | Bank vault | Site/room callout | verified general site / unmeasured room |
| 93 | secret | Hidden Nacht der Untoten | The Prototype / Nacht der Untoten | Cornfield side path | Site/room callout | verified general site / unmeasured room |
| 94 | secret | Denizen portal | Diner & Garage | Powered streetlight with Denizen | No fixed pin | non-spatial |
| 95 | secret | Diner → Town walking shortcut | Town | Fog route via church approach | No fixed pin | non-spatial |
| 96 | secret | Collapsing bridge | Bridge | Town return leg | Site/room callout | verified general site / unmeasured room |
| 97 | secret | NAV Table / NAV Card | Obelisk Tower / Pylon | Under pylon | Site/room callout | verified general site / unmeasured room |
| 98 | secret | Persistent upgrades (perma-perks) | Bus Depot | Across map | No fixed pin | non-spatial |
| 99 | secret | Farmhouse radio TV | Farm | Farmhouse interior | Site/room callout | verified general site / unmeasured room |
| 100 | secret | Town Morse-code traffic light | Town | Town streets | Site/room callout | verified general site / unmeasured room |
| 101 | secret | Ghostly laughter | Obelisk Tower / Pylon | Under the Pylon | No fixed pin | non-spatial |
| 102 | secret | Bus Depot power announcements | Bus Depot | Depot hall | No fixed pin | non-spatial |
| 103 | secret | POWER! and Nuke Donkey posters | Bus Depot | Depot starting hall | Site/room callout | verified general site / unmeasured room |
| 104 | secret | Sniper-scope pre-apocalypse reflection | Diner & Garage | Diner area / sniper scopes | No fixed pin | non-spatial |
| 105 | secret | Bank teammate point sharing | Town | Bank vault / teller counter | Site/room callout | verified general site / unmeasured room |
| 106 | secret | Bank storage limit and fee | Town | Bank vault | Site/room callout | verified general site / unmeasured room |
| 107 | secret | Weapon Locker restrictions | Farm | Farmhouse fridge | Site/room callout | verified general site / unmeasured room |
| 108 | secret | First Mystery Box and EMP Grenades | Diner & Garage | Diner garage | No fixed pin | non-spatial |
| 109 | secret | Persistent Quick Revive upgrade | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 110 | secret | Persistent Juggernog upgrade | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 111 | secret | Persistent headshot damage upgrade | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 112 | secret | Persistent steel barriers | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 113 | secret | Persistent Insta-Kill bonus | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 114 | secret | Persistent Double Points discount | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 115 | secret | Persistent sniper and pistol bonuses | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 116 | secret | Persistent Better Box bonus | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 117 | secret | Persistent cash-back perk bonus | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 118 | secret | Persistent Olympia Ray Gun wall-buy | Bus Depot | Bus Depot / Olympia | No fixed pin | non-spatial |
| 119 | secret | Persistent Tombstone bonus | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 120 | secret | Persistent Steel Carpenter bonus | Bus Depot | Map-wide profile bonus (reference pin only) | No fixed pin | non-spatial |
| 121 | secret | Achievement: Tower of Babble | Obelisk Tower / Pylon | Pylon · main quest | No fixed pin | non-spatial |
| 122 | secret | Achievement: Don't Fire Until You See | Bus Depot | Every zone · start tracking here | No fixed pin | non-spatial |
| 123 | secret | Achievement: Standard Equipment May Vary | Bus Depot | Map-wide buildables | No fixed pin | non-spatial |
| 124 | secret | Achievement: Undead Man's Party Bus | Bus Depot | Bus upgrades | No fixed pin | non-spatial |
| 125 | secret | Achievement: You Have No Power Over Me | Obelisk Tower / Pylon | Avogadro encounter | No fixed pin | non-spatial |
| 126 | secret | Achievement: I Don't Think They Exist | Obelisk Tower / Pylon | Fog / Denizen territory | No fixed pin | non-spatial |
| 127 | secret | Achievement: Fuel Efficient | Diner & Garage | Denizen portal at streetlight | No fixed pin | non-spatial |
| 128 | secret | Achievement: Happy Hour | Bus Depot | Two perks before main power | No fixed pin | non-spatial |
| 129 | secret | Achievement: The Lights of Their Eyes | Diner & Garage | Group of zombies / EMP | No fixed pin | non-spatial |
| 130 | secret | Achievement: Dance On My Grave | Power Station | Tombstone Soda / co-op | No fixed pin | non-spatial |

## Conditions for a defensible exact-icon certification

Every world item needs (1) a source screenshot/video frame with fixed in-game identity, (2) resolved building/floor, (3) a measured point against an accurately registered floor plan, (4) alternate spawn candidates separately and accurately marked, (5) verified door/upgrade game mode, (6) independent verification from another frame/source or player test, (7) a versioned test preventing icon displacement. This is not currently achieved for each of the 130 entries. A broad-region schematic is not a substitute for this evidence.