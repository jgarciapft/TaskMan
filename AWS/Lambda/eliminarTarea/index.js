const {
    organizationExists,
    deleteTask
} = require('azure-promisified')

exports.handler = async ({pathParameters}) => {
    const {organizacion, proyecto, tarea} = pathParameters;

    if (!organizacion || !await organizationExists(organizacion))
        return apiGwResponse(404, 'La organización no existe');

    if (!proyecto || proyecto.startsWith('_') || proyecto.length < 3)
        return apiGwResponse(400, 'Nombre de proyecto mal formado')

    if (!tarea || !/^[1-9][0-9]*$/.test(tarea))
        return apiGwResponse(400, 'Identificador de la tarea mal formado')

    try {
        await deleteTask(organizacion, proyecto, tarea);
        return apiGwResponse(204, 'Tarea eliminada');
    } catch (e) {
        return apiGwResponse(404, 'La tarea no existe');
    }
};

function apiGwResponse(statusCode, body) {
    return {
        statusCode,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(body),
        isBase64Encoded: false
    }
}
