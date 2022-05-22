const endpoint = "http://localhost:3005/students/info";
const nameDisplay = document.querySelector("#name");

async function showInfo() {
    const res = await fetch(endpoint, {
        credentials: "include"
    });
    const { data } = await res.json();
    nameDisplay.textContent = "Hi, " + data.name;
}

showInfo();