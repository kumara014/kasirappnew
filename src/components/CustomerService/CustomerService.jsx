import React from 'react';
import { MessageCircleMore, Phone, ExternalLink } from 'lucide-react';
import './CustomerService.css';

const CustomerService = () => {
    const handleWaClick = () => {
        window.open('https://wa.me/628123456789', '_blank');
    };

    return (
        <div className="cs-view-container">
            <header className="cs-view-header">
                <h1>Customer Service</h1>
                <p>Kami siap membantu kendala anda</p>
            </header>

            <div className="cs-view-content">
                <div className="cs-main-card card">
                    <div className="cs-visual">
                        <div className="cs-icon-blob">
                            <MessageCircleMore size={48} />
                        </div>
                    </div>
                    <div className="cs-text-section">
                        <h2>Halo user!</h2>
                        <p>Apa yang bisa dibantu?</p>
                        <div className="cs-cta-group">
                            <button className="wa-button" onClick={handleWaClick}>
                                <Phone size={18} />
                                <span>Hubungi WA: 08123456789</span>
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="cs-info-grid">
                    <div className="cs-info-item card">
                        <h3>Waktu Operasional</h3>
                        <p>Senin - Minggu</p>
                        <p className="highlight">08:00 - 22:00 WIB</p>
                    </div>
                    <div className="cs-info-item card">
                        <h3>Respon Cepat</h3>
                        <p>Tim kami akan membalas pesan anda dalam hitungan menit.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerService;
