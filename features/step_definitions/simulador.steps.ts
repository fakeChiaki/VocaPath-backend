import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';
import { SimulatorService } from '../../src/simulator/simulator.service.js';

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
    // Transformación de la tabla Gherkin al formato de dominio de la aplicación
    const rows = dataTable.hashes();
    userScores = rows.map((row: any) => {
        let factor = row.Materia;
        if (factor === 'Comp. Lectora') factor = 'language';
        if (factor === 'Comp. Matemática') factor = 'math';
        if (factor === 'Ciencias') factor = 'science';
        if (factor === 'NEM') factor = 'nem';
        if (factor === 'Ranking') factor = 'ranking';

        return { factor, value: parseFloat(row.Puntaje) };
    });
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

Then('el sistema muestra el mensaje {string}', function (string) {
    // Validación del estado de éxito de la simulación
    expect(simulationResult.status).toBe('success');
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

Given('que el estudiante tiene registrados puntajes por materia tales que su puntaje ponderado resultante es exactamente {string}', function (string) {
    const targetScore = parseFloat(string);
    userScores = [
        { factor: 'nem', value: targetScore },
        { factor: 'ranking', value: targetScore },
        { factor: 'language', value: targetScore },
        { factor: 'math', value: targetScore },
        { factor: 'science', value: targetScore }
    ];
});

Given('la carrera {string} exige puntajes en NEM, Ranking, Comp. Lectora y Comp. Matemática', function (string) {
    careerData.name = string;
    careerData.weights = { nem: 10, ranking: 20, language: 20, math: 50 }; // science is missing, weights sum to 100
});

Then('el sistema calcula un puntaje ponderado de {string}', function (string) {
    expect(simulationResult.weightedScore).toBe(parseFloat(string));
});

Then('el sistema indica que el estudiante alcanza el puntaje de corte', function () {
    expect(simulationResult.status).toBe('success');
});

Then('la diferencia mostrada es {string}', function (string) {
    const diff = simulationResult.weightedScore - simulationResult.career.cutoffScore;
    expect(diff.toFixed(1)).toBe(parseFloat(string).toFixed(1));
});

Then('el sistema no interpreta el empate como un resultado desfavorable', function () {
    expect(simulationResult.status).not.toBe('not_enough');
    expect(simulationResult.status).toBe('success');
});

