import moment from "moment-timezone";

const checkinListEndpoint = "http://localhost:3005/checkin";
const classEndpoint = "http://localhost:3005/classes/info";
let students = [];
let activeCheckin = null;

const checkinListTmpl = document.querySelector("#checkin-list");
const studentListTmpl = document.querySelector("#student-list");

async function showCheckinDetail(id) {
    // make table empty
    const table = studentListTmpl.parentNode;
    table.innerHTML = "";
    table.appendChild(studentListTmpl);

    const res = await fetch(`${checkinListEndpoint}/${id}`, { credentials: "include" });
    const { data } = await res.json();

    students.forEach(id => {
        const attendance = data.attendances.includes(id) ? "Yes" : "No";
        const row = studentListTmpl.content.cloneNode(true);
        const cols = row.querySelectorAll("td");

        cols[0].textContent = id;
        cols[1].textContent = attendance;
        // cols[2].textContent = 

        studentListTmpl.parentNode.appendChild(row);
    });
}

async function showCheckinList() {
    const res = await fetch(checkinListEndpoint, { credentials: "include" });
    const { list } = await res.json();

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
    students = data.students;
}

fetchStudents();
showCheckinList();