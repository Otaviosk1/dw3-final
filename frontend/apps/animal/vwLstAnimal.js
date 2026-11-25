document.addEventListener("DOMContentLoaded", function () {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById("animalListagem");
  var alertBox = document.getElementById("animalAlert");

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;
  configurarOperacoesAnimal();
  vwGetAllAnimal(servidorDw3, alertBox);
});

// Consome GET /getAllAnimal com autenticação JWT e carrega o DataTable
async function vwGetAllAnimal(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error("Endereço do servidor back-end não configurado.");
    }

    var response = await fetch(servidorDw3 + "/getAllAnimal", {
      headers: dw3MontarHeadersAutenticacao(),
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar a lista de animais.");
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

    inicializarTabelaAnimal(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || "Erro ao carregar animais.");
    inicializarTabelaAnimal([]);
  }
}

// Configura o DataTable com formatação de data e botões de ação
function inicializarTabelaAnimal(animais) {
  new DataTable("#tblAnimal", {
    data: animais,
    columns: [
      { data: "animalid", defaultContent: "" },
      { data: "nome", defaultContent: "" },
      {
        data: "datanasc",
        defaultContent: "",
        render: function (data) {
          if (!data) {
            return "";
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
          var animalId = escaparHtml(row.animalid || "");
          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do animal">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-animalid="' +
              animalId +
              '" title="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-animalid="' +
              animalId +
              '" title="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-animalid="' +
              animalId +
              '" title="Remover"><i class="bi bi-trash"></i></button>',
            "</div>",
          ].join("");
        },
      },
    ],
    language: {
      emptyTable: "Nenhum animal cadastrado.",
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
function configurarOperacoesAnimal() {
  var tabela = document.getElementById("tblAnimal");
  if (!tabela) {
    return;
  }

  tabela.addEventListener("click", function (event) {
    var botao = event.target.closest("button[data-action][data-animalid]");
    if (!botao) {
      return;
    }

    var action = botao.dataset.action;
    var animalId = botao.dataset.animalid;

    if (action === "visualizar") {
      window.location.href =
        "/animal/form?oper=Re&animalId=" + encodeURIComponent(animalId);
      return;
    }

    if (action === "atualizar") {
      window.location.href =
        "/animal/form?oper=Up&animalId=" + encodeURIComponent(animalId);
      return;
    }

    if (action === "remover") {
      window.location.href =
        "/animal/form?oper=De&animalId=" + encodeURIComponent(animalId);
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