// Funções específicas para a página de Configurações
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar event listeners específicos desta página
    setupSettingsPage();
});

// Configurar página de Configurações
function setupSettingsPage() {
    // Configurar modal de tipo de mapa
    setupMapTypeModal();
}

// Atualizar UI com os tipos de mapa
function updateMapTypesUI(mapTypes) {
    const tableBody = document.querySelector('#map-types-table tbody');
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Adicionar tipos de mapa à tabela
    mapTypes.forEach(mapType => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${mapType.name}</td>
            <td>${formatCurrency(mapType.value)}</td>
            <td class="actions">
                <button class="btn btn-outline edit-map-type" data-id="${mapType.id}" data-name="${mapType.name}" data-value="${mapType.value}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-outline delete-map-type" data-id="${mapType.id}">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        
        // Adicionar à tabela
        tableBody.appendChild(row);
    });
    
    // Adicionar event listeners para botões
    addMapTypeButtonListeners();
    
    // Atualizar selects de tipo de mapa em outras páginas
    loadMapTypesForSelect();
}

// Adicionar event listeners para botões da tabela de tipos de mapa
function addMapTypeButtonListeners() {
    // Botões de editar
    const editButtons = document.querySelectorAll('.edit-map-type');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const value = button.getAttribute('data-value');
            
            // Preencher formulário
            document.getElementById('map-type-id').value = id;
            document.getElementById('map-type-name').value = name;
            document.getElementById('map-type-value').value = value;
            
            // Atualizar título do modal
            document.getElementById('map-type-modal-title').textContent = 'Editar Tipo de Mapa';
            
            // Abrir modal
            openModal('map-type-modal');
        });
    });
    
    // Botões de excluir
    const deleteButtons = document.querySelectorAll('.delete-map-type');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            
            // Confirmar exclusão
            if (confirm('Tem certeza que deseja excluir este tipo de mapa?')) {
                deleteMapType(id);
            }
        });
    });
}

// Configurar modal de tipo de mapa
function setupMapTypeModal() {
    // Fechar modal ao clicar no X
    const closeButton = document.querySelector('#map-type-modal .close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeModal('map-type-modal');
        });
    }
    
    // Fechar modal ao clicar fora do conteúdo
    const modal = document.getElementById('map-type-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal('map-type-modal');
            }
        });
    }
}
