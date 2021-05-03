const azure = require('azure-storage');

const AZURE_TS_ORGSTABLE = process.env.AZURE_TS_ORGSTABLE;
const AZURE_TS_ORGSTABLE_PARTITIONKEY = process.env.AZURE_TS_ORGSTABLE_PARTITIONKEY;

exports.handler = async event => {
    const {authorizationToken, methodArn} = event;
    const requestedOrg = extractRootResourceFromMethodArn(methodArn);
    const denyPolicy = generatePolicy(requestedOrg, 'Deny', methodArn);
    const tableSvc = azure.createTableService();

    if (!requestedOrg) return denyPolicy;

    try {
        const savedAPIKey = await retrieveOrganizationApiKey(tableSvc, requestedOrg);

        if (!savedAPIKey) return denyPolicy;

        return generatePolicy(requestedOrg, authorizationToken === savedAPIKey ? 'Allow' : 'Deny', methodArn);
    } catch (e) {
        console.log(`[ERROR][AzureTS] ${e}`);
        return denyPolicy;
    }
};

function retrieveOrganizationApiKey(tableSvc, orgResourceName) {
    return new Promise((resolve, reject) => {
        tableSvc.retrieveEntity(AZURE_TS_ORGSTABLE, AZURE_TS_ORGSTABLE_PARTITIONKEY, orgResourceName, (error, result) => {
            if (!error) resolve(fromAzureTSModel(result, "claveApi"));
            else reject(error);
        });
    });
}

function generatePolicy(principalId, effect, resource) {
    let authResponse = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        let policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        let statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    return authResponse;
}

function extractRootResourceFromMethodArn(methodArn) {
    return methodArn.split(':')[5].split('/')[3];
}

function fromAzureTSModel(model, key) {
    return model[key]._;
}
