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
                    background: '#f8f9fd'
                }}>
                    <h1 style={{ color: '#ff4d4f', marginBottom: '10px' }}>Waduh! Sepertinya ada masalah.</h1>
                    <p style={{ color: '#718096', marginBottom: '20px', maxWidth: '400px' }}>
                        Aplikasi mengalami kesalahan sistem. Anda bisa mencoba menyegarkan halaman atau melaunching ulang data.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                background: '#73AABE',
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
                                background: '#ff4d4f',
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
                            background: '#fff',
                            border: '1px solid #edf2f7',
                            borderRadius: '8px',
                            fontSize: '12px',
                            textAlign: 'left',
                            maxWidth: '90vw',
                            overflow: 'auto'
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
