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
                resetGrid(gridSize);
            }

            $(xmlDoc).find("zone").find("tokenMap").children().each(function () {
                var entry = $(this);
                var x = entry.find("net\\.rptools\\.maptool\\.model\\.Token");
                //console.log(x);
                
                var assetText = entry.find("imageAssetMap").find("id").text();
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

                new rectangle({
                    //point: vec2.fromValues(25, 25),
                    point: [50, 50],
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    //fillStyle: textureHandler(originalFilename, { texture: true, binaryData: img.src }),
                    fillStyle: img.src,
                    layer: "background",
                    pattern: false
                });
                //console.log(img);
            });
        };
        reader.readAsArrayBuffer(fileToLoad);
    }
};



function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}