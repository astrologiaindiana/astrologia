// Funções para interagir com o Airtable
// Carregar tipos de mapas
function loadMapTypes() {
    showLoading('map-types-loading');
    
    airtableBase(TABLES.MAP_TYPES).select({
        view: 'Grid view'
    }).eachPage(function page(records, fetchNextPage) {
        // Processar os registros desta página
        const mapTypes = records.map(record => ({
            id: record.id,
            name: record.get('Nome'),
            value: record.get('Valor')
        }));
        
        // Atualizar a interface com os tipos de mapas
        updateMapTypesUI(mapTypes);
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        hideLoading('map-types-loading');
        
        if (err) {
            console.error('Erro ao carregar tipos de mapas:', err);
            showToast('Erro ao carregar tipos de mapas', 'error');
        }
    });
}

// Carregar pedidos
function loadOrders(filters = {}) {
    showLoading('orders-loading');
    
    // Construir filtro para o Airtable
    let filterFormula = '';
    
    if (filters.responsible) {
        filterFormula += `{Responsável} = '${filters.responsible}'`;
    }
    
    if (filters.status) {
        if (filterFormula) filterFormula += ' AND ';
        filterFormula += `{Status} = '${filters.status}'`;
    }
    
    if (filters.mapType) {
        if (filterFormula) filterFormula += ' AND ';
        filterFormula += `{Tipo de Mapa} = '${filters.mapType}'`;
    }
    
    if (filters.date) {
        if (filterFormula) filterFormula += ' AND ';
        filterFormula += `DATETIME_FORMAT({Data da Compra}, 'YYYY-MM-DD') = '${filters.date}'`;
    }
    
    // Configurar a consulta
    const queryOptions = {
        view: 'Grid view',
        sort: [{field: 'Data da Compra', direction: 'desc'}]
    };
    
    if (filterFormula) {
        queryOptions.filterByFormula = filterFormula;
    }
    
    // Fazer a consulta
    airtableBase(TABLES.ORDERS).select(queryOptions).eachPage(function page(records, fetchNextPage) {
        // Processar os registros desta página
        const orders = records.map(record => ({
            id: record.id,
            clientName: record.get('Nome do Cliente'),
            clientId: record.get('Cliente')[0],
            purchaseDate: record.get('Data da Compra'),
            mapType: record.get('Tipo de Mapa'),
            responsible: record.get('Responsável'),
            status: record.get('Status'),
            whatsapp: record.get('WhatsApp')
        }));
        
        // Atualizar a interface com os pedidos
        updateOrdersUI(orders);
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        hideLoading('orders-loading');
        
        if (err) {
            console.error('Erro ao carregar pedidos:', err);
            showToast('Erro ao carregar pedidos', 'error');
        }
    });
}

// Carregar clientes
function loadClients(search = '') {
    showLoading('clients-loading');
    
    // Construir filtro para o Airtable
    let filterFormula = '';
    
    if (search) {
        filterFormula = `OR(FIND('${search.toLowerCase()}', LOWER({Nome})), FIND('${search.toLowerCase()}', LOWER({WhatsApp})))`;
    }
    
    // Configurar a consulta
    const queryOptions = {
        view: 'Grid view',
        sort: [{field: 'Nome', direction: 'asc'}]
    };
    
    if (filterFormula) {
        queryOptions.filterByFormula = filterFormula;
    }
    
    // Fazer a consulta
    airtableBase(TABLES.CLIENTS).select(queryOptions).eachPage(function page(records, fetchNextPage) {
        // Processar os registros desta página
        const clients = records.map(record => ({
            id: record.id,
            name: record.get('Nome'),
            whatsapp: record.get('WhatsApp'),
            birthDate: record.get('Data de Nascimento'),
            birthTime: record.get('Hora de Nascimento'),
            birthPlace: record.get('Local de Nascimento'),
            purchaseCount: record.get('Total de Compras') || 0,
            lastPurchase: record.get('Última Compra')
        }));
        
        // Atualizar a interface com os clientes
        updateClientsUI(clients);
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        hideLoading('clients-loading');
        
        if (err) {
            console.error('Erro ao carregar clientes:', err);
            showToast('Erro ao carregar clientes', 'error');
        }
    });
}

