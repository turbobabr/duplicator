


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

    var padding = 10;
    var times = 1;

    for(var n=0;n<times;n++) {

        var action=doc.actionsController().actionWithName("MSCanvasActions");
        action.duplicate(nil);

        var sel=doc.findSelectedLayers();
        log(sel);

        var size=getSelectionSize(sel);

        for(var i=0;i<sel.count();i++) {
            var layer=sel.objectAtIndex(i);
            var rect=layer.frame();

            if(direction=="above") {
                rect.subtractY(size.h+padding);
            } else if(direction=="below") {
                rect.addY(size.h+padding);
            } else if(direction=="right") {
                rect.addX(size.w+padding);
            } else if(direction=="left") {
                rect.subtractX(size.w+padding);
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
