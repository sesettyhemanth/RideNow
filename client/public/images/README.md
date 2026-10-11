# Vehicle Images (optional, first-run only)

Vehicle photos are saved on the backend (`backend/uploads/vehicles/`) with
just the file name stored in MongoDB — you add and manage them from
**Admin → Vehicles** (upload up to 5 photos per vehicle, different angles,
right from the browser).

This folder only matters for the very first time you start the backend, if
you want the starter catalog to come pre-loaded with photos instead of empty
placeholders. If you drop files here using **exactly** these names *before*
your first `npm run dev`, `utils/seedVehicles.js` will copy them into
`backend/uploads/vehicles/` and link them to the vehicles automatically:

## Bikes
- yamaha-r15-v4.jpg
- hero-xtreme-160r.jpg
- honda-sp-125.jpg

## Scooters
- honda-activa-6g.jpg
- tvs-jupiter-125.jpg

## Cars
- maruti-swift.jpg
- hyundai-i20.jpg
- kia-seltos.jpg
- toyota-innova-crysta.jpg

If you skip this, that's fine too — those vehicles just start out with no
photos, and you (or anyone with the admin login) can upload real ones from
the Admin → Vehicles page at any time. Once the database has been seeded
once, files placed in this folder afterward are never read again.
