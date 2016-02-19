"use strict";

var gridSizeInPixels = 50;
const gridSizeInFeet = 5;
const circumferenceOfEarth = 40075016;
const gridWidthMax = Math.floor(circumferenceOfEarth / gridSizeInFeet * gridSizeInPixels);
var textures = {};
var tilingSprite = {};
var selectedShape;
var settings = { displayMode: "WebGL" };
var selectedLayer;
var mouseLocalPosition = { x: 0, y: 0 };

// Manuall set displayMode
//settings.displayMode = "WebGL";
//settings.displayMode = "Canvas";
settings.displayMode = "svg";


var layers = {};
var layers_keys_cache;
var layers_keys_length_cache;
var shapes = {};
var shapes_keys_cache;
var shapes_keys_length_cache;
var viewBox = { x: 0, y: 0, z: 1 };
var lastkeydownEvent;
var mode = "";
var mode2 = "";


var lastMouse = undefined;

$(document).ready(function () {
    console.log("ready!");



    //if (settings.displayMode == "WebGL") {
    //    var c = document.createElement("canvas");
    //    c.setAttribute("id", "pixiCanvas");
    //    canvasDiv.appendChild(c);
    //    window.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, { view: pixiCanvas, transparent: false });
    //    //window.renderer = new PIXI.CanvasRenderer(window.innerWidth, window.innerHeight, { view: pixiCanvas, transparent: false });

    //    //canvasDiv.appendChild(renderer.view);
    //    window.renderer.backgroundColor = 0xb0c4de;
    //    window.stage = new PIXI.Container();
    //    window.world = new PIXI.Container();
    //    stage.addChild(world);
    //}

    //setupLayers();

    //setupGrid();

    reset();

    //if (settings.displayMode == "WebGL") {
    //    setupWegGlEvents();
    //}
    //if (settings.displayMode == "Canvas") {
    //    setupCanvasEvents();
    //}

    //if (settings.displayMode == "svg") {
    //    setupSvgEvents();
    //}

    //Generic Events
    //window.addEventListener("resize", resize);
    //window.addEventListener("keydown", keydown);

    // Finilize & Start animation


    //resize();
    loadSampleMap();
    //setTimeout(loadSampleMap, 1000);
    animate();
});

function setupSvgEvents() {
    //MouseMove
    svgCanvas.onmousemove = function (e) {
        //console.log(e);
        if (!window.lastMouse) {
            window.lastMouse = e
        }
        var deltaX = (window.lastMouse.offsetX - e.offsetX) / viewBox.z;;
        var deltaY = (window.lastMouse.offsetY - e.offsetY) / viewBox.z;;

        window.lastMouse = e;
        updateLocalMouse();

        if (mouseButtonAbstract(e) == 1) {
            if (selectedShape) {
                if (selectedShape.dragging) {
                    selectedShape.move(e);
                }
            }
        }

        // Right Button
        if (mouseButtonAbstract(e) == 3) {
            viewBox.x += deltaX;
            viewBox.y += deltaY;
            resize();
        }
    }

    //Mouse Down
    clickthruLayer.onmousedown = function (e) {
        if (selectedShape) {
            selectedShape.unselect();
        }
    };

    svgCanvas.onmouseup = function (e) {
        if (selectedShape) {
            selectedShape.dragging = false;
        }
    };



    //Mouse Wheel
    svgCanvas.onmousewheel = function (e) {
        event.preventDefault();  // Don't want to zoom browser

        // ViewBox Zoom
        if (e.wheelDelta > 0) {
            viewBox.width -= 10;
            viewBox.height -= 10;
            zoom(viewBox.z * 1.1, e);
        }
        else {
            viewBox.width += 10;
            viewBox.height += 10;
            zoom(viewBox.z / 1.1, e);
        }
    }


    //Context Menu Event
    document.addEventListener("contextmenu", function (e) {
        event.preventDefault();

        e.preventDefault();
    }, false);
}

function zoom(z, event) {

    updateLocalMouse();

    var pctX = (mouseLocalPosition.x - viewBox.x) / viewBox.width;
    var pctY = (mouseLocalPosition.y - viewBox.y) / viewBox.height;

    //scale
    viewBox.z = z;
    var offsetX = viewBox.width;
    var offsetY = viewBox.height;
    viewBox.width = svgCanvas.clientWidth / viewBox.z;
    viewBox.height = svgCanvas.clientHeight / viewBox.z;
    offsetX -= viewBox.width;
    offsetY -= viewBox.height;
    viewBox.x += offsetX * pctX;
    viewBox.y += offsetY * pctY;

    // update mouseLocalPosition
    //mouseLocalPosition.x = event.offsetX / viewBox.zoom + viewBox.x;
    //mouseLocalPosition.y = event.offsetY / viewBox.zoom + viewBox.y;
    updateLocalMouse()

    resize();
    //console.log(viewBox);
}

//function setupCanvasEvents() {
//    //MouseMove
//    window.onmousemove = function (e) {
//        // Don't bother if our window isn't in focus
//        if (!document.hasFocus()) {
//            return;
//        }

//        var mouseX = (e.x - viewBox.x);
//        var mouseY = (e.y - canvasDiv.offsetTop - viewBox.y);
//        var transformedX = mouseX / viewBox.z;
//        var transformedY = mouseY / viewBox.z;


