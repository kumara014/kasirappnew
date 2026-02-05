import React, { useState } from 'react';
import './Menu.css';
import { Search } from 'lucide-react';
import { useData } from '../../context/DataContext';
import API_BASE_URL, { apiFetch } from '../../config';
import { useNotification } from '../../context/NotificationContext';

const CATEGORIES = ['All', 'Makanan', 'Minuman'];

// Mock fallback
const MOCK_MENU_ITEMS = [
];

const Menu = () => {
    const { notify } = useNotification();
    const { productsData, loadingProducts, refreshProducts, setProductsData } = useData();
    const [activeCategory, setActiveCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New Item State (reused for Edit)
    const [newItem, setNewItem] = useState({ id_barang: null, nama_barang: '', harga: '', stok: 0 });

    React.useEffect(() => {
        refreshProducts(true); // silent refresh
    }, [refreshProducts]);

    const menuItems = productsData;
    const loading = loadingProducts && productsData.length === 0;

    const handleSaveItem = () => {
        const isEdit = !!newItem.id_barang;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit
            ? `${API_BASE_URL}/barang/${newItem.id_barang}`
            : `${API_BASE_URL}/barang`;

        apiFetch(url, {
            method: method,
            body: JSON.stringify(newItem)
        })
            .then(res => res.json())
            .then(data => {
                if (data.id_barang || data.nama_barang) {
                    notify(isEdit ? 'Barang berhasil diupdate!' : 'Barang berhasil ditambahkan!', 'success');
                    setIsModalOpen(false);
                    setNewItem({ id_barang: null, nama_barang: '', harga: '', stok: 0 });
                    refreshProducts(true);
                } else {
                    notify(`Gagal menyimpan produk`, 'error');
                }
            })
            .catch(err => notify('Gagal menyimpan: ' + err, 'error'));
    };

    const handleDeleteSelected = async () => {
        if (!confirm(`Yakin ingin menghapus ${selectedIds.length} item?`)) return;

        try {
            // Delete each product individually using DELETE method
            await Promise.all(
                selectedIds.map(id =>
                    apiFetch(`${API_BASE_URL}/barang/${id}`, { method: 'DELETE' })
                )
            );

            notify('Berhasil menghapus produk!', 'success');
            setSelectedIds([]);
            setIsSelectionMode(false);
            refreshProducts(true);
        } catch (err) {
            notify('Gagal menghapus produk', 'error');
        }
    };

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const openEditModal = (item) => {
        setNewItem({ ...item });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setNewItem({ id_barang: null, nama_barang: '', harga: '', stok: 0 });
        setIsModalOpen(true);
    };

    // Updated Filtering Logic
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="menu-container">
            <div className="menu-header">
                <h2>List Barang</h2>

                <div className="header-actions-row">
                    {isSelectionMode ? (
                        <>
                            <button className="delete-badge-btn" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
                                Hapus ({selectedIds.length})
                            </button>
                            <button className="cancel-btn" onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }}>
                                Batal
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="search-bar">
                                <Search size={20} color="#888" />
                                <input
                                    type="text"
                                    placeholder="Cari Barang..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {/* Category Tabs Removed as per request */}
                            <div style={{ flex: 1 }}></div>
                            <button className="manage-btn" onClick={openAddModal} style={{ background: 'var(--primary-brand)', color: 'white', border: 'none' }}>
                                + Tambah Barang
                            </button>
                            <button className="manage-btn" onClick={() => setIsSelectionMode(true)}>
                                Hapus
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="menu-list-container">
                <table className="menu-table">
                    <thead>
                        <tr>
                            {isSelectionMode && <th>Select</th>}
                            <th>Nama Barang</th>
                            <th>Harga</th>
                            <th>Stok</th>
                            {!isSelectionMode && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    {isSelectionMode && <td><div className="skeleton skeleton-circle"></div></td>}
                                    <td><div className="skeleton skeleton-text" style={{ width: '80%' }}></div></td>
                                    <td><div className="skeleton skeleton-text" style={{ width: '60%' }}></div></td>
                                    <td><div className="skeleton skeleton-text" style={{ width: '40%' }}></div></td>
                                    <td><div className="skeleton skeleton-text" style={{ width: '30%' }}></div></td>
                                    {!isSelectionMode && <td><div className="skeleton skeleton-circle"></div></td>}
                                </tr>
                            ))
                        ) : (
                            filteredItems.length === 0 ? <tr><td colSpan="6">Tidak ada barang</td></tr> :
                                filteredItems.map(item => (
                                    <tr key={item.id_barang} className={selectedIds.includes(item.id_barang) ? 'selected-row' : ''} onClick={() => isSelectionMode ? toggleSelection(item.id_barang) : null}>
                                        {isSelectionMode && (
                                            <td>
                                                <div className={`selection-checkbox ${selectedIds.includes(item.id_barang) ? 'checked' : ''}`}>
                                                    {selectedIds.includes(item.id_barang) && '✓'}
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontWeight: 600 }}>{item.nama_barang}</span>
                                            </div>
                                        </td>
                                        <td>Rp {Number(item.harga).toLocaleString()}</td>
                                        <td>
                                            <span style={{ fontWeight: 'bold', color: Number(item.stok) > 0 ? '#28C76F' : '#EA5455' }}>
                                                {item.stok || 0}
                                            </span>
                                        </td>
                                        {!isSelectionMode && (
                                            <td>
                                                <button className="icon-btn edit" onClick={(e) => { e.stopPropagation(); openEditModal(item); }}>
                                                    ✎
                                                </button>
                                            </td>
                                        )}
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
                                    type="number" placeholder="0"
                                    value={newItem.harga} onChange={e => setNewItem({ ...newItem, harga: e.target.value })}
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
                            <label>Kategori</label>
                            <select
                                value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                            >
                                <option value="Makanan">Makanan</option>
                                <option value="Minuman">Minuman</option>
                            </select>
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
