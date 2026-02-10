import React, { useState, useEffect } from 'react';
import './StokMutasi.css';
import { History, Package, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';
import { apiFetch } from '../../config';

const StokMutasi = () => {
    const [mutations, setMutations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMutations = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/stok-mutasi');
            const data = await res.json();
            setMutations(data);
        } catch (err) {
            console.error("Error fetching mutations:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMutations();
    }, []);

    return (
        <div className="mutation-container">
            <div className="mutation-content">
                <div className="mutation-header">
                    <div className="header-title">
                        <History size={24} color="var(--primary-brand)" />
                        <h2>Riwayat Mutasi Stok</h2>
                    </div>
                    <button className="refresh-btn" onClick={fetchMutations}>
                        <RefreshCcw size={16} />
                        <span>Refresh</span>
                    </button>
                </div>

                <div className="mutation-table-container">
                    <table className="mutation-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Barang</th>
                                <th>Jenis</th>
                                <th>Jumlah</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center">Memuat data...</td></tr>
                            ) : mutations.length === 0 ? (
                                <tr><td colSpan="5" className="text-center">Belum ada riwayat mutasi</td></tr>
                            ) : (
                                mutations.map((row) => (
                                    <tr key={row.id_mutasi}>
                                        <td className="date-cell">
                                            {new Date(row.created_at).toLocaleString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="product-cell">
                                            <div className="product-info">
                                                <Package size={16} color="#888" />
                                                <span>{row.barang?.nama_barang || 'Barang Terhapus'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`type-badge ${row.jenis}`}>
                                                {row.jenis === 'masuk' ? (
                                                    <><ArrowUpRight size={14} /> Masuk</>
                                                ) : (
                                                    <><ArrowDownLeft size={14} /> Keluar</>
                                                )}
                                            </span>
                                        </td>
                                        <td className={`amount-cell ${row.jenis}`}>
                                            {row.jenis === 'masuk' ? '+' : '-'}{row.jumlah}
                                        </td>
                                        <td className="desc-cell">{row.keterangan || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StokMutasi;