//        if (lastMouse != undefined) {
//            var deltaX = (e.x - lastMouse.x);
//            var deltaY = (e.y - lastMouse.y);
//            var deltaTX = (transformedX - (lastMouse.x - viewBox.x) / viewBox.z);
//            var deltaTY = (transformedY - (lastMouse.y - canvasDiv.offsetTop - viewBox.y) / viewBox.z);


//            if (mouseButtonAbstract(e) == 3) {
//                //console.log(deltaX, deltaY);
//                //if (window.lastMouse.dragStart) {
//                //    viewBox.x = transformedX - window.lastMouse.dragStart.tx ;
//                //    viewBox.y = transformedY - window.lastMouse.dragStart.ty;
//                //    resize();
//                //}
//                viewBox.x += deltaX;
//                viewBox.y += deltaY;
//                resize();



//            }

//            if (mouseButtonAbstract(e) == 1) {

//                if (selectedShape) {
//                    //if (selectedShape.drag) {
//                    //    selectedShape.drag(deltaTX, deltaTY);
//                    //}
//                    if (selectedShape.moveTo) {
//                        selectedShape.moveTo(transformedX, transformedY);
//                    }
//                }

//            }
//        }

//        //window.lastMouse.x = mouseX;
//        //window.lastMouse.y = mouseY;
//        //window.lastMouse.tx = transformedX;
//        //window.lastMouse.ty = transformedY;

//        window.lastMouse = e; //{ x: e.x, y: e.y, tx: transformedX, ty: transformedY };
//    }


//    //Mouse Down
//    canvasDiv.onmousedown = function (e) {
//        var mouseX = (e.x - viewBox.x);
//        var mouseY = (e.y - this.offsetTop - viewBox.y);
//        var transformedX = mouseX / viewBox.z;
//        var transformedY = mouseY / viewBox.z;
//        //console.log(transformedX, transformedY);
//        window.lastMouse = e; //{ x: e.x, y: e.y, tx: transformedX, ty: transformedY };
//        //window.lastMouse.dragStart = { tx: transformedX, ty: transformedY };

//        if (mouseButtonAbstract(e) == 1) {
//            // Niave hittest




//            // Debug mark
//            var ctx = layers["backgroundLayer"].ctx;
//            ctx.beginPath();
//            ctx.fillStyle = "rgba(255,165,0,.5)";
//            ctx.arc(transformedX, transformedY, 5, 0, 2 * Math.PI);
//            ctx.fill();
//            ctx.stroke();

//            // Last item is the one on top
//            for (var i = shapes_keys_length_cache - 1; i >= 0; i--) {
//                var shape = shapes[shapes_keys_cache[i]];
//                if (transformedX <= (shape.point[0] + shape.width) && transformedX > shape.point[0]) {
//                    if (transformedY <= (shape.point[1] + shape.height) && transformedY > shape.point[1]) {
//                        if (shape.mousedown) {
//                            shape.mousedown(e);
//                        }
//                        return;
//                    }
//                }
//            }
//            // Didn't click on any object so unselect
//            if (selectedShape) {
//                selectedShape.unselect();
//            }
//        }




//    };

//    //Mouse Wheel
//    window.onmousewheel = function (e) {
//        //console.log(e);

//        if (e.wheelDelta > 0) {
//            viewBox.z *= 1.1;
//        }
//        else {
//            viewBox.z /= 1.1;
//        }
//        resize();

//    };

//    //Context Menu Event
//    document.addEventListener("contextmenu", function (e) {
//        event.preventDefault();

//        e.preventDefault();
//    }, false);
//}

function mouseButtonAbstract(e) {
    e = e || window.event;
    if (!e.which && e.button !== undefined) {
        return (e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0)));
    }
    return e.which;
}

//function localCoordinates() {
//    // return [(lastMouse.x - viewBox.x) / viewBox.z, (lastMouse.y - canvasDiv.offsetTop - viewBox.y) / viewBox.z];
//    // return [lastMouse.x, lastMouse.y];
//    return [lastMouse.offsetX / viewBox.z + viewBox.x, lastMouse.offsetY / viewBox.z + viewBox.y]

//    //mouseLocalPosition.x = event.offsetX / viewBox.zoom + viewBox.x;
//    //mouseLocalPosition.y = event.offsetY / viewBox.zoom + viewBox.y;

//}

function updateLocalMouse() {
    mouseLocalPosition.x = lastMouse.offsetX / viewBox.z + viewBox.x;
    mouseLocalPosition.y = lastMouse.offsetY / viewBox.z + viewBox.y;
}


//function setupWegGlEvents() {
//    //MouseMove
//    window.stage.interactive = true;
//    window.stage.on('mousemove', function (e) {

//        var mouseX = e.data.originalEvent.pageX;
//        var mouseY = e.data.originalEvent.pageY;

//        if (e.data.originalEvent.which == 3) {

//            //var localPos = e.data.getLocalPosition(palla)

//            if (window.lastMouse != undefined) {
//                lastX
//                var lastX = window.lastMouse.x;
//                var lastY = window.lastMouse.y;
//                var dx = mouseX - lastX;
//                var dy = mouseY - lastY;
//                world.position.x = world.position.x + dx;
//                world.position.y = world.position.y + dy;
//                //console.log(mouseX, lastX, dx);

//                ///updateGrid();

//                updateSvgTransform();

//            }


