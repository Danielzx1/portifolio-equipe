export default class UIView {
    constructor() {
        // Elementos de Tela
        this.telaInicial = document.getElementById('tela-inicial');
        this.telaCurriculo = document.getElementById('tela-curriculo');
        this.listaMembros = document.getElementById('lista-membros');
        
        // Botões
        this.btnVoltar = document.getElementById('btn-voltar');
        this.btnEditar = document.getElementById('btn-editar');
        this.btnFecharModal = document.getElementById('btn-fechar-modal');
        
        // Elementos do Modal
        this.modalEdicao = document.getElementById('modal-edicao');
        this.formEdicao = document.getElementById('form-edicao');

        // Campos do Currículo
        this.cvNome = document.getElementById('cv-nome');
        this.cvObjetivo = document.getElementById('cv-objetivo');
        this.cvFoto = document.getElementById('cv-foto');
        this.cvDados = document.getElementById('cv-lista-dados');
        this.cvFormacao = document.getElementById('cv-texto-formacao');
        this.cvExperiencia = document.getElementById('cv-lista-experiencia');
        this.cvCursos = document.getElementById('cv-lista-cursos');
        this.cvHabilidades = document.getElementById('cv-lista-habilidades');
        this.toast = document.getElementById('toast');

        // Login
        this.btnLoginToggle = document.getElementById('btn-login-toggle');
        this.modalLogin = document.getElementById('modal-login');
        this.formLogin = document.getElementById('form-login');
        this.btnFecharModalLogin = document.getElementById('btn-fechar-modal-login');

        // Upload de foto
        this.inputFotoUpload = document.getElementById('input-foto-upload');
        this.previewFoto = document.getElementById('preview-foto');
        this.uploadStatus = document.getElementById('upload-status');
        if (this.inputFotoUpload) this._configurarUpload();
    }

    _configurarUpload() {
        this.inputFotoUpload.addEventListener('change', async (e) => {
            const arquivo = e.target.files[0];
            if (!arquivo) return;

            this.uploadStatus.innerText = '⏳ Enviando foto...';
            document.getElementById('label-upload').style.opacity = '0.5';

            const formData = new FormData();
            formData.append('file', arquivo);
            formData.append('upload_preset', 'pkp2xt7q');

            try {
                const resposta = await fetch('https://api.cloudinary.com/v1_1/doytuiwkg/image/upload', {
                    method: 'POST',
                    body: formData
                });
                const dados = await resposta.json();
                const urlFoto = dados.secure_url;

                // Atualiza o campo hidden e o preview
                document.getElementById('edit-foto').value = urlFoto;
                this.previewFoto.src = urlFoto;
                this.previewFoto.classList.remove('hidden');
                this.uploadStatus.innerText = '✅ Foto enviada!';
            } catch (erro) {
                this.uploadStatus.innerText = '❌ Erro no upload. Tente novamente.';
                console.error(erro);
            } finally {
                document.getElementById('label-upload').style.opacity = '1';
            }
        });
    }

    alternarModalLogin(mostrar) {
        if (mostrar) {
            this.modalLogin.classList.remove('hidden');
            document.getElementById('login-erro').innerText = '';
        } else {
            this.modalLogin.classList.add('hidden');
        }
    }

    obterDadosLogin() {
        return {
            email: document.getElementById('login-email').value,
            senha: document.getElementById('login-senha').value
        };
    }

    mostrarErroLogin(mensagem) {
        document.getElementById('login-erro').innerText = mensagem;
    }

    setBotaoLoginCarregando(carregando) {
        const btn = document.getElementById('btn-submeter-login');
        btn.disabled = carregando;
        btn.innerText = carregando ? 'Entrando...' : '🔓 Entrar';
    }

    atualizarBotaoLogin(usuario) {
        if (usuario) {
            this.btnLoginToggle.innerText = '🔓 Sair';
            this.btnLoginToggle.title = `Logado como: ${usuario.email}`;
        } else {
            this.btnLoginToggle.innerText = '🔒 Login';
            this.btnLoginToggle.title = 'Fazer login para editar';
        }
    }

    alternarParaCurriculo() {
        this.telaInicial.classList.add('hidden');
        this.telaCurriculo.classList.remove('hidden');
    }

    alternarParaInicial() {
        this.telaCurriculo.classList.add('hidden');
        this.telaInicial.classList.remove('hidden');
    }

    alternarModalEdicao(mostrar) {
        if (mostrar) {
            this.modalEdicao.classList.remove('hidden');
        } else {
            this.modalEdicao.classList.add('hidden');
        }
    }
    
    mostrarNotificacao(mensagem) {
        if (mensagem) {
            this.toast.innerText = mensagem;
        }
        
        // Tira a classe hidden para aparecer
        this.toast.classList.remove('hidden');
        
        // Coloca um cronômetro de 3 segundos (3000ms) para esconder de novo
        setTimeout(() => {
            this.toast.classList.add('hidden');
        }, 3000);
    }

    renderizarCards(membros, callbackClique) {
        this.listaMembros.innerHTML = ''; 
        for (const [id, dados] of Object.entries(membros)) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-avatar-container">
                    <img class="card-avatar" src="${dados.foto || 'https://via.placeholder.com/150'}" alt="Foto de ${dados.nome}">
                </div>
                <h2>${dados.nome}</h2>
                <p class="card-objetivo">${dados.objetivo || ''}</p>
            `;
            card.onclick = () => callbackClique(id);
            this.listaMembros.appendChild(card);
        }
    }

preencherCurriculo(dados) {
        this.cvNome.innerText = dados.nome || '';
        this.cvObjetivo.innerText = dados.objetivo || '';
        this.cvFoto.src = dados.foto || 'https://via.placeholder.com/150';
        
        // Aqui o innerText junto com o CSS pre-wrap faz a quebra de linha funcionar
        // Calcula e exibe idade automaticamente
        let dadosPessoais = dados.dadosPessoais || '';
        if (dados.dataNascimento) {
            const nascimento = new Date(dados.dataNascimento);
            const hoje = new Date();
            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
            dadosPessoais = `${idade} Anos\n` + dadosPessoais;
        }
        this.cvDados.innerText = dadosPessoais;
        this.cvFormacao.innerText = dados.formacao || '';
        
        // Renderiza os contatos como pílulas
        const pilulasContato = [];
        if (dados.email) pilulasContato.push(`<a href="mailto:${dados.email}" class="pilula-contato">📧 ${dados.email}</a>`);
        if (dados.telefone) pilulasContato.push(`<span class="pilula-contato">📱 ${dados.telefone}</span>`);
        if (dados.linkedin) pilulasContato.push(`<a href="${dados.linkedin}" target="_blank" class="pilula-contato">💼 LinkedIn</a>`);
        if (dados.github) pilulasContato.push(`<a href="${dados.github}" target="_blank" class="pilula-contato">🐙 GitHub</a>`);
        document.getElementById('cv-redes-links').innerHTML = pilulasContato.join('');
        document.getElementById('cv-texto-contato').innerText = '';
        
        // Listas e Tags
        this.cvExperiencia.innerHTML = (dados.experiencia || []).map(item => `<li>${item}</li>`).join('');
        this.cvCursos.innerHTML = (dados.cursos || []).map(item => `<li>${item}</li>`).join('');
        this.cvHabilidades.innerHTML = (dados.habilidades || []).map(item => `<span class="tag-habilidade">${item}</span>`).join('');
    }

    preencherFormularioEdicao(dados) {
        document.getElementById('edit-nome').value = dados.nome || '';
        document.getElementById('edit-objetivo').value = dados.objetivo || '';
        document.getElementById('edit-foto').value = dados.foto || '';

        // Mostra preview da foto atual
        const previewFoto = document.getElementById('preview-foto');
        const uploadStatus = document.getElementById('upload-status');
        const labelUpload = document.getElementById('label-upload');

        if (previewFoto) {
            if (dados.foto) {
                previewFoto.src = dados.foto;
                previewFoto.classList.remove('hidden');
            } else {
                previewFoto.classList.add('hidden');
            }
        }
        if (uploadStatus) uploadStatus.innerText = '';
        if (labelUpload) labelUpload.innerText = '📷 Trocar Foto';
        
        // Novos campos
        document.getElementById('edit-email').value = dados.email || '';
        document.getElementById('edit-telefone').value = dados.telefone || '';
        document.getElementById('edit-linkedin').value = dados.linkedin || '';
        document.getElementById('edit-github').value = dados.github || '';

        document.getElementById('edit-nascimento').value = dados.dataNascimento || '';
        document.getElementById('edit-dados').value = dados.dadosPessoais || '';
        document.getElementById('edit-formacao').value = dados.formacao || '';
        
        document.getElementById('edit-experiencia').value = (dados.experiencia || []).join('\n');
        document.getElementById('edit-cursos').value = (dados.cursos || []).join('\n');
        document.getElementById('edit-habilidades').value = (dados.habilidades || []).join('\n');
    }

    obterDadosDoFormulario() {
        return {
            nome: document.getElementById('edit-nome').value,
            objetivo: document.getElementById('edit-objetivo').value,
            foto: document.getElementById('edit-foto').value,
            
            // Novos campos
            email: document.getElementById('edit-email').value,
            telefone: document.getElementById('edit-telefone').value,
            linkedin: document.getElementById('edit-linkedin').value,
            github: document.getElementById('edit-github').value,

            dataNascimento: document.getElementById('edit-nascimento').value,
            dadosPessoais: document.getElementById('edit-dados').value,
            formacao: document.getElementById('edit-formacao').value,
            
            experiencia: document.getElementById('edit-experiencia').value.split('\n').filter(i => i.trim() !== ''),
            cursos: document.getElementById('edit-cursos').value.split('\n').filter(i => i.trim() !== ''),
            habilidades: document.getElementById('edit-habilidades').value.split('\n').filter(i => i.trim() !== '')
        };
    }
}