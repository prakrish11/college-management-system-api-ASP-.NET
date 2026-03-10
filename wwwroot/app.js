const apiBase = "/api/student";
const statusText = document.getElementById("statusText");
const apiStatus = document.getElementById("apiStatus");
const studentList = document.getElementById("studentList");
const totalCount = document.getElementById("totalCount");
const singleResult = document.getElementById("singleResult");

const studentId = document.getElementById("studentId");
const studentName = document.getElementById("studentName");
const studentAge = document.getElementById("studentAge");
const studentCourse = document.getElementById("studentCourse");
const searchId = document.getElementById("searchId");

const refreshAll = document.getElementById("refreshAll");
const addStudent = document.getElementById("addStudent");
const updateStudent = document.getElementById("updateStudent");
const findStudent = document.getElementById("findStudent");
const deleteStudent = document.getElementById("deleteStudent");

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? "#fecdd3" : "#e2e8f0";
}

function setApiStatus(message) {
  apiStatus.textContent = message;
}

function renderList(students) {
  studentList.innerHTML = "";
  totalCount.textContent = `${students.length} record${students.length === 1 ? "" : "s"}`;

  if (students.length === 0) {
    studentList.innerHTML = "<p class=\"muted\">No students yet. Add one above.</p>";
    return;
  }

  students.forEach((student) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${student.name}</strong>
      <small>Id: ${student.id}</small>
      <small>Age: ${student.age}</small>
      <small>Course: ${student.course}</small>
    `;
    studentList.appendChild(card);
  });
}

function renderSingle(student) {
  if (!student) {
    singleResult.innerHTML = "<p class=\"muted\">Student details will appear here.</p>";
    return;
  }

  singleResult.innerHTML = `
    <strong>${student.name}</strong>
    <div class="muted">Id: ${student.id} | Age: ${student.age}</div>
    <div class="muted">Course: ${student.course}</div>
  `;
}

function getFormData() {
  return {
    id: studentId.value.trim(),
    name: studentName.value.trim(),
    age: Number(studentAge.value),
    course: studentCourse.value.trim(),
  };
}

function validateForm(data) {
  if (!data.id || !data.name || !data.course) {
    return "Id, name, and course are required.";
  }
  if (!Number.isFinite(data.age) || data.age <= 0) {
    return "Age must be greater than zero.";
  }
  return "";
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.title || "Request failed.";
    throw new Error(message);
  }

  return payload;
}

async function loadAllStudents() {
  try {
    setApiStatus("Loading...");
    const students = await requestJson(`${apiBase}/getall`);
    renderList(students);
    setStatus("Student list refreshed.");
    setApiStatus("Online");
  } catch (error) {
    renderList([]);
    setStatus(error.message, true);
    setApiStatus("Offline");
  }
}

addStudent.addEventListener("click", async () => {
  const data = getFormData();
  const validationMessage = validateForm(data);
  if (validationMessage) {
    setStatus(validationMessage, true);
    return;
  }

  try {
    const student = await requestJson(`${apiBase}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setStatus(`Added ${student.name}.`);
    renderSingle(student);
    await loadAllStudents();
  } catch (error) {
    setStatus(error.message, true);
  }
});

updateStudent.addEventListener("click", async () => {
  const data = getFormData();
  const validationMessage = validateForm(data);
  if (validationMessage) {
    setStatus(validationMessage, true);
    return;
  }

  try {
    const student = await requestJson(`${apiBase}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setStatus(`Updated ${student.name}.`);
    renderSingle(student);
    await loadAllStudents();
  } catch (error) {
    setStatus(error.message, true);
  }
});

findStudent.addEventListener("click", async () => {
  const id = searchId.value.trim();
  if (!id) {
    setStatus("Enter a student id to search.", true);
    return;
  }

  try {
    const student = await requestJson(`${apiBase}/${encodeURIComponent(id)}`);
    renderSingle(student);
    setStatus(`Found ${student.name}.`);
  } catch (error) {
    renderSingle(null);
    setStatus(error.message, true);
  }
});

deleteStudent.addEventListener("click", async () => {
  const id = searchId.value.trim();
  if (!id) {
    setStatus("Enter a student id to delete.", true);
    return;
  }

  try {
    const student = await requestJson(`${apiBase}/delete/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    renderSingle(null);
    setStatus(`Deleted ${student.name}.`);
    await loadAllStudents();
  } catch (error) {
    setStatus(error.message, true);
  }
});

refreshAll.addEventListener("click", loadAllStudents);

loadAllStudents();
