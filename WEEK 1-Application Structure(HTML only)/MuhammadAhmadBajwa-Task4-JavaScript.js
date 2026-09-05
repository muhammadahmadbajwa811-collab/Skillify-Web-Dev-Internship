// ---- Get Elements ----
const taskForm = document.querySelector("#add-task form");
const taskNameInput = document.getElementById("TaskName");
const taskCategoryInput = document.getElementById("TaskCategory");
const taskPriorityInput = document.getElementById("TaskPriority");
const dueDateInput = document.getElementById("DueDate");
const taskListUl = document.querySelector("#task-list ul");

const pendingBadge = document.getElementById("pendingBadge");
const completedBadge = document.getElementById("completedBadge");
const inprogressBadge = document.getElementById("inprogressBadge");

let tasks = [];
let editingTaskId = null;

// ---- Load Tasks on Page Load ----
window.addEventListener("DOMContentLoaded", function () {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    renderTasks();
    updateCounter();
});

// ---- Add / Update Task ----
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = taskNameInput.value.trim();
    const category = taskCategoryInput.value.trim();
    const priority = taskPriorityInput ? taskPriorityInput.value : "Low";
    const dueDate = dueDateInput.value;

    if (name === "") {
        alert("Task name should not be empty");
        return;
    }
    if (category === "") {
        alert("Category should be selected");
        return;
    }
    if (dueDate === "") {
        alert("Due date should be selected");
        return;
    }

    if (editingTaskId !== null) {
        tasks = tasks.map(function (task) {
            if (task.id === editingTaskId) {
                task.name = name;
                task.category = category;
                task.priority = priority;
                task.dueDate = dueDate;
            }
            return task;
        });
        editingTaskId = null;
        taskForm.querySelector("button[type='submit']").textContent = "Add Task";
        showToast("Task has been updated!");
    } else {
        const newTask = {
            id: Date.now(),
            name: name,
            category: category,
            priority: priority,
            dueDate: dueDate,
            status: "pending"
        };
        tasks.push(newTask);
        showToast("Task has been added!");
    }

    saveTasks();
    renderTasks();
    updateCounter();
    taskForm.reset();
});

// ---- Render Tasks ----
function renderTasks() {
    taskListUl.innerHTML = "";

    tasks.forEach(function (task) {
        const li = document.createElement("li");

        const dueClass = isDueSoon(task.dueDate) ? "due-soon" : "";

        li.innerHTML = `
            <p><strong>${task.name}</strong></p>
            <p>Category: ${task.category}</p>
            <p>Priority: <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span></p>
            <p>Due: <span class="${dueClass}">${task.dueDate}</span></p>
            <p>Status: <span class="status-${task.status}">${task.status}</span></p>
            <div class="task-actions">
                <select onchange="markStatus(${task.id}, this.value)">
                    <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
                    <option value="inprogress" ${task.status === "inprogress" ? "selected" : ""}>In Progress</option>
                    <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
                </select>
                <button onclick="editTask(${task.id})">Edit</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        taskListUl.appendChild(li);
    });
}

// ---- Check if Due Date is Near ----
function isDueSoon(dueDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Red if due today, tomorrow, or already overdue
    return diffDays <= 1;
}

// ---- Mark Status ----
function markStatus(id, newStatus) {
    tasks = tasks.map(function (task) {
        if (task.id === id) {
            task.status = newStatus;
        }
        return task;
    });
    saveTasks();
    renderTasks();
    updateCounter();
    showToast("Status updated!");
}

// ---- Edit Task ----
function editTask(id) {
    const task = tasks.find(function (t) {
        return t.id === id;
    });

    if (task) {
        taskNameInput.value = task.name;
        taskCategoryInput.value = task.category;
        if (taskPriorityInput) taskPriorityInput.value = task.priority;
        dueDateInput.value = task.dueDate;

        editingTaskId = id;
        taskForm.querySelector("button[type='submit']").textContent = "Update Task";

        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// ---- Delete Task ----
function deleteTask(id) {
    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });
    saveTasks();
    renderTasks();
    updateCounter();
    showToast("Task has been deleted!");
}

// ---- Save to Local Storage ----
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ---- Update Status Badges ----
function updateCounter() {
    const pendingCount = tasks.filter(function (t) { return t.status === "pending"; }).length;
    const completedCount = tasks.filter(function (t) { return t.status === "completed"; }).length;
    const inprogressCount = tasks.filter(function (t) { return t.status === "inprogress"; }).length;

    if (pendingBadge) pendingBadge.textContent = pendingCount;
    if (completedBadge) completedBadge.textContent = completedCount;
    if (inprogressBadge) inprogressBadge.textContent = inprogressCount;
}

// ---- Toast Popup ----
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "show";
    setTimeout(function () {
        toast.className = toast.className.replace("show", "");
    }, 2500);
}