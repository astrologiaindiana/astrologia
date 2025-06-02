// Funções específicas para a página de Videochamadas
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar event listeners específicos desta página
    setupVideoCallsPage();
});

// Configurar página de Videochamadas
function setupVideoCallsPage() {
    // Inicializar calendário
    initCalendar();
    
    // Preencher select de clientes para agendamento
    loadClientsForSelect();
    
    // Configurar navegação do calendário
    setupCalendarNavigation();
}

// Inicializar calendário
function initCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    
    // Limpar calendário
    calendar.innerHTML = '';
    
    // Data atual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Atualizar título do mês
    updateMonthTitle(currentDate);
    
    // Obter primeiro dia do mês
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startingDay = firstDay.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    // Obter último dia do mês
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Adicionar cabeçalho dos dias da semana
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Adicionar dias vazios antes do primeiro dia do mês
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }
    
    // Adicionar dias do mês
    for (let i = 1; i <= totalDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.innerHTML = `<span class="day-number">${i}</span>`;
        
        // Marcar dia atual
        if (i === currentDate.getDate() && currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear()) {
            day.classList.add('today');
        }
        
        // Adicionar data como atributo
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        day.setAttribute('data-date', dateStr);
        
        // Adicionar event listener para selecionar dia
        day.addEventListener('click', () => {
            // Remover seleção anterior
            const selectedDay = document.querySelector('.calendar-day.selected');
            if (selectedDay) {
                selectedDay.classList.remove('selected');
            }
            
            // Selecionar dia clicado
            day.classList.add('selected');
            
            // Atualizar agenda do dia
            updateDaySchedule(dateStr);
        });
        
        calendar.appendChild(day);
    }
    
    // Carregar eventos do mês atual
    loadMonthEvents(currentYear, currentMonth + 1);
}

// Atualizar título do mês
function updateMonthTitle(date) {
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const monthTitle = document.getElementById('current-month');
    if (monthTitle) {
        monthTitle.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
}

// Carregar eventos do mês
function loadMonthEvents(year, month) {
    // Formatar mês para filtro
    const monthStr = String(month).padStart(2, '0');
    
    // Buscar videochamadas do mês
    airtableBase(TABLES.VIDEO_CALLS).select({
        filterByFormula: `AND(
            YEAR({Data}) = ${year},
            MONTH({Data}) = ${month}
        )`
    }).eachPage(function page(records, fetchNextPage) {
        // Processar os registros desta página
        records.forEach(record => {
            const date = new Date(record.get('Data'));
            const dateStr = formatDate(date);
            
            // Marcar dia com evento
            const dayElement = document.querySelector(`.calendar-day[data-date="${dateStr}"]`);
            if (dayElement) {
                dayElement.classList.add('has-events');
            }
        });
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar eventos do mês:', err);
        }
    });
}

