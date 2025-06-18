const taskList = document.getElementById('task-list');
const taskTemplate = document.getElementById('task-template');
const addBtn = document.getElementById('add-task');
const titleInput = document.getElementById('task-title');
const categoryInput = document.getElementById('task-category');
const priorityInput = document.getElementById('task-priority');
const dueInput = document.getElementById('task-due');
const filterStatus = document.getElementById('filter-status');
const filterCategory = document.getElementById('filter-category');
const searchInput = document.getElementById('search');
const sortBtn = document.getElementById('sort-date');
const themeToggle = document.getElementById('theme-toggle');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let sortAsc = true;

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function createTaskElement(task) {
    const li = taskTemplate.content.firstElementChild.cloneNode(true);
    li.dataset.id = task.id;
    li.querySelector('.title').textContent = task.title;
    li.querySelector('.category').textContent = task.category;
    li.querySelector('.priority').textContent = task.priority;
    li.querySelector('.due').textContent = task.dueDate || '';
    li.querySelector('.complete').checked = task.completed;
    if (task.completed) li.classList.add('completed');

    li.querySelector('.complete').addEventListener('change', () => {
        task.completed = !task.completed;
        saveTasks();
        render();
    });

    li.querySelector('.delete').addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        saveTasks();
        render();
    });

    li.querySelector('.edit').addEventListener('click', () => {
        const newTitle = prompt('Edit task', task.title);
        if (newTitle) {
            task.title = newTitle;
            saveTasks();
            render();
        }
    });

    li.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
    });

    li.addEventListener('dragover', (e) => e.preventDefault());

    li.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedIndex = tasks.findIndex(t => t.id === draggedId);
        const targetIndex = tasks.findIndex(t => t.id === task.id);
        const [dragged] = tasks.splice(draggedIndex, 1);
        tasks.splice(targetIndex, 0, dragged);
        saveTasks();
        render();
    });

    return li;
}

function render() {
    taskList.innerHTML = '';
    let filtered = tasks
        .filter(t => {
            if (filterStatus.value === 'completed') return t.completed;
            if (filterStatus.value === 'pending') return !t.completed;
            return true;
        })
        .filter(t => filterCategory.value === 'all' || t.category === filterCategory.value)
        .filter(t => t.title.toLowerCase().includes(searchInput.value.toLowerCase()));
    if (!sortAsc) {
        filtered.sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0));
    } else {
        filtered.sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
    }
    filtered.forEach(task => {
        const el = createTaskElement(task);
        taskList.appendChild(el);
    });
}

addBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    if (!title) return;
    const task = {
        id: Date.now().toString(),
        title,
        category: categoryInput.value,
        priority: priorityInput.value,
        dueDate: dueInput.value,
        completed: false,
    };
    tasks.push(task);
    titleInput.value = '';
    dueInput.value = '';
    saveTasks();
    render();
});

sortBtn.addEventListener('click', () => {
    sortAsc = !sortAsc;
    render();
});

searchInput.addEventListener('input', render);
filterStatus.addEventListener('change', render);
filterCategory.addEventListener('change', render);

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

exportBtn.addEventListener('click', () => {
    const data = new Blob([JSON.stringify(tasks)], { type: 'application/json' });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
    URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data)) {
                tasks = data;
                saveTasks();
                render();
            }
        } catch (err) {
            alert('Invalid file');
        }
    };
    reader.readAsText(file);
});

render();
