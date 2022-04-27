scriptStream = document.createElement("script");
scriptStream.src = chrome.runtime.getURL("stream.js");
document.body.appendChild(scriptStream);

scriptStream.onload = function() {
    scriptFaceAPI = document.createElement("script");
    scriptFaceAPI.src = chrome.runtime.getURL("face-api.min.js");
    document.body.appendChild(scriptFaceAPI);

    scriptFaceAPI.onload = function() {
        scriptCapture = document.createElement("script");
        scriptCapture.src = chrome.runtime.getURL("capture.js");
        document.body.appendChild(scriptCapture);
    }

    scriptSocketIO = document.createElement("script");
    scriptSocketIO.src = chrome.runtime.getURL("socket.io.js");
    document.body.appendChild(scriptSocketIO);

    scriptSocketIO.onload = function() {
        scriptUI = document.createElement("script");
        scriptUI.src = chrome.runtime.getURL("checkinHTML.js");
        document.body.appendChild(scriptUI);

        scriptUI.onload = function() {
            scriptMain = document.createElement("script");
            scriptMain.src = chrome.runtime.getURL("main.js");
            document.body.appendChild(scriptMain);
        }
    }
}

style = document.createElement("link");
style.href = chrome.runtime.getURL("checkin.css");
style.rel = "stylesheet";
document.head.appendChild(style);