//        }
//        window.lastMouse = { x: mouseX, y: mouseY, ctrlKey: e.data.originalEvent.ctrlKey };
//        //console.log("stage mousemove");
//        //window.lastMouse = {pageX: mouseX, pageY: e.data.originalEvent.pageY};
//    });

//    //Mouse Down
//    window.stage.on('mousedown', function (e) {
//        var mouseX = e.data.originalEvent.pageX;
//        var mouseY = e.data.originalEvent.pageY;
//        window.lastMouse = { x: mouseX, y: mouseY };
//        if (!e._stopPropegation) {
//            //console.log("window.stage.onmousedown", e.target);
//            if (selectedShape) {
//                selectedShape.unselect();
//            }
//        }
//        e._stopPropegation = undefined;


//    });

//    //Mouse Wheel
//    window.onmousewheel = function (e) {
//        //console.log(e);

//        if (e.wheelDelta > 0) {
//            world.scale.x *= 1.1;
//            world.scale.y *= 1.1;
//        }
//        else {
//            world.scale.x /= 1.1;
//            world.scale.y /= 1.1;
//        }
//        updateSvgTransform();

//    };





//    //Context Menu Event
//    document.addEventListener("contextmenu", function (e) {
//        event.preventDefault();

//        e.preventDefault();
//    }, false);
//}

function setMode(_mode) {
    mode = _mode;
    var pointerBlue = document.getElementById("pointerBlue");
    var drawBlue = document.getElementById("drawBlue");
    var drawingToolsDiv = document.getElementById("drawingToolsDiv");
    switch (mode) {
        case "Interaction":
            pointerBlue.src = "assets/pointer-blue.png";
            drawBlue.src = "assets/draw-blue-off.png";
            drawingToolsDiv.style.visibility = "collapse";
            svgCanvas.style.cursor = "";
            setMode2("");
            break;
        case "DrawTools":
            pointerBlue.src = "assets/pointer-blue-off.png";
            drawBlue.src = "assets/draw-blue.png";
            drawingToolsDiv.style.visibility = "visible";
            setMode2("DrawRectangle");
            svgCanvas.style.cursor = "crosshair";
            selectLayer("background");
            if (selectedShape) {
                selectedShape.unselect();
            }
            break;
        default:
            console.log("Unknown mode: ", mode);
            break;
    }
}

function setMode2(_mode2) {
    var drawRectangle = document.getElementById("drawRectangle");
    mode2 = _mode2;
    switch (mode2) {
        case "":
            break;
        case "DrawRectangle":
            //svgDocument.style.cursor = "crosshair";
            break;
        default:
            console.log("Unknown mode2: ", mode2);
            break;
    };
}

function keydown(e) {
    lastkeydownEvent = e;


    switch (e.keyCode) {
        case 76: // Light
            if (selectedShape) {
                if (selectedShape.sprite.parent.layer == "token") {
                    light = new raycasting(selectedShape.getCenter());
                    light.parent = selectedShape;
                    light.updateClipPaths();
                    light.drawClipPaths();
                }
            }
            break;
        default:
            console.log("keydown:Unhandled keycode", e.keyCode, e.keyIdentifier);
    }
}

function updateSvgTransform() {
    if (settings.displayMode == "WebGL") {
        layers["adorner"].svgGroup.setAttribute("transform",
        "translate (" + world.position.x + ", " + world.position.y + ") " +
        "scale(" + world.scale.x + ", " + world.scale.y + ")");

        layers["raycast"].setAttribute("transform",
            "translate (" + world.position.x + ", " + world.position.y + ") " +
            "scale(" + world.scale.x + ", " + world.scale.y + ")");
    }

    if (settings.displayMode == "Canvas") {
        if (layers["adorner"]) {
            layers["adorner"].svgGroup.setAttribute("transform",
            "translate (" + viewBox.x + ", " + viewBox.y + ") " +
            "scale(" + viewBox.z + ", " + viewBox.z + ")");
        }
    }
    //console.log("updateSvgTransform");

    viewBox = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight, zoom: 1 };

    svgCanvas.setAttribute("viewBox", viewBox.x + " " + viewBox.y + " " + viewBox.width + " " + viewBox.height);
}

function addLayer(layerName, beforeLayer) {
    var myCanvas = document.createElement("canvas");
    myCanvas.id = layerName;

    var div = document.getElementById("canvasDiv");
    if (beforeLayer) {
        var element = document.getElementById(beforeLayer);
        div.insertBefore(myCanvas, element);
    } else {

        div.appendChild(myCanvas);
    }

    layers[layerName] = { name: layerName, isDirty: true, canvas: myCanvas, ctx: myCanvas.getContext("2d"), gl: myCanvas.getContext("glcanvas") };

    resize();
}

