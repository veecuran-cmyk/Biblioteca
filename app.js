document.addEventListener('DOMContentLoaded', () => {

    let inventario_livros = {};
    let contas_usuarios = {};
    let emprestimos = {};

    function salvarDados() {
        localStorage.setItem('inventario_livros', JSON.stringify(inventario_livros));
        localStorage.setItem('contas_usuarios', JSON.stringify(contas_usuarios));
        localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    }

    function carregarDados() {
        inventario_livros = JSON.parse(localStorage.getItem('inventario_livros')) || {};
        contas_usuarios = JSON.parse(localStorage.getItem('contas_usuarios')) || {};
        
        const emprestimosCarregados = JSON.parse(localStorage.getItem('emprestimos')) || {};
        emprestimos = {};
        for (const id in emprestimosCarregados) {
            const info = emprestimosCarregados[id];
            emprestimos[id] = {
                ...info,
                data_emprestimo: new Date(info.data_emprestimo),
                data_devolucao_prevista: new Date(info.data_devolucao_prevista)
            };
        }
    }

    function renderInventario() {
        const container = document.getElementById('lista-livros-inventario');
        if (Object.keys(inventario_livros).length === 0) {
            container.innerHTML = "<p>Nenhum livro cadastrado.</p>";
            return;
        }

        let table = `<table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Título</th>
                                <th>Autor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>`;
        
        for (const id in inventario_livros) {
            const livro = inventario_livros[id];
            const statusClass = livro.disponivel ? 'status-disponivel' : 'status-emprestado';
            const statusText = livro.disponivel ? 'Disponível' : 'Emprestado';
            table += `<tr>
                        <td>${id}</td>
                        <td>${livro.titulo}</td>
                        <td>${livro.autor}</td>
                        <td><span class="${statusClass}">${statusText}</span></td>
                    </tr>`;
        }
        
        table += `</tbody></table>`;
        container.innerHTML = table;
    }

    function renderUsuarios() {
        const container = document.getElementById('lista-usuarios');
        if (Object.keys(contas_usuarios).length === 0) {
            container.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
            return;
        }

        let table = `<table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>`;
        
        for (const id in contas_usuarios) {
            const usuario = contas_usuarios[id];
            table += `<tr>
                        <td>${id}</td>
                        <td>${usuario.nome}</td>
                        <td><button class="btn btn-danger btn-sm" onclick="handleDeleteUser('${id}')">Excluir</button></td>
                    </tr>`;
        }
        
        table += `</tbody></table>`;
        container.innerHTML = table;
    }

    window.showView = (viewId) => {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-button').forEach(button => {
            button.classList.remove('active');
        });

        document.getElementById(viewId).classList.add('active');
        
        document.querySelector(`.nav-button[onclick="showView('${viewId}')"]`).classList.add('active');

        if (viewId === 'view-inventario') {
            renderInventario();
        } else if (viewId === 'view-contas') {
            renderUsuarios();
        } else if (viewId === 'view-buscar') {
            document.getElementById('search-results').innerHTML = "<p>Digite um termo e clique em 'Buscar' para ver os resultados.</p>";
        }
    }

    const captchaForm = document.getElementById('captcha-form');
    captchaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const isChecked = document.getElementById('captcha-check').checked;
        if (isChecked) {
            document.getElementById('captcha-modal').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            carregarDados();
            showView('view-inventario');
        } else {
            alert('❌ Erro: Por favor, marque a caixa para provar que você não é um robô.');
        }
    });

    const formAddBook = document.getElementById('form-add-book');
    formAddBook.addEventListener('submit', (e) => {
        e.preventDefault();
        const titulo = document.getElementById('livro-titulo').value.trim();
        const autor = document.getElementById('livro-autor').value.trim();

        if (!titulo || !autor) {
            alert("❌ Erro: O título e o autor não podem ser vazios.");
            return;
        }

        const novoId = String(Object.keys(inventario_livros).length + 1);
        inventario_livros[novoId] = { titulo, autor, disponivel: true };
        
        salvarDados();
        alert(`✅ Sucesso: Livro "${titulo}" de ${autor} catalogado com ID: ${novoId}!`);
        formAddBook.reset();
        renderInventario(); 
    });

    const formSearchBook = document.getElementById('form-search-book');
    formSearchBook.addEventListener('submit', (e) => {
        e.preventDefault();
        const termo = document.getElementById('search-term').value.trim().toLowerCase();
        const encontrados = [];

        for (const id in inventario_livros) {
            const livro = inventario_livros[id];
            if (id.toLowerCase() === termo || 
                livro.titulo.toLowerCase().includes(termo) || 
                livro.autor.toLowerCase().includes(termo)) {
                encontrados.push({ id, ...livro });
            }
        }

        const container = document.getElementById('search-results');
        if (encontrados.length === 0) {
            container.innerHTML = "<p>Nenhum livro encontrado.</p>";
            return;
        }

        let table = `<table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Título</th>
                                <th>Autor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>`;
        
        for (const livro of encontrados) {
            const statusClass = livro.disponivel ? 'status-disponivel' : 'status-emprestado';
            const statusText = livro.disponivel ? 'Disponível' : 'Emprestado';
            table += `<tr>
                        <td>${livro.id}</td>
                        <td>${livro.titulo}</td>
                        <td>${livro.autor}</td>
                        <td><span class="${statusClass}">${statusText}</span></td>
                    </tr>`;
        }
        
        table += `</tbody></table>`;
        container.innerHTML = table;
    });

    const formAddUser = document.getElementById('form-add-user');
    formAddUser.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('usuario-nome').value.trim();
        if (!nome) {
            alert("❌ Erro: Nome do usuário não pode ser vazio.");
            return;
        }

        const novoId = String(Object.keys(contas_usuarios).length + 1);
        contas_usuarios[novoId] = { nome };
        
        salvarDados();
        alert(`✅ Sucesso: Usuário "${nome}" cadastrado com ID: ${novoId}!`);
        formAddUser.reset();
        renderUsuarios(); 
    });

    window.handleDeleteUser = (id) => {
        if (!contas_usuarios[id]) {
            alert("❌ Erro: Usuário não encontrado.");
            return;
        }

        let temEmprestimo = false;
        for (const empId in emprestimos) {
            if (emprestimos[empId].usuario_id === id) {
                temEmprestimo = true;
                break;
            }
        }

        if (temEmprestimo) {
            alert(`❌ Erro: Não é possível excluir o usuário "${contas_usuarios[id].nome}", pois ele possui livros pendentes.`);
            return;
        }

        const confirmId = prompt(`Para deletar o usuário "${contas_usuarios[id].nome}", digite o ID dele (${id}):`);
        
        if (confirmId === id) {
            delete contas_usuarios[id];
            salvarDados();
            alert(`✅ Sucesso: Usuário ID ${id} foi excluído.`);
            renderUsuarios();
        } else if (confirmId !== null) { 
            alert("❌ Erro: ID incorreto. Exclusão cancelada.");
        }
    };

    const btnEmprestar = document.getElementById('btn-emprestar');
    const btnDevolver = document.getElementById('btn-devolver');

    btnEmprestar.addEventListener('click', () => {
        const livroId = document.getElementById('emprestimo-livro-id').value.trim();
        const usuarioId = document.getElementById('emprestimo-usuario-id').value.trim();
        
        if (!livroId || !usuarioId) {
            alert("❌ Erro: Para emprestar, o ID do Livro e o ID do Usuário são obrigatórios.");
            return;
        }
        
        if (!inventario_livros[livroId]) {
            alert("❌ Erro: Livro não encontrado.");
            return;
        }
        
        if (!contas_usuarios[usuarioId]) {
            alert("❌ Erro: Usuário não encontrado. Cadastre o usuário primeiro.");
            return;
        }
        
        const livro = inventario_livros[livroId];
        
        if (!livro.disponivel) {
            alert(`❌ Erro: O livro "${livro.titulo}" já está emprestado.`);
            return;
        }

        livro.disponivel = false;
        const dataEmprestimo = new Date();
        const dataDevolucaoPrevista = new Date();
        dataDevolucaoPrevista.setDate(dataEmprestimo.getDate() + 14); 
        
        const idEmprestimo = String(Object.keys(emprestimos).length + 1);
        emprestimos[idEmprestimo] = {
            livro_id: livroId,
            usuario_id: usuarioId,
            data_emprestimo: dataEmprestimo.toISOString(), 
            data_devolucao_prevista: dataDevolucaoPrevista.toISOString() 
        };
        
        salvarDados();
        carregarDados(); 
        
        alert(`✅ Sucesso: Livro "${livro.titulo}" emprestado para ${contas_usuarios[usuarioId].nome}.`);
        alert(`ℹ️ Data de devolução: ${dataDevolucaoPrevista.toLocaleDateString('pt-BR')}.`);
        document.getElementById('form-emprestimo-devolucao').reset();
    });

    btnDevolver.addEventListener('click', () => {
        const livroId = document.getElementById('emprestimo-livro-id').value.trim();
        
        if (!livroId) {
            alert("❌ Erro: Para devolver, o ID do Livro é obrigatório.");
            return;
        }
        
        if (!inventario_livros[livroId]) {
            alert("❌ Erro: Livro não encontrado.");
            return;
        }
        
        const livro = inventario_livros[livroId];
        
        if (livro.disponivel) {
            alert(`ℹ️ Informação: O livro "${livro.titulo}" já consta como disponível.`);
            return;
        }

        if (confirm(`Deseja realmente registrar a devolução do livro "${livro.titulo}"?`)) {
            let emprestimoId = null;
            let emprestimoInfo = null;

            for (const id in emprestimos) {
                if (emprestimos[id].livro_id === livroId) {
                    emprestimoId = id;
                    emprestimoInfo = emprestimos[id];
                    break;
                }
            }
            
            if (!emprestimoInfo) {
                alert("❌ Erro: Não foi possível encontrar um registro de empréstimo ativo para este livro.");
                livro.disponivel = true;
                salvarDados();
                alert("ℹ️ O livro foi marcado como disponível, mas nenhum registro de empréstimo foi fechado.");
                return;
            }

            const dataDevolucaoReal = new Date();
            const dataPrevista = emprestimoInfo.data_devolucao_prevista;
            
            const diffTime = dataDevolucaoReal.getTime() - dataPrevista.getTime();
            const atrasoDias = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            
            if (atrasoDias > 0) {
                const multa = atrasoDias * 2.50;
                alert(`❗️ Devolução atrasada em ${atrasoDias} dias. Multa de R$ ${multa.toFixed(2)}.`);
            } else {
                alert("✅ Devolução realizada sem atraso.");
            }

            livro.disponivel = true;
            delete emprestimos[emprestimoId];
            
            salvarDados();
            alert(`✅ Sucesso: Devolução do livro "${livro.titulo}" registrada.`);
            document.getElementById('form-emprestimo-devolucao').reset();
        } else {
            alert("ℹ️ Operação cancelada.");
        }
    });

});