// Carregar videochamadas
function loadVideoCalls(date = null) {
    // Construir filtro para o Airtable
    let filterFormula = '';
    
    if (date) {
        filterFormula = `DATETIME_FORMAT({Data}, 'YYYY-MM-DD') = '${date}'`;
    }
    
    // Configurar a consulta
    const queryOptions = {
        view: 'Grid view',
        sort: [{field: 'Data', direction: 'asc'}]
    };
    
    if (filterFormula) {
        queryOptions.filterByFormula = filterFormula;
    }
    
    // Fazer a consulta
    airtableBase(TABLES.VIDEO_CALLS).select(queryOptions).eachPage(function page(records, fetchNextPage) {
        // Processar os registros desta página
        const videoCalls = records.map(record => ({
            id: record.id,
            clientName: record.get('Nome do Cliente'),
            clientId: record.get('Cliente')[0],
            date: record.get('Data'),
            notes: record.get('Anotações'),
            whatsapp: record.get('WhatsApp'),
            completed: record.get('Concluída') || false
        }));
        
        // Atualizar a interface com as videochamadas
        updateVideoCallsUI(videoCalls);
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar videochamadas:', err);
            showToast('Erro ao carregar videochamadas', 'error');
        }
    });
}

// Carregar dados financeiros
function loadFinancialData(period = 'day', date = new Date()) {
    // Construir filtro para o Airtable
    let filterFormula = '';
    let startDate, endDate;
    
    if (period === 'day') {
        // Filtrar por dia específico
        const formattedDate = formatDate(date);
        filterFormula = `DATETIME_FORMAT({Data da Compra}, 'YYYY-MM-DD') = '${formattedDate}'`;
    } else if (period === 'week') {
        // Filtrar por semana
        startDate = new Date(date);
        startDate.setDate(date.getDate() - date.getDay()); // Domingo da semana
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Sábado da semana
        
        filterFormula = `AND(
            DATETIME_FORMAT({Data da Compra}, 'YYYY-MM-DD') >= '${formatDate(startDate)}',
            DATETIME_FORMAT({Data da Compra}, 'YYYY-MM-DD') <= '${formatDate(endDate)}'
        )`;
    } else if (period === 'month') {
        // Filtrar por mês
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        filterFormula = `AND(
            YEAR({Data da Compra}) = ${year},
            MONTH({Data da Compra}) = ${month}
        )`;
    }
    
    // Configurar a consulta
    const queryOptions = {
        view: 'Grid view'
    };
    
    if (filterFormula) {
        queryOptions.filterByFormula = filterFormula;
    }
    
    // Fazer a consulta
    airtableBase(TABLES.ORDERS).select(queryOptions).eachPage(function page(records, fetchNextPage) {
        // Processar os registros desta página
        const orders = records.map(record => ({
            id: record.id,
            clientName: record.get('Nome do Cliente'),
            purchaseDate: record.get('Data da Compra'),
            mapType: record.get('Tipo de Mapa'),
            responsible: record.get('Responsável'),
            status: record.get('Status'),
            value: record.get('Valor')
        }));
        
        // Atualizar a interface com os dados financeiros
        updateFinancialUI(orders, period, date);
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar dados financeiros:', err);
            showToast('Erro ao carregar dados financeiros', 'error');
        }
    });
}

