import Swal from "sweetalert2"
import * as config from "root/config.json"

const infoEndpoint = config.apiEndpoint + "/students/info";
const imageServiceEndpoint = config.apiEndpoint + "/images";
const uploadImageEndpoint = config.apiEndpoint + "/students/image";

const camera = document.querySelector("#camera");
const btnCapture = document.querySelector("#btn-capture");
const btnDisabled = document.querySelector("#btn-disabled");
let streamWidth = 0;
let streamHeight = 0;


async function sweetAlert(text, icon) {
    return Swal.fire({
        titleText: text,
        icon: icon
    });
}

async function sweetConfirm(text, icon) {
    return Swal.fire({
        titleText: text,
        icon: icon,
        showCancelButton: true,
        showConfirmButton: true
    });
}

async function getPresignedUrl() {
    const res = await fetch(imageServiceEndpoint, {
        credentials: "include"
    });
    const data = await res.json();
    return data;
}

async function uploadStudentImage(imageUrl) {
    const options = {
        headers: {
            "content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ imageUrl }),
        credentials: "include"
    }

    const res = await fetch(uploadImageEndpoint, options);
    if (!res.ok) {
        sweetAlert("Failed to upload student image", "error");
        return;
    }
    sweetAlert("Register successfully", "success");
}

async function handleCapture() {
    // handle capture event
    const canvas = document.createElement("canvas");
    canvas.width = streamWidth;
    canvas.height = streamHeight;

    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    
    btnCapture.addEventListener("click", async () => {
        const { isConfirmed } = await sweetConfirm("Are you sure you want to register your face ?", "question");
        if (!isConfirmed) {
            return;
        }

        const data = await getPresignedUrl();

        // capture image from camera
        ctx.drawImage(camera, 0, 0);
        canvas.toBlob(async blob => {
            const file = new File([blob], data.name, { type: "image/png" });
            const options = {
                method: "PUT",
                body: file,
                credentials: "include"
            };
            const res = await fetch(data.putUrl, options);
            if (!res.ok) {
                sweetAlert("Failed to upload image to presigned url", "error");
                return;
            }

            await uploadStudentImage(data.getUrl);
        }, "image/png");
    });
}

async function main() {
    // check whether face has been registered or not 
    const res = await fetch(infoEndpoint, {
        credentials: "include"
    });
    const { data } = await res.json();

    if (data.isImgUploaded) {
        btnDisabled.classList.remove("is-hidden");
    }
    else {
        btnCapture.classList.remove("is-hidden");
    }
    
    // turn on camera for capture
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 500,
                height: 500
            }
        });
    }
    catch(err) {
        sweetAlert("Please allow camera to capture", "error");
        return;
    }

    streamWidth = stream.getVideoTracks()[0].getSettings().width;
    streamHeight = stream.getVideoTracks()[0].getSettings().height;
    camera.srcObject = stream;
    camera.onloadstart = handleCapture;
}

main();