function setupLayers() {
    //if (settings.displayMode == "WebGL") {
    //    layers["background"] = new PIXI.Container();
    //    layers["background"].layer = "background";
    //    world.addChild(layers["background"]);

    //    layers["grid"] = new PIXI.Container();
    //    layers["grid"].layer = "grid";
    //    world.addChild(layers["grid"]);

    //    layers["token"] = new PIXI.Container();
    //    layers["token"].layer = "token";
    //    world.addChild(layers["token"]);

    //    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    //    svg.setAttribute("id", "svgCanvas");
    //    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    //    var raycastLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    //    raycastLayer.id = "raycastLayer";
    //    svg.appendChild(raycastLayer);
    //    layers["raycast"] = raycastLayer;

    //    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    //    g.id = "adornerLayer";
    //    svg.appendChild(g);
    //    canvasDiv.appendChild(svg);
    //    layers["adorner"] = { svgGroup: g, svg: svg };




    //}

    //if (settings.displayMode == "Canvas") {
    //    addLayer("gridLayer");

    //    // Add background Layer
    //    addLayer("backgroundLayer", "gridLayer");
    //    layers["backgroundLayer"].canvas.style.backgroundColor = "lightsteelblue";

    //    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    //    svg.setAttribute("id", "svgCanvas");
    //    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    //    g.id = "adornerLayer";
    //    svg.appendChild(g);
    //    canvasDiv.appendChild(svg);
    //    layers["adorner"] = { svgGroup: g, svg: svg };
    //}

    if (settings.displayMode == "svg") {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("id", "svgCanvas");
        svg.style.backgroundColor = "lightsteelblue";
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        canvasDiv.appendChild(svg);

        var clickthruLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
        clickthruLayer.setAttribute("id", "clickthruLayer");
        svg.appendChild(clickthruLayer);

        var backgroundLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
        //addLayer("background");
        //backgroundLayer.layer = "background";
        backgroundLayer.setAttribute("id", "backgroundLayer");
        layers["background"] = backgroundLayer;
        svg.appendChild(backgroundLayer);

        var gridLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
        //addLayer("grid");
        //gridLayer.layer = "grid";
        gridLayer.setAttribute("id", "gridLayer");
        layers["grid"] = gridLayer;
        svg.appendChild(gridLayer);

        var tokenLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
        //addLayer("token");
        //tokenLayer.layer = "token";
        tokenLayer.setAttribute("id", "tokenLayer");
        layers["token"] = tokenLayer;
        svg.appendChild(tokenLayer);

        var adornLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
        //addLayer("adorner");
        //adornLayer.layer = "adorner";
        adornLayer.setAttribute("id", "adornLayer");
        layers["adorner"] = adornLayer;
        svg.appendChild(adornLayer);
    }

    layers_keys_cache = Object.keys(layers);
    layers_keys_length_cache = layers_keys_cache.length;

    //resize();
}

function resize() {
    //viewBox.width = svgCanvas.clientWidth / viewBox.z;
    //viewBox.height = svgCanvas.clientHeight / viewBox.z;  //window.innerHeight - nav1.clientHeight - nav2.clientHeight - statusDiv.clientHeight - 1;
    //svgCanvas.setAttribute("width", 800);
    //svgCanvas.setAttribute("height", 600);


    //if (settings.displayMode == "WebGL") {
    //    //this part resizes the canvas but keeps ratio the same
    //    renderer.view.style.width = w + "px";
    //    renderer.view.style.height = h + "px";

    //    // this part adjusts the ratio
    //    renderer.resize(w, h);
    //}

    //if (settings.displayMode == "Canvas") {
    //    // Size canvas' to match current window size
    //    for (var i = 0; i < Object.keys(layers).length; i++) {
    //        var layer = layers[Object.keys(layers)[i]];
    //        if (layer.canvas) {
    //            layer.canvas.width = w;
    //            layer.canvas.height = h;
    //            layer.canvas.style.width = w + "px";
    //            layer.canvas.style.height = h + "px";
    //            layer.isDirty = true;

    //            // viewbox stuff may need to be reviewed

    //            layer.ctx.setTransform(1, 0, 0, 1, 0, 0);
    //            layer.ctx.translate(viewBox.x, viewBox.y);
    //            layer.ctx.scale(viewBox.z, viewBox.z);
    //        }

    //    }
    //}
    //updateSvgTransform();

    svgCanvas.setAttribute("viewBox", viewBox.x + " " + viewBox.y + " " + viewBox.width + " " + viewBox.height);
    layers["grid"].children[0].setAttribute("x", viewBox.x);
    layers["grid"].children[0].setAttribute("y", viewBox.y);
    clickthruLayer.children[0].setAttribute("x", viewBox.x);
    clickthruLayer.children[0].setAttribute("y", viewBox.y);
}

var tokenList = [];
function bunnySample() {

    //renderer.backgroundColor = 0x4682B4;

    // load the texture we need


    PIXI.loader.add('bunny', 'wizard7.png').load(function (loader, resources) {
        for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
                // This creates a texture from a 'bunny.png' image.
                var bunny = new PIXI.Sprite(resources.bunny.texture);

                // Setup the position and scale of the bunny
                bunny.width = 50;
                bunny.height = 50;
                bunny.position.x = 25 + 50 * x + 0.5;
                bunny.position.y = 25 + 50 * y + 0.5;
                bunny.rotation = x + y;
                bunny.pivot.x = 128;
                bunny.pivot.y = 128;

                // Add the bunny to the scene we are building.
                world.addChild(bunny);
                tokenList.push(bunny);
            }
        }
    });

}

//function loadSampleTextures() {
//    loadSampleMap();
//    return;

//    if (settings.displayMode == "WebGL") {
//        var loader = PIXI.loader
//            .add('Concrete-a.png', 'Concrete-a.png')
//            .load(function (loader, resources) {
//                textures["Concrete-a.png"] = resources["Concrete-a.png"].texture;
//                //tilingSprite["Concrete-a.png"] = new PIXI.extras.TilingSprite(textures["Concrete-a.png"], 100, 100);
//                var ready = setTimeout(loadSampleMap, 1);