// Registrar nova venda
function createNewSale(saleData) {
    // Primeiro, verificar se o cliente já existe
    airtableBase(TABLES.CLIENTS).select({
        filterByFormula: `{WhatsApp} = '${saleData.whatsapp}'`
    }).firstPage((err, records) => {
        if (err) {
            console.error('Erro ao verificar cliente:', err);
            showToast('Erro ao registrar venda', 'error');
            return;
        }
        
        let clientId;
        
        // Se o cliente não existir, criar um novo
        if (records.length === 0) {
            airtableBase(TABLES.CLIENTS).create({
                'Nome': saleData.name,
                'WhatsApp': saleData.whatsapp,
                'Data de Nascimento': saleData.birthDate,
                'Hora de Nascimento': saleData.birthTime,
                'Local de Nascimento': saleData.birthPlace
            }, (err, record) => {
                if (err) {
                    console.error('Erro ao criar cliente:', err);
                    showToast('Erro ao registrar venda', 'error');
                    return;
                }
                
                // Criar o pedido com o novo cliente
                createOrder(record.id);
            });
        } else {
            // Cliente já existe, usar o ID existente
            clientId = records[0].id;
            
            // Atualizar informações do cliente, se necessário
            airtableBase(TABLES.CLIENTS).update(clientId, {
                'Data de Nascimento': saleData.birthDate,
                'Hora de Nascimento': saleData.birthTime,
                'Local de Nascimento': saleData.birthPlace
            }, (err) => {
                if (err) {
                    console.error('Erro ao atualizar cliente:', err);
                }
                
                // Criar o pedido com o cliente existente
                createOrder(clientId);
            });
        }
        
        // Função para criar o pedido
        function createOrder(clientId) {
            // Buscar o valor do tipo de mapa
            airtableBase(TABLES.MAP_TYPES).select({
                filterByFormula: `{Nome} = '${saleData.mapType}'`
            }).firstPage((err, records) => {
                if (err || records.length === 0) {
                    console.error('Erro ao buscar valor do mapa:', err);
                    showToast('Erro ao registrar venda', 'error');
                    return;
                }
                
                const mapValue = records[0].get('Valor');
                
                // Criar o pedido
                airtableBase(TABLES.ORDERS).create({
                    'Cliente': [clientId],
                    'Nome do Cliente': saleData.name,
                    'WhatsApp': saleData.whatsapp,
                    'Data da Compra': new Date().toISOString(),
                    'Tipo de Mapa': saleData.mapType,
                    'Responsável': saleData.responsible,
                    'Status': 'Pendente',
                    'Valor': mapValue
                }, (err, record) => {
                    if (err) {
                        console.error('Erro ao criar pedido:', err);
                        showToast('Erro ao registrar venda', 'error');
                        return;
                    }
                    
                    // Se requer videochamada, criar agendamento
                    if (saleData.requiresVideocall) {
                        // Criar entrada na tabela de videochamadas (sem data definida ainda)
                        airtableBase(TABLES.VIDEO_CALLS).create({
                            'Cliente': [clientId],
                            'Nome do Cliente': saleData.name,
                            'WhatsApp': saleData.whatsapp,
                            'Pedido': [record.id],
                            'Concluída': false
                        }, (err) => {
                            if (err) {
                                console.error('Erro ao criar agendamento:', err);
                                showToast('Venda registrada, mas houve erro ao criar agendamento', 'warning');
                                return;
                            }
                            
                            showToast('Venda registrada com sucesso!', 'success');
                            resetNewSaleForm();
                            loadOrders();
                        });
                    } else {
                        showToast('Venda registrada com sucesso!', 'success');
                        resetNewSaleForm();
                        loadOrders();
                    }
                });
            });
        }
    });
}

// Marcar pedido como enviado
function markOrderAsSent(orderId) {
    airtableBase(TABLES.ORDERS).update(orderId, {
        'Status': 'Enviado'
    }, (err) => {
        if (err) {
            console.error('Erro ao atualizar pedido:', err);
            showToast('Erro ao marcar pedido como enviado', 'error');
            return;
        }
        
        showToast('Pedido marcado como enviado!', 'success');
        loadOrders();
    });
}

