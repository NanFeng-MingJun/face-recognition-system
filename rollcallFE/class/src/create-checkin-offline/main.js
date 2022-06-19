import Swal from "sweetalert2";
import * as config from "root/config.json"

const endpoint = config.apiEndpoint + "/checkin";
const timeoutInput = document.querySelector("#timeout");
const createBtn = document.querySelector("#btn-create");

createBtn.addEventListener("click", createCheckin);

async function createCheckin() {
    const waitTimeout = timeoutInput.value;
    const option = {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            waitTimeout: Number(waitTimeout) * 60 * 1000
        })
    };

    const res = await fetch(endpoint, option);
    if (res.ok) {
        await Swal.fire({
            titleText: `Checkin created successfully`,
            icon: "success"
        });

        return location.href = "/dashboard";
    }

    await Swal.fire({
        titleText: `Cannot create checkin`,
        icon: "error"
    });
}
