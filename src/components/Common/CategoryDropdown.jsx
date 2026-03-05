import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Layers } from 'lucide-react';
import { haptic } from '../../utils/haptics';

const TEAL = "var(--primary-brand)";
const TEAL_LIGHT = "var(--primary-light)";

const CAT_ICONS = {
    'makanan': '🍜',
    'minuman': '💧',
    'snack': '🍪',
    'sembako': '🌾',
    'perawatan': '🧴'
};

const getIcon = (catName) => CAT_ICONS[(catName || "").toLowerCase()] || "📦";

const CategoryDropdown = ({ categories, value, onChange, placeholder = "Semua Kategori" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

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

    const handleSelect = (val) => {
        haptic.impact();
        onChange(val);
        setIsOpen(false);
    };

    const isAll = !value || value === 'All';
    const activeCat = categories.find(c => String(c.id_kategori) === String(value));
    const displayLabel = isAll ? placeholder : (activeCat ? activeCat.nama_kategori : placeholder);
    const displayIcon = isAll ? <Layers size={16} /> : <span>{getIcon(displayLabel)}</span>;

    return (
        <div style={{ position: 'relative', width: '100%' }} ref={containerRef}>
            <div
                onClick={toggleOpen}
                style={{
                    padding: "12px 16px",
                    border: "1.5px solid var(--border-strong)",
                    borderRadius: 14,
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    outline: isOpen ? `2px solid ${TEAL}` : "none",
                    borderColor: isOpen ? TEAL : "var(--border-strong)",
                    boxShadow: isOpen ? `0 0 0 4px ${TEAL}11` : "none",
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: isAll ? 'var(--bg-app-alt)' : TEAL_LIGHT,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isAll ? 'var(--text-tertiary)' : TEAL
                    }}>
                        {displayIcon}
                    </div>
                    <span>{displayLabel}</span>
                </div>
                <ChevronDown
                    size={18}
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        color: isOpen ? TEAL : "var(--text-tertiary)"
                    }}
                />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    background: 'var(--bg-surface)',
                    borderRadius: 16,
                    padding: 8,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
                    animation: 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid var(--border-light)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    <style>{`
                        @keyframes popIn {
                            from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                            to { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `}</style>

                    {/* Option: All */}
                    <DropdownItem
                        label="Semua Kategori"
                        icon={<Layers size={14} />}
                        active={isAll}
                        onClick={() => handleSelect('All')}
                    />

                    {categories.map((cat) => (
                        <DropdownItem
                            key={cat.id_kategori}
                            label={cat.nama_kategori}
                            icon={<span>{getIcon(cat.nama_kategori)}</span>}
                            active={String(value) === String(cat.id_kategori)}
                            onClick={() => handleSelect(cat.id_kategori)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DropdownItem = ({ label, icon, active, onClick }) => (
    <div
        onClick={onClick}
        style={{
            padding: '10px 12px',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: active ? TEAL_LIGHT : 'transparent',
            color: active ? TEAL : 'var(--text-primary)',
            transition: 'all 0.15s',
            marginBottom: 4,
            fontWeight: active ? 700 : 500,
            fontSize: 14
        }}
        onMouseEnter={(e) => !active && (e.currentTarget.style.background = 'var(--bg-app-alt)')}
        onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
                width: 24, height: 24, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 14, opacity: active ? 1 : 0.7
            }}>
                {icon}
            </div>
            <span>{label}</span>
        </div>
        {active && <Check size={16} />}
    </div>
);

export default CategoryDropdown;
