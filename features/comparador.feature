# language: es
Característica: Comparar Carreras (UC10)
  Como estudiante
  Quiero comparar dos carreras de cualquier universidad
  Para evaluar sus puntajes y perfil profesional lado a lado

  Esquema del escenario: Validación de la cantidad de carreras a comparar
    Dado que el estudiante tiene sesión iniciada
    Cuando solicita comparar las carreras "<ids>"
    Entonces el sistema responde con un código 400

    Ejemplos:
      | ids               |
      | un-solo-id        |
      | mismo-id,mismo-id |

  Escenario: Comparación exitosa de dos carreras de universidades distintas
    Dado que el estudiante tiene sesión iniciada
    Cuando solicita comparar la carrera "Medicina" de "UFRO" con la carrera "Ingeniería Comercial" de "UCT"
    Entonces el sistema responde con un código 200
    Y la respuesta contiene exactamente 2 carreras
