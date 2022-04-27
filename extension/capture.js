faceapi.nets.mtcnn.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');

async function detect(input) {
    const detection = await faceapi.detectSingleFace(input, new faceapi.MtcnnOptions({
        maxNumScales: 5,
        minFaceSize: 100,
    }));
    return detection;
}

async function capture() {
    const cv = document.createElement("canvas");
    
    cv.width = checkinVideo.width;
    cv.height = checkinVideo.height;
    
    console.log(`Capture: width=${checkinVideo.width}, height=${checkinVideo.height}`);
    
    const ctx = cv.getContext("2d");
    ctx.drawImage(checkinVideo, 0, 0, cv.width, cv.height);

    cv2 = await faceapi.extractFaces(cv, [await detect(cv)]);
    cv2[0].toBlob(async function(blob) {
        // get presigned url
        const res = await fetch("http://localhost:3000/images");
        const { url, name } = await res.json();

        // upload image to presigned url
        const file = new File([blob], "face.png", {type: "image/png"});
        const res2 = await fetch(url, {
            method: "PUT",
            body: file
        });

        if (!res2.ok) {
            alert("Upload failed");
        }

        // upload image info to server
        const res3 = await fetch("http://localhost:3000/images", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                imageName: name
            })
        });
    })
}