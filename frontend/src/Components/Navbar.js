import React from 'react';
import {Container, Navbar, Nav} from 'react-bootstrap';
import './navbar.css';

export default function NavigationBar({active='inventory'}) {
    return (
        <div className='navbar-container'>
            <Navbar expand="lg" bg='warning'>
                <Container className='nav-container'>
                    <Navbar.Brand href="/">Inventory Management Tool</Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            <Nav.Link  className={active=='inventory'?'active':''} href="/inventory">Inventory</Nav.Link>
                            <Nav.Link  className={active=='orders'?'active':''} href="/orders">Orders</Nav.Link>
                            <Nav.Link  className={active=='checkout'?'active':''} href="/checkout">CheckOut</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
}