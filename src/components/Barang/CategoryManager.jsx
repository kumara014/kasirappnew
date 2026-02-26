import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../config';
import { useNotification } from '../../context/NotificationContext';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { haptic } from '../../utils/haptics';
import './Menu.css'; // Re-using Menu css for consistency

const CategoryManager = ({ onClose, onUpdate }) => {
    const { notify } = useNotification();
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/categories');
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            notify('Gagal memuat kategori', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setSubmitting(true);
        try {
            const res = await apiFetch('/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_kategori: newCategory })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Gagal menambah kategori');
            }

            haptic.success();
            notify('Kategori berhasil ditambahkan', 'success');
            setNewCategory('');
            fetchCategories();
            onUpdate(); // Trigger parent update
        } catch (error) {
            notify(error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        haptic.impact();
        if (!confirm('Hapus kategori ini?')) return;

        try {
            const res = await apiFetch(`/categories/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Gagal menghapus kategori');

            haptic.success();
            notify('Kategori dihapus', 'success');
            fetchCategories();
            onUpdate(); // Trigger parent update
        } catch (error) {
            notify(error.message, 'error');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content menu-edit-modal">
                <div className="modal-top-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <button onClick={() => {
                        haptic.tap();
                        onClose();
                    }} className="nav-back-btn">
                        <ArrowLeft size={24} color="#1a202c" />
                    </button>
                    <h3 style={{ marginLeft: '10px' }}>Kelola Kategori</h3>
                </div>

                <div className="modal-body-scroll">
                    <form onSubmit={handleAdd} className="mockup-input-group" style={{ display: 'flex', gap: '10px' }}>
                        <div className="mockup-input-wrapper" style={{ flex: 1 }}>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Nama Kategori Baru"
                                disabled={submitting}
                            />
                        </div>
                        <button
                            type="submit"
                            className="manage-btn"
                            disabled={submitting || !newCategory.trim()}
                            style={{ background: 'var(--primary-brand)', color: 'white', border: 'none' }}
                        >
                            <Plus size={20} />
                        </button>
                    </form>

                    <div className="category-list" style={{ marginTop: '20px' }}>
                        {loading ? (
                            <p>Memuat...</p>
                        ) : (
                            <table className="menu-table">
                                <thead>
                                    <tr>
                                        <th>Nama Kategori</th>
                                        <th style={{ width: '50px' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <tr key={cat.id_kategori} style={{ cursor: 'default' }}>
                                            <td>{cat.nama_kategori}</td>
                                            <td>
                                                <button
                                                    className="delete-icon-btn"
                                                    style={{ position: 'static', width: '32px', height: '32px' }}
                                                    onClick={() => handleDelete(cat.id_kategori)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(categories || []).length === 0 && (
                                        <tr><td colSpan="2" style={{ textAlign: 'center' }}>Belum ada kategori</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;
