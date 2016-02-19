var adorner = function (_geometry) {
    var _self = this;
    this.type = "adorner";
    //this.point = { x: _point.x, y: _point.y };
    //this.cx = point.x;
    //this.cy = point.y;
    //this.r = 6;

    //this.parent = _parent;
    this._adornNode = _geometry.cloneNode();
    this._adornNode.setAttribute("stroke", "white");
    this._adornNode.setAttribute("stroke-width", "3");
    this._adornNode.setAttribute("fill", "none");
    this._adornNode.setAttribute("pointer-events", "none");
    this._adornNode.setAttribute("vector-effect", "non-scaling-stroke");
    this._adornNode.setAttribute("stroke-linecap", "butt");

    this._adornNode2 = this._adornNode.cloneNode();
    this._adornNode2.setAttribute("stroke", "rgba(0,0,255,0.9)");

    this._adornNode.setAttribute("stroke-dasharray", "5");
    this._adornNode.setAttribute("class", "animation");
    //layers["adorner"].svgGroup.appendChild(this._adornNode2);
    //layers["adorner"].svgGroup.appendChild(this._adornNode);
    layers["adorner"].appendChild(this._adornNode2);
    layers["adorner"].appendChild(this._adornNode);


    this.remove = function () {
        this._adornNode.remove();
        this._adornNode2.remove();
    }
    
}