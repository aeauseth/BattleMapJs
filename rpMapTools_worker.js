importScripts("workerFakeDOM.js", "frameworks/jquery/jquery-2.1.1.min.js", "frameworks/Stuk-jszip/jszip.min.js");

onmessage = function (e) {
    console.log("rpMapTools_worker started with " + e.data[1].length + " items to process");
    console.log(e.data[0]);
    var zip = new JSZip(e.data[0]);
    var _tokensToLoad = e.data[1];

    for (var i = 0; i < _tokensToLoad.length; i++) {
        var _token = _tokensToLoad[i];

        // Reading a large image from the ZIP file take several seconds (4+ during testing).
        // Which is the main reason for using a worker thread.
        _token.assetImage = zip.file("assets/" + _token.tokenProps.hashFileName).asBinary();
        _token.btoa = btoa(_token.assetImage);
        postMessage(_token);
        //console.log(_token);
        //break;
    }

    console.log("rpMapTools_worker ended");
    //close();
}