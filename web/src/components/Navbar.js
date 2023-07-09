import React from 'react';
import { Link } from 'react-router-dom';
import Connect from './Connect';
import logonav from '../images/Algorand_Foundation.svg'

export default function Navbar() {
    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary" style={{ color: 'black', fontWeight: '500', position: 'relative', zIndex: '9999' }}>
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        <img src={logonav} alt="" />
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="/navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" aria-current="page" to="/">
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" aria-current="page" to="/buytickets">
                                    Buy Tickets
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/logevent">
                                    Log Event
                                </Link>
                            </li>
                            <li className="nav-item dropdown">
                                <Link
                                    className="nav-link dropdown-toggle"
                                    to="/myprofile"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ zIndex: '9999' }}
                                >
                                    My Profile
                                </Link>
                                <ul className="dropdown-menu" style={{ zIndex: '9999' }}>
                                    <li>
                                        <Link className="dropdown-item" to="/mytickets">
                                            My Tickets
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <Link className="dropdown-item" to="/myevents">
                                            My Events
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/checkin">
                                    Check In
                                </Link>
                            </li>
                        </ul>
                        <Connect />
                    </div>
                </div>
            </nav>
        </div>
    );
}
