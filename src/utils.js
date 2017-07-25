import _ from 'lodash';

const Utils = {};

Utils.normalizeObject = (obj) => {
  if(!obj) {
    return null;
  }

  if(obj.isKindOfClass(NSString)) {
    return obj.UTF8String();
  } else if(obj.isKindOfClass(NSValue)) {
    return obj + 0;
  } else if(obj.isKindOfClass(NSDictionary)) {
    return _.fromPairs(_.map(obj,(value,key) => {
      return [key,Utils.normalizeObject(value)];
    }));
  } else if(obj.isKindOfClass(NSArray)) {
    return _.map(obj,(value) => {
      return Utils.normalizeObject(value);
    });
  }

  return obj;
};

Utils.normalize = (obj) => { // Alias for `normalizeObject`
  return Utils.normalizeObject(obj);
};

export default Utils;