# language: es
Característica: Gestionar Carreras Favoritas (UC11)
  Como estudiante
  Quiero marcar y desmarcar carreras como favoritas
  Para revisarlas más tarde desde cualquier dispositivo

  Escenario: Marcar una carrera como favorita es una operación idempotente
    Dado que el estudiante tiene sesión iniciada
    Y la carrera "Medicina" no está marcada como favorita
    Cuando el estudiante marca "Medicina" como favorita dos veces seguidas
    Entonces ambas peticiones responden con un código 201
    Y el listado de favoritas contiene "Medicina" una sola vez

  Escenario: Quitar una carrera de favoritas
    Dado que el estudiante tiene sesión iniciada
    Y la carrera "Medicina" está marcada como favorita
    Cuando el estudiante la desmarca
    Entonces el sistema responde con un código 204
    Y "Medicina" ya no aparece en el listado de favoritas

  Escenario: No se puede marcar una carrera que no existe
    Dado que el estudiante tiene sesión iniciada
    Cuando el estudiante marca una carrera inexistente como favorita
    Entonces el sistema responde con un código 404
