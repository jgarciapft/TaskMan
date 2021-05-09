const {
    organizationExists,
    taskExists,
    updateTask,
} = require('azure-promisified')

exports.handler = async ({pathParameters, body}) => {
    const {organizacion, proyecto, tarea} = pathParameters;
    const inputTaskModel = JSON.parse(body);

    if (!organizacion || !await organizationExists(organizacion))
        return apiGwResponse(404, 'La organización no existe');

    if (!proyecto || proyecto.startsWith('_') || proyecto.length < 3)
        return apiGwResponse(400, 'Nombre de proyecto mal formado')

    if (!tarea || !/^[1-9][0-9]*$/.test(tarea))
        return apiGwResponse(400, 'Identificador de la tarea mal formado')

    if (!await taskExists(organizacion, proyecto, tarea)) return apiGwResponse(404, 'La tarea no existe');

    if (!validateTaskModel(inputTaskModel)) return apiGwResponse(400, 'Definición de tarea mal formada');

    try {
        await updateTask(organizacion, proyecto, tarea, inputTaskModel);
        return apiGwResponse(204, 'Tarea actualizada');
    } catch (e) {
        return apiGwResponse(500, 'Algo fue mal. Inténtelo más tarde');
    }
}

function validateTaskModel(taskModel) {
    const {titulo, autor, estado, prioridad, ...rest} = taskModel;

    return Object.keys(taskModel).length >= 4 &&
        !taskModel.id &&
        !taskModel.proyecto &&
        !!titulo &&
        !!autor &&
        !!estado && /^(abierta|en progreso|lista|archivada)$/.test(estado) &&
        !!prioridad && /^(muy baja|baja|media|alta|muy alta)$/.test(prioridad) &&
        (Object.keys(rest).length ? Object.keys(rest).every(((extraField) => /^[^0-9_\-]+$/.test(extraField))) : true);
}

function apiGwResponse(statusCode, body) {
    return {
        statusCode,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(body),
        isBase64Encoded: false
    }
}