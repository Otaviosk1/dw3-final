document.addEventListener("DOMContentLoaded", function () {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById("alocadoListagem");
  var alertBox = document.getElementById("alocadoAlert");

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;
  configurarOperacoesAlocado();
  vwGetAllAlocado(servidorDw3, alertBox);
});

// Consome GET /getAllAlocado com autenticação JWT e carrega o DataTable
async function vwGetAllAlocado(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error("Endereço do servidor back-end não configurado.");
    }

    var response = await fetch(servidorDw3 + "/getAllAlocado", {
      headers: dw3MontarHeadersAutenticacao(),
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar a lista de alocações.");
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

    inicializarTabelaAlocado(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || "Erro ao carregar alocações.");
    inicializarTabelaAlocado([]);
  }
}

// Configura o DataTable com formatação de datas, badge "Em andamento" e botões de ação
function inicializarTabelaAlocado(alocacoes) {
  new DataTable("#tblAlocado", {
    data: alocacoes,
    columns: [
      { data: "alocadoid", defaultContent: "" },
      { data: "animal_nome", defaultContent: "" },
      { data: "piquete_descricao", defaultContent: "" },
      {
        data: "datainicio",
        defaultContent: "",
        render: function (data) {
          if (!data) {
            return "";
          }
          return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
        },
      },
      {
        data: "datafinal",
        defaultContent: "",
        render: function (data) {
          if (!data) {
            return '<span class="badge bg-success-subtle text-success border border-success-subtle">Em andamento</span>';
          }
          return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
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
          var alocadoId = escaparHtml(row.alocadoid || "");
          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações da alocação">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-alocadoid="' +
              alocadoId +
              '" title="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-alocadoid="' +
              alocadoId +
              '" title="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-alocadoid="' +
              alocadoId +
              '" title="Remover"><i class="bi bi-trash"></i></button>',
            "</div>",
          ].join("");
        },
      },
    ],
    language: {
      emptyTable: "Nenhuma alocação cadastrada.",
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
function configurarOperacoesAlocado() {
  var tabela = document.getElementById("tblAlocado");
  if (!tabela) {
    return;
  }

  tabela.addEventListener("click", function (event) {
    var botao = event.target.closest("button[data-action][data-alocadoid]");
    if (!botao) {
      return;
    }

    var action = botao.dataset.action;
    var alocadoId = botao.dataset.alocadoid;

    if (action === "visualizar") {
      window.location.href =
        "/alocado/form?oper=Re&alocadoId=" + encodeURIComponent(alocadoId);
      return;
    }

    if (action === "atualizar") {
      window.location.href =
        "/alocado/form?oper=Up&alocadoId=" + encodeURIComponent(alocadoId);
      return;
    }

    if (action === "remover") {
      window.location.href =
        "/alocado/form?oper=De&alocadoId=" + encodeURIComponent(alocadoId);
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