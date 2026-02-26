import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    background: 'var(--bg-app)'
                }}>
                    <h1 style={{ color: 'var(--status-red)', marginBottom: '10px' }}>Waduh! Sepertinya ada masalah.</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '400px' }}>
                        Aplikasi mengalami kesalahan sistem. Anda bisa mencoba menyegarkan halaman atau melaunching ulang data.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                background: 'var(--primary-brand)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Segarkan Halaman
                        </button>
                        <button
                            onClick={this.handleReset}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                background: 'var(--status-red)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Reset Data (Logout)
                        </button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <pre style={{
                            marginTop: '20px',
                            padding: '15px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            textAlign: 'left',
                            maxWidth: '90vw',
                            overflow: 'auto',
                            color: 'var(--text-primary)'
                        }}>
                            {this.state.error && this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
