import { serverURL } from '../api.js';

export function vehicleImageUrl(vehicle, index = 0) {
  return `${serverURL}/api/vehicles/${vehicle.type}/${vehicle.id}/images/${index}`;
}

export function vehicleImageCount(vehicle) {
  return vehicle.imageCount || 0;
}
