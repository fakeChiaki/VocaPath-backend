# language: es
Característica: Simular Postulación PAES
  Como estudiante de 3° o 4° medio
  Quiero simular mi postulación a una carrera comparando mis puntajes con el puntaje de corte
  Para saber si tengo posibilidades reales de ingresar antes de rendir la PAES oficial

  Antecedentes:
    Dado que el estudiante se encuentra en la sección "Simulador" de VocaPath

  Escenario: Simular postulación con puntajes completos y resultado favorable
    Dado que el estudiante tiene registrados los siguientes puntajes por materia:
      | Materia          | Puntaje |
      | NEM              | 1000    |
      | Ranking          | 1000    |
      | Comp. Lectora    | 1000    |
      | Comp. Matemática | 1000    |
      | Ciencias         | 1000    |
    Y la carrera "Medicina - UFRO" exige puntajes en NEM, Ranking, Comp. Lectora, Comp. Matemática y Ciencias
    Y la carrera "Medicina - UFRO" tiene un puntaje de corte de "882.3"
    Cuando el estudiante selecciona la carrera "Medicina - UFRO" desde el listado desplegable del simulador
    Entonces el sistema valida que existen puntajes para todas las materias exigidas
    Y el sistema calcula el puntaje ponderado utilizando las ponderaciones de la carrera
    Y el sistema muestra el mensaje "¡Alcanzas el puntaje de corte!"
    Y el sistema muestra el puntaje ponderado "1000.0", el puntaje de corte "882.3" y la diferencia "+117.7"
    Y el sistema despliega el desglose ponderado factor por factor
