// Categorias organizadas por mães
const CATEGORIAS = {
    "Procedentes": [
        "Adesão",
        "Não aderiu",
        "Recusou assinar auto",
        "065",
        "Calçada",
        "Potencial",
        "Auto"
    ],
    "Improcedentes": [
        "FDA",
        "Cadastro",
        "Fechado Potencial",
        "Recusa"
    ]
};

// Nomes personalizados para o relatório
const NOMES_RELATORIO = {
    "Procedentes": "PROCEDENTES",
    "Improcedentes": "IMPROCEDENTE"
};

const NOMES_SUBCATEGORIAS_RELATORIO = {
    "Adesão": "ADESÃO",
    "Não aderiu": "CLIENTE CONSCIENTIZADO MAS NÃO ADERIU",
    "Recusou assinar auto": "CLIENTE CONSCIENTIZADO RECUSOU ASSINAR AUTODECLARADO",
    "065": "SOLICITAÇÃO DA 65",
    "Calçada": "CONEXÃO CALÇADA",
    "Potencial": "REDE POTENCIAL",
    "Auto": "AUTODECLARADO",
    "FDA": "FECHADO/DESOCUPADO/ABANDONADO",
    "Cadastro": "CADASTRO",
    "Fechado Potencial": "IMÓVEL FECHADO REDE POTENCIAL",
    "Recusa": "RECUSA"
};

// Obter data atual no formato DD/MM/AA
const getDataAtual = () => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = String(hoje.getFullYear()).slice(-2);
    return `${dia}/${mes}/${ano}`;
};

// Verificar se localStorage está disponível
function isLocalStorageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.warn('localStorage não disponível:', e);
        return false;
    }
}

// Inicializar contadores do dia atual
function inicializarDia() {
    const data = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD para localStorage
    let contadores = {};
    
    if (isLocalStorageAvailable()) {
        contadores = JSON.parse(localStorage.getItem(data)) || {};
    }
    
    Object.keys(CATEGORIAS).forEach(categoriaMae => {
        CATEGORIAS[categoriaMae].forEach(subcategoria => {
            if (!(subcategoria in contadores)) {
                contadores[subcategoria] = 0;
            }
        });
    });
    
    if (isLocalStorageAvailable()) {
        localStorage.setItem(data, JSON.stringify(contadores));
    }
    return contadores;
}

// Salvar inputs no localStorage
function salvarInputs() {
    const agente = document.getElementById('agenteInput').value;
    const lider = document.getElementById('liderInput').value;
    if (isLocalStorageAvailable()) {
        localStorage.setItem('agente', agente);
        localStorage.setItem('lider', lider);
    }
}

// Carregar inputs do localStorage
function carregarInputs() {
    let agente = 'Domingos';
    let lider = 'Diego Muniz';
    if (isLocalStorageAvailable()) {
        agente = localStorage.getItem('agente') || agente;
        lider = localStorage.getItem('lider') || lider;
    }
    document.getElementById('agenteInput').value = agente;
    document.getElementById('liderInput').value = lider;
}

// Incrementar contador (+1)
function incrementar(subcategoria) {
    const data = new Date().toISOString().split('T')[0];
    const contadores = inicializarDia();
    
    contadores[subcategoria]++;
    if (isLocalStorageAvailable()) {
        localStorage.setItem(data, JSON.stringify(contadores));
    }
    atualizarInterface();
}

// Decrementar contador
function decrementar(subcategoria) {
    const data = new Date().toISOString().split('T')[0];
    const contadores = inicializarDia();
    
    if (contadores[subcategoria] > 0) {
        contadores[subcategoria]--;
        if (isLocalStorageAvailable()) {
            localStorage.setItem(data, JSON.stringify(contadores));
        }
        atualizarInterface();
    }
}

// Editar contador manualmente
function editarContador(subcategoria, elemento, valorAtual) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'contagem-input';
    input.value = valorAtual;
    input.min = '0';
    
    // Salvar ao pressionar Enter ou sair do campo
    const salvar = () => {
        let novoValor = parseInt(input.value, 10);
        if (isNaN(novoValor) || novoValor < 0) {
            novoValor = valorAtual; // Restaurar valor original se inválido
        }
        const data = new Date().toISOString().split('T')[0];
        const contadores = inicializarDia();
        contadores[subcategoria] = novoValor;
        if (isLocalStorageAvailable()) {
            localStorage.setItem(data, JSON.stringify(contadores));
        }
        atualizarInterface();
    };
    
    input.addEventListener('blur', salvar);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            salvar();
        } else if (e.key === 'Escape') {
            atualizarInterface(); // Restaurar valor original
        }
    });
    
    elemento.innerHTML = '';
    elemento.appendChild(input);
    input.focus();
}

// Resetar contagem com dupla confirmação
let resetTimeout = null;
function resetarContagem() {
    const botaoReset = document.getElementById('resetarContagem');
    
    if (botaoReset.textContent === 'Confirmar?') {
        const data = new Date().toISOString().split('T')[0];
        const contadores = {};
        
        Object.keys(CATEGORIAS).forEach(categoriaMae => {
            CATEGORIAS[categoriaMae].forEach(subcategoria => {
                contadores[subcategoria] = 0;
            });
        });
        
        if (isLocalStorageAvailable()) {
            localStorage.setItem(data, JSON.stringify(contadores));
            localStorage.removeItem('relatorioTexto');
        }
        atualizarInterface();
        document.getElementById('relatorioTexto').textContent = '';
        botaoReset.textContent = 'Resetar Contagem';
        clearTimeout(resetTimeout);
    } else {
        botaoReset.textContent = 'Confirmar?';
        resetTimeout = setTimeout(() => {
            botaoReset.textContent = 'Resetar Contagem';
        }, 5000); // 5 segundos para confirmar
    }
}