//            });
//    }

//    if (settings.displayMode == "Canvas") {
//        var ctx = layers["backgroundLayer"].ctx;
//        var assetName = "Concrete-a.png";
//        var image = new Image();
//        image.src = assetName;
//        textures[assetName] = { image: image };
//        image.onload = function (e) {
//            var pattern = ctx.createPattern(image, "repeat");
//            textures[assetName].pattern = pattern;
//            layers["backgroundLayer"].isDirty = true;

//            loadSampleMap();
//        }
//    }
//}

var gridSprite;
function setupGrid() {

    //var useSVG = false;

    //if (settings.displayMode == "WebGL") {

    //    var c = document.createElement('canvas');
    //    var ctx = c.getContext('2d');
    //    c.width = gridSizeInPixels * 1;
    //    c.height = gridSizeInPixels * 1;
    //    ctx.lineWidth = 1;
    //    ctx.strokeStyle = "black";
    //    ctx.rect(0, 0, c.width, c.height);
    //    ctx.stroke();
    //    //console.log(c);

    //    var ts = new PIXI.extras.TilingSprite(PIXI.Texture.fromCanvas(c, PIXI.SCALE_MODES.DEFAULT), 65535, 65535);
    //    ts.x = Math.floor(-65535 / 2 / 50) * 50 - 0;
    //    ts.y = ts.x;
    //    ts.scale.x = 1 / 1;
    //    ts.scale.y = 1 / 1;
    //    ts.name = "grid";
    //    layers["grid"].addChild(ts);
    //    gridSprite = ts;
    //    //updateGrid();
    //    //console.log(ts);

    //    //ts.interactive = true;
    //    //ts.on("mousedown", function (e) {
    //    //    if (selectedShape) {
    //    //        selectedShape.unselect();
    //    //    }
    //    //});
    //}

    if (settings.displayMode == "svg") {
        var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        var pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        pattern.setAttribute("id", "basicPattern");
        pattern.setAttribute("x", 0);
        pattern.setAttribute("y", 0);
        pattern.setAttribute("height", 50);
        pattern.setAttribute("width", 50);
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

        polyline.setAttribute("points", "0, " + gridSizeInPixels + " 0,0 " + gridSizeInPixels + ",0");
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", "black");
        polyline.setAttribute("stroke-width", 1);
        //polyline.setAttribute("vector-effect", "non-scaling-stroke");

        pattern.appendChild(polyline);
        defs.appendChild(pattern);
        layers["grid"].parentElement.insertBefore(defs, layers["grid"].parentElement.firstChild);

        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", 0);
        rect.setAttribute("y", 0);
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "url(#basicPattern)");
        rect.setAttribute("id", "grid");
        //var gridLayer = document.getElementById("gridLayer");
        layers["grid"].appendChild(rect);

        var rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect2.setAttribute("x", 0);
        rect2.setAttribute("y", 0);
        rect2.setAttribute("width", "100%");
        rect2.setAttribute("height", "100%");
        rect2.setAttribute("fill", "url(#basicPattern)");
        rect2.setAttribute("id", "grid2");
        clickthruLayer.appendChild(rect2);

    }

    //if (settings.displayMode == "Canvas") {
    //    // Draw rectangle/grid to a buffer canvas
    //    var bufferCanvas = document.createElement("canvas");
    //    var bufferCanvasCtx = bufferCanvas.getContext("2d");
    //    bufferCanvasCtx.canvas.width = gridSizeInPixels;
    //    bufferCanvasCtx.canvas.height = gridSizeInPixels;
    //    bufferCanvasCtx.beginPath();
    //    bufferCanvasCtx.lineWidth = 1;
    //    bufferCanvasCtx.strokeStyle = "black";
    //    bufferCanvasCtx.rect(0.5, 0.5, gridSizeInPixels, gridSizeInPixels);
    //    bufferCanvasCtx.stroke();

    //    // Convert to Image
    //    var img = new Image();
    //    img.src = bufferCanvas.toDataURL("image/png");

    //    // Convert to Pattern
    //    layers["gridLayer"].gridPattern = layers["gridLayer"].ctx.createPattern(img, "repeat");
    //}
}

function resetGrid(newGridSize) {
    gridSizeInPixels = newGridSize;
    //var pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    //pattern.setAttribute("id", "basicPattern");
    //pattern.setAttribute("x", 0);
    //pattern.setAttribute("y", 0);
    basicPattern.setAttribute("height", gridSizeInPixels);
    basicPattern.setAttribute("width", gridSizeInPixels);
    //pattern.setAttribute("patternUnits", "userSpaceOnUse");

    var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

    polyline.setAttribute("points", "0, " + gridSizeInPixels + " 0,0 " + gridSizeInPixels + ",0");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "black");
    polyline.setAttribute("stroke-width", 1);
    //polyline.setAttribute("vector-effect", "non-scaling-stroke");

    basicPattern.children[0] = polyline;
}


function loadSampleMap() {
    var r = new rectangle();
    var r2 = new rectangle({
        point: [50, 50],
        fillStyle: "blue", //textureHandler("Concrete-a.png"),
        //tiledTexture: true,
        width: 150,
        height: 150
    });

    //var l1 = new line();

}

//function updateGrid() {
//    var local = world.toLocal(new PIXI.Point(renderer.width, renderer.height), stage);
//    console.log(local);

