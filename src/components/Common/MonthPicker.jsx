import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { haptic } from '../../utils/haptics';

const TEAL = "var(--primary-brand)";
const TEAL_LIGHT = "var(--primary-light)";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const MonthPicker = ({ value, onChange, placeholder = "Pilih Bulan" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Initial year and month from value (YYYY-MM)
    const initialDate = value ? new Date(value + "-01") : new Date();
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());

    const selectedDate = value ? new Date(value + "-01") : null;
    const selectedMonth = selectedDate ? selectedDate.getMonth() : -1;
    const selectedYear = selectedDate ? selectedDate.getFullYear() : -1;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => {
        haptic.tap();
        setIsOpen(!isOpen);
    };

    const handleMonthClick = (monthIndex) => {
        haptic.impact();
        // Format to YYYY-MM
        const monthStr = (monthIndex + 1).toString().padStart(2, '0');
        const newValue = `${viewYear}-${monthStr}`;
        onChange(newValue);
        setIsOpen(false);
    };

    const changeYear = (delta) => {
        haptic.tap();
        setViewYear(viewYear + delta);
    };

    const displayValue = value ? (() => {
        const [y, m] = value.split('-');
        return `${MONTHS[parseInt(m) - 1]} ${y}`;
    })() : placeholder;

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '200px' }} ref={containerRef}>
            <div
                onClick={toggleOpen}
                style={{
                    padding: "10px 14px",
                    border: "1.5px solid var(--border-strong)",
                    borderRadius: 12,
                    background: "var(--bg-surface-alt)",
                    color: value ? "var(--text-primary)" : "var(--text-tertiary)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    outline: isOpen ? `2px solid ${TEAL}` : "none",
                    borderColor: isOpen ? TEAL : "var(--border-strong)",
                    boxShadow: isOpen ? `0 0 0 4px ${TEAL}11` : "none",
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.background = "var(--bg-surface)"; }
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "var(--bg-surface-alt)"; }
                }}
            >
                <span>{displayValue}</span>
                <CalendarIcon size={16} color={isOpen ? TEAL : "var(--text-tertiary)"} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    zIndex: 1000,
                    background: 'var(--bg-surface)',
                    borderRadius: 16,
                    padding: 16,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.1)',
                    width: 240,
                    animation: 'popIn 0.2s ease-out',
                    border: '1px solid var(--border-light)'
                }}>
                    <style>{`
                        @keyframes popIn {
                            from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                            to { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `}</style>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <button onClick={() => changeYear(-1)} style={yearBtnStyle}><ChevronLeft size={18} /></button>
                        <span style={{ fontSize: 16, fontWeight: 800, color: TEAL }}>{viewYear}</span>
                        <button onClick={() => changeYear(1)} style={yearBtnStyle}><ChevronRight size={18} /></button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        {MONTHS.map((m, i) => {
                            const isSelected = selectedMonth === i && selectedYear === viewYear;
                            return (
                                <button
                                    key={m}
                                    onClick={() => handleMonthClick(i)}
                                    style={{
                                        padding: '12px 0',
                                        borderRadius: 12,
                                        border: 'none',
                                        background: isSelected ? TEAL : 'transparent',
                                        color: isSelected ? '#fff' : 'var(--text-primary)',
                                        fontSize: 14,
                                        fontWeight: isSelected ? 800 : 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        fontFamily: 'inherit'
                                    }}
                                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = TEAL_LIGHT)}
                                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                haptic.tap();
                                const now = new Date();
                                const year = now.getFullYear();
                                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                                onChange(`${year}-${month}`);
                                setIsOpen(false);
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: TEAL,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            Bulan Ini
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const yearBtnStyle = {
    padding: 6,
    borderRadius: 8,
    border: 'none',
    background: 'var(--bg-app-alt)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
};

export default MonthPicker;
