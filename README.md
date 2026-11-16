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

## Install on iPhone
1. Open the app in Safari while online.
2. Use Share > Add to Home Screen.
3. Launch it once while online to cache its files.
4. Confirm the label OFFLINE READY, then check airplane-mode launch before relying on it.

The app cannot read your actual game session or synchronize across friends' phones.

## Accuracy
The hand-drawn SVG follows the geography of the 2012 Treyarch-authorized route map, but is not to scale. **Interior rectangles are schematic conceptual diagrams, not verified floor geometry.** Map pins indicate relevant areas, not exact pickup coordinates. Some parts spawn in multiple possible places.

Status: functional first version deployed on GitHub Pages; physical iPhone playtest is not yet verified. See ROADMAP.md for gates and remaining work.

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
