# language: es
Característica: Iniciar Sesión (UC02)
  Como estudiante registrado
  Quiero iniciar sesión con mi correo y contraseña
  Para acceder a las funcionalidades del sistema

  Escenario: Inicio de sesión exitoso
    Dado que existe una cuenta registrada con correo "seba@test.com" y contraseña "password123"
    Cuando el estudiante envía sus credenciales correctas al sistema
    Entonces el sistema responde con un código 200
    Y la respuesta incluye un access token
    Y el navegador recibe una cookie "refresh_token" de tipo httpOnly

  Esquema del escenario: Inicio de sesión con credenciales inválidas
    Dado que existe una cuenta registrada con correo "seba@test.com" y contraseña "password123"
    Cuando el estudiante envía el correo "<correo>" y la contraseña "<contrasena>"
    Entonces el sistema responde con un código 401
    Y el mensaje de error es "Credenciales inválidas"

    Ejemplos:
      | correo               | contrasena    |
      | seba@test.com        | incorrecta123 |
      | inexistente@test.com | password123   |

  Escenario: El correo no distingue mayúsculas ni espacios
    Dado que existe una cuenta registrada con correo "seba@test.com" y contraseña "password123"
    Cuando el estudiante envía el correo " SEBA@Test.com " y la contraseña "password123"
    Entonces el sistema responde con un código 200

  Escenario: Las rutas protegidas exigen un access token válido
    Cuando un visitante sin sesión consulta el listado de carreras
    Entonces el sistema responde con un código 401