//    if (gridSprite.width < local.x * 2 || gridSprite.height < local.y * 2) {
//        world.removeChild(gridSprite);
//        var c = document.createElement('canvas');
//        var ctx = c.getContext('2d');
//        c.width = gridSizeInPixels * 2;
//        c.height = gridSizeInPixels * 2;
//        ctx.lineWidth = 1;
//        ctx.strokeStyle = "black";
//        ctx.rect(0.5, 0.5, c.width, c.height);
//        ctx.stroke();
//        gridSprite = new PIXI.extras.TilingSprite(PIXI.Texture.fromCanvas(c, PIXI.SCALE_MODES.DEFAULT), local.x * 2, local.y * 2);
//        gridSprite.scale.x = 1 / 2;
//        gridSprite.scale.y = 1 / 2;
//        world.addChild(gridSprite);
//    }
//    // The Grid is a container of limited size.
//    // Need to reposition and resize based on world offset and scale
//    gridSprite.tilePosition.x = world.x * 2;
//    gridSprite.tilePosition.y = world.y * 2;
//    gridSprite.x = -world.x;
//    gridSprite.y = -world.y;



//}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function reset() {

    if (selectedShape) {
        selectedShape.unselect();
    }

    light = undefined;

    //if (settings.displayMode == "WebGL") {

    //    for (var i = 0; i < layers_keys_length_cache; i++) {
    //        var layer = layers[layers_keys_cache[i]];

    //        if (layer instanceof PIXI.Container) {
    //            if (layer.layer != "gridLayer") {
    //                layer.removeChildren();
    //            }
    //        }

    //        if (layer.nodeName) {
    //            if (layer.nodeName == "g") {
    //                while (layer.firstChild) {
    //                    layer.removeChild(layer.firstChild);
    //                }
    //            }
    //        }

    //    }
    //    world.position.x = 0;
    //    world.position.y = 0;
    //    world.scale.x = 1;
    //    world.scale.y = 1;
    //    updateSvgTransform();
    //}



    // Remove All Svg Elements
    if (window.svgCanvas) {
        while (svgCanvas.firstChild) {
            svgCanvas.removeChild(svgCanvas.firstChild);
        }
    }
    //    for (var i = 0; i < layers_keys_length_cache; i++) {
    //        var layer = layers[layers_keys_cache[i]];
    //        if (layer.nodeName) {
    //            if (layer.nodeName == "g") {
    //                //if (layer.id != "gridLayer") {
    //                    while (layer.firstChild) {
    //                        layer.removeChild(layer.firstChild);
    //                    }
    //                //}
    //            }
    //        }
    //    }
    //}
    while (canvasDiv.firstChild) {
        canvasDiv.removeChild(canvasDiv.firstChild);
    }

    shapes = {};

    setupLayers();
    setupGrid();

    viewBox.x = 0;
    viewBox.y = 0;
    viewBox.z = 1;
    viewBox.width = window.innerWidth;
    viewBox.height = window.innerHeight;


    setupSvgEvents();
    selectLayer("background");

    resize();



}

function createMaze() {
    reset();


    //ref: http://www.emanueleferonato.com/2015/06/30/pure-javascript-perfect-tile-maze-generation-with-a-bit-of-magic-thanks-to-phaser/

    var maze = [];
    var mazeWidth = 11;  //Must be odd number
    var mazeHeight = 11; //Must be odd number
    //if (settings.displayMode == "Canvas") {
    //    mazeWidth = 111;
    //    mazeHeight = 111;
    //}
    console.log("CreateMaze " + mazeWidth + " by " + mazeHeight);
    //var tilesSize = 50;
    var moves = [];

    for (var i = 0; i < mazeHeight; i++) {
        maze[i] = [];
        for (var j = 0; j < mazeWidth; j++) {
            maze[i][j] = 1;
        }
    }

    var posX = 1;
    var posY = 1;
    maze[posX][posY] = 0;

    moves.push(posY + posY * mazeWidth);
    while (moves.length) {
        var possibleDirections = "";
        if (posX + 2 > 0 && posX + 2 < mazeHeight - 1 && maze[posX + 2][posY] == 1) {
            possibleDirections += "S";
        }
        if (posX - 2 > 0 && posX - 2 < mazeHeight - 1 && maze[posX - 2][posY] == 1) {
            possibleDirections += "N";
        }
        if (posY - 2 > 0 && posY - 2 < mazeWidth - 1 && maze[posX][posY - 2] == 1) {
            possibleDirections += "W";
        }
        if (posY + 2 > 0 && posY + 2 < mazeWidth - 1 && maze[posX][posY + 2] == 1) {
            possibleDirections += "E";
        }
        if (possibleDirections) {
            var move = randomIntFromInterval(0, possibleDirections.length - 1);
            switch (possibleDirections[move]) {
                case "N":
                    maze[posX - 2][posY] = 0;
                    maze[posX - 1][posY] = 0;
                    posX -= 2;
                    break;
                case "S":
                    maze[posX + 2][posY] = 0;
                    maze[posX + 1][posY] = 0;
                    posX += 2;
                    break;
                case "W":
                    maze[posX][posY - 2] = 0;
                    maze[posX][posY - 1] = 0;
                    posY -= 2;
                    break;
                case "E":
                    maze[posX][posY + 2] = 0;
                    maze[posX][posY + 1] = 0;
                    posY += 2;
                    break;
            }
            moves.push(posY + posX * mazeWidth);
        }
        else {
            var back = moves.pop();
            posX = Math.floor(back / mazeWidth);
            posY = back % mazeWidth;
        }
        //drawMaze(posX, posY);
    }

    // DrawMaze
    for (i = 0; i < mazeHeight; i++) {
        for (j = 0; j < mazeWidth; j++) {
            if (maze[i][j] == 1) {
                var tileSize = 50;
                var tile = new rectangle({
                    point: vec2.fromValues(j * tileSize, i * tileSize),
                    width: tileSize,
                    height: tileSize,
                    fillStyle: textureHandler("Concrete-a.png"),
                    tiledTexture: true,
                    layer: "background"
                });
                //shapes[tile.id] = tile;
                //tile.update();
            }
        }
    }

    //loadWizard();
    //save();
}

