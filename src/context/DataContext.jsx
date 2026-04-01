import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../config';
import { preloadImage } from '../components/Common/SafeImage';

const DataContext = createContext();

const handleUnauthorized = () => {
    localStorage.clear();
    window.location.reload();
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children, user }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [productsData, setProductsData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [loadingDashboard, setLoadingDashboard] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const [productsPagination, setProductsPagination] = useState(null);
    const [ordersPagination, setOrdersPagination] = useState(null);

    const refreshDashboard = useCallback(async (silent = false) => {
        if (!localStorage.getItem('pos_token')) return;
        if (!silent) setLoadingDashboard(true);
        try {
            const res = await apiFetch('/dashboard');
            if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }
            const data = await res.json();
            setDashboardData(data);
        } catch (err) {
            console.error("Error fetching dashboard:", err);
        } finally {
            if (!silent) setLoadingDashboard(false);
        }
    }, []);

    const refreshProducts = useCallback(async (silent = false) => {
        if (!localStorage.getItem('pos_token')) return;
        if (!silent) setLoadingProducts(true);
        try {
            const res = await apiFetch('/barang');
            if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }
            const data = await res.json();
            // Laravel pagination returns data in .data
            const pData = Array.isArray(data.data) ? data.data : [];
            setProductsData(pData);

            // Pre-fetch images
            pData.forEach(p => {
                if (p.gambar) preloadImage(p.gambar);
            });

            setProductsPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                next_page_url: data.next_page_url,
                total: data.total ?? null
            });
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            if (!silent) setLoadingProducts(false);
        }
    }, []);

    const fetchMoreProducts = useCallback(async () => {
        if (!productsPagination?.next_page_url || loadingProducts) return;
        setLoadingProducts(true);
        try {
            // Extract the query part or use the full URL if apiFetch handles it
            const url = productsPagination.next_page_url.split('/api')[1];
            const res = await apiFetch(url);
            if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }
            const data = await res.json();
            const newItems = data.data || [];
            setProductsData(prev => [...prev, ...newItems]);

            // Pre-fetch new images
            newItems.forEach(p => {
                if (p.gambar) preloadImage(p.gambar);
            });

            setProductsPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                next_page_url: data.next_page_url,
                total: data.total ?? null
            });
        } catch (err) {
            console.error("Error fetching more products:", err);
        } finally {
            setLoadingProducts(false);
        }
    }, [productsPagination, loadingProducts]);

    const refreshOrders = useCallback(async (silent = false, filters = {}) => {
        if (!localStorage.getItem('pos_token')) return;
        if (!silent) setLoadingOrders(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const url = `/transaksi${queryParams ? `?${queryParams}` : ''}`;
            const res = await apiFetch(url);
            if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }
            const data = await res.json();
            setOrdersData(Array.isArray(data.data) ? data.data : []);
            setOrdersPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                next_page_url: data.next_page_url
            });
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            if (!silent) setLoadingOrders(false);
        }
    }, []);

    const fetchMoreOrders = useCallback(async () => {
        if (!ordersPagination?.next_page_url || loadingOrders) return;
        setLoadingOrders(true);
        try {
            const url = ordersPagination.next_page_url.split('/api')[1];
            const res = await apiFetch(url);
            if (res.status === 401 || res.status === 403) { handleUnauthorized(); return; }
            const data = await res.json();
            setOrdersData(prev => [...prev, ...(data.data || [])]);
            setOrdersPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                next_page_url: data.next_page_url
            });
        } catch (err) {
            console.error("Error fetching more orders:", err);
        } finally {
            setLoadingOrders(false);
        }
    }, [ordersPagination, loadingOrders]);

    const performRestock = useCallback(async (productId, qty) => {
        try {
            const res = await apiFetch('/stok-mutasi', {
                method: 'POST',
                body: JSON.stringify({
                    id_barang: productId,
                    jenis: 'masuk',
                    jumlah: qty,
                    keterangan: 'Restok lewat notifikasi'
                })
            });
            if (res.ok) {
                // Refresh local data
                refreshProducts(true);
                refreshDashboard(true);
                return { success: true };
            }
            return { success: false, message: 'Gagal melakukan restok' };
        } catch (err) {
            console.error("Restock error:", err);
            return { success: false, message: err.message };
        }
    }, [refreshProducts, refreshDashboard]);

    const lowStockItems = React.useMemo(() => {
        return (productsData || []).map(p => {
            const stock = Number(p.stok);
            const minStock = Number(p.stok_minimum || 5);

            let level = 'aman';
            if (stock === 0) level = 'habis';
            else if (stock <= minStock * 0.5) level = 'kritis';
            else if (stock <= minStock) level = 'menipis';

            return { ...p, level };
        }).filter(p => p.level !== 'aman');
    }, [productsData]);

    // Initial fetch when user logs in
    useEffect(() => {
        if (user) {
            refreshDashboard();
            refreshProducts();
            refreshOrders();
        }
    }, [refreshDashboard, refreshProducts, refreshOrders, user]);

    const value = React.useMemo(() => ({
        dashboardData,
        productsData,
        ordersData,
        productsPagination,
        ordersPagination,
        lowStockItems,
        loadingDashboard,
        loadingProducts,
        loadingOrders,
        refreshDashboard,
        refreshProducts,
        refreshOrders,
        fetchMoreProducts,
        fetchMoreOrders,
        performRestock,
        setProductsData,
        setOrdersData,
        user
    }), [
        dashboardData, productsData, ordersData,
        productsPagination, ordersPagination, lowStockItems,
        loadingDashboard, loadingProducts, loadingOrders,
        refreshDashboard, refreshProducts, refreshOrders,
        fetchMoreProducts, fetchMoreOrders, performRestock,
        user
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
