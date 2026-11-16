# TranZit Field Atlas

An independent, unofficial **Black Ops II TranZit** interactive atlas for **four-player Tower of Babble** runs on iPhone.

**Open app:** https://hdog960.github.io/BO2-map/

## Features
- Original SVG overview: five bus stops, landmarks, route, touch pan/pinch and category filters.
- Perks, wall guns, Mystery Box spots, parts, benches, doors and prices/requirements.
- Conceptual interior diagrams for Bus Depot, Diner, Farm, Power Station and Town.
- Separate Maxis and Richtofen quest trackers, four editable player names and assignments.
- Searchable field index of 130 entries including all ten achievements.
- Manually saved local progress, part tracker, no account or backend.
- Offline service worker and Home Screen manifest.

## Refined interface
The phone app now opens to a clear, interactive world map with a concise **next Easter egg objective** card. The bottom bar is organized by what players do mid-match: **Map / Quest / Find / Sites / Crew**. Map filters are grouped into **Route / Easter egg / Gear / Doors** with extra layers optional. The quest highlights what to do next, Find supports common searches, Sites has an easy location selector, and Crew organizes parts into compact expandable buildable checklists.

All match and player progress remains on-device in the same saved-data key. No live game telemetry or cross-device synchronization is claimed. For detailed implementation and pending accuracy work, see ROADMAP.md.

## Install on iPhone
1. Open the app in Safari while online.
2. Use Share > Add to Home Screen.
3. Launch it once while online to cache its files.
4. Confirm the label OFFLINE READY, then check airplane-mode launch before relying on it.

The app cannot read your actual game session or synchronize across friends' phones.

## Accuracy
The hand-drawn SVG was **redrawn to follow the user-supplied “TranZit Map Key” by Afrochubman**, which credits the original map layout to BradyGames. It now includes the source-shaped roads, central Town junction, east-side Tunnel highway, north Farm–Diner connection, bridge, Power Station loop, and opposing Prototype/Nacht and Obelisk/Pylon landmarks. It is not to scale. **Interior rectangles are schematic conceptual diagrams, not verified floor geometry.** Map pins indicate relevant areas, not exact pickup coordinates. Some parts spawn in multiple possible places.

Status: first version with a geographically corrected world map committed and checked by automated tests. Exact-head GitHub Pages status should be checked after edits. Physical iPhone playtesting is not yet verified. See ROADMAP.md for gates and remaining work.

## Tests
Requires Node 22, no dependencies. Run the JavaScript syntax check and the Node test suite from tests/. GitHub Actions checks automatically after every push.

## Research references
- https://ptgmedia.pearsoncmg.com/imprint_downloads/brady/colin/black_ops_2_zombies_supplement_11-12.pdf
- https://zfrr.me/hub/tranzit-locations/
- https://zfrr.me/hub/tranzit-buildables/
- https://zfrr.me/hub/tranzit-perks-and-power/
- https://zfrr.me/hub/tranzit-weapons/
- https://zfrr.me/hub/tranzit-easter-egg/
- https://www.neoseeker.com/call-of-duty-black-ops-ii/faqs/272171-call-of-duty-bo2.html

Unofficial fan project. No game screenshots or borrowed game artwork are bundled.
