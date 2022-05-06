const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylists(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlists gagal ditambahkan.');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const result = await this._pool.query({
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
                    LEFT JOIN users ON users.id = playlists.owner
                    LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id 
                    WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    });
    return result.rows;
  }

  async getPlaylistsById(id) {
    const result = await this._pool.query({
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
                    LEFT JOIN users ON users.id = playlists.owner 
                    WHERE playlists.id = $1`,
      values: [id],
    });
    if (!result.rows.length) {
      throw new NotFoundError('Playlists tidak ditemukan');
    }
    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const result = await this._pool.query({
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    });
    if (!result.rows.length) {
      throw new NotFoundError('Playlists gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    // const query2 = {
    //   text: 'SELECT id FROM users WHERE id = $1',
    //   values: [owner],
    // };
    // const result2 = await this._pool.query(query2);
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlists tidak ditemukan');
    }
    // if (!result2.rows.length) {
    //   throw new NotFoundError('Playlists tidak ditemukan');
    // }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Tidak berhak mengakses source ini');
    }
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }
    return result.rows[0];
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId,
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
