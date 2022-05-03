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
      await this._songsService.getSongById({ id: songId });
      const songIdResult = await this._service.addSongsPlaylist(playlistId, songId);

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

  async getSongsFromPlaylistHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getSongsPlaylist({
      playlistId,
    });

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validateDeleteSongPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongPlaylist(playlistId, songId);

    return {
      status: 'success',
      message: `Lagu ${songId} berhasil dihapus dari Playlist ${playlistId}`,
    };
  }
}

module.exports = PlaylistSongsHandler;
