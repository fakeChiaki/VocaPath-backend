# language: es
Característica: Revisar Puntajes por Materia (UC06)
  Como estudiante
  Quiero registrar, revisar y eliminar mis puntajes por materia
  Para usarlos en el simulador de postulación

  Antecedentes:
    Dado que el estudiante tiene sesión iniciada

  Escenario: Registrar un puntaje manualmente
    Cuando el estudiante registra el puntaje 850 en "nem"
    Entonces el sistema responde con un código 200
    Y su puntaje de "nem" es 850 con origen "manual"

  Esquema del escenario: Rechazo de puntajes fuera de rango
    Cuando el estudiante registra el puntaje <puntaje> en "nem"
    Entonces el sistema responde con un código 400

    Ejemplos:
      | puntaje |
      | 99      |
      | 1001    |

  Escenario: Rechazo de una materia inexistente
    Cuando el estudiante registra el puntaje 700 en "fisica"
    Entonces el sistema responde con un código 400

  Escenario: Eliminar un puntaje
    Dado que el estudiante tiene registrado el puntaje 850 en "nem"
    Cuando el estudiante elimina su puntaje de "nem"
    Entonces el sistema responde con un código 204
    Y "nem" ya no aparece en sus puntajes

  Escenario: Eliminar un puntaje que no existe
    Cuando el estudiante elimina su puntaje de "ranking"
    Entonces el sistema responde con un código 404

  Escenario: Un puntaje manual reemplaza al de una prueba rendida
    Dado que el estudiante ya rindió la prueba de "lectora" con puntaje 588
    Cuando el estudiante registra el puntaje 700 en "lectora"
    Entonces el sistema responde con un código 200
    Y su puntaje de "lectora" es 700 con origen "manual"
    Y ya no existe un intento de "lectora" para ese estudiante
