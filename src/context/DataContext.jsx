import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../config';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [productsData, setProductsData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [loadingDashboard, setLoadingDashboard] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const refreshDashboard = useCallback(async (silent = false) => {
        if (!silent) setLoadingDashboard(true);
        try {
            const res = await apiFetch('/dashboard');
            const data = await res.json();
            setDashboardData(data);
        } catch (err) {
            console.error("Error fetching dashboard:", err);
        } finally {
            if (!silent) setLoadingDashboard(false);
        }
    }, []);

    const refreshProducts = useCallback(async (silent = false) => {
        if (!silent) setLoadingProducts(true);
        try {
            const res = await apiFetch('/barang');
            const data = await res.json();
            setProductsData(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            if (!silent) setLoadingProducts(false);
        }
    }, []);

    const refreshOrders = useCallback(async (silent = false) => {
        if (!silent) setLoadingOrders(true);
        try {
            const res = await apiFetch('/transaksi');
            const data = await res.json();
            setOrdersData(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            if (!silent) setLoadingOrders(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        refreshDashboard();
        refreshProducts();
        refreshOrders();
    }, [refreshDashboard, refreshProducts, refreshOrders]);

    const value = {
        dashboardData,
        productsData,
        ordersData,
        loadingDashboard,
        loadingProducts,
        loadingOrders,
        refreshDashboard,
        refreshProducts,
        refreshOrders,
        setProductsData,
        setOrdersData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
