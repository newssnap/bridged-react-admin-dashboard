export default function flattenObject(obj) {
  // Initialize the result object.
  const result = {};

  function recurse(current, prop) {
    if (Object(current) !== current) {
      // If the current item is not an object, add it to the result.
      result[prop] = current;
    } else if (Array.isArray(current)) {
      // If it's an array, iterate through its elements.
      for (let i = 0; i < current.length; i++) {
        // Recursively process each element with an indexed property.
        recurse(current[i], prop + "[" + i + "]");
      }
      // Handle the case of an empty array.
      if (current.length === 0) {
        result[prop] = [];
      }
    } else {
      // If it's an object, iterate through its properties.
      let isEmpty = true;
      for (let p in current) {
        isEmpty = false;
        // Recursively process each property with a dot-separated property path.
        recurse(current[p], prop ? prop + "." + p : p);
      }
      // Handle the case of an empty object.
      if (isEmpty && prop) {
        result[prop] = {};
      }
    }
  }

  // Start the recursion with an empty property path.
  recurse(obj, "");
  return result;
}
