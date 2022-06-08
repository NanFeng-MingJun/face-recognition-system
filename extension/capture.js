async function capture(checkinID) {
    const cv = document.createElement("canvas");
    
    cv.width = checkinVideo.width;
    cv.height = checkinVideo.height;
    
    console.log(`Capture: width=${checkinVideo.width}, height=${checkinVideo.height}`);
    
    const ctx = cv.getContext("2d");
    ctx.drawImage(checkinVideo, 0, 0, cv.width, cv.height);

    // cv2 = await faceapi.extractFaces(cv, [await detect(cv)]);
    cv.toBlob(async function(blob) {
        // get presigned url
        const res = await fetch("$khoaluan-rollcall-url/images");
        const { putUrl, getUrl, name } = await res.json();

        // upload image to presigned url
        const file = new File([blob], "face.png", {type: "image/png"});
        const res2 = await fetch(putUrl, {
            method: "PUT",
            body: file
        });

        if (!res2.ok) {
            return alert("Upload failed");
        }

        // upload image info to server
        const res3 = await fetch("$khoaluan-rollcall-url/checkin/" + checkinID, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                imageUrl: getUrl
            })
        });
        
        if (res3.ok) {
        	alert("Check-in successfully");
        } else {
        	alert("Check-in failed");
        }
    })
}
