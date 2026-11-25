// Dirección de la API.
const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

// Mostrar mensajes en pantalla.
function mostrarMensaje(texto) {
    const mensaje = document.getElementById("mensaje");

    if (mensaje) {
        mensaje.textContent = texto;
    }
}

// Leer la respuesta de la API.
async function obtenerDatos(respuesta) {
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.message || "Ocurrió un error.");
    }

    return datos;
}

// REGISTRO
const formRegistro = document.getElementById("formRegistro");

if (formRegistro) {
    formRegistro.addEventListener("submit", async function(evento) {
        evento.preventDefault();

        const usuario = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            itsonId: document.getElementById("itsonId").value.trim(),
            password: document.getElementById("password").value
        };

        try {
            const respuesta = await fetch(API_BASE + "/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            });

            await obtenerDatos(respuesta);

            mostrarMensaje("Usuario registrado. Ya puedes iniciar sesión.");
            formRegistro.reset();
        } catch (error) {
            mostrarMensaje(error.message);
        }
    });
}

// LOGIN
const formLogin = document.getElementById("formLogin");

if (formLogin) {
    // Si ya hay un token guardado, ir al Home.
    if (localStorage.getItem("authToken")) {
        window.location.href = "home.html";
    }

    formLogin.addEventListener("submit", async function(evento) {
        evento.preventDefault();

        const usuario = {
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
        };

        try {
            const respuesta = await fetch(API_BASE + "/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            });

            const datos = await obtenerDatos(respuesta);

            // Guardar el token que entrega la API.
            localStorage.setItem("authToken", datos.token);
            localStorage.setItem("usuario", JSON.stringify(datos.user));

            window.location.href = "home.html";
        } catch (error) {
            mostrarMensaje(error.message);
        }
    });
}

// HOME: comprobar que existe un token y que la API lo acepta.
const listaProyectos = document.getElementById("listaProyectos");

if (listaProyectos) {
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.replace("index.html");
    } else {
        cargarProyectos();
    }
}

// READ: obtener proyectos del usuario.
async function cargarProyectos() {
    try {
        const respuesta = await fetch(API_BASE + "/projects", {
            headers: {
                "auth-token": localStorage.getItem("authToken")
            }
        });

        const proyectos = await obtenerDatos(respuesta);
        mostrarProyectos(proyectos);
    } catch (error) {
        // Si el token no es válido, cerrar la sesión.
        localStorage.removeItem("authToken");
        localStorage.removeItem("usuario");
        window.location.replace("index.html");
    }
}

// Mostrar los proyectos recibidos.
function mostrarProyectos(proyectos) {
    listaProyectos.innerHTML = "";

    if (!Array.isArray(proyectos) || proyectos.length === 0) {
        listaProyectos.innerHTML = "<p>No hay proyectos registrados.</p>";
        return;
    }

    proyectos.forEach(function(proyecto) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "proyecto";

        const titulo = document.createElement("h3");
        titulo.textContent = proyecto.title;

        const descripcion = document.createElement("p");
        descripcion.textContent = proyecto.description;

        const tecnologias = document.createElement("p");
        tecnologias.textContent = "Tecnologías: " +
            (proyecto.technologies || []).join(", ");

        const botonActualizar = document.createElement("button");
        botonActualizar.textContent = "Actualizar";
        botonActualizar.type = "button";

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.type = "button";
        botonEliminar.className = "boton-eliminar";

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(descripcion);
        tarjeta.appendChild(tecnologias);
        tarjeta.appendChild(botonActualizar);
        tarjeta.appendChild(botonEliminar);

        listaProyectos.appendChild(tarjeta);
    });
}

// Mostrar el formulario visual para agregar un proyecto.
const btnAgregar = document.getElementById("btnAgregar");
const formularioProyecto = document.getElementById("formularioProyecto");

if (btnAgregar) {
    btnAgregar.addEventListener("click", function() {
        formularioProyecto.classList.remove("oculto");
    });
}

// Ocultar el formulario.
const btnCancelar = document.getElementById("btnCancelar");

if (btnCancelar) {
    btnCancelar.addEventListener("click", function() {
        formularioProyecto.classList.add("oculto");
    });
}

// El formulario es visual: la consigna solicita los elementos del CRUD,
// pero no se proporcionaron las rutas POST, PUT y DELETE de proyectos.
const formProyecto = document.getElementById("formProyecto");

if (formProyecto) {
    formProyecto.addEventListener("submit", function(evento) {
        evento.preventDefault();
        mostrarMensaje("Formulario listo. Falta conectar el endpoint para guardar proyectos.");
    });
}

// Cerrar sesión.
const btnSalir = document.getElementById("btnSalir");

if (btnSalir) {
    btnSalir.addEventListener("click", function() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    });
}
