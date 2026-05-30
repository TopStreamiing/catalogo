const usuarioInput = document.getElementById("usuario");
const passwordInput = document.getElementById("password");
const correoInput = document.getElementById("correo");
const btnEnviar = document.getElementById("btnEnviar");
const mensaje = document.getElementById("mensaje");
const loginForm = document.getElementById("loginForm");
const togglePassword = document.getElementById("togglePassword");

const otpBox = document.getElementById("otpBox");
const codigoOtpInput = document.getElementById("codigoOtp");
const btnVerificar = document.getElementById("btnVerificar");

const API_BASE = "https://chesttop-api.fam-premium2720.workers.dev/api/toperu";

const USUARIOS_AUTORIZADOS = {
  "admin2720@chesttop.com": "Gerencia",
  "asesor01@chesttop.com": "Alonso",
  "stream01@chesttop.com": "Kevin",
  "staff1@chesttop.com": "Cherry",
  "team01@chesttop.com": "Extra"
};

let currentRequestId = "";

function getDeviceId() {
  const key = "toperu_device_id";
  let id = localStorage.getItem(key);

  if (!id) {
    id = "dvc_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
    localStorage.setItem(key, id);
  }

  return id;
}

function setMensaje(texto, tipo = "") {
  mensaje.classList.remove("ok", "error");
  mensaje.textContent = texto;

  if (tipo) {
    mensaje.classList.add(tipo);
  }
}

function validarFormulario() {
  const usuario = usuarioInput.value.trim();
  const password = passwordInput.value.trim();
  const correo = correoInput.value.trim().toLowerCase();

  const usuarioVacio = usuario === "";
  const passwordVacio = password === "";
  const usuarioEncontrado = USUARIOS_AUTORIZADOS[correo];

  const habilitar = usuarioVacio && passwordVacio && !!usuarioEncontrado;

  btnEnviar.disabled = !habilitar;

  if (correo.length === 0 && usuario.length === 0 && password.length === 0) {
    setMensaje("Ingresa tus datos para continuar.");
    return;
  }

  if (habilitar) {
    setMensaje(`Acceso identificado: ${usuarioEncontrado}. Puedes solicitar tu código.`, "ok");
  } else {
    setMensaje("Verifica los datos ingresados.");
  }
}

async function apiPost(action, payload = {}) {
  const res = await fetch(`${API_BASE}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      deviceId: getDeviceId(),
      ...payload
    })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      kind: data.kind || "error",
      message: data.message || "No se pudo completar la solicitud."
    };
  }

  return data;
}

async function solicitarCodigo() {
  const correo = correoInput.value.trim().toLowerCase();
  const usuario = USUARIOS_AUTORIZADOS[correo];

  if (!usuario) {
    setMensaje("Correo no autorizado.", "error");
    return;
  }

  btnEnviar.disabled = true;
  btnEnviar.textContent = "Enviando código...";
  setMensaje(`Enviando código de acceso para ${usuario}...`);

  try {
    const data = await apiPost("request-otp", {
      email: correo
    });

    if (!data.ok) {
      setMensaje(data.message || "No se pudo enviar el código.", "error");
      return;
    }

    currentRequestId = data.requestId || "";

    otpBox.classList.remove("hidden");
    codigoOtpInput.value = "";
    btnVerificar.disabled = true;
    codigoOtpInput.focus();

    setMensaje(`Código enviado. Revisa el correo de ${data.name || usuario}.`, "ok");
  } catch (error) {
    setMensaje("Error de conexión. Intenta nuevamente.", "error");
  } finally {
    btnEnviar.textContent = "Enviar código de acceso";
    validarFormulario();
  }
}

function validarCodigoInput() {
  codigoOtpInput.value = codigoOtpInput.value.replace(/[^\d]/g, "");
  btnVerificar.disabled = codigoOtpInput.value.length !== 6 || !currentRequestId;
}

async function verificarCodigo() {
  const code = codigoOtpInput.value.trim();

  if (!currentRequestId || code.length !== 6) {
    setMensaje("Ingresa el código de 6 dígitos.", "error");
    return;
  }

  btnVerificar.disabled = true;
  btnVerificar.textContent = "Verificando...";
  setMensaje("Verificando código...");

  try {
    const data = await apiPost("verify-otp", {
      requestId: currentRequestId,
      code
    });

    if (!data.ok) {
      setMensaje(data.message || "Código incorrecto o vencido.", "error");
      btnVerificar.disabled = false;
      return;
    }

    localStorage.setItem("toperu_session_token", data.sessionToken || "");
    localStorage.setItem("toperu_user", JSON.stringify(data.user || {}));

    setMensaje(data.message || "Acceso verificado correctamente.", "ok");

    setTimeout(() => {
      window.location.href = "./panel.html";
    }, 700);

  } catch (error) {
    setMensaje("Error de conexión. Intenta nuevamente.", "error");
    btnVerificar.disabled = false;
  } finally {
    btnVerificar.textContent = "Verificar código";
  }
}

async function verificarSesionInicial() {
  const token = localStorage.getItem("toperu_session_token");

  if (!token) return;

  try {
    const data = await apiPost("session", {
      sessionToken: token
    });

    if (data.ok) {
      window.location.href = "./panel.html";
      return;
    }

    localStorage.removeItem("toperu_session_token");
    localStorage.removeItem("toperu_user");
  } catch (e) {
    // Si falla la conexión, dejamos que muestre login.
  }
}

usuarioInput.addEventListener("input", validarFormulario);
passwordInput.addEventListener("input", validarFormulario);
correoInput.addEventListener("input", validarFormulario);

codigoOtpInput.addEventListener("input", validarCodigoInput);

togglePassword.addEventListener("click", () => {
  const visible = passwordInput.type === "text";

  passwordInput.type = visible ? "password" : "text";
  togglePassword.textContent = visible ? "Ver" : "Ocultar";
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (btnEnviar.disabled) {
    setMensaje("No se pudo validar el acceso.", "error");
    return;
  }

  solicitarCodigo();
});

btnVerificar.addEventListener("click", verificarCodigo);

validarFormulario();
verificarSesionInicial();
