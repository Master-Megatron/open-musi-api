const routes = require('./routes');
const CollaborationsHandler = require('./handler');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (
    server,
    { collaborationsService, playlistService, validator },
  ) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistService,
      validator,
    );
    server.route(routes(collaborationsHandler));
  },
};
