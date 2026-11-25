document.addEventListener("DOMContentLoaded", function () {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById("pastoListagem");
  var alertBox = document.getElementById("pastoAlert");

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;
  configurarOperacoesPasto();
  vwGetAllPasto(servidorDw3, alertBox);
});

// Consome GET /getAllPasto com autenticação JWT e carrega o DataTable
async function vwGetAllPasto(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error("Endereço do servidor back-end não configurado.");
    }

    var response = await fetch(servidorDw3 + "/getAllPasto", {
      headers: dw3MontarHeadersAutenticacao(),
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar a lista de pastos.");
    }

    var data = await response.json();

    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || !Array.isArray(data.registro)) {
      throw new Error("Resposta inválida do servidor back-end.");
    }

    inicializarTabelaPasto(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || "Erro ao carregar pastos.");
    inicializarTabelaPasto([]);
  }
}

// Configura o DataTable com formatação numérica (pt-BR) e botões de ação
function inicializarTabelaPasto(pastos) {
  new DataTable("#tblPasto", {
    data: pastos,
    columns: [
      { data: "pastoid", defaultContent: "" },
      { data: "descricao", defaultContent: "" },
      {
        data: "areatotal",
        defaultContent: "",
        render: function (data) {
          if (data === null || data === undefined || data === "") {
            return "";
          }
          return Number(data).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        },
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function (data, type, row) {
          if (type !== "display") {
            return "";
          }
          var pastoId = escaparHtml(row.pastoid || "");
          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do pasto">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-pastoid="' +
              pastoId +
              '" title="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-pastoid="' +
              pastoId +
              '" title="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-pastoid="' +
              pastoId +
              '" title="Remover"><i class="bi bi-trash"></i></button>',
            "</div>",
          ].join("");
        },
      },
    ],
    language: {
      emptyTable: "Nenhum pasto cadastrado.",
      info: "Mostrando _START_ até _END_ de _TOTAL_ registros",
      infoEmpty: "Mostrando 0 até 0 de 0 registros",
      infoFiltered: "(filtrado de _MAX_ registros no total)",
      lengthMenu: "Mostrar _MENU_ registros",
      loadingRecords: "Carregando...",
      processing: "Processando...",
      search: "Pesquisar:",
      zeroRecords: "Nenhum registro encontrado",
      paginate: {
        first: "Primeiro",
        last: "Último",
        next: "Próximo",
        previous: "Anterior",
      },
    },
  });
}

// Redireciona para o formulário passando a operação (Re, Up ou De) e o ID
function configurarOperacoesPasto() {
  var tabela = document.getElementById("tblPasto");
  if (!tabela) {
    return;
  }

  tabela.addEventListener("click", function (event) {
    var botao = event.target.closest("button[data-action][data-pastoid]");
    if (!botao) {
      return;
    }

    var action = botao.dataset.action;
    var pastoId = botao.dataset.pastoid;

    if (action === "visualizar") {
      window.location.href =
        "/pasto/form?oper=Re&pastoId=" + encodeURIComponent(pastoId);
      return;
    }

    if (action === "atualizar") {
      window.location.href =
        "/pasto/form?oper=Up&pastoId=" + encodeURIComponent(pastoId);
      return;
    }

    if (action === "remover") {
      window.location.href =
        "/pasto/form?oper=De&pastoId=" + encodeURIComponent(pastoId);
    }
  });
}

// Escapa caracteres especiais para evitar injeção de HTML na tabela
function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function exibirErro(alertBox, mensagem) {
  if (!alertBox) {
    return;
  }
  alertBox.textContent = mensagem;
  alertBox.classList.remove("d-none");
}