// Atualizar agenda do dia
function updateDaySchedule(dateStr) {
    const selectedDate = document.getElementById('selected-date');
    const appointmentsContainer = document.getElementById('appointments-container');
    const emptyState = document.getElementById('appointments-empty');
    
    // Formatar data para exibição
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('pt-BR', options);
    
    // Atualizar título
    if (selectedDate) {
        selectedDate.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
    
    // Limpar container
    if (appointmentsContainer) {
        appointmentsContainer.innerHTML = '';
    }
    
    // Buscar videochamadas do dia
    airtableBase(TABLES.VIDEO_CALLS).select({
        filterByFormula: `DATETIME_FORMAT({Data}, 'YYYY-MM-DD') = '${dateStr}'`,
        sort: [{field: 'Data', direction: 'asc'}]
    }).eachPage(function page(records, fetchNextPage) {
        if (records.length === 0) {
            // Mostrar estado vazio
            if (emptyState) {
                emptyState.classList.remove('hidden');
            }
            return;
        }
        
        // Esconder estado vazio
        if (emptyState) {
            emptyState.classList.add('hidden');
        }
        
        // Processar os registros desta página
        records.forEach(record => {
            const appointment = {
                id: record.id,
                clientName: record.get('Nome do Cliente'),
                dateTime: record.get('Data'),
                notes: record.get('Anotações') || '',
                whatsapp: record.get('WhatsApp'),
                completed: record.get('Concluída') || false
            };
            
            // Criar card de agendamento
            const card = document.createElement('div');
            card.className = 'appointment-card';
            if (appointment.completed) {
                card.classList.add('completed');
            }
            
            // Formatar hora
            const time = new Date(appointment.dateTime).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            card.innerHTML = `
                <p class="appointment-time">${time}</p>
                <h4 class="appointment-client">${appointment.clientName}</h4>
                ${appointment.notes ? `<p class="appointment-notes">${appointment.notes}</p>` : ''}
                <div class="appointment-actions">
                    <button class="btn btn-primary open-whatsapp" data-number="${appointment.whatsapp}">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                    ${!appointment.completed ? 
                        `<button class="btn btn-outline mark-completed" data-id="${appointment.id}">
                            <i class="fas fa-check"></i> Concluir
                        </button>` : ''
                    }
                    <button class="btn btn-outline delete-appointment" data-id="${appointment.id}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
            
            // Adicionar ao container
            if (appointmentsContainer) {
                appointmentsContainer.appendChild(card);
            }
        });
        
        // Adicionar event listeners para botões
        addAppointmentButtonListeners();
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar agenda do dia:', err);
            showToast('Erro ao carregar agenda', 'error');
        }
    });
}

// Adicionar event listeners para botões de agendamento
function addAppointmentButtonListeners() {
    // Botões de WhatsApp
    const whatsappButtons = document.querySelectorAll('.appointment-card .open-whatsapp');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', () => {
            const number = button.getAttribute('data-number');
            openWhatsApp(number, 'Olá! Estou entrando em contato sobre nossa videochamada agendada.');
        });
    });
    
    // Botões de marcar como concluído
    const completeButtons = document.querySelectorAll('.appointment-card .mark-completed');
    completeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const appointmentId = button.getAttribute('data-id');
            markVideoCallAsCompleted(appointmentId);
        });
    });
    
    // Botões de excluir
    const deleteButtons = document.querySelectorAll('.appointment-card .delete-appointment');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const appointmentId = button.getAttribute('data-id');
            
            // Confirmar exclusão
            if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                deleteVideoCall(appointmentId);
            }
        });
    });
}

// Configurar navegação do calendário
function setupCalendarNavigation() {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            navigateMonth(-1);
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            navigateMonth(1);
        });
    }
}

// Navegar entre meses
function navigateMonth(direction) {
    // Obter mês atual do título
    const currentMonthTitle = document.getElementById('current-month').textContent;
    const [monthName, year] = currentMonthTitle.split(' ');
    
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const monthIndex = monthNames.indexOf(monthName);
    const currentYear = parseInt(year);
    
    // Calcular novo mês e ano
    let newMonth = monthIndex + direction;
    let newYear = currentYear;
    
    if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    }
    
    // Atualizar calendário
    const newDate = new Date(newYear, newMonth, 1);
    
    // Atualizar título do mês
    updateMonthTitle(newDate);
    
    // Reinicializar calendário
    initCalendar();
}

// Carregar clientes para o select de agendamento
function loadClientsForSelect() {
    const clientSelect = document.getElementById('schedule-client');
    
    if (!clientSelect) return;
    
    // Limpar opções existentes
    clientSelect.innerHTML = '<option value="" disabled selected>Selecione um cliente</option>';
    
    // Buscar clientes do Airtable
    airtableBase(TABLES.CLIENTS).select({
        view: 'Grid view',
        sort: [{field: 'Nome', direction: 'asc'}]
    }).eachPage(function page(records, fetchNextPage) {
        // Processar os registros desta página
        records.forEach(record => {
            const option = document.createElement('option');
            option.value = record.id;
            option.textContent = record.get('Nome');
            option.setAttribute('data-whatsapp', record.get('WhatsApp'));
            
            clientSelect.appendChild(option);
        });
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar clientes:', err);
            showToast('Erro ao carregar clientes', 'error');
        }
    });
}
