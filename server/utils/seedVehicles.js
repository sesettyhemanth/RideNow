const fs = require('fs');
const path = require('path');
const Vehicle = require('../models/Vehicle');

const vehicleTypes = ['bike', 'scooter', 'car'];

const EXTENSION_TO_MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function loadImageFile(fileName) {
  if (!fileName) return null;

  const imagePath = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', fileName);

  if (!fs.existsSync(imagePath)) {
    return null;
  }

  const ext = path.extname(fileName).toLowerCase();
  const contentType = EXTENSION_TO_MIME[ext] || 'image/jpeg';

  return { data: fs.readFileSync(imagePath), contentType };
}

async function seedVehicles() {
  const existingCount = await Vehicle.countDocuments();

  if (existingCount > 0) {
    return;
  }

  const vehiclesToInsert = [];
  let vehiclesWithoutPhotos = 0;

  for (const type of vehicleTypes) {
    const filePath = path.join(__dirname, '..', 'seed', `${type}.json`);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const vehicles = JSON.parse(rawData);

    vehicles.forEach(({ id, image, ...vehicle }) => {
      const loadedImage = loadImageFile(image);
      if (!loadedImage) vehiclesWithoutPhotos += 1;

      vehiclesToInsert.push({
        ...vehicle,
        type,
        images: loadedImage ? [loadedImage] : [],
      });
    });
  }

  await Vehicle.insertMany(vehiclesToInsert);
  console.log(`Seeded ${vehiclesToInsert.length} vehicles into MongoDB`);

  if (vehiclesWithoutPhotos > 0) {
    console.log(
      `${vehiclesWithoutPhotos} of them have no photo yet - add real images from Admin -> Vehicles, ` +
        `or drop files into frontend/public/images/ before the FIRST server start (see that folder's README.md)`
    );
  }
}

module.exports = seedVehicles;
