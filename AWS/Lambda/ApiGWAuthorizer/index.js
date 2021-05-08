const {
    retrieveOrganizationApiKey,
} = require('azure-promisified')

exports.handler = async ({authorizationToken, methodArn}) => {
    const requestedOrg = extractRootResourceFromMethodArn(methodArn);
    const denyPolicy = generatePolicy(requestedOrg, 'Deny', methodArn);

    if (!requestedOrg) return denyPolicy;

    try {
        const savedAPIKey = await retrieveOrganizationApiKey(requestedOrg);

        if (!savedAPIKey) return denyPolicy;

        return generatePolicy(requestedOrg, authorizationToken === savedAPIKey ? 'Allow' : 'Deny', methodArn);
    } catch (e) {
        console.log(`[ERROR][AzureTS] ${e}`);
        return denyPolicy;
    }
};

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