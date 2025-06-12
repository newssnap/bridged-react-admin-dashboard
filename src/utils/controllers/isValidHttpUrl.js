export default function isValidHttpUrl(string) {
  // Regular expression pattern to validate URLs
  const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

  // Use the `test` method to check if the string matches the pattern
  return urlPattern.test(string);
}

export const isValidGaPropertyId = propertyId => {
  // Regex pattern for both Universal Analytics (UA) and GA4 property IDs
  const gaPropertyIdPattern = /^(UA-\d{4,10}-\d{1}|G-[A-Z0-9]{10})$/;
  return gaPropertyIdPattern.test(propertyId);
};
