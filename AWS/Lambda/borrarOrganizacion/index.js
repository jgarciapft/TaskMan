const {
    deleteOrganization,
    organizationExists,
    deleteTable
} = require('azure-promisified')

exports.handler = async ({pathParameters}) => {
    const {organizacion} = pathParameters;

    if (!organizacion || !await organizationExists(organizacion))
        return apiGwResponse(404, 'La organización no existe');

    try {
        await deleteTable(organizacion);
        await deleteOrganization(organizacion);
        return apiGwResponse(204, 'Organización borrada');
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