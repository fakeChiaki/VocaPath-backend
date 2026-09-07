import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { SimulatorService } from '../../src/simulator/simulator.service.js';

const FACTOR_LABELS: Record<string, string> = {
    nem: 'NEM',
    ranking: 'Ranking',
    language: 'Comp. Lectora',
    math: 'Comp. Matemática',
    science: 'Ciencias',
};

const LABEL_TO_FACTOR: Record<string, string> = Object.fromEntries(
    Object.entries(FACTOR_LABELS).map(([factor, label]) => [label, factor]),
);

// Variables de estado compartidas entre los pasos del escenario
let userScores: any[] = [];
let careerData: any = { id: 'carrera-1', weights: {} };
let simulationResult: any;
let simulatorService: SimulatorService;

Given('que el estudiante se encuentra en la sección {string} de VocaPath', function (string) {
    // Inicialización del servicio inyectando repositorios simulados (mocks)
    const mockCareersService = { findById: async (id: string) => careerData } as any;
    const mockScoresService = { findAll: async (userId: string) => userScores } as any;

    simulatorService = new SimulatorService(mockCareersService, mockScoresService);
});

Given('que el estudiante tiene registrados los siguientes puntajes por materia:', function (dataTable) {
    const rows = dataTable.hashes();
    userScores = rows.map((row: any) => ({
        factor: LABEL_TO_FACTOR[row.Materia],
        value: parseFloat(row.Puntaje),
    }));
});

Given('la carrera {string} exige puntajes en NEM, Ranking, Comp. Lectora, Comp. Matemática y Ciencias', function (string) {
    // Configuración de las ponderaciones requeridas para el cálculo
    careerData.name = string;
    careerData.weights = { nem: 10, ranking: 20, language: 15, math: 45, science: 10 };
});

Given('la carrera {string} tiene un puntaje de corte de {string}', function (string, string2) {
    careerData.cutoffScore = parseFloat(string2);
});

When('el estudiante selecciona la carrera {string} desde el listado desplegable del simulador', async function (string) {
    // Ejecución de la lógica de negocio principal
    simulationResult = await simulatorService.simulate('user-1', 'carrera-1');
});

Then('el sistema valida que existen puntajes para todas las materias exigidas', function () {
    // Validación de precondiciones de datos
    expect(simulationResult.status).not.toBe('missing_scores');
    expect(simulationResult.missingFactors).toHaveLength(0);
});

Then('el sistema calcula el puntaje ponderado utilizando las ponderaciones de la carrera', function () {
    // Verificación de generación de resultados
    expect(simulationResult.weightedScore).toBeDefined();
});

Then('el sistema muestra el mensaje {string}', function (string: string) {
    // Validación de la correspondencia entre el mensaje y el estado de la simulación
    const expectedStatusByMessage: Record<string, string> = {
        '¡Alcanzas el puntaje de corte!': 'success',
        'Te faltan puntajes para simular': 'missing_scores',
    };

    expect(simulationResult.status).toBe(expectedStatusByMessage[string]);
});

Then('el sistema muestra el puntaje ponderado {string}, el puntaje de corte {string} y la diferencia {string}', function (string, string2, string3) {
    // Aserción de los cálculos matemáticos contra los valores esperados
    expect(simulationResult.weightedScore).toBe(parseFloat(string));
    expect(simulationResult.career.cutoffScore).toBe(parseFloat(string2));

    const diff = simulationResult.weightedScore - simulationResult.career.cutoffScore;
    expect(diff.toFixed(1)).toBe(parseFloat(string3).toFixed(1));
});

Then('el sistema despliega el desglose ponderado factor por factor', function () {
    // Validación de la estructura de respuesta completa
    expect(simulationResult).toHaveProperty('career');
});

Given('que el estudiante no tiene registrado ningún puntaje por materia', function () {
    userScores = [];
});

Then('el sistema bloquea la simulación', function () {
    // Verificación de que la simulación se bloquea cuando no hay puntajes registrados
    expect(simulationResult.status).toBe('missing_scores');
});

Then('el sistema indica como materias faltantes {string}', function (string: string) {
    const expectedLabels = string.split(', ');
    const actualLabels = simulationResult.missingFactors.map((factor: string) => FACTOR_LABELS[factor]);

    expect(actualLabels).toEqual(expectedLabels);
});

Then('el sistema muestra el botón {string}', function (string: string) {
    // El botón es una decisión de UI del frontend; a nivel de dominio
    // se verifica la condición que dispara su aparición: hay materias faltantes.
    expect(simulationResult.missingFactors.length).toBeGreaterThan(0);
});

Then('el sistema no calcula ni muestra ningún puntaje ponderado', function () {
    // Validación de que no se realiza el cálculo de puntaje ponderado cuando faltan puntajes
    expect(simulationResult.weightedScore).toBeNull();
});