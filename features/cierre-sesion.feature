# language: es
Característica: Cerrar Sesión (UC03)
  Como estudiante con sesión iniciada
  Quiero cerrar mi sesión
  Para que nadie más pueda usar mi cuenta desde este navegador

  Escenario: Cerrar sesión revoca la sesión
    Dado que el estudiante tiene sesión iniciada
    Cuando el estudiante cierra sesión
    Entonces el sistema responde con un código 204
    Y la cookie "refresh_token" es eliminada
    Y al renovar la sesión el sistema responde con un código 401

  Escenario: Cerrar sesión funciona aunque el access token haya vencido
    Dado que el estudiante tiene sesión iniciada
    Cuando el estudiante cierra sesión con un access token vencido
    Entonces el sistema responde con un código 204
    Y al renovar la sesión el sistema responde con un código 401

  Escenario: Renovar la sesión rota el refresh token
    Dado que el estudiante tiene sesión iniciada
    Cuando el estudiante renueva su sesión
    Entonces el sistema responde con un código 200
    Y la respuesta incluye un access token
    Y el refresh token anterior ya no permite renovar la sesión
