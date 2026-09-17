function handler(event) {
  var request = event.request;
  // Attached only to the S3 behavior; never rewrites API or socket errors.
  if (request.uri === '/' || !request.uri.split('/').pop().includes('.')) {
    request.uri = '/index.html';
  }
  return request;
}
