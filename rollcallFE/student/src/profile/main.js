import placeholderImage from "./images/placeholder.png"
import * as config from "root/config.json"

const studentIDDisplay = document.querySelector("#student-id");
const nameDisplay = document.querySelector("#name");
const phoneDisplay = document.querySelector("#phone");
const faceImage = document.querySelector("#face-image");

const endpoint = config.apiEndpoint + "/students/info";

async function showInfo() {
    const res = await fetch(endpoint, {
        credentials: "include"
    });
    const { data } = await res.json();
    
    studentIDDisplay.innerHTML += data._id;
    nameDisplay.innerHTML += data.name;
    phoneDisplay.innerHTML += data.phone;

    const imageUrl = data.imageUrl || placeholderImage;
    faceImage.style.backgroundImage = `url(${imageUrl})`;
}

showInfo();