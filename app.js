
const API_URL = "https://jsonplaceholder.typicode.com/todos";

//////////////////////////////////////////////////////
// 🔵 MODEL (يتعامل فقط مع API)
//////////////////////////////////////////////////////

class TaskModel {
  async getAll() {
    const res = await fetch(API_URL);
    return await res.json();
  }

  async add(title) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        completed: false
      })
    });

    return await res.json();
  }

  async update(id, title, completed) {
    const res = await fetch(API_URL + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        completed: completed
      })
    });

    return await res.json();
  }

  async delete(id) {
    await fetch(API_URL + "/" + id, {
      method: "DELETE"
    });
  }
}

//////////////////////////////////////////////////////
// 🟢 VIEW (يتعامل فقط مع DOM)
//////////////////////////////////////////////////////

class TaskView {
  constructor() {
    this.list = document.getElementById("taskList");
    this.input = document.getElementById("taskInput");
    this.addBtn = document.querySelector("button");
  }

  getInput() {
    return this.input.value;
  }

  clearInput() {
    this.input.value = "";
  }

  render(tasks, toggleFn, deleteFn) {
    this.list.innerHTML = "";

    tasks.forEach(task => {
      const li = document.createElement("li");

      if (task.completed) {
        li.classList.add("completed");
      }

      li.innerHTML = `
        <span>${task.title}</span>
        <div>
          <button>Check</button>
          <button>Delete</button>
        </div>
      `;

      const buttons = li.querySelectorAll("button");

      buttons[0].onclick = () => toggleFn(task);
      buttons[1].onclick = () => deleteFn(task.id);

      this.list.appendChild(li);
    });
  }
}

//////////////////////////////////////////////////////
// 🟡 VIEWMODEL (يربط الاثنين)
//////////////////////////////////////////////////////

class TaskViewModel {
  constructor() {
    this.model = new TaskModel();
    this.view = new TaskView();
    this.tasks = [];

    this.start();
  }

  async start() {
    this.tasks = await this.model.getAll();
    this.updateView();

    this.view.addBtn.addEventListener("click", () => this.addTask());
  }

  updateView() {
    this.view.render(
      this.tasks,
      (task) => this.toggleTask(task),
      (id) => this.deleteTask(id)
    );
  }

  async addTask() {
    const title = this.view.getInput();
    if (!title) return;

    const newTask = await this.model.add(title);

    this.tasks.push(newTask);
    this.view.clearInput();
    this.updateView();
  }

  async toggleTask(task) {
    const updated = await this.model.update(
      task.id,
      task.title,
      !task.completed
    );

    this.tasks = this.tasks.map(t =>
      t.id === task.id ? updated : t
    );

    this.updateView();
  }

  async deleteTask(id) {
    await this.model.delete(id);

    this.tasks = this.tasks.filter(t => t.id !== id);
    this.updateView();
  }
}

//////////////////////////////////////////////////////
// 🚀 تشغيل التطبيق
//////////////////////////////////////////////////////

new TaskViewModel();


