/**
 * Referencia global al elemento HTML de la tarjeta que se está arrastrando actualmente.
 * Se utiliza para mover el nodo del DOM de una columna a otra.
 * @type {HTMLElement|null}
 */
let draggedCard = null;

/**
 * Configuración inicial de las columnas del tablero Kanban.
 * @type {Array<{id: string, title: string}>}
 */
const columns = [
    { id: 'todo', title: 'ToDo' },
    { id: 'in-progress', title: 'Doing' },
    { id: 'done', title: 'Done' }
];

/**
 * Crea un elemento del DOM que representa una columna del tablero.
 * Configura la estructura HTML interna, los eventos del formulario de añadir tarjeta
 * y los eventos de la zona de soltado (Drag & Drop zone).
 * * @param {Object} col - Objeto de configuración de la columna.
 * @param {string} col.title - El título visible de la columna (ej. "ToDo").
 * @returns {HTMLDivElement} El elemento DOM de la columna completamente configurado.
 */
function createColumn(col) {
    const column = Object.assign(document.createElement('div'), {
        className: 'column',
        innerHTML: `
            <div class="column-header">${col.title}</div>
            <div class="cards-container"></div>
            <div class="add-card-form">
                <textarea placeholder="Escribe el título de la tarjeta..."></textarea>
                <div class="form-actions">
                    <button class="confirm-btn">Añadir tarjeta</button>
                    <button class="cancel-btn">✕</button>
                </div>
            </div>
            <button class="add-card-btn"><span>＋</span><span>Añadir una tarjeta</span></button>
        `
    });

    const form = column.querySelector('.add-card-form');
    const textarea = column.querySelector('textarea');
    const addBtn = column.querySelector('.add-card-btn');
    const container = column.querySelector('.cards-container');

    addBtn.onclick = () => {
        form.classList.add('active');
        addBtn.style.display = 'none';
        textarea.focus();
    };

    column.querySelector('.cancel-btn').onclick = () => {
        form.classList.remove('active');
        addBtn.style.display = 'flex';
        textarea.value = '';
    };

    column.querySelector('.confirm-btn').onclick = () => {
        if (textarea.value.trim()) {
            addCard(textarea.value.trim(), container);
            textarea.value = '';
            textarea.focus();
        }
    };

    /**
     * Permite enviar el formulario presionando la tecla Enter (sin Shift/Ctrl).
     * @param {KeyboardEvent} e - Evento de teclado.
     */
    textarea.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
            column.querySelector('.confirm-btn').click();
        }
    };

    /**
     * Maneja el evento cuando una tarjeta se arrastra SOBRE la columna.
     * Calcula la posición del ratón relativa a las otras tarjetas para insertar
     * un placeholder visual en la posición correcta.
     * * @param {DragEvent} e - El evento de arrastre.
     */
    column.ondragover = (e) => {
        e.preventDefault(); // Necesario para permitir el drop
        column.classList.add('drag-over');

        // Algoritmo para encontrar el elemento más cercano al cursor
        const after = [...container.querySelectorAll('.card:not(.dragging)')].reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;

        container.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
        const placeholder = Object.assign(document.createElement('div'), { className: 'drag-placeholder' });
        
        // Inserta el placeholder antes del elemento referencia o al final
        after ? container.insertBefore(placeholder, after) : container.appendChild(placeholder);
    };

    /**
     * Maneja el evento cuando se SUELTA la tarjeta en la columna.
     * Mueve el nodo `draggedCard` al nuevo contenedor en la posición calculada.
     * * @param {DragEvent} e - El evento de soltar.
     */
    column.ondrop = (e) => {
        e.preventDefault();
        if (draggedCard) {
            // Recalcula la posición exacta para la inserción final
            const after = [...container.querySelectorAll('.card:not(.dragging)')].reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = e.clientY - box.top - box.height / 2;
                return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element;
            
            after ? container.insertBefore(draggedCard, after) : container.appendChild(draggedCard);
        }
        column.classList.remove('drag-over');
        container.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
    };

    /**
     * Limpia los estilos visuales si la tarjeta sale de la columna sin soltarse.
     * @param {DragEvent} e 
     */
    column.ondragleave = (e) => {
        if (e.target === column) column.classList.remove('drag-over');
    };

    return column;
}

/**
 * Crea una nueva tarjeta, configura sus eventos de arrastre (Drag API) y la añade al contenedor.
 * * @param {string} text - El contenido textual de la tarjeta.
 * @param {HTMLElement} container - El contenedor DOM donde se añadirá la tarjeta.
 */
function addCard(text, container) {
    const card = Object.assign(document.createElement('div'), {
        className: 'card',
        draggable: true, // Habilita la API nativa de Drag & Drop
        innerHTML: `<div class="card-content">${text}</div><button class="delete-btn">✕</button>`
    });

    card.ondragstart = () => {
        draggedCard = card;
        card.classList.add('dragging');
    };

    card.ondragend = () => {
        card.classList.remove('dragging');
        draggedCard = null;
        document.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
        document.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
    };

    card.querySelector('.delete-btn').onclick = () => {
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'scale(0.8)';
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 300);
    };

    container.appendChild(card);
}

columns.forEach(col => document.querySelector('.kanban-container').appendChild(createColumn(col)));