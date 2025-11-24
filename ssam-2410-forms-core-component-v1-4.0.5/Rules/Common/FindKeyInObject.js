/**
 * Given a set of possible keys, find the first key that is present in the
 * object using a case-insensitive search.
 * @param {Object} object - The object to search.
 * @param {Array} possibleKeys - The possible keys to search for.
 * @returns {string|undefined} The original key if matched (with its case
 *   unchanged), otherwise undefined.
 */
export default function FindKeyInObject(object, possibleKeys) {
  // Convert all object keys to lowercase for case-insensitive comparison
  const normalizedData = Object.keys(object).reduce((acc, key) => {
    acc[key.toLowerCase()] = key;
    return acc;
  }, {});
  // Find the first matching key, converting possible keys to lowercase for comparison
  const matchedNormalizedKey = possibleKeys.map(key => key.toLowerCase()).find(key => key in normalizedData);
  // Return the original key if found, otherwise undefined
  return matchedNormalizedKey ? normalizedData[matchedNormalizedKey] : undefined;
}