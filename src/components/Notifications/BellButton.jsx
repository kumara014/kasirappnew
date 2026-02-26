import React from "react";
import { Bell } from "lucide-react";

export const BellButton = ({ count, onClick, hasNew }) => {
    return (
        <button
            onClick={onClick}
            className="bell-button"
            style={{
                position: "relative",
                width: 44,
                height: 44,
                borderRadius: 14,
                background: hasNew ? "var(--primary-light)" : "var(--bg-app-alt)",
                border: `1.5px solid ${hasNew ? "var(--primary-brand)" : "transparent"}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                color: hasNew ? "var(--primary-brand)" : "var(--text-tertiary)",
                boxShadow: hasNew ? "0 4px 12px rgba(74, 155, 173, 0.2)" : "none"
            }}
        >
            <style>{`
                .bell-button:active { transform: scale(0.9); }
                @keyframes bellPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                .badge-pulse { animation: bellPulse 1.5s ease-in-out infinite; }
            `}</style>

            <Bell size={22} fill={hasNew ? "var(--primary-brand)" : "none"} />

            {count > 0 && (
                <div
                    className={hasNew ? "badge-pulse" : ""}
                    style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        minWidth: 20,
                        height: 20,
                        borderRadius: 10,
                        background: "var(--status-red)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 5px",
                        border: "2px solid var(--bg-surface)"
                    }}
                >
                    {count > 9 ? "9+" : count}
                </div>
            )}
        </button>
    );
};
