const usuarioInput = document.getElementById("usuario");
const passwordInput = document.getElementById("password");
const correoInput = document.getElementById("correo");
const btnEnviar = document.getElementById("btnEnviar");
const mensaje = document.getElementById("mensaje");
const loginForm = document.getElementById("loginForm");
const togglePassword = document.getElementById("togglePassword");

const CORREO_AUTORIZADO = "atencion@chesttop.com";

function validarFormulario() {
  const usuario = usuarioInput.value.trim();
  const password = passwordInput.value.trim();
  const correo = correoInput.value.trim().toLowerCase();

  const usuarioVacio = usuario === "";
  const passwordVacio = password === "";
  const correoCorrecto = correo === CORREO_AUTORIZADO;

  const habilitar = usuarioVacio && passwordVacio && correoCorrecto;

  btnEnviar.disabled = !habilitar;

  mensaje.classList.remove("ok", "error");

  if (correo.length === 0 && usuario.length === 0 && password.length === 0) {
    mensaje.textContent = "Ingresa tus datos para continuar.";
    return;
  }

  if (habilitar) {
    mensaje.textContent = "Datos validados. Puedes solicitar tu código.";
    mensaje.classList.add("ok");
  } else {
    mensaje.textContent = "Verifica los datos ingresados.";
  }
}

usuarioInput.addEventListener("input", validarFormulario);
passwordInput.addEventListener("input", validarFormulario);
correoInput.addEventListener("input", validarFormulario);

togglePassword.addEventListener("click", () => {
  const visible = passwordInput.type === "text";

  passwordInput.type = visible ? "password" : "text";
  togglePassword.textContent = visible ? "Ver" : "Ocultar";
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (btnEnviar.disabled) {
    mensaje.textContent = "No se pudo validar el acceso.";
    mensaje.classList.add("error");
    return;
  }

  mensaje.textContent = "Vista previa: aquí luego enviaremos el código de acceso.";
  mensaje.classList.remove("error");
  mensaje.classList.add("ok");
});

validarFormulario();
