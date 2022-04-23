const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._albums = [];
  }

  addAlbum({ name, year }) {
    const id = nanoid(16);
    const newAlbum = {
      id, name, year,
    };
    this._albums.push(newAlbum);
    const isSuccess = this._albums.filter((album) => album.id === id).length > 0;
    if (!isSuccess) {
      throw new InvariantError('Album Gagal ditambahkan');
    }
    return id;
  }

  getAlbumById(id) {
    const album = this._albums.filter((n) => n.id === id)[0];
    if (!album) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return album;
  }

  async editAlbumById(id, { name, year }) {
    const index = this._albums.findIndex((album) => album.id === id);

    if (index === -1) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    this._albums[index] = {
      ...this._albums[index],
      name,
      year,
    };
  }

  deleteAlbumById(id) {
    const index = this._albums.findIndex((album) => album.id === id);
    if (index === -1) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
    this._albums.splice(index, 1);
  }
}

module.exports = AlbumsService;
