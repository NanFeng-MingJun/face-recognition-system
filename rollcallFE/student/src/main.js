import * as config from "root/config.json"

const endpoint = config.apiEndpoint + "/students/info";
const logoutEndpoint = config.apiEndpoint + "/auth/logout";
const nameDisplay = document.querySelector("#name");

async function showInfo() {
    const res = await fetch(endpoint, {
        credentials: "include"
    });
    
    if (res.ok) {
        const { data } = await res.json();
        nameDisplay.textContent = "Hi, " + data.name;
    } 
    else {
        window.location.href = "/login";
    }
}

showInfo();

// logout
const logout = document.querySelector("#logout");
logout.addEventListener("click", async () => {
    await fetch(logoutEndpoint, {
    	credentials: "include"
    });
    window.location.href = "/login";
})
