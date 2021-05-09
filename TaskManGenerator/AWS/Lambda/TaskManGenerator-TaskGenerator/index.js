const {Chance} = require('chance');

exports.handler = async ({queryStringParameters}) => {
    let count = 1;
    let generatedTasks = [];

    if (queryStringParameters) count = queryStringParameters.count;

    if(isNaN(count)) return apiGwResponse(400, 'La cuenta de tareas no es un número válido');

    for (let i = 1; i <= count; i++) generatedTasks.push(generateTask());

    return apiGwResponse(200, generatedTasks);
}

function generateTask(partial) {
    let etiquetas = [];

    for (let i = 0; i < Chance().natural({min: 2, max: 10}); i++)
        etiquetas.push(Chance().word());

    return {
        ...partial,
        titulo: Chance().sentence({words: 7}),
        descripcion: Chance().paragraph({sentences: 10}),
        estado: Chance().pickone(['abierta', 'en progreso', 'lista', 'archivada']),
        autor: Chance().name(),
        responsable: Chance().name(),
        prioridad: Chance().pickone(['muy baja', 'baja', 'media', 'alta', 'muy alta']),
        etiquetas
    }
}

function apiGwResponse(statusCode, body) {
    return {
        statusCode,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(body),
        isBase64Encoded: false
    }
}