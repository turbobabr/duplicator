
var DEFAULT_SPACING = 10;


function isRetinaDisplay() {
  return NSScreen.isOnRetinaScreen();
}

function actionWithType(type,context) {
  var doc = context.document;

  var controller = doc.actionsController();
  if(controller.actionWithName) {
    return controller.actionWithName(type);
  } else if(controller.actionWithID) {
    return controller.actionWithID(type);
  }
}

function createAlert(direction,context) {
  var alert = COSAlertWindow.new();

  function createTextFieldWithLabel(label,defaultValue) {
    alert.addTextLabelWithValue(label);
    alert.addTextFieldWithValue(defaultValue);
  }

  // Set icon.
  function imageSuffix() {
    return isRetinaDisplay() ? "@2x" : "";
  }

  var imageFilePath = context.command.pluginBundle().url().URLByAppendingPathComponent("/Contents/Resources/"+direction + imageSuffix() + '.png').path();
  var icon = NSImage.alloc().initByReferencingFile(imageFilePath);
  alert.setIcon(icon);

  function capitalizeString(string)
  {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  alert.setMessageText("Step and Repeat: "+capitalizeString(direction));
  alert.setInformativeText("This tool takes the current selection and copies it a specified number of times in a specified direction.");

  // Repeats
  createTextFieldWithLabel("Repeats:","1");

  // Spacing
  createTextFieldWithLabel(((direction=="left" || direction=="right") ? "Horizontal" : "Vertical") + " Spacing (pixels):","10");

  // Actions buttons.
  alert.addButtonWithTitle('OK');
  alert.addButtonWithTitle('Cancel');

  return alert;
}


function duplicate(direction,showOptionsAlert,context) {

  var doc = context.document;
  var selection = context.selection;

  if(selectionContainsArtboards(context)) {
    doc.displayMessage("🚫🚫🚫 Can't duplicate Artboards! Please remove all the artboards from the selection. 🚫🚫🚫");
    return;
  }

  if(selection.count()<1) {
    doc.displayMessage("🚫🚫🚫 Can't duplicate an emptiness! Please select some layers and try again. 🚫🚫🚫");
    return;
  }

  var spacing = DEFAULT_SPACING;
  var repeats = 1;

  function layerOffset(layer,x,y) {
    var rect = layer.rect();
    rect.origin.x+=x;
    rect.origin.y+=y;

    layer.rect = rect;
  }

  if(showOptionsAlert) {
    function handleAlertResponse(alert, responseCode) {
      if (responseCode == "1000") {
        function valAtIndex (view, index) {
          return parseInt(view.viewAtIndex(index).stringValue());
        }

        return {
          spacing: valAtIndex(alert,3),
          repeats: valAtIndex(alert,1)
        }
      }

      return null;
    }
    var alert = createAlert(direction,context);
    var options = handleAlertResponse(alert,alert.runModal());
    if(options == null) {
      return;
    }

    spacing=options.spacing;
    repeats=options.repeats;
  }

  for(var n=0;n<repeats;n++) {

    var action = actionWithType("MSCanvasActions",context);
    action.duplicate(null);

    var sel=doc.findSelectedLayers();

    var size=getSelectionSize(sel);

    for(var i=0;i<sel.count();i++) {
      var layer=sel.objectAtIndex(i);

      if(direction=="above") {
        layerOffset(layer,0,-(size.h+spacing));
      } else if(direction=="below") {
        layerOffset(layer,0,size.h+spacing);
      } else if(direction=="right") {
        layerOffset(layer,size.w+spacing,0);
      } else if(direction=="left") {
        layerOffset(layer,-(size.w+spacing),0);
      }
    }
  }
}

function selectionContainsArtboards(context) {
  var selection = context.selection;

  for(var i=0;i<selection.count();i++) {
    var layer=selection.objectAtIndex(i);
    if(layer.className()=="MSArtboardGroup") return true;
  }

  return false;
}

function getSelectionSize(sel) {
  var minX,minY,maxX,maxY;
  minX=minY=Number.MAX_VALUE;
  maxX=maxY=-0xFFFFFFFF;

  for(var i=0;i<sel.count();i++) {
    var rect=sel.objectAtIndex(i).frame();

    minX=Math.min(minX,rect.minX());
    minY=Math.min(minY,rect.minY());
    maxX=Math.max(maxX,rect.maxX());
    maxY=Math.max(maxY,rect.maxY());
  }

  return {
    w: maxX-minX,
    h: maxY-minY
  };
}

function duplicateLeft(context) {
  duplicate("left",false,context);
}

function duplicateRight(context) {
  duplicate("right",false,context);
}

function duplicateAbove(context) {
  duplicate("above",false,context);
}

function duplicateBelow(context) {
  duplicate("below",false,context);
}


function duplicateLeftRepeater(context) {
  duplicate("left",true,context);
}

function duplicateRightRepeater(context) {
  duplicate("right",true,context);
}

function duplicateAboveRepeater(context) {
  duplicate("above",true,context);
}

function duplicateBelowRepeater(context) {
  duplicate("below",true,context);
}

function addImgToGroup (group, filePath, layerName) {
  var layer = MSBitmapLayer.bitmapLayerWithImageFromPath(filePath);
  layer.name = layerName;

  group.addLayers([layer]);

  return layer;
}

function injectCheatSheet(context) {
  var doc = context.document;

  var imageFilePath = context.command.pluginBundle().url().URLByAppendingPathComponent("/Contents/Resources/cheatsheet.png").path();
  if(doc.artboards().count()>0) {

    var rect = MSLayerGroup.groupBoundsForLayers(doc.artboards());

    var boardRect = NSMakeRect(rect.origin.x+rect.size.width+100,rect.origin.y,517,871);
    var board = MSArtboardGroup.alloc().init();
    board.name = "Duplicator Cheat Sheet";
    board.rect = boardRect;
    addImgToGroup(board,imageFilePath,"Image");

    doc.currentPage().addLayers([board]);

  } else {
    addImgToGroup(doc.currentPage(),imageFilePath,"Duplicator Cheat Sheet");
  }
}