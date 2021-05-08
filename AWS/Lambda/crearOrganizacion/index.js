const {
    createNewOrganization,
    organizationExists,
    createTable
} = require('azure-promisified')
const {camelCase} = require('lodash')

exports.handler = async ({body}) => {
    const inputOrgModel = JSON.parse(body);

    if (!inputOrgModel || !validateOrganizationModel(inputOrgModel))
        return apiGwResponse(400, 'Los datos de la organización no son válidos');

    if (await organizationExists(inputOrgModel.nombreRecurso))
        return apiGwResponse(400, 'La organización ya existe');

    try {
        await createTable(camelCase(inputOrgModel.nombreRecurso))

        return apiGwResponse(201,
            {
                mensaje: 'Organización creada',
                claveApi: await createNewOrganization(inputOrgModel)
            });
    } catch (e) {
        return apiGwResponse(500, 'Algo fue mal. Inténtelo más tarde');
    }
}

function validateOrganizationModel(orgModel) {
    return Object.keys(orgModel).length === 2 &&
        orgModel.nombreCompleto &&
        orgModel.nombreRecurso &&
        /^[a-z_]+$/.test(orgModel.nombreRecurso);
}

function apiGwResponse(statusCode, body) {
    return {
        statusCode,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(body),
        isBase64Encoded: false
    }
}