import _ from 'lodash';

import Storage from './thread-storage';
import {
  PREVIOUS_STENCIL_DESCRIPTOR_KEY,
  PRESERVED_OFFSETS_KEY,
  DEFAULTS_STORAGE_KEY,
  Direction,
  InjectionMode
} from './constants';

import { showAlert } from './ui';

const arrayFastEach = (array,iteratee) => {
  iteratee = iteratee || function() {};

  if(toString.call(array) === '[object Array]') {
    for(let i=0;i<array.length;i++) {
      iteratee(array[i],i);
    }

    return;
  }

  let enumerator = array.objectEnumerator();
  let obj, index = 0;
  while ((obj = enumerator.nextObject())) {
    iteratee(obj,index);
    index++;
  }
};

const groupLayersByParentGroup = (layers) => {
  let result = NSMutableDictionary.new();

  const distinctParentIDs = layers.valueForKeyPath("@distinctUnionOfObjects.parentGroup.objectID");
  for (let i = 0 ;i< distinctParentIDs.count();i++) {
    const objectID = distinctParentIDs.objectAtIndex(i);

    const predicate = NSPredicate.predicateWithFormat("parentGroup.objectID = %@", objectID);
    const layersCluster = layers.filteredArrayUsingPredicate(predicate);
    result.setObject_forKey(layersCluster,objectID);
  }

  return result;
};

const makeClustersDescriptor = (clusters,direction) => {

  let hash = {
    direction,
    snapshot: {},
    bounds: {},
    identities: {}
  };

  let keys = clusters.allKeys();
  arrayFastEach(keys,(key) => {
    let cluster = clusters[key];
    let bounds = MSLayerGroup.groupBoundsForContainer(MSLayerArray.arrayWithLayers(cluster));

    let firstLayer = cluster.firstObject();

    hash.snapshot[key]=`${bounds.size.width}x${bounds.size.height}x${cluster.count()}-${firstLayer ? firstLayer.objectID() : 'empty'}`;
    hash.bounds[key] = {
      x: bounds.origin.x,
      y: bounds.origin.y,
      width: bounds.size.width,
      height: bounds.size.height
    };
  });

  return NSDictionary.dictionaryWithDictionary(hash);
};

const compareClustersDescriptors = (clustersA,clustersB) => {
  if(clustersA.direction != clustersB.direction) {
    return false;
  }

  let keysA = clustersA.snapshot.allKeys();
  let keysB = clustersB.snapshot.allKeys();

  if(keysA.count() != keysB.count()) {
    return false;
  }

  for(var i=0;i<keysA.count();i++) {
    const hashKey = keysA.objectAtIndex(i);
    if(clustersB.snapshot[hashKey]) {
      let hashA = clustersA.snapshot[hashKey];
      let hashB = clustersB.snapshot[hashKey];
      if(!hashA.isEqualToString(hashB)) {
        return false;
      }
    } else {
      return false;
    }

    let boundsA = clustersA.bounds[hashKey];
    let boundsB = clustersB.bounds[hashKey];

    switch(clustersA.direction.UTF8String()) {
      case Direction.Left:
      case Direction.Right:
      {
        if(boundsA.y != boundsB.y) {
          return false
        }
      } break;
      case Direction.Above:
      case Direction.Below:
      {
        if(boundsA.x != boundsB.x) {
          return false
        }
      } break;
    }
  }

  return true;
};


const loadDefaultSettings = () => {
  let str = NSUserDefaults.standardUserDefaults().stringForKey(DEFAULTS_STORAGE_KEY);
  if(!str) {
    return {
    };
  }

  let options = {};

  try {
    options = JSON.parse(str);
  } catch(err) {
    print("[duplicator]: Error - Can't load default settings!");
  }

  return options;
};

const saveDefaultSettings = (options) => {
  options = options || {};

  let str = JSON.stringify(options);

  let userDefaults = NSUserDefaults.standardUserDefaults();
  userDefaults.setObject_forKey(str,DEFAULTS_STORAGE_KEY);
  userDefaults.synchronize();
};


const defaults = (options) => {
  options = options || {};

  let defaultOptions = {
    defaultOffset: 10,
    defaultArtboardOffset: 30,
    injectionMode: InjectionMode.AfterSelection
  };

  return _.assign(defaultOptions,loadDefaultSettings(),options);
};

export const showSettingsDialog = () => {
  showAlert();
};

