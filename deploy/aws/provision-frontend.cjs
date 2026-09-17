// Run after building frontend. Uses the existing AWS login; never handles secrets.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const bucket = 'chat-app-frontend-559947224926-ap-south-1';
const distribution = 'E1RD94HS9FYMD0';
function aws(...args) {
  const result = execFileSync('aws', [...args, '--region', 'ap-south-1', '--no-cli-pager'], { encoding: 'utf8' });
  return result.trim() ? JSON.parse(result) : {};
}
if (!fs.existsSync('frontend/build/index.html')) throw Error('Build frontend first');
const buckets = aws('s3api', 'list-buckets').Buckets;
if (!buckets.some(b => b.Name === bucket)) aws('s3api', 'create-bucket', '--bucket', bucket,
  '--create-bucket-configuration', 'LocationConstraint=ap-south-1');
aws('s3api', 'put-public-access-block', '--bucket', bucket, '--public-access-block-configuration',
  'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true');
aws('s3api', 'put-bucket-versioning', '--bucket', bucket, '--versioning-configuration', 'Status=Enabled');
aws('s3api', 'put-bucket-policy', '--bucket', bucket, '--policy', JSON.stringify({
  Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'cloudfront.amazonaws.com' },
    Action: 's3:GetObject', Resource: `arn:aws:s3:::${bucket}/*`, Condition: { StringEquals: {
      'AWS:SourceArn': `arn:aws:cloudfront::559947224926:distribution/${distribution}` } } }]
}));
execFileSync('bash', ['deploy/aws/publish-frontend.sh'], { stdio: 'inherit' });
let oac = aws('cloudfront', 'list-origin-access-controls').OriginAccessControlList.Items?.find(x => x.Name === 'chat-app-frontend');
if (!oac) oac = aws('cloudfront', 'create-origin-access-control', '--origin-access-control-config', JSON.stringify({
  Name: 'chat-app-frontend', Description: 'Private chat-app S3 frontend', SigningProtocol: 'sigv4',
  SigningBehavior: 'always', OriginAccessControlOriginType: 's3'
})).OriginAccessControl;
const name = 'chat-app-spa-routing';
let fn = aws('cloudfront', 'list-functions').FunctionList.Items?.find(x => x.Name === name);
let functionResult;
const config = JSON.stringify({ Comment: 'SPA routing on S3 behavior only', Runtime: 'cloudfront-js-2.0' });
if (!fn) functionResult = aws('cloudfront', 'create-function', '--name', name,
  '--function-config', config, '--function-code', 'fileb://deploy/aws/spa-routing.js');
else {
  const description = aws('cloudfront', 'describe-function', '--name', name);
  functionResult = aws('cloudfront', 'update-function', '--name', name, '--if-match', description.ETag,
    '--function-config', config, '--function-code', 'fileb://deploy/aws/spa-routing.js');
}
fn = aws('cloudfront', 'publish-function', '--name', name, '--if-match', functionResult.ETag).FunctionSummary;
const current = aws('cloudfront', 'get-distribution-config', '--id', distribution);
const d = current.DistributionConfig;
const origin = { Id: 'chat-app-s3', DomainName: `${bucket}.s3.ap-south-1.amazonaws.com`,
  OriginPath: '', CustomHeaders: { Quantity: 0 }, ConnectionAttempts: 3, ConnectionTimeout: 10,
  S3OriginConfig: { OriginAccessIdentity: '' }, OriginAccessControlId: oac.Id };
d.Origins.Items = d.Origins.Items.filter(o => o.Id !== origin.Id).concat(origin);
d.Origins.Quantity = d.Origins.Items.length;
const api = d.DefaultCacheBehavior.TargetOriginId === 'chat-app-ec2' ? d.DefaultCacheBehavior : d.CacheBehaviors.Items.find(b => b.PathPattern === '/api/*');
const backend = { ...api };
delete backend.PathPattern;
backend.FunctionAssociations = { Quantity: 0 };
d.CacheBehaviors = { Quantity: 4, Items: ['/api', '/api/*', '/socket.io', '/socket.io/*'].map(PathPattern => ({ ...backend, PathPattern })) };
d.DefaultCacheBehavior = {
  ...backend,
  TargetOriginId: origin.Id, ViewerProtocolPolicy: 'redirect-to-https', Compress: true,
  AllowedMethods: { Quantity: 2, Items: ['GET', 'HEAD'], CachedMethods: { Quantity: 2, Items: ['GET', 'HEAD'] } },
  CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
  FunctionAssociations: { Quantity: 1, Items: [{ EventType: 'viewer-request', FunctionARN: fn.FunctionMetadata.FunctionARN }] }
};
delete d.DefaultCacheBehavior.OriginRequestPolicyId;
d.DefaultRootObject = 'index.html';
d.Comment = 'Chat-app React on private S3; API and Socket.IO on Mumbai EC2';
aws('cloudfront', 'update-distribution', '--id', distribution, '--if-match', current.ETag, '--distribution-config', JSON.stringify(d));
console.log('Frontend distribution updated: https://d2suke8zow8xpc.cloudfront.net');
