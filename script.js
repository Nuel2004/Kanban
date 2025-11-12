let draggedCard = null;

        const columns = [
            { id: 'todo', title: 'ToDo' },
            { id: 'in-progress', title: 'Doing' },
            { id: 'done', title: 'Done' }
        ];

        // Crear columna completa
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

            // Mostrar/ocultar formulario
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

            // Añadir tarjeta
            column.querySelector('.confirm-btn').onclick = () => {
                if (textarea.value.trim()) {
                    addCard(textarea.value.trim(), container);
                    textarea.value = '';
                    textarea.focus();
                }
            };

            textarea.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.ctrlKey) {
                    e.preventDefault();
                    column.querySelector('.confirm-btn').click();
                }
            };

            // Drag and drop
            column.ondragover = (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
                const after = [...container.querySelectorAll('.card:not(.dragging)')].reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = e.clientY - box.top - box.height / 2;
                    return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
                }, { offset: Number.NEGATIVE_INFINITY }).element;

                container.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
                const placeholder = Object.assign(document.createElement('div'), { className: 'drag-placeholder' });
                after ? container.insertBefore(placeholder, after) : container.appendChild(placeholder);
            };

            column.ondrop = (e) => {
                e.preventDefault();
                if (draggedCard) {
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

            column.ondragleave = (e) => {
                if (e.target === column) column.classList.remove('drag-over');
            };

            return column;
        }

        // Añadir tarjeta
        function addCard(text, container) {
            const card = Object.assign(document.createElement('div'), {
                className: 'card',
                draggable: true,
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

        // Inicializar
        columns.forEach(col => document.querySelector('.kanban-container').appendChild(createColumn(col)));