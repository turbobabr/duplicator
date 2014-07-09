
var DEFAULT_SPACING = 10;


function isRetinaDisplay() {
    /*
    var displayScale = 1;
    if ([[NSScreen mainScreen] respondsToSelector:NSSelectorFromString("backingScaleFactor")]) {
        var screens = [NSScreen screens];
        for (var i = 0; i < [screens count]; i++) {
            var s = [[screens objectAtIndex:i] backingScaleFactor];
            if (s > displayScale)
                displayScale = s;
        }
    }

    return displayScale==2;
    */

    return NSScreen.isOnRetinaScreen();
}


function createAlert(direction) {
    var alert = COSAlertWindow.new();

    function createTextFieldWithLavel(label,defaultValue) {
        alert.addTextLabelWithValue(label);
        alert.addTextFieldWithValue(defaultValue);
    }

    // Set icon.
    var scriptPath = scriptPath || sketch.scriptPath;
    var pluginPath = scriptPath.substring(0, scriptPath.lastIndexOf('/'));

    function imageSuffix() {
        return isRetinaDisplay() ? "@2x" : "";
    }

    var imageFilePath=pluginPath + '/images/' + direction + imageSuffix() + '.png';
    var icon = NSImage.alloc().initByReferencingFile(imageFilePath);
    alert.setIcon(icon);

    function capitalizeString(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    alert.setMessageText("Step and Repeat: "+capitalizeString(direction));
    alert.setInformativeText("This tool takes the current selection and copies it a specified number of times in a specified direction.");

    // Repeats
    createTextFieldWithLavel("Repeats:","1");

    // Spacing
    createTextFieldWithLavel(((direction=="left" || direction=="right") ? "Horizontal" : "Vertical") + " Spacing (pixels):","10");

    // Actions buttons.
    alert.addButtonWithTitle('OK');
    alert.addButtonWithTitle('Cancel');

    return alert;
}


function duplicate(direction,showOptionsAlert) {
    if(selectionContainsArtboards()) {
        doc.displayMessage("🚫🚫🚫 Can't duplicate Artboards! Please remove all the artboards from the selection. 🚫🚫🚫");
        return;
    }

    if(selection.count()<1) {
        doc.displayMessage("🚫🚫🚫 Can't duplicate an emptiness! Please select some layers and try again. 🚫🚫🚫");
        return;
    }

    var showOptionsAlert=showOptionsAlert || false;

    var spacing = DEFAULT_SPACING;
    var repeats = 1;

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
        var alert=createAlert(direction);
        var options=handleAlertResponse(alert,alert.runModal());
        if(options==null) {
            return;
        }

        spacing=options.spacing;
        repeats=options.repeats;
    }

    for(var n=0;n<repeats;n++) {

        var action=doc.actionsController().actionWithName("MSCanvasActions");
        action.duplicate(nil);

        var sel=doc.findSelectedLayers();

        var size=getSelectionSize(sel);

        for(var i=0;i<sel.count();i++) {
            var layer=sel.objectAtIndex(i);
            var rect=layer.frame();

            if(direction=="above") {
                rect.subtractY(size.h+spacing);
            } else if(direction=="below") {
                rect.addY(size.h+spacing);
            } else if(direction=="right") {
                rect.addX(size.w+spacing);
            } else if(direction=="left") {
                rect.subtractX(size.w+spacing);
            }
        }
    }
}

function selectionContainsArtboards() {
    for(var i=0;i<selection.count();i++) {
        var layer=selection.objectAtIndex(i);
        if(layer.className()=="MSArtboardGroup") return true;
    }

    return false;
}

function getSelectionSize(sel) {
    var minX,minY,maxX,maxY;
    minX=minY=Number.MAX_VALUE;
    // maxX=maxY=Number.MIN_VALUE; // Have no idea why it doesn't work.. :(
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
