const localStorageKey = "kafuffle-data";

const defaultData = {
  selectedSpaceId: null,
  selectedZoneId: null,
};

export const getSpace = () => {
  const data = localStorage.getItem(localStorageKey);
  return data ? JSON.parse(data).selectedSpaceId : defaultData.selectedSpaceId;
};

export const getZone = () => {
  const data = localStorage.getItem(localStorageKey);
  return data ? JSON.parse(data).selectedZoneId : defaultData.selectedZoneId;
};

export const setSpace = (spaceId: string) => {
  const data = localStorage.getItem(localStorageKey);
  const newData = data ? JSON.parse(data) : defaultData;

  newData.selectedSpaceId = spaceId;
  localStorage.setItem(localStorageKey, JSON.stringify(newData));
};

export const setZone = (zoneId: string) => {
  const data = localStorage.getItem(localStorageKey);
  const newData = data ? JSON.parse(data) : defaultData;

  newData.selectedZoneId = zoneId;
  localStorage.setItem(localStorageKey, JSON.stringify(newData));
};

export const clearStorage = () => {
  localStorage.removeItem(localStorageKey);
};
