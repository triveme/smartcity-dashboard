const searchSensorsByQuery = (
  sensors: (number | string)[],
  filter: string,
): (string | number)[] => {
  const data = sensors.filter((sensor) => {
    if (typeof sensor === 'string') {
      return sensor
        .toLocaleLowerCase()
        .trim()
        .includes(filter.toLocaleLowerCase().trim());
    } else {
      const string = sensor.toString().trim().includes(filter.trim());
      return Number(string);
    }
  });
  return data;
};

export default searchSensorsByQuery;
