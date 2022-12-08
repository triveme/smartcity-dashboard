const allowedPrimitiveAttributes = [
  "intervalInMinutes",
  "fiwareService",
  "aggrMode",
  "apexType",
  "apexMaxValue",
  "apexMaxAlias",
];
const allowedComplexAttributes = ["entityId", "type", "attribute"];

exports.isEqual = (a, b) => {
  if (a && b) {
    let valuesEqual = checkIfValuesChanged(a, b, allowedPrimitiveAttributes);
    if (valuesEqual === false) {
      return false;
    }

    let arraysEqual = checkIfArraysChanged(a, b, allowedComplexAttributes);
    if (arraysEqual === false) {
      return false;
    }
  } else if (a || b) {
    return false;
  }
  return true;
};

function checkIfValuesChanged(a, b, attributes) {
  for (var i = 0; i < attributes.length; i++) {
    var attributeName = attributes[i];
    if (!checkValue(a, b, attributeName)) {
      return false;
    }
  }
}

function checkValue(a, b, keyName) {
  if (a[keyName] && b[keyName]) {
    if (a[keyName] !== b[keyName]) {
      return false;
    }
  } else if (a[keyName] || b[keyName]) {
    return false;
  }
  return true;
}

function checkIfArraysChanged(a, b, attributes) {
  for (var i = 0; i < attributes.length; i++) {
    var attributeName = attributes[i];
    if (!checkArray(a, b, attributeName)) {
      return false;
    }
  }
}

function checkArray(a, b, keyName) {
  if (a[keyName] && b[keyName]) {
    if (JSON.stringify(a[keyName]) !== JSON.stringify(b[keyName])) {
      return false;
    }
  } else if (a[keyName] || b[keyName]) {
    return false;
  }
  return true;
}
