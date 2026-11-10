# language: es
Característica: Rendir Prueba Tipo PAES (UC05)
  Como estudiante
  Quiero rendir una prueba de alternativas por materia
  Para obtener un puntaje estimado que se refleje en Mis Puntajes

  Escenario: Rendir la prueba de Ciencias requiere elegir una mención
    Dado que el estudiante tiene sesión iniciada
    Cuando solicita el banco de preguntas de la materia "ciencias" sin indicar mención
    Entonces el sistema responde con un código 400
    Y el mensaje de error es "Debes indicar una mención para Ciencias"

  Escenario: Calificación correcta de una prueba rendida
    Dado que el estudiante tiene sesión iniciada
    Y el banco de preguntas de "lectora" tiene 4 preguntas
    Cuando el estudiante responde correctamente 1 de las 4 preguntas
    Y envía sus respuestas
    Entonces el sistema responde con un código 201
    Y el puntaje calculado es 588
    Y su puntaje de "lectora" es 588 con origen "paes_attempt"

  Escenario: Retomar la prueba reemplaza el intento anterior
    Dado que el estudiante ya rindió la prueba de "lectora" con puntaje 588
    Cuando el estudiante vuelve a rendir la prueba de "lectora" respondiendo todo correctamente
    Entonces el sistema responde con un código 201
    Y el puntaje calculado es 1000
    Y solo existe un intento de "lectora" para ese estudiante en la base de datos
