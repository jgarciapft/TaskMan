const {
    retrieveOrganization,
    fromAzureTSModel,
} = require('azure-promisified')

exports.handler = async ({pathParameters}) => {
    const {organizacion} = pathParameters;

    if (!organizacion) return apiGwResponse(404, 'La organización no existe');

    if (organizacion.startsWith('APP'))
        return apiGwResponse(400, 'Nombre de recurso mal formado');

    try {
        const remoteOrg = await retrieveOrganization(organizacion);

        const nombreCompleto = fromAzureTSModel(remoteOrg, 'nombreCompleto');
        const nombreRecurso = fromAzureTSModel(remoteOrg, 'RowKey');

        return apiGwResponse(200, {nombreCompleto, nombreRecurso});
    } catch (e) {
        return apiGwResponse(404, 'La organización no existe');
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