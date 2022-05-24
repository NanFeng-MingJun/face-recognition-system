import Swal from "sweetalert2"
import * as config from "root/config.json"

const endpoint = config.apiEndpoint + "/auth/login?role=class";
const classIdInput = document.querySelector("#classid");
const passwordInput = document.querySelector("#password");
const btnLogin = document.querySelector("#btn-login");

btnLogin.addEventListener("click", login);

async function login() {
    const classID = classIdInput.value;
    const password = passwordInput.value;

    if (!classID.trim() || !password.trim()) {
        return sweetAlert("Missing ClassID or Password", "error");
    }

    const options = {
        headers: {
            "content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            username: classID,
            password: password
        }),
        credentials: "include"
    };

    const res = await fetch(endpoint, options);

    if (res.ok) {
        return location.href = "/checkin";
    }

    if (res.status == 401) {
        await sweetAlert("Invalid ClassID or Password", "error");
    }
    else {
        await sweetAlert("Something was wrong", "error");
    }
}

async function sweetAlert(text, icon) {
    return Swal.fire({
        titleText: text,
        icon: icon
    });
}

