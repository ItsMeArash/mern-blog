import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import {BrowserRouter} from "react-router-dom";
import "./i18n.js";
import Loader from "./components/loader.component.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
        <React.Suspense fallback={<Loader/>}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </React.Suspense>,
)