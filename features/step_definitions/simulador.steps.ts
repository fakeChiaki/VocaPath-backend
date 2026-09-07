import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { SimulatorService } from '../../src/simulator/simulator.service.js';

const FACTOR_LABELS: Record<string, string> = {
    nem: 'NEM',
    ranking: 'Ranking',
    lectora: 'Comp. Lectora',
    matematica: 'Comp. Matemática',
    ciencias: 'Ciencias',
};

const LABEL_TO_FACTOR: Record<string, string> = Object.fromEntries(
    Object.entries(FACTOR_LABELS).map(([factor, label]) => [label, factor]),
);

let userScores: any[] = [];
let careerData: any = { id: 'carrera-1', weights: {} };
let simulationResult: any;
let simulatorService: SimulatorService;

function scoresFromTable(dataTable: any) {
    return dataTable.hashes().map((row: any) => ({
        factor: LABEL_TO_FACTOR[row.Materia],
        value: parseFloat(row.Puntaje),
    }));
}

Given('que el estudiante se encuentra en la sección {string} de VocaPath', function () {
    userScores = [];
    careerData = { id: 'carrera-1', weights: {} };
    simulationResult = undefined;

    const mockCareersService = {
        findById: async () => careerData,
    } as any;

    const mockScoresService = {
        findAll: async () => userScores,
    } as any;

    simulatorService = new SimulatorService(mockCareersService, mockScoresService);
});

Given('que el estudiante tiene registrados los siguientes puntajes por materia:', function (dataTable) {
    userScores = scoresFromTable(dataTable);
});

Given('que el estudiante tiene registrados los siguientes puntajes bajos por materia:', function (dataTable) {
    userScores = scoresFromTable(dataTable);

    careerData.name = 'Medicina - UFRO';
    careerData.weights = {
        nem: 10,
        ranking: 20,
        lectora: 10,
        matematica: 20,
        ciencias: 40,
    };
});

Given('la carrera {string} exige puntajes en NEM, Ranking, Comp. Lectora, Comp. Matemática y Ciencias', function (string) {
    careerData.name = string;
    careerData.weights = {
        nem: 10,
        ranking: 20,
        lectora: 15,
        matematica: 45,
        ciencias: 10,
    };
});

Given('la carrera {string} tiene un puntaje de corte de {string}', function (_career, cutoff) {
    careerData.cutoffScore = parseFloat(cutoff);
});

When('el estudiante selecciona la carrera {string} desde el listado desplegable del simulador', async function () {
    simulationResult = await simulatorService.simulate('user-1', 'carrera-1');
});

Then('el sistema valida que existen puntajes para todas las materias exigidas', function () {
    expect(simulationResult.status).not.toBe('missing_scores');
    expect(simulationResult.missingFactors).toHaveLength(0);
});

Then('el sistema calcula el puntaje ponderado utilizando las ponderaciones de la carrera', function () {
    expect(simulationResult.weightedScore).toBeDefined();
});

Then('el sistema muestra el mensaje {string}', function (message: string) {
    const expectedStatusByMessage: Record<string, string> = {
        '¡Alcanzas el puntaje de corte!': 'success',
        'Te faltan puntajes para simular': 'missing_scores',
        'Lamentablemente no alcanzas el puntaje de corte histórico': 'not_enough',
    };

    expect(simulationResult.status).toBe(expectedStatusByMessage[message]);
});

Then('el sistema muestra el puntaje ponderado {string}, el puntaje de corte {string} y la diferencia {string}', function (score, cutoff, difference) {
    expect(simulationResult.weightedScore).toBe(parseFloat(score));
    expect(simulationResult.career.cutoffScore).toBe(parseFloat(cutoff));

    const actualDifference = simulationResult.weightedScore - simulationResult.career.cutoffScore;
    expect(actualDifference.toFixed(1)).toBe(parseFloat(difference).toFixed(1));
});

Then('el sistema despliega el desglose ponderado factor por factor', function () {
    expect(simulationResult).toHaveProperty('career');
});

Given('que el estudiante no tiene registrado ningún puntaje por materia', function () {
    userScores = [];
});

Then('el sistema bloquea la simulación', function () {
    expect(simulationResult.status).toBe('missing_scores');
});

Then('el sistema indica como materias faltantes {string}', function (string: string) {
    const expectedLabels = string.split(', ');
    const actualLabels = simulationResult.missingFactors.map(
        (factor: string) => FACTOR_LABELS[factor],
    );

    expect(actualLabels).toEqual(expectedLabels);
});

Then('el sistema muestra el botón {string}', function () {
    expect(simulationResult.missingFactors.length).toBeGreaterThan(0);
});

Then('el sistema no calcula ni muestra ningún puntaje ponderado', function () {
    expect(simulationResult.weightedScore).toBeNull();
});

Given('que el estudiante tiene registrados puntajes por materia tales que su puntaje ponderado resultante es exactamente {string}', function (string) {
    const targetScore = parseFloat(string);

    userScores = [
        { factor: 'nem', value: targetScore },
        { factor: 'ranking', value: targetScore },
        { factor: 'lectora', value: targetScore },
        { factor: 'matematica', value: targetScore },
        { factor: 'ciencias', value: targetScore },
    ];
});

Given('la carrera {string} exige puntajes en NEM, Ranking, Comp. Lectora y Comp. Matemática', function (string) {
    careerData.name = string;
    careerData.weights = {
        nem: 10,
        ranking: 20,
        lectora: 20,
        matematica: 50,
    };
});

Then('el sistema calcula un puntaje ponderado de {string}', function (string) {
    expect(simulationResult.weightedScore).toBe(parseFloat(string));
});

Then('el sistema indica que el estudiante alcanza el puntaje de corte', function () {
    expect(simulationResult.status).toBe('success');
});

Then('la diferencia mostrada es {string}', function (string) {
    const difference = simulationResult.weightedScore - simulationResult.career.cutoffScore;
    expect(difference.toFixed(1)).toBe(parseFloat(string).toFixed(1));
});

Then('el sistema no interpreta el empate como un resultado desfavorable', function () {
    expect(simulationResult.status).not.toBe('not_enough');
    expect(simulationResult.status).toBe('success');
});

Given('la carrera {string} exige puntajes solo en NEM, Ranking, Comp. Lectora y Comp. Matemática', function (string) {
    careerData.name = string;
    careerData.weights = {
        nem: 10,
        ranking: 20,
        lectora: 20,
        matematica: 50,
    };
});