function textureHandler(textureName, options) {
    if (textures[textureName] == undefined) {

        if (!options) {
            options = {
                texture: true
            };
        }

        textures[textureName] = "url(#" + textureName + ")";
        if (options.texture && !options.binaryData) {
            getDataUri(textureName, function (e) {
                var defs = document.getElementsByTagName("defs")[0];
                var pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
                pattern.setAttribute("id", textureName);
                pattern.setAttribute("x", 0);
                pattern.setAttribute("y", 0);
                pattern.setAttribute("width", e.width);
                pattern.setAttribute("height", e.height);
                pattern.setAttribute("patternUnits", "userSpaceOnUse");
                var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
                image.setAttributeNS("http://www.w3.org/1999/xlink", "href", e.dataUri);
                image.setAttribute("x", 0);
                image.setAttribute("y", 0);
                image.setAttribute("width", e.width);
                image.setAttribute("height", e.height);
                pattern.appendChild(image)
                defs.appendChild(pattern);

            });
        }

        if (options.texture && options.binaryData) {
            getDataUri(options.binaryData, function (e) {
                var defs = document.getElementsByTagName("defs")[0];
                var pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
                pattern.setAttribute("id", textureName);
                pattern.setAttribute("x", 0);
                pattern.setAttribute("y", 0);
                pattern.setAttribute("width", e.width);
                pattern.setAttribute("height", e.height);
                pattern.setAttribute("patternUnits", "objectBoundingBox");
                var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
                image.setAttributeNS("http://www.w3.org/1999/xlink", "href", e.dataUri);
                image.setAttribute("x", 0);
                image.setAttribute("y", 0);
                image.setAttribute("width", e.width);
                image.setAttribute("height", e.height);
                pattern.appendChild(image)
                defs.appendChild(pattern);

            });
        }


        if (!options.texture && options.binaryData) {
            getDataUri(options.binaryData, function (e) {
                var defs = document.getElementsByTagName("defs")[0];
                var pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
                pattern.setAttribute("id", textureName);
                pattern.setAttribute("x", 0);
                pattern.setAttribute("y", 0);
                pattern.setAttribute("width", e.width);
                pattern.setAttribute("height", e.height);
                pattern.setAttribute("patternUnits", "objectBoundingBox");
                var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
                image.setAttributeNS("http://www.w3.org/1999/xlink", "href", e.dataUri);
                image.setAttribute("x", 0);
                image.setAttribute("y", 0);
                image.setAttribute("width", e.width);
                image.setAttribute("height", e.height);
                pattern.appendChild(image)
                defs.appendChild(pattern);

            });
        }
    }
    return textures[textureName];

}


function getDataUri(url, callback) {
    //REF: https://davidwalsh.name/convert-image-data-uri-javascript

    var image = new Image();

    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

        canvas.getContext('2d').drawImage(this, 0, 0);

        //get as Data URI
        callback({ dataUri: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height });
    };

    image.src = url;
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function loadWizard() {
    if (selectedShape) {
        selectedShape.unselect();
    }
    //getDataUri("wizard7.png", function (e) {

    //if (textures["wizard7.png"] == undefined) {
    //    textures["wizard7.png"] = PIXI.Texture.fromImage("wizard7.png");
    //}

    var wizard = new rectangle({
        //point: vec2.fromValues(25, 25),
        point: [50, 50],
        width: 50,
        height: 50,
        fillStyle: "wizard7.png", //extureHandler("wizard7.png"),
        layer: "token",
        pattern: false
    });
    selectLayer("token");
    wizard.select();
}

function selectLayer(layer) {
    if (selectedShape) {
        selectedShape.unselect();
    }

    for (var i = 0; i < layers_keys_length_cache; i++) {
        layers[layers_keys_cache[i]].setAttribute("pointer-events", "none");
    }

    if (selectedLayer) {
        //if (selectedLayer.children) {
        //    for (var i = 0; i < selectedLayer.children.length; i++) {
        //        selectedLayer.setAttribute("pointer-events", "none");
        //    }
        //}
        document.getElementById((selectedLayer.layer || selectedLayer.id) + "ListItem").classList.remove("selectedButton");
    }
    selectedLayer = layers[layer];
    //if (selectedLayer.children) {
    //    for (var i = 0; i < selectedLayer.children.length; i++) {
    //        selectedLayer.removeAttribute("pointer-events");
    //    }
    //}
    selectedLayer.removeAttribute("pointer-events");
    var elem = document.getElementById((selectedLayer.layer || selectedLayer.id) + "ListItem");
    if (elem) {
        elem.classList.add("selectedButton");
    }
}