export const duplicate = (layers,options,count) => {
  if(!layers || layers.count()<1) {
    return;
  }

  options = defaults(options);

  const { direction, defaultOffset, defaultArtboardOffset, injectionMode } = options;
  let clusters = groupLayersByParentGroup(layers);

  let currentStencilDescriptor = makeClustersDescriptor(clusters,direction);

  let prevStencilDescriptor = null;
  if(Storage.exists(PREVIOUS_STENCIL_DESCRIPTOR_KEY)) {
    prevStencilDescriptor = Storage.get(PREVIOUS_STENCIL_DESCRIPTOR_KEY);
  }

  let keys = clusters.allKeys();
  let allDuplicates = [];

  let offsetDeltasForClusters = {};
  let prevOffsetDeltasForClusters = Storage.get(PRESERVED_OFFSETS_KEY);

  arrayFastEach(keys,(key) => {
    let cluster = clusters[key];
    let originalBounds = MSLayerGroup.groupBoundsForContainer(MSLayerArray.arrayWithLayers(cluster))

    let offsetDelta = 0;
    if(prevStencilDescriptor) {
      if(compareClustersDescriptors(currentStencilDescriptor,prevStencilDescriptor)) {
        offsetDelta = originalBounds.origin.y-prevStencilDescriptor.bounds[key].y;

        switch(direction) {
          case Direction.Below:
            offsetDelta = originalBounds.origin.y-prevStencilDescriptor.bounds[key].y;
            break;

          case Direction.Right:
            offsetDelta = originalBounds.origin.x-prevStencilDescriptor.bounds[key].x;
            break;

          case Direction.Left:
            offsetDelta = (prevStencilDescriptor.bounds[key].x+prevStencilDescriptor.bounds[key].width) - (originalBounds.origin.x+originalBounds.size.width);
            break;

          case Direction.Above:
            offsetDelta = (prevStencilDescriptor.bounds[key].y+prevStencilDescriptor.bounds[key].height) - (originalBounds.origin.y+originalBounds.size.height);
            break;
        }

        if(prevOffsetDeltasForClusters && !_.isUndefined(prevOffsetDeltasForClusters[key]) && prevOffsetDeltasForClusters[key]) {
          if(offsetDelta == 0) {
            offsetDelta = prevOffsetDeltasForClusters[key];
          } else {
            offsetDelta = prevOffsetDeltasForClusters[key] + offsetDelta;
          }
        }

        offsetDeltasForClusters[key] = offsetDelta;
      } else {
        // TODO: Should discard previous saved stencil here!
      }
    }


    let duplicates = [];
    arrayFastEach(cluster,(layer) => {
      duplicates.push(injectionMode === InjectionMode.Default ? layer.duplicate() : layer.copy());
    });

    if(injectionMode !== InjectionMode.Default) {
      let parentGroup = cluster.firstObject().parentGroup();
      if(!parentGroup) {
        print("[duplicator]: Can't find parent group!");
        return;
      }

      switch(injectionMode) {
        case InjectionMode.AfterSelection:
          parentGroup.insertLayers_afterLayer(duplicates,cluster.lastObject());
          break;
        case InjectionMode.BeforeSelection:
          parentGroup.insertLayers_beforeLayer(duplicates,cluster.firstObject());
          break;
      }
    }

    let newBounds = MSLayerGroup.groupBoundsForContainer(MSLayerArray.arrayWithLayers(duplicates));
    arrayFastEach(duplicates,(layer) => {

      const offset = (layer.isKindOfClass(MSArtboardGroup) ? defaultArtboardOffset : defaultOffset) + offsetDelta;

      switch(direction) {
        case Direction.Left:
        {
          layer.frame().x = originalBounds.origin.x-originalBounds.size.width + (layer.frame().x()-newBounds.origin.x)-offset;
          layer.frame().y = originalBounds.origin.y + (layer.frame().y()-newBounds.origin.y);
        } break;

        case Direction.Above:
        {
          layer.frame().x = originalBounds.origin.x + (layer.frame().x()-newBounds.origin.x);
          layer.frame().y = originalBounds.origin.y - originalBounds.size.height + (layer.frame().y()-newBounds.origin.y)-offset;

        } break;

        case Direction.Below:
        {
          layer.frame().x = originalBounds.origin.x + (layer.frame().x()-newBounds.origin.x);
          layer.frame().y = originalBounds.origin.y + originalBounds.size.height + (layer.frame().y()-newBounds.origin.y)+offset;

        } break;

        case Direction.Right:
        {
          layer.frame().x = originalBounds.origin.x + originalBounds.size.width + (layer.frame().x()-newBounds.origin.x)+offset;
          layer.frame().y = originalBounds.origin.y + (layer.frame().y()-newBounds.origin.y);
        } break;
      }
    });

    allDuplicates = allDuplicates.concat(duplicates);
  });

  arrayFastEach(layers,(layer) => {
    layer.select_byExtendingSelection(false,false);
  });

  arrayFastEach(allDuplicates,(layer) => {
    layer.select_byExtendingSelection(true,true);
  });

  let stencilDescriptor = makeClustersDescriptor(groupLayersByParentGroup(NSArray.arrayWithArray(allDuplicates)),direction);
  Storage.set(PREVIOUS_STENCIL_DESCRIPTOR_KEY,stencilDescriptor);
  Storage.set(PRESERVED_OFFSETS_KEY,NSDictionary.dictionaryWithDictionary(offsetDeltasForClusters));
};