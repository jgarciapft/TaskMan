const {
    organizationExists,
    queryTasksOfProject,
} = require('azure-promisified')

exports.handler = async ({pathParameters}) => {
    const {organizacion, proyecto} = pathParameters;

    if (!organizacion || !await organizationExists(organizacion))
        return apiGwResponse(404, 'La organización no existe');

    if (!proyecto || proyecto.startsWith('_') || proyecto.length < 3)
        return apiGwResponse(400, 'Nombre de proyecto mal formado')

    try {
        return apiGwResponse(200, await queryTasksOfProject(organizacion, proyecto));
    } catch (e) {
        return apiGwResponse(500, 'Algo fue mal. Inténtelo más tarde');
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
