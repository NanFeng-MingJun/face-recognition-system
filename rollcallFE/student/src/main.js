import Swal from "sweetalert2"
import * as config from "root/config.json"

const endpoint = config.apiEndpoint + "/auth/login";
const studentIdInput = document.querySelector("#studentid");
const passwordInput = document.querySelector("#password");
const btnLogin = document.querySelector("#btn-login");

btnLogin.addEventListener("click", login);

async function login() {
    const studentID = studentIdInput.value;
    const password = passwordInput.value;

    if (!studentID.trim() || !password.trim()) {
        return sweetAlert("Missing StudentID or Password", "error");
    }

    const options = {
        headers: {
            "content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            username: studentID,
            password: password
        }),
        credentials: "include"
    };

    const res = await fetch(endpoint, options);

    if (res.ok) {
        return location.href = "/dashboard";
    }

    if (res.status == 401) {
        await sweetAlert("Invalid StudentID or Password", "error");
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

