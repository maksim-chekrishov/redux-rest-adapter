/**
 * Created by m.chekryshov on 20.12.16.
 */

export function containsString(str, value) {
  return str.indexOf(value) !== -1;
}

export function hasCyclicReferences(obj) {
  var seenObjects = [];

  function detect(obj) {
    if (obj && typeof obj === 'object') {
      if (seenObjects.indexOf(obj) !== -1) {
        return true;
      }
      seenObjects.push(obj);
      for (var key in obj) {
        if (obj.hasOwnProperty && obj.hasOwnProperty(key) && detect(obj[key])) {
          return true;
        }
      }
    }
    return false;
  }

  return detect(obj);
}
