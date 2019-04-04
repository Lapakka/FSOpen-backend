/* Extracts the token from POST authorization header */
const tokenExtractor = (request, response, next) => {
  request.token = null;
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    request.token = authorization.substring(7);
  }
  next();
};

module.exports = { tokenExtractor };