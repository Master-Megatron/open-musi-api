const ClientError = require('../../exceptions/ClientError');

class playlistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
  }

  //  add new playlist to database
  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);
      const { owner } = request.auth.credentials;
      const { name } = request.payload;
      const playlistId = await this._service.addPlaylists(name, owner);
      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: { playlistId },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      //  Server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan di server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  //  get playlist
  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);
      return {
        status: 'success',
        data: { playlists },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      //  Server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan di server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  //  delete playlist based on id
  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);
      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      //  Server error
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan di server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = playlistsHandler;
