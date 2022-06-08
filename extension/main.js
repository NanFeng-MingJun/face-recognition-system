const chkContainer = document.querySelector(".checkin-container");
const chkRoleSelection = document.querySelector("#checkin-form-role");
const chkClassInput = document.querySelector("#checkin-form-class");
const chkPasswordInput = document.querySelector("#checkin-form-pwd");
const chkFormJoinBtn = document.querySelector("#checkin-form-join-btn");
const chkFormCancelBtn = document.querySelector("#checkin-form-cancel-btn");
const chkToolsCancelBtn = document.querySelector("#checkin-tools-cancel-btn");
const chkToolsCaptureBtn = document.querySelector("#checkin-tools-capture-btn");
const chkJoinedCancelBtn = document.querySelector("#checkin-joined-cancel-btn");
const chkToggleBtn = document.querySelector(".checkin-toggle-button");

const chkJoinForm = document.querySelector("#checkin-join-form");
const chkTools = document.querySelector("#checkin-tools");
const chkJoined = document.querySelector("#checkin-joined");
let currentScreen = chkJoinForm;


let checkinState = null;
const socket = io.connect("$khoaluan-rollcall-url");


function closeContainer() {
    chkContainer.classList.add("is-hide");
}

function openContainer() {
    chkContainer.classList.remove("is-hide");
}

function selectRoleHandler(e) {
    if (e.target.value == "host") {
          chkPasswordInput.parentNode.style.display = "block";
    }
    else {
      chkPasswordInput.parentElement.style.display = "none";
      chkPasswordInput.value = "";
    }
}


chkRoleSelection.addEventListener("change", selectRoleHandler);
chkToggleBtn.addEventListener("click", openContainer);
chkFormCancelBtn.addEventListener("click", closeContainer);
chkToolsCancelBtn.addEventListener("click", closeContainer);
chkJoinedCancelBtn.addEventListener("click", closeContainer);


chkFormJoinBtn.addEventListener("click", e => {
    const role = chkRoleSelection.value;
    const classID = chkClassInput.value;
    const password = chkPasswordInput.value;

    if (role == "host") {
        checkinState = { role, classID, password }
        socket.emit("join-host", checkinState);
    } 

    if (role == "member") {
        checkinState = { role, classID }
        socket.emit("join-member", checkinState);
    }
});


chkToolsCaptureBtn.addEventListener("click", e => {
    if (checkinState.role == "host") {
        const isConfirmed = confirm("Are you sure you want to do a roll call ?")
        if (!isConfirmed) return;
        socket.emit("capture-member", {});
    }
});


// socket event
socket.on("notify-join", data => {
    if (data.status == 401 || data.status == 404) {
        alert(data.message);
        return;
    }

    currentScreen.classList.add("is-hide");
    if (checkinState.role == "host") {
        currentScreen = chkTools;
    } else {
        currentScreen = chkJoined;
    }
    currentScreen.classList.remove("is-hide");
});


socket.on("capture", (data) => {
    console.log(data);
    if (checkinState.role == "host") {
        alert("Sent request successfully");
        closeContainer();
    } else {
        capture(data.checkinID);
    }
});