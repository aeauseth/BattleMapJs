"use strict"
var rectangle = function (props) {
    var _self = this;
    this.id = generateUUID();
    this.type = "rect";
    this.point = [0, 0];
    this.width = 50;
    this.height = 50;
    this.src = undefined;
    this.fillStyle = "green";
    this.layer = "background";
    this.pattern = true;

    // Load Properties (if provided)
    if (props != undefined) {
        for (var prop in props) {
            this[prop] = props[prop];
        }
    }

    if (typeof (this.layer) == "string") {
        if (layers[this.layer]) {
            this.layer = layers[this.layer];
        }
        else {
            console.log("Undefined Layer: ", this.layer, ". Defaulting to background layer");
            this.layer = layers["background"];
        }
    }

    // solid color texture?
    //if (settings.displayMode == "WebGL") {
    //    shapes[_self.id] = _self;
    //    if (typeof (this.fillStyle) == "string") {
    //        var c = document.createElement('canvas');
    //        var ctx = c.getContext('2d');
    //        c.width = 1;
    //        c.height = 1;
    //        ctx.fillStyle = this.fillStyle;
    //        ctx.fillRect(0, 0, c.width, c.height);
    //        var t = new PIXI.Texture.fromCanvas(c);
    //        this.sprite = new PIXI.Sprite(t);
    //    }
    //    if (typeof (this.fillStyle) == "object") {
    //        if (this.tiledTexture) {
    //            this.sprite = new PIXI.extras.TilingSprite(this.fillStyle, this.fillStyle.width, this.fillStyle.height);
    //            this.sprite.tilePosition.x = this.point[0];
    //            this.sprite.tilePosition.y = this.point[1];
    //        } else {
    //            this.sprite = new PIXI.Sprite(this.fillStyle);
    //        }

    //        //this.sprite = new PIXI.Sprite.fromImage("Concrete-a.png");
    //        //this.width = 50;
    //        //this.height = 50;
    //    }

    //    this.sprite.buttonMode = true;
    //    this.sprite.position.x = this.point[0];
    //    this.sprite.position.y = this.point[1];
    //    this.sprite.width = this.width;
    //    this.sprite.height = this.height;
    //    this.layer.addChild(this.sprite);
    //    //console.log(this.sprite);

    //    this.sprite._self = _self;
    //    this.sprite.interactive = this.layer === selectedLayer;
    //    this.sprite.on("mousedown", function (e) {
    //        _self.select();
    //        var local = world.toLocal(e.data.global, stage);
    //        _self.dragOffset = [local.x - _self.point[0], local.y - _self.point[1]];
    //        _self.dragging = true;

    //        //_self.mousedown();

    //        //var local = world.toLocal(e.data.global, stage);
    //        //_self.offset = { x: local.x - _self.sprite.position.x, y: local.y - _self.sprite.position.y };
    //        //_self.dragging = true;
    //        //console.log("sprite.mousedown", _self);
    //        e._stopPropegation = true;
    //    });

    //    this.sprite.on('mouseup', function (e) {
    //        _self.dragging = false;
    //    });

    //    this.sprite.on("mousemove", function (e) {
    //        //window.lastMouse = e.data.originalEvent;
    //        if (selectedShape !== _self) return;
    //        if (e.data.originalEvent.which != 1) return;
    //        if (!_self.dragging) return;
    //        var local = world.toLocal(e.data.global, stage);

    //        _self.moveTo(local.x, local.y);


    //        //if (!_self.dragging) return;

    //        ////if (e.data.originalEvent.which == 1) {
    //        //var local = world.toLocal(e.data.global, stage);

    //        //_self.sprite.position.x = local.x - _self.offset.x;
    //        //_self.sprite.position.y = local.y - _self.offset.y;

    //        //_self.adorner._adornNode.setAttribute("x", _self.sprite.position.x);
    //        //_self.adorner._adornNode2.setAttribute("x", _self.sprite.position.x);
    //        //_self.adorner._adornNode.setAttribute("y", _self.sprite.position.y);
    //        //_self.adorner._adornNode2.setAttribute("y", _self.sprite.position.y)
    //        //}
    //        //console.log("mousemove");


    //    });
    //}

    this.move = function (e) {
        //var lc = localCoordinates();

        _self.moveTo(mouseLocalPosition.x, mouseLocalPosition.y);
    }

    if (settings.displayMode == "Canvas") {
        shapes[_self.id] = _self;

    }

    if (settings.displayMode == "svg") {
        shapes[_self.id] = _self;

        if (!this.pattern) {
            //console.log(this.fillStyle);
            this.geometry = document.createElementNS("http://www.w3.org/2000/svg", "image");
            this.geometry.setAttributeNS("http://www.w3.org/1999/xlink", "href", this.fillStyle);
        } else {
            this.geometry = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.geometry.setAttribute("fill", this.fillStyle);
        }
        
        

        this.geometry.setAttribute("x", this.point[0]);
        this.geometry.setAttribute("y", this.point[1]);
        this.geometry.setAttribute("width", this.width);
        this.geometry.setAttribute("height", this.height);


        
        this.layer.appendChild(this.geometry);
        this.geometry.onmousedown = function (e) {
            //console.log("geometry onmousedown", e, _self);
            //var lc = localCoordinates();
            _self.dragOffset = [mouseLocalPosition.x - _self.point[0], mouseLocalPosition.y - _self.point[1]];
            _self.select();
            _self.dragging = true;

        }
        //console.log(this.geometry);

    }

    this.draw = function (ctx) {
        this.ctx = layers["backgroundLayer"].ctx;
        this.ctx.fillStyle = "black";
        if (typeof (this.fillStyle) == "string") {
            this.ctx.fillStyle = this.fillStyle;
        } else {
            this.ctx.fillStyle = this.fillStyle.pattern;
        }
        var x = this.point[0];
        var y = this.point[1];

        ctx.fillRect(x, y, this.width, this.height);
    }

    this.select = function () {
        if (selectedShape === _self) return;
        if (selectedShape != undefined) {
            selectedShape.unselect();
        }
        selectedShape = _self;
        this.geometry.style.cursor = "move";
       

        console.log("select", _self);




        // Adorner
        var _adn = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        _adn.setAttribute("x", this.point[0]);
        _adn.setAttribute("y", this.point[1]);
        _adn.setAttribute("width", this.width);
        _adn.setAttribute("height", this.height);
        _self.adorner = new adorner(_adn);

        //if (this.sprite) {
        //    this.sprite.buttonMode = true;
        //}
    }

    this.unselect = function () {
        _self.adorner.remove();

        //if (this.sprite) {
        //    this.sprite.buttonMode = false;
        //}

        this.geometry.style.cursor = "";

        selectedShape = undefined;
    }

    this.drag = function (deltaX, deltaY) {
        _self.point[0] += deltaX;
        _self.point[1] += deltaY;

        _self.adorner._adornNode.setAttribute("x", _self.point[0]);
        _self.adorner._adornNode.setAttribute("y", _self.point[1]);
        _self.adorner._adornNode2.setAttribute("x", _self.point[0]);
        _self.adorner._adornNode2.setAttribute("y", _self.point[1]);

        layers["backgroundLayer"].isDirty = true;

    }


    this.moveTo = function (x, y) {
        var xx = x - _self.dragOffset[0];
        var yy = y - _self.dragOffset[1];

        if (lastMouse.ctrlKey) {
            xx = Math.round(xx / gridSizeInPixels) * gridSizeInPixels;
            yy = Math.round(yy / gridSizeInPixels) * gridSizeInPixels;
        }

        _self.point[0] = xx;
        _self.point[1] = yy;

        //if (_self.sprite) {
        //    _self.sprite.position.x = _self.point[0];
        //    _self.sprite.position.y = _self.point[1];
        //    if (_self.sprite.tilePosition) {
        //        _self.sprite.tilePosition.x = -_self.point[0];
        //        _self.sprite.tilePosition.y = -_self.point[1];
        //    }
        //}

        _self.geometry.setAttribute("x", _self.point[0]);
        _self.geometry.setAttribute("y", _self.point[1]);

        _self.adorner._adornNode.setAttribute("x", _self.point[0]);
        _self.adorner._adornNode.setAttribute("y", _self.point[1]);
        _self.adorner._adornNode2.setAttribute("x", _self.point[0]);
        _self.adorner._adornNode2.setAttribute("y", _self.point[1]);

        if (settings.displayMode == "Canvas") {
            layers["backgroundLayer"].isDirty = true;
        }

        if (light) {

            if (_self.layer.layer == "background") {
                light.updateClipPaths();
            }

            if (light.parent) {
                light.center = light.parent.getCenter();
            }
            light.drawClipPaths();
            //light.drawRays();
        }
    }

    this.mousedown = function () {
        var lc = localCoordinates();
        _self.dragOffset = [lc[0] - _self.point[0], lc[1] - _self.point[1]];
        _self.select();
        _self.dragging = true;
    }

    this.getCenter = function () {
        return [_self.point[0] + _self.width / 2, _self.point[1] + _self.height / 2];
    }

    this.getClipPath = function () {
        if (_self.layer.layer == "token") return;
        var clipPath = [];
        var x1 = this.point[0];
        var y1 = this.point[1];
        var x2 = this.point[0] + this.width;
        var y2 = this.point[1] + this.height;

        var v1 = vec2.fromValues(x1, y1);
        var v2 = vec2.fromValues(x2, y1);
        var v3 = vec2.fromValues(x2, y2);
        var v4 = vec2.fromValues(x1, y2);

        //this.updateMatrix();
        //vec2.transformMat3(v1, v1, this.matrix);
        //vec2.transformMat3(v2, v2, this.matrix);
        //vec2.transformMat3(v3, v3, this.matrix);
        //vec2.transformMat3(v4, v4, this.matrix);

        var c = [{ "X": v1[0], "Y": v1[1] }, { "X": v2[0], "Y": v2[1] },
             { "X": v3[0], "Y": v3[1] }, { "X": v4[0], "Y": v4[1] }];
        //console.log(c);
        clipPath.push(c);

        return clipPath;

    }
}

var line = function (props) {
    var _self = this;
    this.type = "line";
    this.pt1 = [0, 0];
    this.pt2 = [200, 200];

    var g = new PIXI.Graphics();
    g.lineStyle(2, 0xFF0000);
    g.moveTo(this.pt1[0], this.pt1[1]);
    g.lineTo(this.pt2[0], this.pt2[1]);
    this.sprite = g;
    world.addChild(this.sprite);
}