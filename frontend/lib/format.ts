const hemisphere = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`;

export const formatCoordinates = (latitude: number, longitude: number) =>
  `${hemisphere(latitude, "N", "S")}, ${hemisphere(longitude, "E", "W")}`;

export const formatSigned = (value: number, digits = 1) => {
  const rounded = Number(value.toFixed(digits));
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : "±"}${Math.abs(rounded).toFixed(digits)}`;
};

export const formatYears = (start: number, end: number) => `${start}–${end}`;
