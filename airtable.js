// Configuração do Airtable
// Inicializa a conexão com o Airtable
var airtableBase;

// Constantes para nomes de tabelas
const TABLES = {
    MAP_TYPES: 'Tipos de Mapa',
    ORDERS: 'Pedidos',
    CLIENTS: 'Clientes',
    VIDEO_CALLS: 'Videochamadas'
};

// Inicializar Airtable
function initAirtable() {
    console.log("Inicializando Airtable...");
    try {
        // Verificar se a chave API está definida
        if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
            console.error("Chave API ou Base ID do Airtable não definidos");
            showToast("Erro ao conectar com Airtable. Verifique as configurações.", "error");
            return false;
        }
        
        // Configurar Airtable
        Airtable.configure({
            apiKey: AIRTABLE_API_KEY
        });
        
        // Inicializar base
        airtableBase = Airtable.base(AIRTABLE_BASE_ID);
        console.log("Airtable inicializado com sucesso!");
        return true;
    } catch (error) {
        console.error("Erro ao inicializar Airtable:", error);
        showToast("Erro ao conectar com Airtable: " + error.message, "error");
        return false;
    }
}

// Carregar tipos de mapa
function loadMapTypes(callback) {
    console.log("Carregando tipos de mapa...");
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.MAP_TYPES).select({
            view: 'Grid view',
            sort: [{field: 'Nome', direction: 'asc'}]
        }).eachPage(function page(records, fetchNextPage) {
            const mapTypes = records.map(record => ({
                id: record.id,
                name: record.get('Nome'),
                value: record.get('Valor') || 0
            }));
            
            if (callback) {
                callback(mapTypes);
            }
            
            fetchNextPage();
        }, function done(err) {
            if (err) {
                console.error('Erro ao carregar tipos de mapa:', err);
                showToast('Erro ao carregar tipos de mapa', 'error');
            }
        });
    } catch (error) {
        console.error("Erro ao carregar tipos de mapa:", error);
        showToast("Erro ao carregar dados: " + error.message, "error");
    }
}

// Adicionar tipo de mapa
function addMapType(name, value, callback) {
    console.log(`Adicionando tipo de mapa: ${name}, valor: ${value}`);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.MAP_TYPES).create({
            'Nome': name,
            'Valor': parseFloat(value)
        }, function(err, record) {
            if (err) {
                console.error('Erro ao adicionar tipo de mapa:', err);
                showToast('Erro ao adicionar tipo de mapa', 'error');
                return;
            }
            
            showToast('Tipo de mapa adicionado com sucesso', 'success');
            
            if (callback) {
                callback({
                    id: record.id,
                    name: name,
                    value: parseFloat(value)
                });
            }
        });
    } catch (error) {
        console.error("Erro ao adicionar tipo de mapa:", error);
        showToast("Erro ao adicionar dados: " + error.message, "error");
    }
}

// Atualizar tipo de mapa
function updateMapType(id, name, value, callback) {
    console.log(`Atualizando tipo de mapa: ${id}, nome: ${name}, valor: ${value}`);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.MAP_TYPES).update(id, {
            'Nome': name,
            'Valor': parseFloat(value)
        }, function(err, record) {
            if (err) {
                console.error('Erro ao atualizar tipo de mapa:', err);
                showToast('Erro ao atualizar tipo de mapa', 'error');
                return;
            }
            
            showToast('Tipo de mapa atualizado com sucesso', 'success');
            
            if (callback) {
                callback({
                    id: record.id,
                    name: name,
                    value: parseFloat(value)
                });
            }
        });
    } catch (error) {
        console.error("Erro ao atualizar tipo de mapa:", error);
        showToast("Erro ao atualizar dados: " + error.message, "error");
    }
}

// Excluir tipo de mapa
function deleteMapType(id, callback) {
    console.log(`Excluindo tipo de mapa: ${id}`);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.MAP_TYPES).destroy(id, function(err, deletedRecord) {
            if (err) {
                console.error('Erro ao excluir tipo de mapa:', err);
                showToast('Erro ao excluir tipo de mapa', 'error');
                return;
            }
            
            showToast('Tipo de mapa excluído com sucesso', 'success');
            
            if (callback) {
                callback(id);
            }
        });
    } catch (error) {
        console.error("Erro ao excluir tipo de mapa:", error);
        showToast("Erro ao excluir dados: " + error.message, "error");
    }
}

