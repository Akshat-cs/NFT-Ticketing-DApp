import React from 'react';
import logo from '../images/algorand_logo_mark_black.png';

export default function Home() {
    return (
        <>
            <div className='d-flex container'>
                <div className="container">
                    <div>
                        <h2 style={{ fontSize: '5em', fontWeight: '700' }}>
                            NFTs -<br /> New, Fairer<br /> Ticketing.
                        </h2>
                    </div>
                    <div style={{ width: '400px', fontSize: '1.25em', fontWeight: '300' }}>
                        <p>An NFT event ticketing marketplace helping artists foster closer connections with fans, eliminating fraud and reducing the impact of scalping.</p>
                    </div>
                </div>
                <div className="container" style={{ maxWidth: '500px' }}>
                    <img src={logo} alt="logo" style={{ width: '100%', height: 'auto', filter: 'invert(1)' }} />
                </div>
            </div>
        </>
    );
}