// Atualizar interface
function atualizarInterface() {
    const data = new Date().toISOString().split('T')[0];
    const contadores = inicializarDia();
    
    const contadoresDiv = document.getElementById('contadores');
    contadoresDiv.innerHTML = '';
    
    Object.keys(CATEGORIAS).forEach(categoriaMae => {
        const divMae = document.createElement('div');
        divMae.className = 'categoria-mae';
        divMae.innerHTML = `<h2>${categoriaMae}</h2>`;
        
        const table = document.createElement('table');
        table.innerHTML = `
            <tr>
                <th>Remover</th>
                <th>Contagem</th>
                <th>Adicionar</th>
            </tr>
        `;
        
        CATEGORIAS[categoriaMae].forEach(subcategoria => {
            const row = document.createElement('tr');
            const valor = contadores[subcategoria] || 0;
            row.innerHTML = `
                <td><button class="remover" onclick="decrementar('${subcategoria}')">-</button></td>
                <td><p class="contagem-clicavel" onclick="editarContador('${subcategoria}', this, ${valor})">${valor}</p></td>
                <td><button onclick="incrementar('${subcategoria}')">${subcategoria}</button></td>
            `;
            table.appendChild(row);
        });
        
        divMae.appendChild(table);
        contadoresDiv.appendChild(divMae);
    });
}

// Gerar relatório parcial
function gerarRelatorioParcial() {
    const contadores = inicializarDia();
    
    let totalGeral = 0;
    Object.keys(CATEGORIAS).forEach(categoriaMae => {
        CATEGORIAS[categoriaMae].forEach(subcategoria => {
            totalGeral += contadores[subcategoria] || 0;
        });
    });
    
    const autodeclarado = contadores["Auto"] || 0;
    const conexaoCalcada = contadores["Calçada"] || 0;
    
    let textoContent = `PARCIAL DIÁRIA\n\n`;
    textoContent += `IMÓVEIS VISITADOS: ${totalGeral}\n\n`;
    textoContent += `AUTODECLARADO: ${autodeclarado}\n\n`;
    textoContent += `CONEXÃO CALÇADA: ${conexaoCalcada}\n`;
    
    document.getElementById('relatorioTexto').textContent = textoContent;
    if (isLocalStorageAvailable()) {
        localStorage.setItem('relatorioTexto', textoContent); // Salvar relatório
    }
}

// Gerar relatório final
function gerarRelatorio() {
    const data = getDataAtual();
    const contadores = inicializarDia();
    const agente = document.getElementById('agenteInput').value;
    const lider = document.getElementById('liderInput').value;
    
    let textoContent = `AGENTE: ${agente}\n`;
    textoContent += `DATA: ${data}\n`;
    textoContent += `LÍDER: ${lider}\n\n`;
    
    let totalGeral = 0;
    Object.keys(CATEGORIAS).forEach(categoriaMae => {
        CATEGORIAS[categoriaMae].forEach(subcategoria => {
            totalGeral += contadores[subcategoria] || 0;
        });
    });
    
    textoContent += `IMÓVEIS VISITADOS: ${totalGeral}\n`;
    
    Object.keys(CATEGORIAS).forEach(categoriaMae => {
        const nomeRelatorio = NOMES_RELATORIO[categoriaMae] || categoriaMae;
        let totalMae = 0;
        CATEGORIAS[categoriaMae].forEach(subcategoria => {
            totalMae += contadores[subcategoria] || 0;
        });
        
        textoContent += `${nomeRelatorio}: ${totalMae}\n`;
        
        CATEGORIAS[categoriaMae].forEach(subcategoria => {
            const contador = contadores[subcategoria] || 0;
            const nomeSubcategoria = NOMES_SUBCATEGORIAS_RELATORIO[subcategoria] || subcategoria;
            textoContent += `-${nomeSubcategoria}: ${contador}\n`;
        });
        
        textoContent += `\n`;
    });
    
    document.getElementById('relatorioTexto').textContent = textoContent;
    if (isLocalStorageAvailable()) {
        localStorage.setItem('relatorioTexto', textoContent); // Salvar relatório
    }
}

// Copiar relatório para a área de transferência
function copiarRelatorio() {
    const texto = document.getElementById('relatorioTexto').textContent;
    if (texto) {
        navigator.clipboard.writeText(texto).catch(err => {
            console.error('Erro ao copiar:', err);
        });
    }
}

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    inicializarDia();
    carregarInputs();
    atualizarInterface();
    
    // Restaurar relatório salvo
    if (isLocalStorageAvailable()) {
        const relatorioSalvo = localStorage.getItem('relatorioTexto');
        if (relatorioSalvo) {
            document.getElementById('relatorioTexto').textContent = relatorioSalvo;
        }
    }
    
    document.getElementById('gerarRelatorio').addEventListener('click', gerarRelatorio);
    document.getElementById('gerarRelatorioParcial').addEventListener('click', gerarRelatorioParcial);
    document.getElementById('resetarContagem').addEventListener('click', resetarContagem);
    document.getElementById('copiarRelatorio').addEventListener('click', copiarRelatorio);
    
    // Salvar inputs ao mudar
    document.getElementById('agenteInput').addEventListener('input', salvarInputs);
    document.getElementById('liderInput').addEventListener('input', salvarInputs);
});