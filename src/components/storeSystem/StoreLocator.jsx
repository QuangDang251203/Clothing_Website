// src/components/StoreLocatorEmbed.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/StoreLocator.css';

const API_STORES = 'http://localhost:8080/storeSystem/getAllStore';

export default function StoreLocator() {
    const [stores, setStores] = useState([]);
    const [active, setActive] = useState(null);

    useEffect(() => {
        fetch(API_STORES)
            .then(r => r.json())
            .then(res =>{
                const activeOnly = (res.data || []).filter(s => s.status === 1);
                setStores(activeOnly);
            })
            .catch(console.error);
    }, []);

    // Khi chọn store, build URL embed
    const makeEmbedUrl = (address) =>
        `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

    return (
        <div className="embed-container">
            <aside className="store-sidebar">
                <h3>Danh sách cửa hàng</h3>
                <ul>
                    {stores.map(store => (
                        <li
                            key={store.merchantCode}
                            className={active === store ? 'active' : ''}
                            onClick={() => setActive(store)}
                        >
                            <strong>{store.merchantName}</strong><br/>
                            {store.address}<br/>
                            <small>ĐT: {store.phone}</small>
                        </li>
                    ))}
                </ul>
            </aside>

            <section className="store-map-embed">
                {active ? (
                    <iframe
                        title="store-map"
                        src={makeEmbedUrl(active.address)}
                        frameBorder="0"
                        allowFullScreen
                    />
                ) : (
                    <div className="placeholder">
                        Chọn cửa hàng để xem bản đồ
                    </div>
                )}
            </section>
        </div>
    );
}