// Adicionar tipo de mapa
function addMapType(mapTypeData) {
    airtableBase(TABLES.MAP_TYPES).create({
        'Nome': mapTypeData.name,
        'Valor': mapTypeData.value
    }, (err) => {
        if (err) {
            console.error('Erro ao adicionar tipo de mapa:', err);
            showToast('Erro ao adicionar tipo de mapa', 'error');
            return;
        }
        
        showToast('Tipo de mapa adicionado com sucesso!', 'success');
        loadMapTypes();
    });
}

// Atualizar tipo de mapa
function updateMapType(id, mapTypeData) {
    airtableBase(TABLES.MAP_TYPES).update(id, {
        'Nome': mapTypeData.name,
        'Valor': mapTypeData.value
    }, (err) => {
        if (err) {
            console.error('Erro ao atualizar tipo de mapa:', err);
            showToast('Erro ao atualizar tipo de mapa', 'error');
            return;
        }
        
        showToast('Tipo de mapa atualizado com sucesso!', 'success');
        loadMapTypes();
    });
}

// Excluir tipo de mapa
function deleteMapType(id) {
    airtableBase(TABLES.MAP_TYPES).destroy(id, (err) => {
        if (err) {
            console.error('Erro ao excluir tipo de mapa:', err);
            showToast('Erro ao excluir tipo de mapa', 'error');
            return;
        }
        
        showToast('Tipo de mapa excluído com sucesso!', 'success');
        loadMapTypes();
    });
}

// Agendar videochamada
function scheduleVideoCall(scheduleData) {
    airtableBase(TABLES.VIDEO_CALLS).create({
        'Cliente': [scheduleData.clientId],
        'Nome do Cliente': scheduleData.clientName,
        'WhatsApp': scheduleData.whatsapp,
        'Data': scheduleData.dateTime,
        'Anotações': scheduleData.notes,
        'Concluída': false
    }, (err) => {
        if (err) {
            console.error('Erro ao agendar videochamada:', err);
            showToast('Erro ao agendar videochamada', 'error');
            return;
        }
        
        showToast('Videochamada agendada com sucesso!', 'success');
        loadVideoCalls();
    });
}

// Marcar videochamada como concluída
function markVideoCallAsCompleted(id) {
    airtableBase(TABLES.VIDEO_CALLS).update(id, {
        'Concluída': true
    }, (err) => {
        if (err) {
            console.error('Erro ao marcar videochamada como concluída:', err);
            showToast('Erro ao marcar videochamada como concluída', 'error');
            return;
        }
        
        showToast('Videochamada marcada como concluída!', 'success');
        loadVideoCalls();
    });
}

// Excluir videochamada
function deleteVideoCall(id) {
    airtableBase(TABLES.VIDEO_CALLS).destroy(id, (err) => {
        if (err) {
            console.error('Erro ao excluir videochamada:', err);
            showToast('Erro ao excluir videochamada', 'error');
            return;
        }
        
        showToast('Videochamada excluída com sucesso!', 'success');
        loadVideoCalls();
    });
}

// Exportar dados para CSV
function exportToCSV(data, filename) {
    // Verificar se há dados para exportar
    if (!data || !data.length) {
        showToast('Não há dados para exportar', 'warning');
        return;
    }
    
    // Obter cabeçalhos (nomes das propriedades)
    const headers = Object.keys(data[0]);
    
    // Criar conteúdo CSV
    let csvContent = headers.join(',') + '\n';
    
    // Adicionar linhas de dados
    data.forEach(item => {
        const row = headers.map(header => {
            // Escapar aspas e adicionar aspas em volta de strings
            const cell = item[header] !== null && item[header] !== undefined ? item[header].toString() : '';
            return `"${cell.replace(/"/g, '""')}"`;
        });
        
        csvContent += row.join(',') + '\n';
    });
    
    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
