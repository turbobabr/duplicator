import _ from 'lodash';

import Storage from './thread-storage';
import {
  PREVIOUS_STENCIL_DESCRIPTOR_KEY,
  PRESERVED_OFFSETS_KEY,
  Direction,
  InjectionMode
} from './constants';

import { defaultSettings } from './settings';
import PropEditorDialog, { PropType, PropEditorType } from './prop-editor';

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

const duplicate = (layers,options) => {
  if(!layers || layers.count()<1) {
    return;
  }

  options = defaultSettings(options);

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
        Storage.remove(PREVIOUS_STENCIL_DESCRIPTOR_KEY);
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

      const offset = (layer.isKindOfClass(MSArtboardGroup) ? defaultArtboardOffset : defaultOffset) + (!options.ignoreOffsetDelta ? offsetDelta : 0);

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


  // Adjust frames of parents of the duplicated layers.
  let affectedParents = layers.valueForKeyPath('@distinctUnionOfObjects.parentGroup');
  arrayFastEach(affectedParents,(layer) => {
    layer.resizeToFitChildrenWithOption(1);
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

  return allDuplicates;
};

export const duplicateOnce = (layers,direction) => {
  duplicate(layers,{ direction: direction });
};


const buildRepeaterDialogConfiguration = (direction) => {

  switch(direction) {
    case Direction.Left:
      return {
        title: 'Repeat Left',
        description: 'This tool takes the current selection and copies it a specified number of times to the left',
        icon: 'ic-duplicate-left.png',
      };
      break;

    case Direction.Right:
      return {
        title: 'Repeat Right',
        description: 'This tool takes the current selection and copies it a specified number of times to the right',
        icon: 'ic-duplicate-right.png',
      };
      break;

    case Direction.Above:
      return {
        title: 'Repeat Above',
        description: 'This tool takes the current selection and copies it a specified number of times above the selection',
        icon: 'ic-duplicate-above.png',
      };
      break;

    case Direction.Below:
      return {
        title: 'Repeat Below',
        description: 'This tool takes the current selection and copies it a specified number of times below the selection',
        icon: 'ic-duplicate-below.png',
      };
      break;

  }

  return {};
};

const findSelectedLayers = (document) => {
  document = document || MSDocument.currentDocument();
  return document.selectedLayers().layers();
};

const Containment = {
  Empty: 'empty',
  ArtboardsOnly: 'artboardsOnly',
  CommonLayers: 'layers',
  Mixed: 'mixed'
};

const testContainment = (layers) => {
  if(!layers || layers.count() <1 ) {
    return Containment.Empty;
  }

  const artboards = layers.filteredArrayUsingPredicate(NSPredicate.predicateWithFormat("className == 'MSArtboardGroup' || className == 'MSSymbolMaster'"));
  if(layers.count() == artboards.count()) {
    return Containment.ArtboardsOnly;
  }

  if(artboards.count() > 0 && layers.count() != artboards.count()) {
    return Containment.Mixed;
  }

  return Containment.CommonLayers;
};

const gatherClustersInfo = (layers,options) => {
  if(!layers || layers.count()<1) {
    return;
  }

  options = defaultSettings(options);

  const { direction } = options;
  let clusters = groupLayersByParentGroup(layers);

  let currentStencilDescriptor = makeClustersDescriptor(clusters,direction);

  let prevStencilDescriptor = null;
  if(Storage.exists(PREVIOUS_STENCIL_DESCRIPTOR_KEY)) {
    prevStencilDescriptor = Storage.get(PREVIOUS_STENCIL_DESCRIPTOR_KEY);
  }

  let keys = clusters.allKeys();

  let offsetDeltasForClusters = {};
  let prevOffsetDeltasForClusters = Storage.get(PRESERVED_OFFSETS_KEY);

  let offsetDelta = 0;
  arrayFastEach(keys,(key) => {
    let cluster = clusters[key];
    let originalBounds = MSLayerGroup.groupBoundsForContainer(MSLayerArray.arrayWithLayers(cluster))


    if(prevStencilDescriptor) {
      if (compareClustersDescriptors(currentStencilDescriptor, prevStencilDescriptor)) {
        offsetDelta = originalBounds.origin.y - prevStencilDescriptor.bounds[key].y;

        switch (direction) {
          case Direction.Below:
            offsetDelta = originalBounds.origin.y - prevStencilDescriptor.bounds[key].y;
            break;

          case Direction.Right:
            offsetDelta = originalBounds.origin.x - prevStencilDescriptor.bounds[key].x;
            break;

          case Direction.Left:
            offsetDelta = (prevStencilDescriptor.bounds[key].x + prevStencilDescriptor.bounds[key].width) - (originalBounds.origin.x + originalBounds.size.width);
            break;

          case Direction.Above:
            offsetDelta = (prevStencilDescriptor.bounds[key].y + prevStencilDescriptor.bounds[key].height) - (originalBounds.origin.y + originalBounds.size.height);
            break;
        }

        if (prevOffsetDeltasForClusters && !_.isUndefined(prevOffsetDeltasForClusters[key]) && prevOffsetDeltasForClusters[key]) {
          if (offsetDelta == 0) {
            offsetDelta = prevOffsetDeltasForClusters[key];
          } else {
            offsetDelta = prevOffsetDeltasForClusters[key] + offsetDelta;
          }
        }

        offsetDeltasForClusters[key] = offsetDelta;
      }
    }
  });

  return {
    clusters,
    offsetDeltasForClusters
  };
};

export const duplicateWithRepeater = (layers,direction) => {
  const options = defaultSettings({});
  let offset = 0;

  switch(testContainment(layers)) {
    case Containment.Empty:
      MSDocument.currentDocument().showMessage('[Duplicator]: Selection is empty!');
      return;
      break;

    case Containment.ArtboardsOnly:
      offset = options.defaultArtboardOffset;
      break;

    case Containment.Mixed:
    case Containment.CommonLayers:
      offset = options.defaultOffset;
      break;
  }

  const clustersInfo = gatherClustersInfo(layers, { direction });
  if(clustersInfo && _.keys(clustersInfo.offsetDeltasForClusters).length > 0) {
    let referenceOffset = _.get(clustersInfo.offsetDeltasForClusters,_.first(_.keys(clustersInfo.offsetDeltasForClusters)));
    if(_.every(_.keys(clustersInfo.offsetDeltasForClusters),(key) => {
      return _.get(clustersInfo.offsetDeltasForClusters,key) == referenceOffset;
      })) {
      offset += referenceOffset;
    }
  }

  const editor = new PropEditorDialog(_.assign(
    buildRepeaterDialogConfiguration(direction),{
    props: [
      {
        name: 'count',
        type: PropType.Number,
        editorType: PropEditorType.TextField,
        label: 'Count:',
        value: 1
      },
      {
        name: 'offset',
        type: PropType.Number,
        editorType: PropEditorType.TextField,
        label: 'Spacing (pixels):',
        value: offset
      },
      {
        name: 'injectionMode',
        type: PropType.List,
        list: [
          {
            name: InjectionMode.Default,
            label: 'In Place'
          },
          {
            name: InjectionMode.BeforeSelection,
            label: 'Before Selection'
          },
          {
            name: InjectionMode.AfterSelection,
            label: 'After Selection'
          }
        ],
        editorType: PropEditorType.PopupButton,
        label: 'Injection Mode:',
        value: options.injectionMode
      }
    ],
    buttons: [
      {
        title: "Duplicate",
        id: "ok"
      },
      {
        title: "Cancel",
        id: "cancel"
      }
    ]
  }));

  editor.show((response,props) => {
    if(response != 'ok') {
      return;
    }

    let selection = [];
    _.times(props.count,() => {
      selection = selection.concat(duplicate(findSelectedLayers(),{
        direction: direction,
        defaultOffset: props.offset,
        defaultArtboardOffset: props.offset,
        injectionMode: props.injectionMode,
        ignoreOffsetDelta: true
      }));
    });

    arrayFastEach(selection,(layer) => {
      layer.select_byExtendingSelection(true,true);
    });
  });
};