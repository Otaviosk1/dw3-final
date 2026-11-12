document.addEventListener("DOMContentLoaded", function () {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById("piqueteListagem");
  var alertBox = document.getElementById("piqueteAlert");

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;
  configurarOperacoesPiquete();
  vwGetAllPiquete(servidorDw3, alertBox);
});

async function vwGetAllPiquete(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error("Endereço do servidor back-end não configurado.");
    }

    var response = await fetch(servidorDw3 + "/getAllPiquete", {
      headers: dw3MontarHeadersAutenticacao(),
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar a lista de piquetes.");
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

    inicializarTabelaPiquete(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || "Erro ao carregar piquetes.");
    inicializarTabelaPiquete([]);
  }
}

function inicializarTabelaPiquete(piquetes) {
  new DataTable("#tblPiquete", {
    data: piquetes,
    columns: [
      { data: "piqueteid", defaultContent: "" },
      { data: "descricao", defaultContent: "" },
      { data: "latitude", defaultContent: "" },
      { data: "longitude", defaultContent: "" },
      { data: "pasto_descricao", defaultContent: "" },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function (data, type, row) {
          if (type !== "display") {
            return "";
          }
          var piqueteId = escaparHtml(row.piqueteid || "");
          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do piquete">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-piqueteid="' +
              piqueteId +
              '" title="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-piqueteid="' +
              piqueteId +
              '" title="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-piqueteid="' +
              piqueteId +
              '" title="Remover"><i class="bi bi-trash"></i></button>',
            "</div>",
          ].join("");
        },
      },
    ],
    language: {
      emptyTable: "Nenhum piquete cadastrado.",
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

function configurarOperacoesPiquete() {
  var tabela = document.getElementById("tblPiquete");
  if (!tabela) {
    return;
  }

  tabela.addEventListener("click", function (event) {
    var botao = event.target.closest("button[data-action][data-piqueteid]");
    if (!botao) {
      return;
    }

    var action = botao.dataset.action;
    var piqueteId = botao.dataset.piqueteid;

    if (action === "visualizar") {
      window.location.href =
        "/piquete/form?oper=Re&piqueteId=" + encodeURIComponent(piqueteId);
      return;
    }

    if (action === "atualizar") {
      window.location.href =
        "/piquete/form?oper=Up&piqueteId=" + encodeURIComponent(piqueteId);
      return;
    }

    if (action === "remover") {
      window.location.href =
        "/piquete/form?oper=De&piqueteId=" + encodeURIComponent(piqueteId);
    }
  });
}

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