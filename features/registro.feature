# language: es
Característica: Registrarse (UC01)
  Como visitante
  Quiero crear una cuenta con mi nombre, correo y contraseña
  Para poder guardar mis puntajes, favoritas y resultados

  Escenario: Registro exitoso
    Dado que no existe una cuenta con correo "nueva@test.com"
    Cuando el visitante se registra con nombre "Nueva Estudiante", correo "nueva@test.com" y contraseña "password123"
    Entonces el sistema responde con un código 201
    Y la respuesta no incluye la contraseña
    Y el estudiante puede iniciar sesión con correo "nueva@test.com" y contraseña "password123"

  Escenario: No se permite registrar dos veces el mismo correo
    Dado que existe una cuenta registrada con correo "seba@test.com" y contraseña "password123"
    Cuando el visitante se registra con nombre "Otra Persona", correo "SEBA@Test.com" y contraseña "password123"
    Entonces el sistema responde con un código 409
    Y el mensaje de error es "Ya existe una cuenta con ese correo"

  Escenario: Las contraseñas deben coincidir
    Cuando el visitante intenta registrarse con contraseña "password123" y confirmación "otraclave456"
    Entonces el sistema responde con un código 400
    Y el mensaje de error es "Las contraseñas no coinciden"

  Esquema del escenario: Datos de registro inválidos
    Cuando el visitante se registra con nombre "<nombre>", correo "<correo>" y contraseña "<contrasena>"
    Entonces el sistema responde con un código 400

    Ejemplos:
      | nombre | correo       | contrasena  |
      | A      | ok@test.com  | password123 |
      | Ana    | no-es-correo | password123 |
      | Ana    | ok@test.com  | corta       |
