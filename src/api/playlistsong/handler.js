const ClientError = require('../../exceptions/ClientError');

class PlaylistSongsHandler {
  constructor(service, validator) {
    const {
      playlistSongsService,
      playlistService,
      songsService,
    } = service;
    this._service = playlistSongsService;
    this._playlistService = playlistService;
    this._songsService = songsService;
    this._validator = validator;

    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
  }

  // songs to playlist
  async postSongToPlaylistHandler(request, h) {
    try {
      this._validator.validatePostSongPlaylistPayload(request.payload);

      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(playlistId, id);
      await this._songsService.getSongById(songId);
      const songIdResult = await this._service.addSongToPlaylist({ playlistId, songId });

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke dalam Playlist',
        data: {
          songIdResult,
        },
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
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan di server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsFromPlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      const playlistDetail = await this._playlistService.getPlaylistsById(playlistId);
      const playlistSongs = await this._service.getSongsFromPlaylist(
        playlistId,
      );

      const playlist = { ...playlistDetail, songs: playlistSongs };
      return {
        status: 'success',
        data: {
          playlist,
        },
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
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan di server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      this._validator.validateDeleteSongPlaylistPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongFromPlaylist(playlistId, songId);
      return {
        status: 'success',
        message: `Lagu ${songId} berhasil dihapus dari Playlist ${playlistId}`,
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
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan di server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistSongsHandler;