// Carregar pedidos
function loadOrders(filters, callback) {
    console.log("Carregando pedidos com filtros:", filters);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        // Construir fórmula de filtro
        let filterFormula = '';
        
        if (filters) {
            const filterConditions = [];
            
            if (filters.responsible) {
                filterConditions.push(`{Responsável} = '${filters.responsible}'`);
            }
            
            if (filters.status) {
                filterConditions.push(`{Status} = '${filters.status}'`);
            }
            
            if (filters.mapType) {
                filterConditions.push(`{Tipo de Mapa} = '${filters.mapType}'`);
            }
            
            if (filters.date) {
                filterConditions.push(`DATETIME_FORMAT({Data da Compra}, 'YYYY-MM-DD') = '${filters.date}'`);
            }
            
            if (filterConditions.length > 0) {
                filterFormula = `AND(${filterConditions.join(', ')})`;
            }
        }
        
        const params = {
            view: 'Grid view',
            sort: [{field: 'Data da Compra', direction: 'desc'}]
        };
        
        if (filterFormula) {
            params.filterByFormula = filterFormula;
        }
        
        airtableBase(TABLES.ORDERS).select(params).eachPage(function page(records, fetchNextPage) {
            const orders = records.map(record => ({
                id: record.id,
                clientName: record.get('Nome do Cliente'),
                clientId: record.get('Cliente')[0],
                purchaseDate: record.get('Data da Compra'),
                mapType: record.get('Tipo de Mapa'),
                responsible: record.get('Responsável'),
                status: record.get('Status') || 'Pendente',
                requiresVideoCall: record.get('Requer Videochamada') || false,
                birthDate: record.get('Data de Nascimento'),
                birthTime: record.get('Hora de Nascimento'),
                birthPlace: record.get('Local de Nascimento'),
                whatsapp: record.get('WhatsApp')
            }));
            
            if (callback) {
                callback(orders);
            }
            
            fetchNextPage();
        }, function done(err) {
            if (err) {
                console.error('Erro ao carregar pedidos:', err);
                showToast('Erro ao carregar pedidos', 'error');
            }
        });
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        showToast("Erro ao carregar dados: " + error.message, "error");
    }
}

// Adicionar pedido
function addOrder(orderData, callback) {
    console.log("Adicionando pedido:", orderData);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        // Verificar se o cliente já existe
        findClientByWhatsApp(orderData.whatsapp, function(existingClient) {
            if (existingClient) {
                // Cliente já existe, usar ID existente
                createOrderRecord(existingClient.id);
            } else {
                // Cliente não existe, criar novo
                addClient({
                    name: orderData.clientName,
                    whatsapp: orderData.whatsapp,
                    birthDate: orderData.birthDate,
                    birthTime: orderData.birthTime,
                    birthPlace: orderData.birthPlace
                }, function(newClient) {
                    createOrderRecord(newClient.id);
                });
            }
        });
        
        // Função para criar o registro de pedido
        function createOrderRecord(clientId) {
            airtableBase(TABLES.ORDERS).create({
                'Nome do Cliente': orderData.clientName,
                'Cliente': [clientId],
                'Data da Compra': new Date().toISOString(),
                'Tipo de Mapa': orderData.mapType,
                'Responsável': orderData.responsible,
                'Status': 'Pendente',
                'Requer Videochamada': orderData.requiresVideoCall,
                'Data de Nascimento': orderData.birthDate,
                'Hora de Nascimento': orderData.birthTime,
                'Local de Nascimento': orderData.birthPlace,
                'WhatsApp': orderData.whatsapp
            }, function(err, record) {
                if (err) {
                    console.error('Erro ao adicionar pedido:', err);
                    showToast('Erro ao adicionar pedido', 'error');
                    return;
                }
                
                showToast('Pedido adicionado com sucesso', 'success');
                
                if (callback) {
                    callback({
                        id: record.id,
                        clientName: orderData.clientName,
                        clientId: clientId,
                        purchaseDate: new Date().toISOString(),
                        mapType: orderData.mapType,
                        responsible: orderData.responsible,
                        status: 'Pendente',
                        requiresVideoCall: orderData.requiresVideoCall,
                        birthDate: orderData.birthDate,
                        birthTime: orderData.birthTime,
                        birthPlace: orderData.birthPlace,
                        whatsapp: orderData.whatsapp
                    });
                }
            });
        }
    } catch (error) {
        console.error("Erro ao adicionar pedido:", error);
        showToast("Erro ao adicionar dados: " + error.message, "error");
    }
}

