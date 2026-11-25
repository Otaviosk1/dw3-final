// Protege as telas privadas: exige cookie IsLogged e token JWT no localStorage
function dw3IsLogged() {
  const isLogged = document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("IsLogged="));
  const token = localStorage.getItem("token");

  if (!isLogged || !token) {
    dw3ClearIsLoggedCookie();
    window.location.href = "/login";
    return false;
  }
  return true;
}

// Encerra a sessão local expirando o cookie IsLogged e removendo o token JWT
function dw3ClearIsLoggedCookie() {
  var isLogged = document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("IsLogged="));

  if (isLogged) {
    document.cookie =
      "IsLogged=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  localStorage.removeItem("token");
}

// Injeta o cabeçalho Authorization (Bearer <token>) nas requisições fetch para a API
function dw3MontarHeadersAutenticacao(headers) {
  var token = localStorage.getItem("token");
  var finalHeaders = headers || {};
  if (token) {
    finalHeaders.Authorization = "Bearer " + token;
  }
  return finalHeaders;
}

function dw3OcultarBotao(id) {
  var botao = document.getElementById(id);
  if (botao) {
    botao.classList.add("d-none");
  }
}