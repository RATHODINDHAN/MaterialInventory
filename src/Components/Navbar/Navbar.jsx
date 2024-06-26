import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ handleLogout }) => {


    return (
        <nav>
            <ul className='menu'>
                <div className="nav-links">
                    <li className="menu_list"><span className="front fas fa-home"></span><Link className='side' to="/">Home</Link></li>
                    <li className="menu_list"><span className="front fas fa-gauge-high"></span><Link className='side' to="/dashboard">DashBoard</Link></li>
                    <li className="menu_list"><span className="front fas fa-info"></span><Link className='side' to="/about">About</Link></li>
                    <li className="menu_list"><span className="front fas fa-solid fa-file-import"></span><Link className='side' to="/upload">Upload</Link></li>

                </div>
                <li>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;

