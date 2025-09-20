const allTasks = document.getElementById("allTasks");
const addTask = document.getElementById("addTask");
const deleteMsg = document.getElementById("deleteMsg");
const updateMsg = document.getElementById("updateMsg");
const successMsg = document.getElementById("successMsg");

let showTasksButton = document.getElementById("showTasksButton");
let addTaskButton = document.getElementById("addTaskButton");

let showToggle = true;
let addToggle = false;

// Hide messages by default
deleteMsg.style.display = "none";
updateMsg.style.display = "none";
successMsg.style.display = "none";

window.onload = fetchTasks;

// ================= Show/Hide Tasks =================
async function showTasks() {
  if (showToggle) {
    allTasks.style.display = "none";
    showToggle = false;
    showTasksButton.innerText = "Show Tasks";
  } else {
    await fetchTasks();
    allTasks.style.display = "block";
    showToggle = true;
    showTasksButton.innerText = "Hide Tasks";
  }
}

// ================= Fetch Tasks =================
async function fetchTasks() {
  const response = await fetch(
    "https://simpletodobackend-production-cfba.up.railway.app/alltasks"
  );
  const tasks = await response.json();

  if (!tasks.length) {
    allTasks.innerHTML = "<p>No tasks available</p>";
    return;
  }

  let list = `<h3>All Tasks</h3><ul>`;
  tasks.forEach((task) => {
    list += `<li id="taskLi${task.id}">
      <strong id="taskText${task.id}">${task.task}</strong>
      <span id="taskDue${task.id}">⏰ ${task.dueDate}</span>
      <span class="updateTaskBtn" data-id="${task.id}">
        <i class="fa-solid fa-pen"></i>
      </span>
      <span class="deleteTaskBtn" data-id="${task.id}">
        <i class="fa-solid fa-trash"></i>
      </span>
    </li>`;
  });
  list += `</ul>`;

  allTasks.innerHTML = list;

  // Attach update events
  document.querySelectorAll(".updateTaskBtn").forEach((btn) => {
    btn.onclick = () => updateTask(btn.dataset.id);
  });

  // Attach delete events
  document.querySelectorAll(".deleteTaskBtn").forEach((btn) => {
    btn.onclick = () => deleteTask(btn.dataset.id);
  });

  allTasks.style.display = "block";
}

// ================= Add Task Form =================
function addTasks() {
  if (addToggle) {
    // Cancel add form
    addTask.innerHTML = "";
    addToggle = false;
    addTaskButton.innerText = "Add Task";
    allTasks.style.display = "block";
    showToggle = true;
    showTasksButton.innerText = "Hide Tasks";
    showTasksButton.disabled = false;
  } else {
    // Show add form
    addTask.innerHTML = `
      <div class="addFormContainer">
        <form id="taskForm">
          <div class="inputDiv">
            <label for="task">Task</label>
            <input type="text" name="task" placeholder="Enter your task" id="task" required />
          </div>
          <div class="inputDiv">
            <label for="dueDate">Due Time</label>
            <i class="fa-solid fa-alarm-clock"></i>
            <select name="dueDate" id="dueDate" required>
              <option value="" disabled selected hidden>-- Select due Time --</option>
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
              <option value="This week">This week</option>
            </select>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    `;

    allTasks.style.display = "none";
    showToggle = false;
    showTasksButton.innerText = "Show Tasks";
    showTasksButton.disabled = true;
    addToggle = true;
    addTaskButton.innerText = "Cancel Add Task";

    document
      .getElementById("taskForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new URLSearchParams();
        formData.append("task", document.getElementById("task").value);
        formData.append("dueDate", document.getElementById("dueDate").value);

        await fetch(
          "https://simpletodobackend-production-cfba.up.railway.app/posttasks",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          }
        );

        // Show success message
        successMsg.style.display = "block";
        successMsg.innerHTML = `<p>Task added successfully!</p>`;
        setTimeout(() => (successMsg.style.display = "none"), 2000);

        addTask.innerHTML = "";
        addToggle = false;
        addTaskButton.innerText = "Add Task";

        await fetchTasks();
        showToggle = true;
        showTasksButton.innerText = "Hide Tasks";
        showTasksButton.disabled = false;
      });
  }
}

// ================= Delete Task =================
async function deleteTask(id) {
  await fetch(
    `https://simpletodobackend-production-cfba.up.railway.app/deletetask/${id}`,
    { method: "DELETE" }
  );

  // Show delete message
  deleteMsg.style.display = "block";
  deleteMsg.innerHTML = `<p>Deleted successfully</p>`;
  setTimeout(() => (deleteMsg.style.display = "none"), 2000);

  await fetchTasks();
}

// ================= Update Task =================
async function updateTask(id) {
  const taskElement = document.getElementById(`taskText${id}`);
  const dueElement = document.getElementById(`taskDue${id}`);
  const updateBtn = document.querySelector(`#taskLi${id} .updateTaskBtn`);

  const currentTask = taskElement.innerText;
  const currentDue = dueElement.innerText.replace(/[^a-zA-Z ]/g, "").trim();

  taskElement.innerHTML = `<input type="text" id="editTask${id}" value="${currentTask}">`;

  dueElement.innerHTML = `
    ⏰
    <select name="dueDate" id="editDue${id}" required>
      <option value="Today" ${
        currentDue === "Today" ? "selected" : ""
      }>Today</option>
      <option value="Tomorrow" ${
        currentDue === "Tomorrow" ? "selected" : ""
      }>Tomorrow</option>
      <option value="This week" ${
        currentDue === "This week" ? "selected" : ""
      }>This week</option>
    </select>
  `;

  const icon = updateBtn.querySelector("i");
  updateBtn.innerHTML = "";
  updateBtn.appendChild(icon);
  const textNode = document.createElement("span");
  textNode.innerText = " Save";
  updateBtn.appendChild(textNode);

  updateBtn.onclick = async function () {
    const newTask = document.getElementById(`editTask${id}`).value;
    const newDue = document.getElementById(`editDue${id}`).value;

    await fetch(
      `https://simpletodobackend-production-cfba.up.railway.app/updatetask/${id}?task=${encodeURIComponent(
        newTask
      )}&dueDate=${encodeURIComponent(newDue)}`,
      { method: "PUT" }
    );

    // Show update message
    updateMsg.style.display = "block";
    updateMsg.innerHTML = `<p style="color:blue;">Updated successfully!</p>`;
    setTimeout(() => (updateMsg.style.display = "none"), 2000);

    await fetchTasks();
  };
}
