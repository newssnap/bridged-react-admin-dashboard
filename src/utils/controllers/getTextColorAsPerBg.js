// A helper function to determine if a color is dark or light
function isDarkColor(hexColor) {
  if (!hexColor || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexColor)) {
    return true; // Return black for undefined or invalid input
  }

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const relativeLuminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return relativeLuminance > 0.5;
}

// A helper function to get text color (black or white) based on background color
function getTextColor(hexColor) {
  return isDarkColor(hexColor) ? 'black' : 'white';
}

export default getTextColor;
