/* TranZit Field Atlas data — authored map schematic, source-grounded labels. */
window.TZ_DATA=(function(){
const zones=[
{id:"depot",name:"Bus Depot",short:"DEPOT",x:566,y:321,stop:1,description:"Starting hall, Turbine bench, Quick Revive, 750-point exit and two Turbine-access doors."},
{id:"tunnel",name:"Tunnel",short:"TUNNEL",x:647,y:157,description:"Bus slows; jump off for the M16 and Jet Gun engine."},
{id:"diner",name:"Diner & Garage",short:"DINER",x:502,y:48,stop:2,description:"Speed Cola, first Mystery Box, Zombie Shield, Galvaknuckles and bus-part shed."},
{id:"farm",name:"Farm",short:"FARM",x:161,y:87,stop:3,description:"Barn, farmhouse, Double Tap, Turret, weapon-storage fridge, bus-part shed."},
{id:"nacht",name:"The Prototype / Nacht der Untoten",short:"NACHT",x:52,y:210,description:"Hidden in cornfield; Jet Gun handbrake and possible NAV radio."},
{id:"pylon",name:"Obelisk Tower / Pylon",short:"PYLON",x:216,y:220,description:"Tower of Babble objective and NAV Table workbench."},
{id:"power",name:"Power Station",short:"POWER",x:78,y:433,stop:4,description:"Power switch, Tombstone, Electric Trap, Pack-a-Punch remote door."},
{id:"cabin",name:"Hunter's Cabin",short:"CABIN",x:240,y:320,description:"Bowie Knife and Jet Gun pressure gauge."},
{id:"town",name:"Town",short:"TOWN",x:348,y:206,stop:5,description:"Bank, bar, Juggernog, Stamin-Up, Jet Gun bench, Pack-a-Punch."},
{id:"bridge",name:"Bridge",short:"BRIDGE",x:494,y:209,description:"Return route toward Bus Depot; collapses after first bus crossing."}
];
const types={
stop:{name:"Stops",color:"#e7b969",short:"S"},perk:{name:"Perks",color:"#79d2a0",short:"P"},weapon:{name:"Wall buys",color:"#8ba9e3",short:"W"},part:{name:"Parts",color:"#dbb274",short:"+"},bench:{name:"Benches",color:"#9fd7d2",short:"B"},paid:{name:"Paid doors",color:"#e79a68",short:"$"},turbine:{name:"Turbine doors",color:"#e6da73",short:"T"},special:{name:"Special doors",color:"#d19cda",short:"!"},box:{name:"Mystery Box",color:"#bba2f1",short:"?"},secret:{name:"Secrets",color:"#b5c58b",short:"★"},goal:{name:"Quest points",color:"#e48d84",short:"⚡"}
};
const items=[];
function add(type,zone,name,room,price,detail){const id=[type,zone,name,room||""].join("-").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");const legacyId=type+"-"+String(items.length+1);items.push({id:id,legacyId:legacyId,type:type,zone:zone,name:name,room:room||"",price:price||"",detail:detail||""});return id}
zones.forEach(z=>{if(z.stop)add("stop",z.id,z.name,"Bus stop "+z.stop,"",z.description)});
add("perk","depot","Quick Revive","Depot hall, hallway near main door","1500","Co-op price. Needs main power or a nearby Turbine; 500 points solo.");
add("perk","diner","Speed Cola","Diner interior by MP5","3000","Requires power or Turbine.");
add("perk","farm","Double Tap Root Beer","Barn upper level","2000","Requires power or Turbine.");
add("perk","power","Tombstone Soda","Power exit / catwalk","2000","Co-op only. Requires power or Turbine.");
add("perk","town","Juggernog","Burning building upper floor","2500","Requires power or Turbine.");
add("perk","town","Stamin-Up","Bar ground floor","2000","Requires power or Turbine.");
add("weapon","depot","M14","Starting hall","500","Wall gun.");
add("weapon","depot","Olympia","Starting hall","500","Wall shotgun.");
add("weapon","depot","B23R","Inside the moving bus","1000","Bus wall gun; available while riding.");
add("weapon","tunnel","Colt M16A1","Tunnel maintenance ramp","1200","Jump off bus at tunnel.");
add("weapon","diner","MP5","Diner interior near Speed Cola","1000","Wall SMG.");
add("weapon","diner","Galvaknuckles","Diner roof","6000","Access using bus roof hatch upgrade placed on diner roof.");
add("weapon","farm","Remington 870 MCS","Barn ground floor","1500","Wall shotgun.");
add("weapon","farm","Claymores","Farm shed (Turbine)","1000","Buy after powering shed.");
add("weapon","power","AK-74u","Exterior of Power Station outhouse","1200","Wall SMG.");
add("weapon","cabin","Bowie Knife","Hunter's Cabin interior","3000","Melee weapon.");
add("weapon","town","Semtex","Rare Books / Turbine room","250","Price according to ZFRR; some older guides list higher values.");
add("bench","depot","Turbine bench","Depot hall","","Mannequin, fan and tail.");
add("bench","diner","Zombie Shield bench","Garage","","Car door + hand trolley.");
add("bench","farm","Turret bench","Farmhouse ground level","","RPD, ammo bag, lawn mower; equipment requires Turbine.");
add("bench","power","Power switch bench","Reactor","","Power board + lever + zombie arm.");
add("bench","power","Electric Trap bench","Exit catwalk / top of stairs","","Battery + coil + TV screen; equipment needs a Turbine.");
add("bench","town","Jet Gun bench","Town bar next to Stamin-Up","","Engine, wires, handbrake, pressure gauge.");
add("bench","town","Pack-a-Punch bench","Bank underground hallway","","Machine + car battery + table legs. 5000 to upgrade a gun.");
add("bench","pylon","NAV Table bench","Under the pylon","","Four parts; not required for Tower of Babble.");
add("paid","depot","Depot main door","Hall exit","750","Opens from starting room to street.");
add("paid","diner","Diner entrance","Diner","750","Paid access; both diner entrance leaves open together.");
add("paid","diner","Garage entrance","Gas station garage","750","Access to Shield bench and early Mystery Box.");
add("paid","farm","Farm gate","Farm perimeter","750","Paid entrance into Farm area.");
add("paid","farm","Farmhouse door","Farmhouse ground floor","750","Access to turret bench and fridge.");
add("paid","power","Power Station outhouse","Outdoor outhouse","750","Drop down to underground switch room.");
add("paid","town","Bank door","Bank ground floor","1000","Enter Bank before breaching the vault.");
add("paid","town","Bar door","Town bar","750","Jet Gun bench and Stamin-Up inside.");
add("paid","town","Burning building door","Building near Bank","750","Upstairs Juggernog.");
add("turbine","depot","Depot power door A","Side garage","Turbine","Power to enter bus part room.");
add("turbine","depot","Depot power door B","Side garage exit","Turbine","Separate powered opening in Depot.");
add("turbine","diner","Diner shed","Beyond gas station","Turbine","Potential bus upgrade.");
add("turbine","farm","Farm shed doors","Between farmhouse and barn","Turbine","Two powered faces of same shed; potential bus upgrade and Claymores.");
add("turbine","power","Remote Pack-a-Punch door","Under Power Station / lightning symbol","Turbine","Leave a functioning Turbine here, then reach Town bank.");
add("turbine","town","Rare Books store","Turbine room in Town","Turbine","Semtex and possible bus upgrade.");
add("special","power","Station shutter","Power exit / catwalk","Power or Turbine","Opens with active power or locally applied Turbine.");
add("special","town","Bank vault outer door","Bank interior","Grenade","Blow open vault door with a grenade.");
add("special","town","Bank vault inner door","Bank inner vault","Grenade","A second grenade breach; Pack-a-Punch passage below.");
add("special","town","Pack-a-Punch passage door","Below the Bank","Remote Turbine","Opens when the Power Station lightning door is powered.");
add("part","depot","Turbine mannequin","By wall route map","","Fixed room location.");
add("part","depot","Turbine fan","Waiting room seats","","Fixed room location.");
add("part","depot","Turbine tail","Depot hall floor / pay phones","","Fixed room location.");
add("part","diner","Shield car door","Garage, restroom, car on lift or bench-side table","","Randomized within garage.");
add("part","diner","Shield hand trolley","Diner behind counter or far booth","","Randomized within diner.");
add("part","farm","Turret unusable RPD","Barn upper or farmhouse","","Alternate spawn.");
add("part","farm","Turret ammo bag","Farmhouse ground or upper shelves","","Alternate spawn.");
add("part","farm","Turret lawn mower","Behind farmhouse","","Outside behind back door.");
add("part","power","Electric Trap battery","Upstairs / catwalk room","","Check nearby spots in this room.");
add("part","power","Electric Trap coil","Upstairs / catwalk room","","Check nearby spots in this room.");
add("part","power","Electric Trap TV screen","Upstairs / catwalk room","","Check nearby spots in this room.");
add("part","power","Power board","Reactor area","","Power switch component.");
add("part","power","Power lever","Reactor area","","Power switch component.");
add("part","power","Zombie arm","Reactor area","","Power switch component.");
add("part","tunnel","Jet Gun engine","Tunnel cars / M16 railing area","","Multiple possible positions in tunnel.");
add("part","power","Jet Gun wires","Near Tombstone / power exit room","","Spawn after power activation/voice cue.");
add("part","nacht","Jet Gun handbrake","Nacht bunker","", "Near lamp, cabinet or stairs.");
add("part","cabin","Jet Gun gauge","Hunter's Cabin","", "By fireplace or on bed.");
add("part","depot","NAV meteorite","Wall opening outside Depot near Box","","NAV Table part.");
add("part","nacht","NAV radio","Nacht bunker or Diner garage tall cabinet","","NAV Table alternate spawn.");
add("part","tunnel","NAV wooden board","Tunnel by M16 or Power Station catwalk","","NAV Table alternate spawn.");
add("part","farm","NAV electrical box","Farm fridge area or Town back alley","","NAV Table alternate spawn.");
add("part","town","Pack-a-Punch parts","Bank underground","","Machine, car battery, table legs inside passage.");
add("part","depot","Bus upgrade candidate","Depot powered room","","One of hatch, ladder, bumper; or empty.");
add("part","diner","Bus upgrade candidate","Diner shed powered room","","One of hatch, ladder, bumper; or empty.");
add("part","farm","Bus upgrade candidate","Farm powered shed","","One of hatch, ladder, bumper; or empty.");
add("part","town","Bus upgrade candidate","Rare Books Turbine room","","One of hatch, ladder, bumper; or empty.");
add("box","diner","Mystery Box (initial)","Garage","950","Always starts here in TranZit.");
add("box","depot","Mystery Box spawn","Outside Bus Depot","950","Possible subsequent location.");
add("box","farm","Mystery Box spawn","Farmhouse balcony","950","Possible subsequent location.");
add("box","power","Mystery Box spawn","Power room","950","Possible subsequent location.");
add("box","town","Mystery Box spawn","Bar upstairs","950","Possible subsequent location.");
add("box","town","Mystery Box spawn","Town back alley","950","Possible subsequent location.");
add("goal","pylon","Tower of Babble Pylon","Beneath electric tower","","Both main Easter egg branches.");
add("goal","depot","Streetlight / possible EMP target","By Bus Depot","","Coordinate with crew; validate green-lit portals in match.");
add("goal","diner","Streetlight / possible EMP target","Diner outskirts","","Coordinate with crew; validate green-lit portals in match.");
add("goal","farm","Streetlight / possible EMP target","Farm road","","Verify active light and portal in match.");
add("goal","cabin","Streetlight / possible EMP target","Hunter's Cabin road","","Verify active light and portal in match.");
add("secret","depot","Carrion teddy bear 1","Bench outside Bus Depot","","First music teddy.");
add("secret","farm","Carrion teddy bear 2","Farmhouse upstairs mattress","","Second music teddy.");
add("secret","town","Carrion teddy bear 3","Town bar","","Third music teddy.");
add("secret","farm","Weapon storage fridge","Farmhouse","","Stores one weapon across games; match/game mode restrictions apply.");
add("secret","town","Bank deposits and withdrawals","Bank vault","","Points can carry between matches in supported online sessions.");
add("secret","nacht","Hidden Nacht der Untoten","Cornfield side path","","Hidden remnant of original World at War map.");
add("secret","diner","Denizen portal","Powered streetlight with Denizen","","Let a Denizen latch on and carry it to a streetlight to create a portal.");
add("secret","town","Diner → Town walking shortcut","Fog route via church approach","","Fog/Denizens; not a bus route.");
add("secret","bridge","Collapsing bridge","Town return leg","","Collapse on first bus crossing; bus still navigates.");
add("secret","pylon","NAV Table / NAV Card","Under pylon","","Separate cross-map secret; not a Tower of Babble prerequisite.");
add("secret","depot","Persistent upgrades (perma-perks)","Across map","","Hidden upgrades depend on specific actions and online profile.");
// Verified hidden interactions, achievements and player-reference landmarks.
add("secret","farm","Farmhouse radio TV","Farmhouse interior","","Interact with the old television for cryptic messages and radio transmissions.");
add("secret","town","Town Morse-code traffic light","Town streets","","Traffic signal blinks an encoded message about energy, light and the future.");
add("secret","pylon","Ghostly laughter","Under the Pylon","","An eerie child's laugh can be heard in the cornfield.");
add("secret","depot","Bus Depot power announcements","Depot hall","","Announcements can play over the depot speakers after activating main power.");
add("secret","depot","POWER! and Nuke Donkey posters","Depot starting hall","","Look at the wall posters and the tower hint.");
add("secret","diner","Sniper-scope pre-apocalypse reflection","Diner area / sniper scopes","","A sniper scope reflection shows the area before the Moon events; visual Easter egg.");
add("secret","town","Bank teammate point sharing","Bank vault / teller counter","","Hit the keys with Galvaknuckles or appropriate upgraded knife, then spend 1100 to drop 1000 for a teammate.");
add("secret","town","Bank storage limit and fee","Bank vault","","Store up to 250,000. Each 1000-point withdrawal returns 900 after a 100-point fee.");
add("secret","farm","Weapon Locker restrictions","Farmhouse fridge","","Stores one supported weapon, not the M1911, Ballistic Knife or wonder weapons.");
add("secret","diner","First Mystery Box and EMP Grenades","Diner garage","","Mystery Box starts here. EMP grenades are needed for Richtofen's end step and useful against Avogadro.");
add("secret","depot","Persistent Quick Revive upgrade","Map-wide profile bonus (reference pin only)","","Revive speed bonus from repeated revives; consult source reference for version-specific conditions.");
add("secret","depot","Persistent Juggernog upgrade","Map-wide profile bonus (reference pin only)","","A hidden health upgrade triggered by early deaths; not the Juggernog machine.");
add("secret","depot","Persistent headshot damage upgrade","Map-wide profile bonus (reference pin only)","","Bonus from repeated multi-headshot kills. Lost through poor headshot performance.");
add("secret","depot","Persistent steel barriers","Map-wide profile bonus (reference pin only)","","Repairing many barricades over rounds can strengthen the boards.");
add("secret","depot","Persistent Insta-Kill bonus","Map-wide profile bonus (reference pin only)","","Hidden insta-kill behavior triggered by specific kill/pickup timing.");
add("secret","depot","Persistent Double Points discount","Map-wide profile bonus (reference pin only)","","Hidden Half-Off bonus associated with Double Points performance.");
add("secret","depot","Persistent sniper and pistol bonuses","Map-wide profile bonus (reference pin only)","","Hidden points upgrades based on weapon use; see sourced conditions in references.");
add("secret","depot","Persistent Better Box bonus","Map-wide profile bonus (reference pin only)","","Hidden Mystery Box bonus obtained through repeated early purchases.");
add("secret","depot","Persistent cash-back perk bonus","Map-wide profile bonus (reference pin only)","","May refund points after perk purchases depending on profile conditions.");
add("secret","depot","Persistent Olympia Ray Gun wall-buy","Bus Depot / Olympia","Secret upgrade","Can replace Olympia wall buy when persistent condition is active; not guaranteed each match.");
add("secret","depot","Persistent Tombstone bonus","Map-wide profile bonus (reference pin only)","","Hidden perk retention upgrade distinct from buying Tombstone Soda.");
add("secret","depot","Persistent Steel Carpenter bonus","Map-wide profile bonus (reference pin only)","","Hidden Carpenter interaction with window kills.");
add("secret","pylon","Achievement: Tower of Babble","Pylon · main quest","75G","Complete either Maxis or Richtofen quest branch on Original.");
add("secret","depot","Achievement: Don't Fire Until You See","Every zone · start tracking here","30G","Open all TranZit doors in one run without being set on fire. Avoid lava and burning-zombie explosions.");
add("secret","depot","Achievement: Standard Equipment May Vary","Map-wide buildables","25G","Acquire four distinct items from Turbine, Shield, Turret, Electric Trap, Jet Gun in a game.");
add("secret","depot","Achievement: Undead Man's Party Bus","Bus upgrades","15G","Fit all three bus upgrades; do not spend roof hatch on the Diner.");
add("secret","pylon","Achievement: You Have No Power Over Me","Avogadro encounter","10G","Defeat Avogadro without getting attacked by it.");
add("secret","pylon","Achievement: I Don't Think They Exist","Fog / Denizen territory","10G","Kill a Denizen while latched onto you.");
add("secret","diner","Achievement: Fuel Efficient","Denizen portal at streetlight","10G","Use the alternative streetlight portal transit system.");
add("secret","depot","Achievement: Happy Hour","Two perks before main power","10G","Use Turbines to buy two different perks before activating the power switch.");
add("secret","diner","Achievement: The Lights of Their Eyes","Group of zombies / EMP","5G","Pacify ten or more zombies with one EMP Grenade.");
add("secret","power","Achievement: Dance On My Grave","Tombstone Soda / co-op","5G","Acquire your Tombstone after giving up when downed and returning for it next round.");
// Icon placement audit: distinguish grounded site associations from exact floor coordinates.
// This data deliberately does not fabricate exact pickup positions within buildings.
// Original TranZit reference layout: Afrochubman map key / credited BradyGames map layout.
// Location cross-checks: ZFRR TranZit locations, perks, weapons and buildables,
// community 2016 Black Ops II buildables and original-era Neoseeker door walkthrough.
const offMapReason=(item)=>{
 if(item.type==="stop")return "Site location is drawn as a numbered stop, not an item icon";
 if(item.name==="B23R")return "Moving wall-buy inside the bus; no stationary location";
 if(item.name.startsWith("Achievement:"))return "Achievement is a map-wide activity, not a fixed-world object";
 if(item.name.startsWith("Persistent ")||item.name==="Persistent upgrades (perma-perks)")return "Persistent/profile feature; not a permanently placed world object";
 if(item.name==="Sniper-scope pre-apocalypse reflection")return "Visual reference interaction, not a fixed world pickup";
 if(item.name==="Bus Depot power announcements")return "Audio event, not a physical collectible";
 if(item.name==="Ghostly laughter")return "Audio event, not a physical collectible";
 if(item.name==="First Mystery Box and EMP Grenades")return "Reference note; actual first Mystery Box already has its own marker";
 if(item.name==="Diner → Town walking shortcut")return "Walking route, not a static map object";
 if(item.name==="Denizen portal")return "Dynamic portal; depends on Denizen and streetlight interaction";
 if(item.name==="Streetlight / possible EMP target")return "Only an area-level possible portal; exact activated lamp varies by game";
 if(item.name==="Bus upgrade candidate")return null; // fixed shed, random item inside
 return null;
};
const multiZone={
 "NAV radio":["diner"],
 "NAV wooden board":["power"],
 "NAV electrical box":["town","depot"]
};
for(const item of items){
 const reason=offMapReason(item);
 item.mapMode=reason?"index-only":"site-callout";
 item.mapReason=reason||"Associated with this site, not a measured in-building coordinate";
 item.alternateZones=multiZone[item.name]||[];
 item.placementEvidence=item.type==="perk"||item.type==="weapon"||item.type==="bench"||item.type==="box"
   ?"ZFRR locations, weapons, perks and buildables"
   :item.type==="paid"||item.type==="turbine"||item.type==="special"
   ?"Neoseeker original-era door guide and ZFRR location notes"
   :item.type==="part"?"ZFRR buildables and 2016 CoDZ buildable guide"
   :"User-supplied Afrochubman/BradyGames world-map reference and community location guide";
 item.placementPrecision=item.mapMode==="index-only"?"non-spatial":
   item.alternateZones.length?"multiple possible sites":
   /random|alternate|possible|candidate/i.test(item.detail)?"variable within site":"reported general site / unmeasured room";
}
const builds=[
{id:"turbine",name:"Turbine",zone:"depot",location:"Depot hall",parts:[["Mannequin","By route map"],["Fan","Waiting seats"],["Tail","Hall floor / pay phones"]]},
{id:"shield",name:"Zombie Shield",zone:"diner",location:"Garage",parts:[["Car door","Garage: bathroom / car lift / table"],["Hand trolley","Diner: behind counter / far booth"]]},
{id:"turret",name:"Turret",zone:"farm",location:"Farmhouse ground floor",parts:[["Unusable RPD","Barn upstairs or farmhouse"],["Ammo bag","Farmhouse down/upstairs"],["Lawn mower","Behind farmhouse"]]},
{id:"trap",name:"Electric Trap",zone:"power",location:"Catwalk / upstairs workbench",parts:[["Battery","Near electric trap bench"],["Coil","Near electric trap bench"],["TV screen","Near electric trap bench"]]},
{id:"power",name:"Power switch",zone:"power",location:"Reactor",parts:[["Power board","Reactor"],["Lever","Reactor"],["Zombie arm","Reactor"]]},
{id:"jet",name:"Jet Gun",zone:"town",location:"Town bar",parts:[["Jet engine","Tunnel, several spots"],["Wires","Power Station room by Tombstone"],["Handbrake","Nacht bunker"],["Pressure gauge","Hunter's Cabin"]]},
{id:"pap",name:"Pack-a-Punch",zone:"town",location:"Under Town bank",parts:[["Machine","Underground bank"],["Car battery","Underground bank"],["Table legs","Underground bank"]]},
{id:"nav",name:"NAV Table",zone:"pylon",location:"Under pylon",parts:[["Meteorite","Outside Bus Depot"],["Radio","Nacht bunker or Diner garage"],["Wooden board","Tunnel or Power Station"],["Electrical box","Farm near fridge or Town alley"]]},
{id:"bus",name:"Bus upgrades",zone:"depot",location:"Four Turbine rooms; three upgrades, one empty",parts:[["Roof hatch","One of four upgrade rooms"],["Ladder","One of four upgrade rooms"],["Plow / bumper","One of four upgrade rooms"]]}
];
// Craftable-specific identity. Codes and colors label each part on the atlas and
// in the same saved-progress checklist (state.parts remains unchanged).
const buildAppearance={
 turbine:{code:"TB",color:"#e8c66a",note:"All three parts and bench are in the Bus Depot hall."},
 shield:{code:"ZS",color:"#8cabf6",note:"Parts split between the Diner and its garage; bench in the garage."},
 turret:{code:"TR",color:"#89dfab",note:"Parts are around Farm, with variable indoor spawns."},
 trap:{code:"ET",color:"#c6a0ef",note:"Parts near the Power Station upstairs catwalk; requires a Turbine to operate."},
 power:{code:"PS",color:"#efa56c",note:"All three pieces and the switch bench are in the reactor area."},
 jet:{code:"JG",color:"#6fd4e6",note:"Four separate part areas: Tunnel, Power Station, Nacht, Hunter's Cabin; bench in Town bar."},
 pap:{code:"PAP",color:"#f18b87",note:"Three pieces below the Town bank; requires the separate remote-Turbine door step."},
 nav:{code:"NAV",color:"#ed9bce",note:"Four components; several have alternate possible areas; bench under the Pylon."},
 bus:{code:"BUS",color:"#d3c0a0",note:"Three upgrades appear across four powered rooms (one empty); attach them directly to the bus."}
};
const componentNames={
 turbine:["Turbine mannequin","Turbine fan","Turbine tail"],
 shield:["Shield car door","Shield hand trolley"],
 turret:["Turret unusable RPD","Turret ammo bag","Turret lawn mower"],
 trap:["Electric Trap battery","Electric Trap coil","Electric Trap TV screen"],
 power:["Power board","Power lever","Zombie arm"],
 jet:["Jet Gun engine","Jet Gun wires","Jet Gun handbrake","Jet Gun gauge"],
 pap:["Pack-a-Punch parts","Pack-a-Punch parts","Pack-a-Punch parts"],
 nav:["NAV meteorite","NAV radio","NAV wooden board","NAV electrical box"],
 bus:["Bus upgrade candidate","Bus upgrade candidate","Bus upgrade candidate"]
};
const benchNames={
 turbine:"Turbine bench",shield:"Zombie Shield bench",turret:"Turret bench",
 trap:"Electric Trap bench",power:"Power switch bench",jet:"Jet Gun bench",
 pap:"Pack-a-Punch bench",nav:"NAV Table bench"
};
for(const b of builds){
 Object.assign(b,buildAppearance[b.id]);
 const names=componentNames[b.id]||[];
 for(let i=0;i<b.parts.length;i++){
  // A candidate may represent several possible spots, not separate physical copies.
  const name=names[i],catalog=items.filter(item=>item.type==="part"&&item.name===name);
  b.parts[i][2]=catalog.map(item=>item.id);
 }
 const bench=items.find(item=>item.type==="bench"&&item.name===benchNames[b.id]);
 b.benchItemId=bench?.id||null; // Bus upgrades are attached to the bus, not to a fixed crafting bench.
 for(const item of items.filter(i=>i.type==="part"&&names.includes(i.name))){
  item.buildId=b.id;
  const partIndex=names.indexOf(item.name);
  item.buildPartIndex=names.filter(x=>x===item.name).length===1?partIndex:null;
 }
 if(bench){bench.buildId=b.id;bench.buildKind="bench";}
}
const quests={
maxis:[
{title:"Build your Turbines",zone:"depot",note:"Build at least two Turbines at the Bus Depot starting hall. Four-player groups can bring extras for the final lamppost step."},
{title:"Build and turn on the power",zone:"power",note:"Pay 750 for the outhouse, assemble board/lever/zombie arm in the reactor, turn the power on and listen for Maxis."},
{title:"Switch the power OFF",zone:"power",note:"After Maxis speaks, turn the power off. Keep Turbines alive; put two beneath the Pylon."},
{title:"Prepare the Avogadro and EMP",zone:"pylon",note:"Draw the Avogadro during the lightning storm; the Mystery Box provides EMP grenades. Keep it alive until under the tower."},
{title:"Kill Avogadro beneath the Pylon",zone:"pylon",note:"EMP is reliable; two charged Turbines must be beneath the tower as the Avogadro is defeated. Listen for the Maxis confirmation."},
{title:"Power two separate streetlights",zone:"diner",note:"Once Maxis confirms the Avogadro charge, power two DIFFERENT lamps with functioning Turbines. Two players can move the original two Turbines from the Pylon."}
],
richtofen:[
{title:"Assign Samuel; activate power",zone:"power",note:"Build the power switch at Power Station and leave power ON. Samuel hears Richtofen's quest dialogue."},
{title:"Collect all four Jet Gun parts",zone:"tunnel",note:"Tunnel engine, Power Station wires, Nacht handbrake, Hunter's Cabin pressure gauge. Use Index → Parts to find spawn notes."},
{title:"Build Jet Gun in Town bar",zone:"town",note:"The Thrustodyne is built at the bar next to Stamin-Up. Keep one player assigned to carry it."},
{title:"Overload the Jet Gun under Pylon",zone:"pylon",note:"Fire the assembled Jet Gun toward the pylon until it overheats/breaks and Richtofen speaks to Samuel."},
{title:"Charge with explosive kills",zone:"pylon",note:"Kill zombies beneath the tower with explosives (standard Ray Gun counts). Community guides report about 25; listen for the confirming voice line."},
{title:"Secure EMP grenades",zone:"diner",note:"Spin the Mystery Box. Ideally all four players obtain EMPs for a simple final simultaneous throw."},
{title:"Plan four different lamppost targets",zone:"pylon",note:"Choose four distinct flickering green streetlights. Four players each take one lamp; a smaller team can prepare Denizen portals for quick travel."},
{title:"EMP four different lampposts",zone:"pylon",note:"Hit four DIFFERENT green streetlights in a short overlapping window. Four players can throw together; fewer players can use portals. Solo is exceptionally difficult."}
]};

/* Expanded, source-checked Tower of Babble field guide.
   Keep each route's original 6/8 objective slots for schema-1 save compatibility. */
const questGuide={
 maxis:{
  players:"2–4 players",power:"OFF after Maxis asks",gear:"2+ Turbines / EMP",
  intro:"Use working Turbines to charge the Pylon while defeating the Avogadro underneath it, then power two separate streetlights.",
  prep:[
   "Set difficulty to Original, not Easy. Start from the lobby if trying to update a previously saved quest side.",
   "At least two players are required; four make the finale easier. Each player can carry one Turbine.",
   "Build the Power Station switch, switch ON and listen to Maxis, then switch OFF when he asks.",
   "Get EMP Grenades from the Mystery Box and find the Pylon in the cornfield between Farm and Power Station.",
   "A NAV Table and Pack-a-Punch are not necessary for Tower of Babble."
  ],
  reminder:"With two players, move the two Turbines to separate lamps after the Avogadro charge succeeds. With four, leave two beneath the tower and place two others at lamps.",
  result:"Maxis confirms completion as orange electricity travels from the streetlights to the tower.",
  faq:[
   ["Do we need four players?","No. Two-player Maxis is possible. Both players use Turbines at the tower, then relocate them to different lamps after the Avogadro step is confirmed."],
   ["Why did the Avogadro not count?","Main power must be OFF, Avogadro must be directly under the tower, and the two Turbines must still be supplying energy. Keep the EMP blast away from the Turbines."],
   ["Do we need the NAV Table?","No. The NAV Table relates to the broader BO2 Victis story, not the Tower of Babble completion itself."]
  ]
 },
 richtofen:{
  players:"1–4 players*",power:"ON throughout",gear:"Jet Gun / explosives / EMP",
  intro:"Overload the Jet Gun under the Pylon, make explosive zombie kills beneath it, and EMP four distinct green streetlights.",
  prep:[
   "Use Original difficulty, not Easy. For a newly saved profile-side choice, start the match from the lobby.",
   "Build the power switch and leave the Power Station ON for the entire Richtofen route.",
   "Samuel Stuhlinger hears Richtofen's instructions. Other characters can perform actions, but Samuel provides crucial audio confirmation.",
   "Collect four Jet Gun parts; the Town bar has the build bench. Bring an explosive weapon and enough Mystery Box EMP Grenades.",
   "Four players are easiest. Two or three may chain Denizen portals. A solo strategy exists, but is highly luck- and timing-dependent. A NAV Table is not required."
  ],
  reminder:"Denizen portals are a travel workaround for smaller teams, not a mandatory prerequisite when four players can already stand at separate lampposts.",
  result:"Richtofen's closing dialogue plays and blue electricity links the streetlights to the tower.",
  faq:[
   ["Must four people play?","No. Four separate EMP lamp hits are needed, not necessarily four different throwers. With two or three players, use Denizen portals to chain hits. Solo requires difficult luck-sensitive timing and potentially a Max Ammo."],
   ["Why did the Jet Gun charge fail?","Fully cool it, then break it by firing under the Pylon with power ON. If Richtofen does not acknowledge it and the green lamps do not flicker, rebuild and retry."],
   ["Do all lamps need portals?","No. Four people can each EMP a distinct lamp without portals; smaller groups use portals to reach enough targets quickly."]
  ]
 }
};
const questStepDetails={
 maxis:[
  {actions:[
   "Find the mannequin, fan and tailfin parts inside the Bus Depot starting hall.",
   "Build a Turbine at the starting-room bench; a second player should build their own.",
   "Keep Turbines charged and ready; additional ones are helpful for larger teams."
  ],confirm:"At least two players have working Turbines.",warning:"A placed Turbine can expire, so carry spares if possible.",tool:"turbine"},
  {actions:[
   "At Power Station, purchase the 750-point outhouse access and drop into the laboratory.",
   "Find the board, lever and severed zombie arm, and add them to the power-switch blueprint.",
   "Activate the built power switch and listen for Maxis."
  ],confirm:"The main power comes on and Maxis begins speaking.",warning:"The remote Pack-a-Punch lightning door is not the power switch."},
  {actions:[
   "Once Maxis asks you to shut the power down, turn the completed switch back OFF.",
   "Head to the Pylon in the cornfield between Farm and Power Station.",
   "Bring two usable Turbines and an EMP-equipped teammate underneath the tower."
  ],confirm:"Main power is OFF and the party is ready under the Pylon.",warning:"Keeping power ON is for Richtofen's route, not this one."},
  {actions:[
   "Get EMP Grenades from the Mystery Box before attempting the charged encounter.",
   "Watch for lightning directly above the Pylon, and end a round during the storm to attempt an Avogadro spawn.",
   "Lure the living Avogadro underneath the main tower and deploy two working Turbines there."
  ],confirm:"Maxis' energy dialogue plays while the Turbines operate under the Pylon.",warning:"Storm timing is not guaranteed every round. Do not waste the EMP before the Avogadro is properly positioned."},
  {actions:[
   "Check that main power is OFF and the two Turbines have energy.",
   "Lead the Avogadro into the Pylon footprint, then throw an EMP near him.",
   "Keep the EMP blast away from the Turbines and wait for Maxis to acknowledge the charge."
  ],confirm:"Maxis acknowledges the transfer of live energy to the tower.",warning:"If Maxis complains that your supplies are drained, replace any failed Turbine and repeat."},
  {actions:[
   "Choose two DIFFERENT streetlights (Bus Depot and Diner are convenient examples).",
   "With four players, two leave Turbines under the Pylon while two others place separate Turbines at the lamps.",
   "With two players, move the two original Turbines to different lamps AFTER the successful Avogadro step.",
   "Listen for Maxis' completion line and watch for the orange effect at the tower."
  ],confirm:"Two separate lamps send orange energy to the Pylon and Maxis completes the quest.",warning:"Both lamp Turbines must be functioning. Do not treat two hits at one lamp as two targets."}
 ],
 richtofen:[
  {actions:[
   "Start on Original difficulty, ideally from the lobby if changing the saved route.",
   "Build the board, lever and zombie arm into the Power Station switch and activate it.",
   "Keep main power ON. Identify the Samuel player who can hear Richtofen's dialogue."
  ],confirm:"Power remains ON and Samuel can hear the route cues.",warning:"Turning power off sends you down the Maxis setup."},
  {actions:[
   "Find the Jet Gun engine in the road Tunnel between Depot and Diner.",
   "Find the wires in the Power Station underground Tombstone / Electric Trap area.",
   "Find the handbrake in hidden Nacht der Untoten off the cornfield.",
   "Find the pressure gauge in Hunter's Cabin between Power Station and Town."
  ],confirm:"All four Jet Gun parts are collected.",warning:"Parts can have alternate exact positions within the listed zones. Nacht and the Cabin are not regular bus stops.",tool:"jet"},
  {actions:[
   "Carry the components to the Thrustodyne workbench inside the Town bar near Stamin-Up.",
   "Assemble the Jet Gun; have one player bring it to the Pylon.",
   "Let the Jet Gun cool completely before firing at the tower."
  ],confirm:"The assembled Jet Gun is ready and fully cooled.",warning:"Overheating breaks the gun; a failed tower attempt can mean rebuilding.",tool:"jet"},
  {actions:[
   "Stand right underneath the Pylon, leaving power ON.",
   "Fire a completely cooled Jet Gun upward until it overheats and breaks.",
   "Listen for Richtofen speaking to Samuel and check for flickering green streetlights."
  ],confirm:"Richtofen addresses Samuel and the green lamps start sparking.",warning:"A partly heated Jet Gun may not deliver the needed charge. Rebuild and retry after fully cooling."},
  {actions:[
   "Stay under the Pylon with the main power still ON.",
   "Kill about 25 zombies with explosive damage; the Ray Gun and Ray Gun Mark II are commonly used.",
   "Teammates may contribute; continue until Samuel hears Richtofen's confirming line."
  ],confirm:"Richtofen confirms the tower has sufficient explosive energy.",warning:"Ordinary gunfire may not count. Do not mark complete just because you counted 25 kills."},
  {actions:[
   "Spin the Mystery Box until the party has sufficient EMP Grenades for four lamp hits.",
   "Assign targets: ideally one lamp per EMP-equipped player in a four-player group.",
   "If fewer than four players, save supplies for rapid second throws after portal travel."
  ],confirm:"Enough EMP throws are available for four different lampposts.",warning:"EMP supply is random; do not initiate the finale until everyone is stocked and positioned."},
  {actions:[
   "Identify four separate green/flickering lamps around TranZit.",
   "With four players, station one person at each different lamp; portals are optional.",
   "With two or three, let a Denizen latch onto a player near a lamp to open a teleporter as a shortcut to another lamp.",
   "Agree on who will target each lamp and synchronize the final attempt."
  ],confirm:"Four distinct lamps have owners and the team is ready.",warning:"Hitting one lamppost twice does not replace a fourth unique target. Portals have unpredictable exits."},
  {actions:[
   "Hit four DIFFERENT green lamps with EMPs in a short overlapping window.",
   "Four players: throw together at assigned lamps. Two or three: one player EMPs a lamp, portals, and quickly EMPs another.",
   "Solo: an advanced, luck-sensitive sequence with prepared portals and possibly a timed Max Ammo; success is not guaranteed.",
   "Wait for Richtofen's final voice line and blue electrical effect."
  ],confirm:"Richtofen congratulates Samuel and blue energy links the lamps to the Pylon.",warning:"Four different targets are mandatory; four different players are not. Check timing and lamp uniqueness if it fails."}
 ]};
for(const side of Object.keys(quests)){
 quests[side].forEach((step,i)=>Object.assign(step,questStepDetails[side][i]));
}

const plans={
depot:{floors:[{name:"Ground",rooms:[{name:"Starting hall",x:22,y:65,w:265,h:150},{name:"Quick Revive hall",x:287,y:90,w:100,h:100},{name:"Garage / powered room",x:387,y:65,w:165,h:150},{name:"Bus stop outside",x:210,y:260,w:185,h:75}]}]},
diner:{floors:[{name:"Ground",rooms:[{name:"Diner",x:25,y:76,w:225,h:155},{name:"Gas station garage",x:270,y:76,w:195,h:155},{name:"Powered shed",x:475,y:115,w:110,h:116},{name:"Bus stop",x:213,y:258,w:160,h:62}]},{name:"Roof",rooms:[{name:"Diner roof",x:105,y:70,w:320,h:170},{name:"Hatch access",x:231,y:250,w:160,h:60}]}]},
farm:{floors:[{name:"Ground",rooms:[{name:"Barn",x:30,y:66,w:220,h:172},{name:"Farmhouse",x:330,y:66,w:200,h:172},{name:"Turbine shed",x:260,y:125,w:63,h:100},{name:"Backyard mower",x:338,y:260,w:180,h:58}]},{name:"Upper",rooms:[{name:"Barn upper / Double Tap",x:30,y:70,w:220,h:160},{name:"Farmhouse upstairs",x:330,y:70,w:220,h:160},{name:"Farmhouse balcony",x:370,y:240,w:140,h:70}]}]},
power:{floors:[{name:"Exterior",rooms:[{name:"Outhouse entry",x:155,y:58,w:220,h:120},{name:"AK-74u wall",x:382,y:85,w:160,h:70}]},{name:"Underground",rooms:[{name:"Reactor / switch",x:85,y:58,w:230,h:214},{name:"Lightning door to PaP",x:318,y:88,w:150,h:106},{name:"Catwalk / Tombstone / Trap",x:317,y:201,w:235,h:104}]}]},
town:{floors:[{name:"Street",rooms:[{name:"Bank",x:24,y:63,w:230,h:170},{name:"Bar",x:295,y:63,w:235,h:170},{name:"Burning building",x:325,y:248,w:205,h:83},{name:"Rare Books",x:30,y:255,w:190,h:76}]},{name:"Upper",rooms:[{name:"Juggernog floor",x:24,y:66,w:250,h:180},{name:"Bar upstairs / Box",x:310,y:66,w:225,h:180}]},{name:"Underground",rooms:[{name:"Bank inner vault",x:35,y:73,w:220,h:175},{name:"Pack-a-Punch passage",x:260,y:73,w:275,h:175}]}]}
};
const references=[
{name:"Original 2012 Treyarch-authorized route reference",url:"https://ptgmedia.pearsoncmg.com/imprint_downloads/brady/colin/black_ops_2_zombies_supplement_11-12.pdf"},
{name:"ZFRR TranZit locations",url:"https://zfrr.me/hub/tranzit-locations/"},
{name:"ZFRR TranZit buildables",url:"https://zfrr.me/hub/tranzit-buildables/"},
{name:"ZFRR TranZit perks",url:"https://zfrr.me/hub/tranzit-perks-and-power/"},
{name:"ZFRR TranZit weapons",url:"https://zfrr.me/hub/tranzit-weapons/"},
{name:"ZFRR Tower of Babble",url:"https://zfrr.me/hub/tranzit-easter-egg/"},
{name:"Call of Duty Wiki / Fandom Tower of Babble walkthrough",url:"https://callofduty.fandom.com/wiki/Tower_of_Babble#Walkthrough"},
{name:"Call of Duty Zombies Guides walkthrough",url:"https://www.codzombiesguides.com/main-quests/black-ops-2/tranzit/"},
{name:"Secrets and Easter eggs reference",url:"https://zfrr.me/hub/tranzit-secrets/"},
{name:"Persistent-upgrades reference",url:"https://zfrr.me/hub/tranzit-persistent-upgrades/"},
{name:"Ten achievements reference",url:"https://zfrr.me/hub/tranzit-achievements/"},
{name:"Original-era door checklist",url:"https://www.neoseeker.com/call-of-duty-black-ops-ii/faqs/272171-call-of-duty-bo2.html"},
{name:"Call of Duty Zombies Richtofen quest",url:"https://www.callofdutyzombies.com/zombie-library/zombies-library/black-ops_ii/tranzit/side-quest-easter-egg-%E2%80%93-tower-of-babble-~-obey-richtofen-r297/"}
];
return {zones,types,items,builds,quests,questGuide,plans,references};
})();