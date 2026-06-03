import FirebaseService from './services/FirebaseService.js';
import UIView from './view/UIView.js';

class AppController {
    constructor() {
        this.banco = new FirebaseService();
        this.ui = new UIView();
        this.membroAtualId = null;
        this.usuarioLogado = null;
        this.iniciar();
    }

    iniciar() {
        this.carregarTelaInicial();
        this.configurarEventos();
        this.observarLogin();
    }

    // Fica escutando o estado do login em tempo real
    observarLogin() {
        this.banco.observarAuth((usuario) => {
            this.usuarioLogado = usuario;
            this.ui.atualizarBotaoLogin(usuario);

            // Se tem um perfil aberto, atualiza a visibilidade do botão editar
            if (this.membroAtualId) {
                this.verificarPermissaoEdicao();
            }
        });
    }

    configurarEventos() {
        // Voltar para a tela inicial
        this.ui.btnVoltar.onclick = () => {
            this.ui.alternarParaInicial();
            this.membroAtualId = null;
        };

        // Abrir modal de edição
        this.ui.btnEditar.onclick = async () => {
            const dados = await this.banco.obterMembroPorId(this.membroAtualId);
            this.ui.preencherFormularioEdicao(dados);
            this.ui.alternarModalEdicao(true);
        };

        // Fechar modal de edição
        this.ui.btnFecharModal.onclick = () => {
            this.ui.alternarModalEdicao(false);
        };

        // Salvar edição
        this.ui.formEdicao.onsubmit = async (evento) => {
            evento.preventDefault();
            try {
                const novosDados = this.ui.obterDadosDoFormulario();

                // Mantém o uid vinculado ao documento
                const dadosAtuais = await this.banco.obterMembroPorId(this.membroAtualId);
                if (dadosAtuais?.uid) novosDados.uid = dadosAtuais.uid;

                await this.banco.atualizarMembro(this.membroAtualId, novosDados);
                this.ui.preencherCurriculo(novosDados);
                this.ui.alternarModalEdicao(false);
                this.carregarTelaInicial();
                this.ui.mostrarNotificacao('✅ Currículo atualizado com sucesso!');
            } catch (erro) {
                console.error("Erro ao salvar:", erro);
                this.ui.mostrarNotificacao('❌ Erro ao salvar. Tente novamente.');
            }
        };

        // Botão de login/logout no canto da tela
        this.ui.btnLoginToggle.onclick = () => {
            if (this.usuarioLogado) {
                this.banco.logout();
                this.ui.mostrarNotificacao('👋 Você saiu da conta.');
            } else {
                this.ui.alternarModalLogin(true);
            }
        };

        // Fechar modal de login
        this.ui.btnFecharModalLogin.onclick = () => {
            this.ui.alternarModalLogin(false);
        };

        // Submeter login
        this.ui.formLogin.onsubmit = async (evento) => {
            evento.preventDefault();
            const { email, senha } = this.ui.obterDadosLogin();
            try {
                this.ui.setBotaoLoginCarregando(true);
                await this.banco.login(email, senha);
                this.ui.alternarModalLogin(false);
                this.ui.mostrarNotificacao('✅ Login realizado com sucesso!');
            } catch (erro) {
                console.error("Erro no login:", erro);
                this.ui.mostrarErroLogin('Email ou senha incorretos.');
            } finally {
                this.ui.setBotaoLoginCarregando(false);
            }
        };
    }

    async carregarTelaInicial() {
        try {
            const todosOsMembros = await this.banco.obterTodosOsMembros();
            this.ui.renderizarCards(todosOsMembros, (idMembro) => this.abrirPerfil(idMembro));
        } catch (erro) {
            console.error("Erro ao carregar membros:", erro);
        }
    }

    async abrirPerfil(idMembro) {
        this.membroAtualId = idMembro;
        const dadosDoMembro = await this.banco.obterMembroPorId(idMembro);
        if (dadosDoMembro) {
            this.ui.preencherCurriculo(dadosDoMembro);
            this.ui.alternarParaCurriculo();
            this.verificarPermissaoEdicao(dadosDoMembro);
        }
    }

    // Mostra o botão editar só se o usuário logado for o dono do perfil
    verificarPermissaoEdicao(dados = null) {
        if (!this.usuarioLogado || !dados?.uid) {
            this.ui.btnEditar.classList.add('hidden');
            return;
        }
        if (this.usuarioLogado.uid === dados.uid) {
            this.ui.btnEditar.classList.remove('hidden');
        } else {
            this.ui.btnEditar.classList.add('hidden');
        }
    }
}

const meuApp = new AppController();