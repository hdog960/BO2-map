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

## Interactive map-first interface

The home screen is the geographically referenced **TranZit map**. Every major area has tappable icons with an **always-visible key** for perks, wall buys, doors (paid/Turbine/special), parts, benches, boxes, secrets and Easter egg locations. Tapping a marker opens information on the map; the **+N** site markers reveal the other items associated with each location. Icons describe site/room areas, not unverified exact pickup coordinates.

The bottom navigation provides a **separate EASTER EGG tab** with the complete Maxis/Richtofen checklists and four-player assignments. The walkthrough's **Show location** buttons return to a marked site on the map. Search, site floor diagrams and buildable checklists are supporting views.

The map supports touch pan/pinch zoom, a Full map view and local part/door tracking. All content stays available offline after an online cache load. See ROADMAP.md (M10) for implementation and accuracy boundaries.

## Diagnose iPhone map lag

If dragging or pinching the map feels jerky, open the **Map** tab, tap **Scan**, then **Start 15-second scan**. Move the map with one finger and pinch-zoom with two fingers while the scan records. When it finishes, tap **Copy report** and paste the text into the ChatGPT development conversation. If iOS blocks clipboard access, the report remains selectable in the text box.

The scan measures frame pacing, touch events and local SVG map-update cost. It runs entirely on the phone without a backend. No game saves, account data or precise location are collected, and no report is transmitted unless you manually share it.

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
