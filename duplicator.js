

function cloneSelectedLayers() {
    var clones=[];
    for(var i=0;i<selection.count();i++) {
        var layer=selection.objectAtIndex(i);
        clones.push(layer.duplicate());
        layer.setIsSelected(false);
    }
    return clones;
}

function deselectAllLayers() {
    for (var i=0; i<selection.count(); i++) {
        selection[i].setIsSelected(false);
    }
}



function duplicate(direction,paddings) {
    if(selection.count()<1) return;

    var direction = direction || "right";
    var paddings = paddings || 10;

    var bounds=getSelectionBounds();
    var clones = cloneSelectedLayers();

    // deselectAllLayers();

    var w=bounds.maxX-bounds.minX;
    var h=bounds.maxY-bounds.minY;

    var paddings=10;


    for(var i=0;i<clones.length;i++) {
        var layer=clones[i];
        var rect=clones[i].frame();

        [layer select:true byExpandingSelection:true ];
        // layer.setIsSelected(true);

        if(direction=="above") {
            rect.subtractY(h+paddings);
        } else if(direction=="below") {
            rect.addY(h+paddings);
        } else if(direction=="right") {
            rect.addX(w+paddings);
        } else if(direction=="left") {
            rect.subtractX(w+paddings);
        }

    }

    // doc.currentView().refresh();
}

function getSelectionBounds() {
    var minX,minY,maxX,maxY;
    minX=minY=10000000;
    maxX=maxY=-10000000;

    for(var i=0;i<selection.count();i++) {
        var rect=selection.objectAtIndex(i).frame();
        if(rect.minX()<minX) minX=rect.minX();
        if(rect.minY()<minY) minY=rect.minY();
        if(rect.maxX()>maxX) maxX=rect.maxX();
        if(rect.maxY()>maxY) maxY=rect.maxY();

    }

    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
    };
}
