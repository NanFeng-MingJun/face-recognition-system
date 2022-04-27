tempGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

let checkinVideo = null;

navigator.mediaDevices.getUserMedia = async function(...args) {
    constrains = args[0];

    // no video stream
    if (!constrains.video) {
        return await tempGetUserMedia(...args);
    }

    // desktop stream
    if (constrains.video.mandatory && 
            constrains.video.mandatory.chromeMediaSource == 'desktop') {
        return await tempGetUserMedia(...args);
    }

    const stream = await tempGetUserMedia(...args);
    console.log(stream);
    
    checkinVideo = document.createElement('video');
    checkinVideo.srcObject = stream;
    checkinVideo.width = stream.getVideoTracks()[0].getSettings().width;
    checkinVideo.height = stream.getVideoTracks()[0].getSettings().height;
    await checkinVideo.play();

    stream.oninactive = function() {
        checkinVideo = null;
    }
    
    return stream
}

// escapePolicy = trustedTypes.createPolicy("default", {
//     createScriptURL: string => string
// })
// const worker = new Worker(document.body.dataset.workerUrl);

