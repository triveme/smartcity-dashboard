export function validateUrl(val: string): boolean {
  const urlRegex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
  return urlRegex.test(val);
}

export function validateLat(mapLatitude: number | undefined): boolean {
  if (mapLatitude) {
    if (isNaN(mapLatitude)) {
      return false;
    }
    if (mapLatitude < -90 || mapLatitude > 90) {
      return false;
    }
  } else {
    return false;
  }
  return true;
}

export function validateLong(mapLongitude: number | undefined): boolean {
  if (mapLongitude) {
    if (isNaN(mapLongitude)) {
      return false;
    }
    if (mapLongitude < -180 || mapLongitude > 180) {
      return false;
    }
  } else {
    return false;
  }
  return true;
}
