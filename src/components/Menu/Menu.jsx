import React, { useState } from 'react';
import './Menu.css';
import { Search } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config';
import { useNotification } from '../../context/NotificationContext';
import SafeImage from '../Common/SafeImage';

const CATEGORIES = ['All', 'Makanan', 'Minuman'];

const formatNumber = (val) => {
    if (!val && val !== 0) return '';
    let str = val.toString().replace(/,/g, '');
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumber = (val) => {
    return val.replace(/,/g, '');
};

// Mock fallback
const MOCK_MENU_ITEMS = [
];

const Menu = () => {
    const { notify } = useNotification();
    const { productsData, loadingProducts, refreshProducts, setProductsData } = useData();
    const [activeCategory, setActiveCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New Item State (reused for Edit)
    const [newItem, setNewItem] = useState({ id_barang: null, nama_barang: '', harga: '', stok: 0, gambar: null });
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    React.useEffect(() => {
        refreshProducts(true); // silent refresh
    }, [refreshProducts]);

    const menuItems = productsData;
    const loading = loadingProducts && productsData.length === 0;

    const handleSaveItem = () => {
        const isEdit = !!newItem.id_barang;
        const url = isEdit
            ? `/barang/${newItem.id_barang}`
            : `/barang`;

        const formData = new FormData();
        formData.append('nama_barang', newItem.nama_barang);
        formData.append('harga', newItem.harga);
        formData.append('stok', newItem.stok);
        if (selectedFile) {
            formData.append('gambar', selectedFile);
        }
        if (isEdit) {
            formData.append('_method', 'PUT');
        }

        apiFetch(url, {
            method: 'POST',
            body: formData
        })
            .then(async res => {
                const data = await res.json().catch(() => ({ message: 'Format respons tidak valid (Bukan JSON)' }));
                if (!res.ok) {
                    throw new Error(data.message || `Server error: ${res.status}`);
                }
                return data;
            })
            .then(data => {
                if (data.id_barang || data.nama_barang || data.message?.includes('berhasil')) {
                    notify(isEdit ? 'Barang berhasil diupdate!' : 'Barang berhasil ditambahkan!', 'success');
                    setIsModalOpen(false);
                    setNewItem({ id_barang: null, nama_barang: '', harga: '', stok: 0, gambar: null });
                    setSelectedFile(null);
                    setImagePreview(null);
                    refreshProducts(true);
                } else {
                    notify(`Gagal menyimpan produk: ${data.message || 'Error'}`, 'error');
                }
            })
            .catch(err => notify('Gagal menyimpan: ' + err.message, 'error'));
    };

    const handleDeleteItem = async (id) => {
        if (!confirm(`Yakin ingin menghapus item ini?`)) return;

        try {
            const res = await apiFetch(`/barang/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Gagal menghapus produk');

            notify('Berhasil menghapus produk!', 'success');
            refreshProducts(true);
        } catch (err) {
            notify('Gagal menghapus produk', 'error');
        }
    };


    const openEditModal = (item) => {
        setNewItem({ ...item });
        setSelectedFile(null);
        setImagePreview(item.gambar); // Just pass the path
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setNewItem({ id_barang: null, nama_barang: '', harga: '', stok: 0, gambar: null });
        setSelectedFile(null);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Updated Filtering Logic
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="menu-container">
            <div className="menu-header">

                <div className="header-actions-row">
                    <div className="search-bar">
                        <Search size={20} color="#888" />
                        <input
                            type="text"
                            placeholder="Cari Barang..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1 }}></div>
                    <button className="manage-btn" onClick={openAddModal} style={{ background: 'var(--primary-brand)', color: 'white', border: 'none' }}>
                        + Tambah Barang
                    </button>
                </div>
            </div>

            <div className="menu-list-container">
                <table className="menu-table">
                    <thead>
                        <tr>
                            <th>Gambar</th>
                            <th>Nama Barang</th>
                            <th>Harga</th>
                            <th>Stok</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    {!isSelectionMode && <td><div className="skeleton skeleton-circle"></div></td>}
                                </tr>
                            ))
                        ) : (
                            filteredItems.length === 0 ? <tr><td colSpan="6">Tidak ada barang</td></tr> :
                                filteredItems.map(item => (
                                    <tr key={item.id_barang}>
                                        <td>
                                            <div className="table-img-container">
                                                <SafeImage
                                                    src={item.gambar}
                                                    alt={item.nama_barang}
                                                    fallback={<div className="no-img-placeholder">🍽️</div>}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontWeight: 600 }}>{item.nama_barang}</span>
                                            </div>
                                        </td>
                                        <td>Rp {Number(item.harga).toLocaleString()}</td>
                                        <td>
                                            <span style={{ fontWeight: 'bold', color: Number(item.stok) > 0 ? '#73AABE' : '#EA5455' }}>
                                                {item.stok || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="icon-btn edit" onClick={() => openEditModal(item)}>
                                                    ✎
                                                </button>
                                                <button className="icon-btn delete" onClick={() => handleDeleteItem(item.id_barang)}>
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{newItem.id_barang ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
                        <div className="input-group">
                            <label>Nama Barang</label>
                            <input
                                type="text" placeholder="Contoh: Nasi Goreng"
                                value={newItem.nama_barang} onChange={e => setNewItem({ ...newItem, nama_barang: e.target.value })}
                            />
                        </div>

                        <div className="form-row" style={{ display: 'flex', gap: 10 }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Harga (Rp)</label>
                                <input
                                    type="text" placeholder="0"
                                    value={formatNumber(newItem.harga)}
                                    onChange={e => {
                                        const rawValue = parseNumber(e.target.value);
                                        if (/^\d*$/.test(rawValue)) {
                                            setNewItem({ ...newItem, harga: rawValue });
                                        }
                                    }}
                                />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Stok</label>
                                <input
                                    type="number" placeholder="0"
                                    value={newItem.stok} onChange={e => setNewItem({ ...newItem, stok: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Gambar Produk</label>
                            <div className="image-upload-wrapper">
                                {imagePreview && (
                                    <div className="image-preview-container">
                                        <SafeImage
                                            src={imagePreview}
                                            alt="Preview"
                                            fallback={<div className="no-img-placeholder">🍽️</div>}
                                        />
                                        <button className="remove-img-btn" onClick={() => { setSelectedFile(null); setImagePreview(null); }}>×</button>
                                    </div>
                                )}
                                <label className="file-upload-label">
                                    {imagePreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                                    <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                </label>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setIsModalOpen(false)}>Batal</button>
                            <button className="save-btn" onClick={handleSaveItem}>Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
