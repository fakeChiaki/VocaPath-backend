# language: es
Característica: Simular Postulación PAES (UC12)
  Como estudiante
  Quiero simular mi postulación a una carrera
  Para saber si mi puntaje ponderado alcanza el puntaje de corte

  Antecedentes:
    Dado que el estudiante tiene sesión iniciada

  Escenario: La simulación se bloquea si faltan puntajes
    Dado que no tiene registrado un puntaje de "ranking"
    Y "Medicina" exige un puntaje de "ranking" mayor a 0
    Cuando el estudiante simula su postulación a "Medicina"
    Entonces el sistema responde con un código 200 y estado "missing_scores"
    Y el detalle de puntajes faltantes incluye "ranking"

  Esquema del escenario: Resultado de la simulación según el puntaje ponderado
    Dado que el estudiante tiene todos los puntajes exigidos por "Medicina" en <puntaje>
    Y el puntaje de corte de "Medicina" es 882.3
    Cuando el estudiante simula su postulación a "Medicina"
    Entonces el estado de la simulación es "<estado>"

    Ejemplos:
      | puntaje | estado     |
      | 700     | not_enough |
      | 950     | success    |

  Escenario: Un puntaje ponderado igual al corte alcanza para postular
    Dado que el estudiante tiene todos los puntajes exigidos por "Ingeniería Civil Informática" en 705.4
    Cuando el estudiante simula su postulación a "Ingeniería Civil Informática"
    Entonces el estado de la simulación es "success"
    Y el puntaje ponderado es 705.4

  Escenario: No se puede comparar con una carrera que no publica su corte
    Dado que el estudiante tiene todos los puntajes exigidos por "Agronomía" en 800
    Cuando el estudiante simula su postulación a "Agronomía"
    Entonces el estado de la simulación es "cutoff_unavailable"

  Escenario: Con Historia o Ciencias se usa el mayor de los dos puntajes
    Dado que el estudiante tiene registrados los siguientes puntajes:
      | factor     | puntaje |
      | nem        | 1000    |
      | ranking    | 1000    |
      | lectora    | 1000    |
      | matematica | 1000    |
      | ciencias   | 800     |
    Cuando el estudiante simula su postulación a "Ingeniería Comercial"
    Entonces el estado de la simulación es "success"
    Y el puntaje ponderado es 980