// Atualizar status do pedido
function updateOrderStatus(id, status, callback) {
    console.log(`Atualizando status do pedido: ${id}, status: ${status}`);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.ORDERS).update(id, {
            'Status': status
        }, function(err, record) {
            if (err) {
                console.error('Erro ao atualizar status do pedido:', err);
                showToast('Erro ao atualizar status do pedido', 'error');
                return;
            }
            
            showToast('Status do pedido atualizado com sucesso', 'success');
            
            if (callback) {
                callback({
                    id: record.id,
                    status: status
                });
            }
        });
    } catch (error) {
        console.error("Erro ao atualizar status do pedido:", error);
        showToast("Erro ao atualizar dados: " + error.message, "error");
    }
}

// Carregar clientes
function loadClients(callback) {
    console.log("Carregando clientes...");
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.CLIENTS).select({
            view: 'Grid view',
            sort: [{field: 'Nome', direction: 'asc'}]
        }).eachPage(function page(records, fetchNextPage) {
            const clients = records.map(record => ({
                id: record.id,
                name: record.get('Nome'),
                whatsapp: record.get('WhatsApp'),
                birthDate: record.get('Data de Nascimento'),
                birthTime: record.get('Hora de Nascimento'),
                birthPlace: record.get('Local de Nascimento'),
                mapCount: record.get('Mapas Comprados') || 0,
                lastPurchase: record.get('Última Compra')
            }));
            
            if (callback) {
                callback(clients);
            }
            
            fetchNextPage();
        }, function done(err) {
            if (err) {
                console.error('Erro ao carregar clientes:', err);
                showToast('Erro ao carregar clientes', 'error');
            }
        });
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        showToast("Erro ao carregar dados: " + error.message, "error");
    }
}

// Buscar cliente por WhatsApp
function findClientByWhatsApp(whatsapp, callback) {
    console.log(`Buscando cliente por WhatsApp: ${whatsapp}`);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.CLIENTS).select({
            filterByFormula: `{WhatsApp} = '${whatsapp}'`,
            maxRecords: 1
        }).firstPage(function(err, records) {
            if (err) {
                console.error('Erro ao buscar cliente por WhatsApp:', err);
                showToast('Erro ao buscar cliente', 'error');
                return;
            }
            
            if (records && records.length > 0) {
                const record = records[0];
                const client = {
                    id: record.id,
                    name: record.get('Nome'),
                    whatsapp: record.get('WhatsApp'),
                    birthDate: record.get('Data de Nascimento'),
                    birthTime: record.get('Hora de Nascimento'),
                    birthPlace: record.get('Local de Nascimento'),
                    mapCount: record.get('Mapas Comprados') || 0,
                    lastPurchase: record.get('Última Compra')
                };
                
                if (callback) {
                    callback(client);
                }
            } else {
                if (callback) {
                    callback(null);
                }
            }
        });
    } catch (error) {
        console.error("Erro ao buscar cliente por WhatsApp:", error);
        showToast("Erro ao buscar dados: " + error.message, "error");
        if (callback) {
            callback(null);
        }
    }
}

// Adicionar cliente
function addClient(clientData, callback) {
    console.log("Adicionando cliente:", clientData);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.CLIENTS).create({
            'Nome': clientData.name,
            'WhatsApp': clientData.whatsapp,
            'Data de Nascimento': clientData.birthDate,
            'Hora de Nascimento': clientData.birthTime,
            'Local de Nascimento': clientData.birthPlace,
            'Mapas Comprados': 1,
            'Última Compra': new Date().toISOString()
        }, function(err, record) {
            if (err) {
                console.error('Erro ao adicionar cliente:', err);
                showToast('Erro ao adicionar cliente', 'error');
                return;
            }
            
            const client = {
                id: record.id,
                name: clientData.name,
                whatsapp: clientData.whatsapp,
                birthDate: clientData.birthDate,
                birthTime: clientData.birthTime,
                birthPlace: clientData.birthPlace,
                mapCount: 1,
                lastPurchase: new Date().toISOString()
            };
            
            if (callback) {
                callback(client);
            }
        });
    } catch (error) {
        console.error("Erro ao adicionar cliente:", error);
        showToast("Erro ao adicionar dados: " + error.message, "error");
    }
}

