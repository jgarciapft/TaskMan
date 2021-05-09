const {
    organizationExists,
    insertNewTask,
    incrementTaskSequence,
} = require('azure-promisified')

exports.handler = async ({pathParameters, body}) => {
    const {organizacion, proyecto} = pathParameters;
    const inputTaskModel = JSON.parse(body);

    if (!organizacion || !await organizationExists(organizacion))
        return apiGwResponse(404, 'La organización no existe');

    if (!proyecto || proyecto.startsWith('_') || proyecto.length < 3)
        return apiGwResponse(400, 'Nombre de proyecto mal formado')

    if (!validateNewTaskModel(inputTaskModel)) return apiGwResponse(400, 'Definición de tarea mal formada');

    try {
        await insertNewTask(organizacion, proyecto, applyDefaultsToNewTask(inputTaskModel));
        await incrementTaskSequence(organizacion);

        return apiGwResponse(201, 'Tarea creada');
    } catch (e) {
        return apiGwResponse(500, 'Algo fue mal. Inténtelo más tarde');
    }
}

function validateNewTaskModel(taskModel) {
    const {titulo, autor, estado, prioridad, ...rest} = taskModel;

    return Object.keys(taskModel).length >= 2 &&
        !!titulo &&
        !!autor &&
        (estado ? /^(abierta|en progreso|lista|archivada)$/.test(estado) : true) &&
        (prioridad ? /^(muy baja|baja|media|alta|muy alta)$/.test(prioridad) : true) &&
        (Object.keys(rest).length ? Object.keys(rest).every(((extraField) => /^[^0-9_\-]+$/.test(extraField))) : true);
}

function applyDefaultsToNewTask({estado = 'abierta', prioridad = 'media', ...rest}) {
    return {estado, prioridad, ...rest}
}

function apiGwResponse(statusCode, body) {
    return {
        statusCode,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(body),
        isBase64Encoded: false
    }
}