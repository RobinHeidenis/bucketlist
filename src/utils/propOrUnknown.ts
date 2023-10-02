export const propOrUnknown = <T>(prop: T | undefined | null): T | 'Unknown' => {
  if (prop === undefined || prop === null) return 'Unknown';
  return prop;
};
