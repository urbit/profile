import Mousetrap from 'mousetrap';

Mousetrap.prototype.stopCallback = (e, element, combo) => {
  if (typeof element.dataset.mousetrap !== undefined) {
    return false
  }

  return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || (element.contentEditable && element.contentEditable == 'true');
}

Object.arrayify = (obj) => {
  let ret = [];
  Object.keys(obj).forEach((key) => {
    ret.push({key, value: obj[key]});
  })

  return ret;
}

Object.cloneByProperty = (obj, propName) => {
  let ret = [];
  let arr = obj[propName];

  arr.forEach(item => {
    let objClone = {...obj};
    objClone[propName] = [item];
    ret.push(objClone);
  });

  return ret;
}