// Carregar histórico de compras do cliente
function loadClientHistory(clientId, callback) {
    console.log(`Carregando histórico do cliente: ${clientId}`);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.ORDERS).select({
            filterByFormula: `FIND('${clientId}', {Cliente})`,
            sort: [{field: 'Data da Compra', direction: 'desc'}]
        }).eachPage(function page(records, fetchNextPage) {
            const history = records.map(record => ({
                id: record.id,
                purchaseDate: record.get('Data da Compra'),
                mapType: record.get('Tipo de Mapa'),
                responsible: record.get('Responsável'),
                status: record.get('Status') || 'Pendente'
            }));
            
            if (callback) {
                callback(history);
            }
            
            fetchNextPage();
        }, function done(err) {
            if (err) {
                console.error('Erro ao carregar histórico do cliente:', err);
                showToast('Erro ao carregar histórico do cliente', 'error');
            }
        });
    } catch (error) {
        console.error("Erro ao carregar histórico do cliente:", error);
        showToast("Erro ao carregar dados: " + error.message, "error");
    }
}

// Carregar videochamadas
function loadVideoCalls(callback) {
    console.log("Carregando videochamadas...");
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.VIDEO_CALLS).select({
            view: 'Grid view',
            sort: [{field: 'Data', direction: 'asc'}]
        }).eachPage(function page(records, fetchNextPage) {
            const videoCalls = records.map(record => ({
                id: record.id,
                clientName: record.get('Nome do Cliente'),
                clientId: record.get('Cliente')[0],
                dateTime: record.get('Data'),
                notes: record.get('Anotações') || '',
                whatsapp: record.get('WhatsApp'),
                completed: record.get('Concluída') || false
            }));
            
            if (callback) {
                callback(videoCalls);
            }
            
            fetchNextPage();
        }, function done(err) {
            if (err) {
                console.error('Erro ao carregar videochamadas:', err);
                showToast('Erro ao carregar videochamadas', 'error');
            }
        });
    } catch (error) {
        console.error("Erro ao carregar videochamadas:", error);
        showToast("Erro ao carregar dados: " + error.message, "error");
    }
}

// Adicionar videochamada
function addVideoCall(videoCallData, callback) {
    console.log("Adicionando videochamada:", videoCallData);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        // Buscar informações do cliente
        airtableBase(TABLES.CLIENTS).find(videoCallData.clientId, function(err, record) {
            if (err) {
                console.error('Erro ao buscar cliente:', err);
                showToast('Erro ao buscar cliente', 'error');
                return;
            }
            
            const clientName = record.get('Nome');
            const whatsapp = record.get('WhatsApp');
            
            // Criar registro de videochamada
            airtableBase(TABLES.VIDEO_CALLS).create({
                'Nome do Cliente': clientName,
                'Cliente': [videoCallData.clientId],
                'Data': videoCallData.dateTime,
                'Anotações': videoCallData.notes,
                'WhatsApp': whatsapp,
                'Concluída': false
            }, function(err, record) {
                if (err) {
                    console.error('Erro ao adicionar videochamada:', err);
                    showToast('Erro ao adicionar videochamada', 'error');
                    return;
                }
                
                showToast('Videochamada agendada com sucesso', 'success');
                
                if (callback) {
                    callback({
                        id: record.id,
                        clientName: clientName,
                        clientId: videoCallData.clientId,
                        dateTime: videoCallData.dateTime,
                        notes: videoCallData.notes,
                        whatsapp: whatsapp,
                        completed: false
                    });
                }
            });
        });
    } catch (error) {
        console.error("Erro ao adicionar videochamada:", error);
        showToast("Erro ao adicionar dados: " + error.message, "error");
    }
}

