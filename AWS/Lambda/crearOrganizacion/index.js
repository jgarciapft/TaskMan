const {
    createNewOrganization,
    organizationExists,
    createTable,
    createEntity,
    deleteEntity,
    azureEntityGenerator
} = require('azure-promisified')
const {camelCase} = require('lodash')

exports.handler = async ({body}) => {
    const inputOrgModel = JSON.parse(body);

    if (!inputOrgModel || !validateOrganizationModel(inputOrgModel))
        return apiGwResponse(400, 'Los datos de la organización no son válidos');

    if (await organizationExists(inputOrgModel.nombreRecurso))
        return apiGwResponse(400, 'La organización ya existe');

    const tableNameForOrg = camelCase(inputOrgModel.nombreRecurso);

    try {
        await createTable(tableNameForOrg)
        await createEntity(tableNameForOrg, initMetadata());

        return apiGwResponse(201,
            {
                mensaje: 'Organización creada',
                claveApi: await createNewOrganization(inputOrgModel)
            });
    } catch (e) {
        await deleteTable(tableNameForOrg);
        await deleteEntity(tableNameForOrg, initMetadata().PartitionKey, initMetadata().RowKey);
        return apiGwResponse(500, 'Algo fue mal. Inténtelo más tarde');
    }
}

function validateOrganizationModel(orgModel) {
    return Object.keys(orgModel).length === 2 &&
        orgModel.nombreCompleto &&
        orgModel.nombreRecurso &&
        /^[a-z_]+$/.test(orgModel.nombreRecurso);
}

function initMetadata() {
    return {
        PartitionKey: azureEntityGenerator.String('_metadata'),
        RowKey: azureEntityGenerator.String('secuenciaTarea'),
        valor: azureEntityGenerator.Int32(1)
    };
}

function apiGwResponse(statusCode, body) {
    return {
        statusCode,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify(body),
        isBase64Encoded: false
    }
}