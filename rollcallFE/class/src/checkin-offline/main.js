import moment from "moment-timezone";
import * as config from "root/config.json"

const checkinListEndpoint = config.apiEndpoint + "/checkin";
const classEndpoint = config.apiEndpoint + "/classes/info";
let students = [];
let activeCheckin = null;

const checkinListTmpl = document.querySelector("#checkin-list");
const studentListTmpl = document.querySelector("#student-list");
const progressDisplay = document.querySelector("#progress");

async function showCheckinDetail(id) {
    // make table empty
    const table = studentListTmpl.parentNode;
    table.innerHTML = "";
    table.appendChild(studentListTmpl);

    const res = await fetch(`${checkinListEndpoint}/${id}`, { credentials: "include" });
    const { data } = await res.json();

    // display progress
    if (new Date() > new Date(data.endAt)) {
        progressDisplay.textContent = "(Done)";
    }
    else {
        progressDisplay.textContent = "(In processing)";
    }

    students.forEach(id => {
        const attendance = data.attendances.find(a => a.studentID == id);
        const row = studentListTmpl.content.cloneNode(true);
        const cols = row.querySelectorAll("td");

        cols[0].textContent = id;
        cols[1].textContent = attendance ? "Yes" : "No";

        if (attendance) {
            // overtime attendance has color red
            if (attendance.at > data.endAt) { 
                cols[1].style.color = "red";
            }
        }

        studentListTmpl.parentNode.appendChild(row);
    });
}

async function showCheckinList() {
    const res = await fetch(checkinListEndpoint, { credentials: "include" });
    let { list } = await res.json();

    list = list.filter(c => c.mode == "offline");
    list.reverse();
    list.forEach(c => {
        const d = new Date(c.createdAt);
        const m = moment(d);
        const dateText = m.tz("Asia/Ho_Chi_Minh").format("DD-MM-YYYY - HH:mm:ss");

        const checkinItem = checkinListTmpl.content.cloneNode(true);

        checkinItem.querySelector("a").textContent = dateText;
        checkinItem.querySelector("li").onclick = function(e) {
            // color active tab
            if (activeCheckin) activeCheckin.classList.remove("is-active");
            activeCheckin = e.target;
            activeCheckin.classList.add("is-active");

            // show checkin detail table 
            showCheckinDetail(c._id);
        } 
        checkinListTmpl.parentNode.appendChild(checkinItem);
    });
}

async function fetchStudents() {
    const res = await fetch(`${classEndpoint}`, { credentials: "include" });
    const { data } = await res.json();
    students = [...new Set(data.students)];
}

fetchStudents();
showCheckinList();
