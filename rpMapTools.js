function importRpMap() {
    console.log("importRpMap");
    reset();

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //ref: https://www.thewebflash.com/reading-and-creating-text-files-using-the-html5-file-api/

        document.getElementById('InputFile').click();

    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

}

document.getElementById('InputFile').onchange = function (event) {
    var fileToLoad = event.target.files[0];

    if (fileToLoad) {
        var reader = new FileReader();
        reader.onload = function (fileLoadedEvent) {

            // ref: https://stuk.github.io/jszip/documentation/examples/read-local-file-api.html
            var zip = new JSZip(fileLoadedEvent.target.result);
            window._zip = zip;

            var content = zip.file("content.xml").asText();
            window.xmlDoc = $.parseXML(content);
            //console.log(window.xmlDoc);

            var gridSize = $(xmlDoc).find("zone").find("grid").find("size").text();
            if (gridSize != gridSizeInPixels) {
                resizeGrid(gridSize);
            }

            $(xmlDoc).find("zone").find("tokenMap").children().each(function () {
                var tokenProps = {};
                var entry = $(this);
                //var x = entry.find("net\\.rptools\\.maptool\\.model\\.Token");
                //console.log(x);

                var assetText = entry.find("imageAssetMap").find("id").text();
                tokenProps.imageAssetMap = assetText;
                //console.log(assetText);
                var assetMapRaw = zip.file("assets/" + assetText).asText();
                var assetMapDoc = $.parseXML(assetMapRaw);
                //console.log(assetMapDoc);
                var originalFilename = $(assetMapDoc).find("name").text() + "." + $(assetMapDoc).find("extension").text();
                var hashFileName = assetText + "." + $(assetMapDoc).find("extension").text();

                //console.log(fileName);
                var assetImage = zip.file("assets/" + hashFileName).asBinary();
                var img = document.createElement('img');
                img.src = "data:image/jpeg;base64," + btoa(assetImage);

                var tokenEntry = entry.children("net\\.rptools\\.maptool\\.model\\.Token");



                tokenProps.x = tokenEntry.children("x").text();
                tokenProps.y = tokenEntry.children("y").text();
                tokenProps.z = tokenEntry.children("z").text();
                tokenProps.anchorX = tokenEntry.children("anchorX").text();
                tokenProps.anchorY = tokenEntry.children("anchorY").text();
                tokenProps.sizeScale = tokenEntry.children("sizeScale").text();
                tokenProps.snapToScale = tokenEntry.children("snapToScale").text();
                tokenProps.width = tokenEntry.children("width").text();
                tokenProps.height = tokenEntry.children("height").text();
                tokenProps.scaleX = tokenEntry.children("scaleX").text();
                tokenProps.scaleY = tokenEntry.children("scaleY").text();
                tokenProps.sizeMap = tokenEntry.children("sizeMap").find("baGUID").text();
                tokenProps.snapToGrid = tokenEntry.children("snapToGrid").text();
                tokenProps.isVisible = tokenEntry.children("isVisible").text();
                tokenProps.name = tokenEntry.children("name").text();
                tokenProps.tokenShape = tokenEntry.children("tokenShape").text();
                tokenProps.tokenType = tokenEntry.children("tokenType").text();
                tokenProps.layer = tokenEntry.children("layer").text();
                tokenProps.facing = tokenEntry.children("facing").text();

                var shapeProps = {};

                shapeProps.layer = "";
                shapeProps.x = tokenProps.x;
                shapeProps.y = tokenProps.y;
                shapeProps.width = img.naturalWidth;
                shapeProps.height = img.naturalHeight;

                if (tokenProps.layer == "BACKGROUND") {
                    shapeProps.layer = "background";
                }

                if (tokenProps.layer == "TOKEN") {
                    shapeProps.layer = "token";
                }

                if ((tokenProps.sizeMap == "fwABAc9lFSoFAAAAKgABAQ==" || tokenProps.sizeMap == "fwABAQllXDgBAAAAOAABAQ==") && tokenProps.layer == "BACKGROUND") {
                    shapeProps.size = "Free_Size";
                    shapeProps.width = tokenProps.width * tokenProps.scaleX;
                    shapeProps.height = tokenProps.height * tokenProps.scaleY;

                }


                if ((tokenProps.sizeMap == "fwABAc1lFSoBAAAAKgABAQ==") && tokenProps.layer == "TOKEN") {
                    shapeProps.size = "Fine";
                    shapeProps.width = gridSizeInPixels * .6;
                    shapeProps.height = gridSizeInPixels * .6;
                }

                if ((tokenProps.sizeMap == "fwABAc1lFSoCAAAAKgABAQ==" ) && tokenProps.layer == "TOKEN") {
                    shapeProps.size = "Diminutive";
                    shapeProps.width = gridSizeInPixels * .7;
                    shapeProps.height = gridSizeInPixels * .7;
                }

                if ((tokenProps.sizeMap == "fwABAc5lFSoEAAAAKgABAA==" ) && tokenProps.layer == "TOKEN") {
                    shapeProps.size = "Small"
                    shapeProps.width = gridSizeInPixels * .8;
                    shapeProps.height = gridSizeInPixels * .8;
                }

                if ((tokenProps.sizeMap == "fwABAQllXDgBAAAAOAABAQ==" || tokenProps.sizeMap == "fwABAc9lFSoFAAAAKgABAQ==") && tokenProps.layer == "TOKEN") {
                    shapeProps.size = "Medium"
                    shapeProps.width = gridSizeInPixels;
                    shapeProps.height = gridSizeInPixels;
                }

                if ((tokenProps.sizeMap == "fwABAQllXDgCAAAAOAABAQ==" || tokenProps.sizeMap == "fwABAdBlFSoGAAAAKgABAA==") && tokenProps.layer == "TOKEN") {
                    shapeProps.size = "Large"
                    shapeProps.width = gridSizeInPixels * 2;
                    shapeProps.height = gridSizeInPixels * 2;
                }

                if (tokenProps.sizeMap == "fwABAdBlFSoHAAAAKgABAA==" && tokenProps.layer == "TOKEN") {
                    shapeProps.size = "Huge"
                    shapeProps.width = gridSizeInPixels * 3;
                    shapeProps.height = gridSizeInPixels * 3;
                }

                if (tokenProps.sizeMap == "fwABAdFlFSoIAAAAKgABAQ==" && tokenProps.layer == "TOKEN") {
                    shapeProps.size = "Gargantuan"
                    shapeProps.width = gridSizeInPixels * 4;
                    shapeProps.height = gridSizeInPixels * 4;
                }

                if (tokenProps.sizeMap == "fwABAeFlFSoJAAAAKgABAQ==" && tokenProps.layer == "TOKEN") {
                    shapeProps.size = "Colossal"
                    shapeProps.width = gridSizeInPixels * 6;
                    shapeProps.height = gridSizeInPixels * 6;
                }

                //if (tokenProps.snapToGrid && tokenProps.layer == "TOKEN") {
                //    shapeProps.x = Math.floor(shapeProps.x / gridSizeInPixels) * gridSizeInPixels;
                //    shapeProps.y = Math.floor(shapeProps.y / gridSizeInPixels) * gridSizeInPixels;
                //}

                // Make sure we have an appropriate layer we can handle
                if (shapeProps.layer > "") {

                    var shape = new rectangle({
                        //point: vec2.fromValues(25, 25),
                        point: [shapeProps.x, shapeProps.y],
                        width: shapeProps.width,
                        height: shapeProps.height,
                        fillStyle: textureHandler(assetText, { binary64: "data:image/jpeg;base64," + btoa(assetImage) }),
                        //fillStyle: img.src,
                        layer: shapeProps.layer,
                        pattern: false,
                        snapToGrid: tokenProps.snapToGrid
                    });

                    shape.tokenProps = tokenProps;
                    shape.shapeProps = shapeProps;
                    
                    
                    //Z-index
                    if (tokenProps.z > 0) {
                        shape.geometry.setAttribute("z", tokenProps.z);
                    } else {
                        shape.geometry.setAttribute("z", 0);
                    }


                    // Facing
                    if (tokenProps.facing) {
                        //shape.rotate(tokenProps.facing);
                    }

                }


                // ToDo: move into worker thread becuase some maps take ALONG time to load.
                // ToDo: Storing images in SVG DEF may be inefficient.
                console.log(tokenProps.name, shapeProps);
            });

            // Sort background layer by Z-index
            $(layers["background"]).children("").sort(function (a, b) {
                return $(a).attr('z') - $(b).attr('z');
            })
            .appendTo(layers["background"]);

            // Sort token layer by Z-index
            $(layers["token"]).children("").sort(function (a, b) {
                return $(a).attr('z') - $(b).attr('z');
            })
            .appendTo(layers["token"]);

            // ToDo: Am I suppose to close a zip/reader?

        };
        reader.readAsArrayBuffer(fileToLoad);

    }
};



function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}