function drawWebGL() {
    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
}

//function drawGrid() {
//    if (layers["gridLayer"].isDirty) {
//        //var viewBox = { x: 0, y: 0, width: 2000, height: 2000, zoom: 1 };
//        if (viewBox.z > 0.2) {
//            console.log("drawGrid");
//            var ctx = layers["gridLayer"].ctx;
//            var canvas = layers["gridLayer"].canvas;

//            if (layers["gridLayer"].gridPattern == undefined) {
//                // Draw rectangle/grid to a buffer canvas
//                var bufferCanvas = document.createElement("canvas");
//                var bufferCanvasCtx = bufferCanvas.getContext("2d");
//                var size = gridSizeInPixels * viewBox.zoom;
//                bufferCanvasCtx.canvas.width = size;
//                bufferCanvasCtx.canvas.height = size;
//                bufferCanvasCtx.beginPath();
//                bufferCanvasCtx.lineWidth = 1;
//                bufferCanvasCtx.strokeStyle = "black";
//                bufferCanvasCtx.rect(0.5, 0.5, size, size);
//                bufferCanvasCtx.stroke();
//                console.log("GridSize: " + size, bufferCanvasCtx.canvas.height);
//                // Convert to Image
//                var img = new Image();
//                img.src = bufferCanvas.toDataURL("image/png");

//                // Convert to Pattern
//                layers["gridLayer"].gridPattern = layers["gridLayer"].ctx.createPattern(img, "repeat");
//                //layers["gridLayer"].patternZoom = viewBox.zoom
//            }
//            //ctx.translate(-viewBox.x, -viewBox.y);
//            ctx.clearRect(-viewBox.x / viewBox.z, -viewBox.y / viewBox.z, canvas.width / viewBox.z, canvas.height / viewBox.z);


//            //ctx.rect(-viewBox.x, -viewBox.y, canvas.width / viewBox.z, canvas.height / viewBox.z);
//            ctx.rect(-viewBox.x / viewBox.z, -viewBox.y / viewBox.z, canvas.width / viewBox.z, canvas.height / viewBox.z);
//            ctx.fillStyle = layers["gridLayer"].gridPattern;
//            ctx.fill();
//            //ctx.translate(viewBox.x, viewBox.y);

//        }
//        layers["gridLayer"].isDirty = false;
//    }
//}

function drawShapes() {
    if (layers["backgroundLayer"]) {
        if (layers["backgroundLayer"].isDirty) {
            console.log("drawShapes");

            var canvas = layers["backgroundLayer"].canvas;
            var ctx = layers["backgroundLayer"].ctx;
            ctx.clearRect(-viewBox.x / viewBox.z, -viewBox.y / viewBox.z, canvas.width / viewBox.z, canvas.height / viewBox.z);
            for (var i = 0; i < shapes_keys_length_cache; i++) {
                var shape = shapes[shapes_keys_cache[i]];
                shape.draw(ctx);

            }

            layers["backgroundLayer"].isDirty = false;
        }
    }
}

var _frameNumber = 0;
var _fpsStartTime = Date.now();
var _fps = 30;
var _frameCount = 0;

function animate(e) {
    var t = Date.now();

    // Some hash table functions are slow.  Cache results for simple optimization
    shapes_keys_cache = Object.keys(shapes);
    shapes_keys_length_cache = shapes_keys_cache.length;

    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    // each frame we spin the bunny around a bit
    for (var i = 0; i < tokenList.length; i++) {
        tokenList[i].rotation += 0.01;
    }

    var t_Renderer = "?";
    var t_Shapes = "?";
    var t_x = "?";
    var t_y = "?";

    if (settings.displayMode == "WebGL") {

        drawWebGL();
    }

    if (settings.displayMode == "Canvas") {

        drawGrid();
        drawShapes();

        t_Renderer = "canvas";
        t_Shapes = shapes_keys_length_cache;
        if (lastMouse) {
            t_x = Math.round(localCoordinates()[0]);
            t_y = Math.round(localCoordinates()[1]);
        }
    }


    var drawTime = (Date.now() - t);
    _frameCount += 1;
    if (Date.now() - _fpsStartTime >= 1000) {
        _fps = _frameCount;
        _frameCount = 0;
        _fpsStartTime = Date.now();
    }
    var text = "";

    if (settings.displayMode == "WebGL") {
        if (renderer instanceof PIXI.CanvasRenderer) {
            t_Renderer = "pixicanvas";
        } else {
            t_Renderer = "webgl";
        }

        t_Shapes = shapes_keys_length_cache;
        if (window.lastMouse != undefined) {
            var local = world.toLocal(new PIXI.Point(lastMouse.x, lastMouse.y), stage);
            t_x = Math.round(local.x);
            t_y = Math.round(local.y);
        }
    }

    if (settings.displayMode == "svg") {
        t_Renderer = "svg";


        t_Shapes = shapes_keys_length_cache;
        if (window.lastMouse != undefined) {
            //var local = localCoordinates();
            t_x = Math.round(mouseLocalPosition.x);
            t_y = Math.round(mouseLocalPosition.y);
        }
    }

    text = "Render: " + t_Renderer + ", Shapes: " + t_Shapes + ", FPS: " + _fps + ", DrawTime: " + ("0" + drawTime).slice(-2) + "ms";
    text += ", Cursor: " + t_x + " " + t_y;


    statusSpan.textContent = text;
}