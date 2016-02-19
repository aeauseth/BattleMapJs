"use strict"
var light;

var raycasting = function (_center) {
    var maxRayLength = 1000;
    var rayOffset = 0.00001;
    this.center = _center;
    this.blockers = [];
    this.clipPaths = [];
    this.solution;
    this.parent;
    this.debug = {};

    this.addBlockers = function (newBlockers) {
        this.blockers = this.blockers.concat(newBlockers);
    }

    this.addClipPath = function (newClipPath) {
        this.clipPaths = this.clipPaths.concat(newClipPath);
    }

    //this.drawBlockers = function () {
    //    var blockerLayer = document.getElementById("blockerLayer");
    //    while (blockerLayer.firstChild) {
    //        blockerLayer.removeChild(blockerLayer.firstChild);
    //    }

    //    for (i = 0; i < this.blockers.length; i++)
    //    {
    //        var blocker = this.blockers[i];

    //        //var line = drawLine(blocker.x1, blocker.y1, blocker.x2, blocker.y2, blockerLayer, "blocker");

    //        var line = new Line(new Point(blocker.x1, blocker.y1), new Point(blocker.x2, blocker.y2));
    //        line.draw(blockerLayer, "blocker");
    //    }

    //    this.drawRays();
    //}

    this.updateClipPaths = function () {
        console.log("updateClipPaths");
        this.clipPaths = [];
        this.blockers = [];
        for (i = 0; i < Object.keys(shapes).length; i++) {
            var shape = shapes[Object.keys(shapes)[i]];
            if (shape.getClipPath) {
                if (shape.layer.id != "tokenLayer") {
                    var shapeClipPath = shape.getClipPath()
                    if (shapeClipPath) {
                        light.addClipPath(shapeClipPath);
                    }
                }
            }
        }

        var cpr = new ClipperLib.Clipper();
        if (this.clipPaths.length > 0) {
            cpr.AddPath(this.clipPaths[0], ClipperLib.PolyType.ptSubject, true);
            for (var i = 1; i < this.clipPaths.length; i++) {
                cpr.AddPath(this.clipPaths[i], ClipperLib.PolyType.ptSubject, true);
            }

            this.solution = new ClipperLib.Paths();

            cpr.Execute(ClipperLib.ClipType.ctUnion, this.solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

            // Add Blockers based on Solution
            for (var i = 0; i < this.solution.length; i++) {
                for (var j = 0; j < this.solution[i].length; j++) {
                    var k = j + 1;
                    if (k == this.solution[i].length) {
                        k = 0;
                    }
                    //this.blockers.push({
                    //    x1: this.solution[i][j].X, y1: this.solution[i][j].Y,
                    //    x2: this.solution[i][k].X, y2: this.solution[i][k].Y
                    //});
                    this.blockers.push({
                        line: new Line(
                            new vec2.fromValues(this.solution[i][j].X, this.solution[i][j].Y),
                            new vec2.fromValues(this.solution[i][k].X, this.solution[i][k].Y)
                            )
                    });
                }
            }
        }


    }

    this.drawClipPaths = function () {
        var raycastLayer = layers["raycast"];
        while (raycastLayer.firstChild) {
            raycastLayer.removeChild(raycastLayer.firstChild);
        }

        if (this.clipPaths.length > 0) {
            var path = paths2string(this.solution, 1);

            var geometry = document.createElementNS("http://www.w3.org/2000/svg", "path");
            raycastLayer.appendChild(geometry);
            geometry.setAttribute("d", path);
            geometry.setAttribute("class", "svgPath");
        }

        this.drawRays();

    }

    var rayOcomplexity = 0;
    this.drawRays = function () {
        rayOcomplexity = 0;
        var rayCalcMs = Date.now();

        //var raycastLayer = document.getElementById("raycastLayer");
        //while (raycastLayer.firstChild) {
        //    raycastLayer.removeChild(raycastLayer.firstChild);
        //}

        var rays = [];

        // Create 4 rays on diagnals to create a basic vision box
        // Useful when there are large open areas
        // ToDo: Improve to use arcs/circles instead of a square vision box

        rays.push(new Ray(this.center, vec2.fromValues(this.center[0] - maxRayLength, this.center[1] - maxRayLength)));
        rays.push(new Ray(this.center, vec2.fromValues(this.center[0] + maxRayLength, this.center[1] - maxRayLength)));
        rays.push(new Ray(this.center, vec2.fromValues(this.center[0] - maxRayLength, this.center[1] + maxRayLength)));
        rays.push(new Ray(this.center, vec2.fromValues(this.center[0] + maxRayLength, this.center[1] + maxRayLength)));

        // Add a Ray for each blocker endpoint
        for (i = 0; i < this.blockers.length; i++) {
            var blocker = this.blockers[i];
            var ray1 = new Ray(this.center, blocker.line.pt1);
            ray1.angle -= rayOffset;
            rays.push(ray1);
            var ray2 = new Ray(this.center, blocker.line.pt1);
            ray2.angle += rayOffset;
            rays.push(ray2);

            var ray1 = new Ray(this.center, blocker.line.pt2);
            ray1.angle -= rayOffset;
            rays.push(ray1);
            var ray2 = new Ray(this.center, blocker.line.pt2);
            ray2.angle += rayOffset;
            rays.push(ray2);
        }
        //rayOcomplexity += this.blockers.length;


        rays.sort(function (a, b) {
            if (a.angle > b.angle) {
                return 1;
            }
            if (a.angle < b.angle) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });

        //rayOcomplexity: unknown sort O value


        // Purge duplicates and zero length (awkward)
        var _rays2 = []
        _rays2.push(rays[0]);
        for (var i = 1; i < rays.length; i++) {
            if (rays[i].angle != rays[i - 1].angle && rays[i].length > 0) {
                _rays2.push(rays[i]);
            }
        }

        rays = _rays2;

        // Sort blockers based on distance
        for (var b = 0; b < this.blockers.length; b++) {
            this.blockers[b].distance = this.blockers[b].line.distanceToPointSquared(this.center);
        }

        this.blockers.sort(function (a, b) {
            if (a.distance > b.distance) {
                return 1;
            }
            if (a.distance < b.distance) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });


        //Draw all the rays;
        for (var i = 0; i < rays.length; i++) {
            this.drawRay(rays[i]);
        }

        // Fill light with several polygons
        if (true) {
            for (var i = 0; i < rays.length; i++) {

                var geometry = document.createElementNS("http://www.w3.org/2000/svg", "path");
                raycastLayer.appendChild(geometry);

                var j = i + 1;
                if (j >= rays.length) {
                    j = 0;
                }
                var pstring = "M" + rays[i].pt[0] + " " + rays[i].pt[1];
                pstring += "L " + rays[i].getEndPoint()[0] + ", " + rays[i].getEndPoint()[1];

                if (rays[i].length == maxRayLength && rays[j].length == maxRayLength) {
                    pstring += "A " + maxRayLength + " " + maxRayLength + " 0 0 1 " + rays[j].getEndPoint()[0] + ", " + rays[j].getEndPoint()[1] + " Z";
                }
                else {
                    pstring += "L " + rays[j].getEndPoint()[0] + ", " + rays[j].getEndPoint()[1] + " Z";
                }



                geometry.setAttribute("d", pstring);
                geometry.setAttribute("class", "rayFill");
            }
        }
        this.debug["drawRaysMs"] = Date.now() - rayCalcMs;
        this.debug["rays"] = rays.length;
        this.debug["rayOcomplexity"] = rayOcomplexity;
        this.debug["rayBlockrs"] = this.blockers.length;
    }



    var Line = function (_pt1, _pt2) {
        this.pt1 = _pt1;
        this.pt2 = _pt2;


        this.draw = function (_layer, _cssClass) {
            var svgLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            _layer.appendChild(svgLine);
            svgLine.setAttribute("x1", this.pt1[0]);
            svgLine.setAttribute("y1", this.pt1[1]);
            svgLine.setAttribute("x2", this.pt2[0]);
            svgLine.setAttribute("y2", this.pt2[1]);
            if (_cssClass) {
                svgLine.setAttribute("class", _cssClass);
            }
        }

        this.distanceToPointSquared = function (p) {
            //ref: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
            var l2 = DistanceToPointSquared(this.pt1, this.pt2);
            if (l2 == 0) return DistanceToPointSquared(p, this.pt1);
            var t = ((p[0] - this.pt1[0]) * (this.pt2[0] - this.pt1[0]) + (p[1] - this.pt1[1]) * (this.pt2[1] - this.pt1[1])) / l2;
            if (t < 0) return DistanceToPointSquared(p, this.pt1);
            if (t > 1) return DistanceToPointSquared(p, this.pt2);
            return DistanceToPointSquared(p, [
                this.pt1[0] + t * (this.pt2[0] - this.pt1[0]),
                this.pt1[1] + t * (this.pt2[1] - this.pt1[1])
            ]);
        }


    }

    var Ray = function (_pt1, _pt2) {
        if (_pt1) {
            this.pt = _pt1;
            // this.angle = this.pt.AngleToPoint(_pt2);

            // AngleToPoint doens't seem to be included in glMatrix so making my own
            var dx = _pt2[0] - _pt1[0];
            var dy = _pt2[1] - _pt1[1];
            this.angle = Math.atan2(dy, dx);
            this.length = maxRayLength;  //Start with max ray length //this.pt.DistanceToPoint(_pt2);
        }

        this.getEndPoint = function () {
            var x2 = this.pt[0] + Math.cos(this.angle) * this.length;
            var y2 = this.pt[1] + Math.sin(this.angle) * this.length;
            return vec2.fromValues(x2, y2);
        }


        this.BROKEN_FromLine = function (_line) {
            this.pt = _line.pt1;
            var dx = _line.pt2[0] - _line.pt1[0];
            var dy = _line.pt2[1] - _line.pt1[1];
            this.angle = Math.atan2(dy, dx);
            this.length = DistanceToPoint(pt, _line.pt2);
            return this;
        }

        this.CheckBlocker = function (_line) {
            var line1EndX = this.pt[0] + Math.cos(this.angle) * this.length;
            var line1EndY = this.pt[1] + Math.sin(this.angle) * this.length;

            var denominator = ((_line.pt2[1] - _line.pt1[1]) * (line1EndX - this.pt[0])) - ((_line.pt2[0] - _line.pt1[0]) * (line1EndY - this.pt[1]));
            var a = this.pt[1] - _line.pt1[1];
            var b = this.pt[0] - _line.pt1[0];
            var numerator1 = ((_line.pt2[0] - _line.pt1[0]) * a) - ((_line.pt2[1] - _line.pt1[1]) * b);
            var numerator2 = ((line1EndX - this.pt[0]) * a) - ((line1EndY - this.pt[1]) * b);
            a = numerator1 / denominator;
            b = numerator2 / denominator;

            // check bounds to ensure intersection actually occurs within the line segments
            if (a > 0 && a < 1) {
                if (b > 0 && b < 1) {

                    var intersectX = this.pt[0] + (a * (line1EndX - this.pt[0]));
                    var intersectY = this.pt[1] + (a * (line1EndY - this.pt[1]));
                    this.length = Math.min(this.length, DistanceToPoint(this.pt, vec2.fromValues(intersectX, intersectY)));
                    this.length = Math.min(this.length, maxRayLength);
                    //return true; // ray hit blocker (maybe)
                }
            }
            return false; // ray will never hit blocker
        }
    }

    this.drawRay = function (ray) {

        // Loop thru all blockers to see if our ray intersects.  If so shorten the length of the ray.
        for (var j = 0; j < this.blockers.length; j++) {
            rayOcomplexity += 1;
            var blocker = this.blockers[j];
            //var line = new Line(blocker[0], blocker[1]);
            if (ray.CheckBlocker(blocker.line)) {
                break;
            }
        }
        //rayOcomplexity += this.blockers.length;

        //var x2 = ray.pt[0] + Math.cos(ray.angle) * ray.length;
        //var y2 = ray.pt[1] + Math.sin(ray.angle) * ray.length;
        //var line = drawLine(ray.pt.x, ray.pt.y, x2, y2, raycastLayer, "rayCast");
        //var line = new Line(ray.pt, vec2.fromValues(x2, y2));
        //line.draw(raycastLayer, "rayCast");
    }

    //var drawLine = function (x1, y1, x2, y2, layer, cssClass)
    //{
    //    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    //    layer.appendChild(line);
    //    line.setAttribute("x1", x1);
    //    line.setAttribute("y1", y1);
    //    line.setAttribute("x2", x2);
    //    line.setAttribute("y2", y2);
    //    if (cssClass) {
    //        line.setAttribute("class", cssClass);
    //    }

    //    return line;
    //}

    function findDistance(block, angle) {
        var y = (block.position.y + block.height / 2) - light.position.y,
            x = (block.position.x + block.width / 2) - light.position.x,
            dist = Math.sqrt((y * y) + (x * x));

        if (light.radius >= dist) {
            var rads = angle * (Math.PI / 180),
                pointPos = new vector(light.position.x, light.position.y);

            pointPos.x += Math.cos(rads) * dist;
            pointPos.y += Math.sin(rads) * dist;

            if (pointPos.x > block.position.x && pointPos.x < block.position.x + block.width && pointPos.y > block.position.y && pointPos.y < block.position.y + block.height) {
                if (start || dist < shortest) {
                    start = false;
                    shortest = dist;
                    rLen = dist;
                    closestBlock = block;
                }

                return { 'start': start, 'shortest': shortest, 'rLen': rLen, 'block': closestBlock };
            }
        }
        return { 'start': start, 'shortest': shortest, 'rLen': rLen, 'block': closestBlock };
    }

    function DistanceToPoint(_pt1, _pt2) {
        var dx = _pt2[0] - _pt1[0];
        var dy = _pt2[1] - _pt1[1];
        return Math.sqrt((dx * dx) + (dy * dy));
    }

    function DistanceToPointSquared(_pt1, _pt2) {
        var dx = _pt2[0] - _pt1[0];
        var dy = _pt2[1] - _pt1[1];
        return (dx * dx) + (dy * dy);
    }

    this.distanceToPointSquared = function (blocker, point) {
        var v = blocker[x1];
        var w = blocker[x2];
        var l2 = DistanceToPointSquared(this.pt1, this.pt2);
        if (l2 == 0) return DistanceToPointSquared(p, this.pt1);
        var t = ((point[0] - this.pt1[0]) * (this.pt2[0] - this.pt1[0]) + (point[1] - this.pt1[1]) * (this.pt2[1] - this.pt1[1])) / l2;
        if (t < 0) return DistanceToPointSquared(point, this.pt1);
        if (t > 1) return DistanceToPointSquared(point, this.pt2);
        return DistanceToPointSquared(point, [
            this.pt1.x + t * (this.pt2.x - this.pt1.x),
            this.pt1.y + t * (this.pt2.y - this.pt1.y)
        ]);
    }
}

function paths2string(paths, scale) {
    var svgpath = "", i, j;
    if (!scale) scale = 1;
    for (i = 0; i < paths.length; i++) {
        for (j = 0; j < paths[i].length; j++) {
            if (!j) svgpath += "M";
            else svgpath += "L";
            svgpath += (paths[i][j].X / scale) + ", " + (paths[i][j].Y / scale);
        }
        svgpath += "Z";
    }
    if (svgpath == "") svgpath = "M0,0";
    return svgpath;
}