// Marcar videochamada como concluída
function markVideoCallAsCompleted(id, callback) {
    console.log(`Marcando videochamada como concluída: ${id}`);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.VIDEO_CALLS).update(id, {
            'Concluída': true
        }, function(err, record) {
            if (err) {
                console.error('Erro ao marcar videochamada como concluída:', err);
                showToast('Erro ao atualizar videochamada', 'error');
                return;
            }
            
            showToast('Videochamada marcada como concluída', 'success');
            
            if (callback) {
                callback({
                    id: record.id,
                    completed: true
                });
            }
        });
    } catch (error) {
        console.error("Erro ao marcar videochamada como concluída:", error);
        showToast("Erro ao atualizar dados: " + error.message, "error");
    }
}

// Excluir videochamada
function deleteVideoCall(id, callback) {
    console.log(`Excluindo videochamada: ${id}`);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        airtableBase(TABLES.VIDEO_CALLS).destroy(id, function(err, deletedRecord) {
            if (err) {
                console.error('Erro ao excluir videochamada:', err);
                showToast('Erro ao excluir videochamada', 'error');
                return;
            }
            
            showToast('Videochamada excluída com sucesso', 'success');
            
            if (callback) {
                callback(id);
            }
        });
    } catch (error) {
        console.error("Erro ao excluir videochamada:", error);
        showToast("Erro ao excluir dados: " + error.message, "error");
    }
}

// Carregar dados financeiros
function loadFinancialData(period, date, callback) {
    console.log(`Carregando dados financeiros: período ${period}, data ${date}`);
    
    // Verificar se airtableBase está definido
    if (!airtableBase) {
        if (!initAirtable()) {
            return;
        }
    }
    
    try {
        // Calcular datas de início e fim com base no período
        const startDate = new Date(date);
        const endDate = new Date(date);
        
        switch (period) {
            case 'day':
                // Manter startDate e endDate como o mesmo dia
                break;
            case 'week':
                // Ajustar para domingo (início da semana)
                startDate.setDate(date.getDate() - date.getDay());
                // Ajustar para sábado (fim da semana)
                endDate.setDate(startDate.getDate() + 6);
                break;
            case 'month':
                // Ajustar para primeiro dia do mês
                startDate.setDate(1);
                // Ajustar para último dia do mês
                endDate.setMonth(date.getMonth() + 1);
                endDate.setDate(0);
                break;
        }
        
        // Formatar datas para filtro
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Buscar pedidos no período
        airtableBase(TABLES.ORDERS).select({
            filterByFormula: `AND(
                DATETIME_FORMAT({Data da Compra}, 'YYYY-MM-DD') >= '${startDateStr}',
                DATETIME_FORMAT({Data da Compra}, 'YYYY-MM-DD') <= '${endDateStr}'
            )`,
            sort: [{field: 'Data da Compra', direction: 'asc'}]
        }).eachPage(function page(records, fetchNextPage) {
            // Processar pedidos
            const orders = [];
            
            // Promessas para buscar valores dos tipos de mapa
            const promises = records.map(record => {
                return new Promise((resolve) => {
                    const mapType = record.get('Tipo de Mapa');
                    
                    // Buscar valor do tipo de mapa
                    airtableBase(TABLES.MAP_TYPES).select({
                        filterByFormula: `{Nome} = '${mapType}'`,
                        maxRecords: 1
                    }).firstPage(function(err, mapTypeRecords) {
                        let value = 0;
                        
                        if (!err && mapTypeRecords && mapTypeRecords.length > 0) {
                            value = mapTypeRecords[0].get('Valor') || 0;
                        }
                        
                        orders.push({
                            id: record.id,
                            clientName: record.get('Nome do Cliente'),
                            purchaseDate: record.get('Data da Compra'),
                            mapType: mapType,
                            responsible: record.get('Responsável'),
                            status: record.get('Status') || 'Pendente',
                            value: value
                        });
                        
                        resolve();
                    });
                });
            });
            
            // Quando todas as promessas forem resolvidas
            Promise.all(promises).then(() => {
                if (callback) {
                    callback(orders, period, date);
                }
                
                fetchNextPage();
            });
        }, function done(err) {
            if (err) {
                console.error('Erro ao carregar dados financeiros:', err);
                showToast('Erro ao carregar dados financeiros', 'error');
            }
        });
    } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
        showToast("Erro ao carregar dados: " + error.message, "error");
    }
}

// Inicializar Airtable quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado, inicializando Airtable...");
    initAirtable();
});
