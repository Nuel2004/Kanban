let draggedCard = null;

const columns = [
    { id: 'todo', title: 'ToDo' },
    { id: 'in-progress', title: 'Doing' },
    { id: 'done', title: 'Done' }
];

function createColumn({ title }) {
    const col = document.createElement('div');
    col.className = 'column';
    col.innerHTML = `
    <div class="column-header">${title}</div>
    <div class="cards-container"></div>
    <div class="add-card-form">
        <textarea placeholder="Escribe el título..."></textarea>
        <div class="form-actions">
            <button class="confirm-btn">Añadir</button>
            <button class="cancel-btn">✕</button>
        </div>
    </div>
    <button class="add-card-btn"><span>＋</span>Añadir tarjeta</button>
    `;

    const container = col.querySelector('.cards-container');
    const form = col.querySelector('.add-card-form');
    const textarea = form.querySelector('textarea');
    const addBtn = col.querySelector('.add-card-btn');

    // Mostrar / ocultar formulario
    addBtn.onclick = () => { form.classList.add('active'); addBtn.style.display = 'none'; textarea.focus(); };
    form.querySelector('.cancel-btn').onclick = () => { form.classList.remove('active'); addBtn.style.display = 'flex'; textarea.value = ''; };

    // Añadir tarjeta
    form.querySelector('.confirm-btn').onclick = () => {
        const text = textarea.value.trim();
        if (!text) return;
        addCard(text, container);
        textarea.value = '';
        textarea.focus();
    };
    textarea.onkeydown = e => { if (e.key === 'Enter' && !e.ctrlKey) { e.preventDefault(); form.querySelector('.confirm-btn').click(); } };

    // Drag and drop
    col.ondragover = e => {
        e.preventDefault();
        const cards = [...container.querySelectorAll('.card:not(.dragging)')];
        const after = cards.find(c => e.clientY < c.getBoundingClientRect().top + c.offsetHeight / 2);
        container.insertBefore(document.querySelector('.drag-placeholder') || createPlaceholder(), after || null);
    };

    col.ondrop = e => {
        e.preventDefault();
        const placeholder = container.querySelector('.drag-placeholder');
        if (draggedCard && placeholder) container.insertBefore(draggedCard, placeholder);
        cleanupDrag();
    };

    col.ondragleave = e => { if (e.target === col) cleanupDrag(); };

    return col;
}

function addCard(text, container) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.innerHTML = `<div class="card-content">${text}</div><button class="delete-btn">✕</button>`;

    card.ondragstart = () => { draggedCard = card; card.classList.add('dragging'); };
    card.ondragend = cleanupDrag;
    card.querySelector('.delete-btn').onclick = () => { card.remove(); };

    container.appendChild(card);
}

function createPlaceholder() {
    const p = document.createElement('div');
    p.className = 'drag-placeholder';
    return p;
}

function cleanupDrag() {
    draggedCard?.classList.remove('dragging');
    draggedCard = null;
    document.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
}

columns.forEach(c => document.querySelector('.kanban-container').appendChild(createColumn(c)));
