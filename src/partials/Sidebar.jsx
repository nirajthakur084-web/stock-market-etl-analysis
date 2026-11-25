import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = 'default' }) {
  const location = useLocation();
  const { pathname } = location;
  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  const go = (id) => (e) => {
    e.preventDefault();
    setSidebarOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const itemCls = "block text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white truncate transition duration-150";
  const labelCls = "text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200";

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-xs'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between items-center mb-10 pr-3 sm:px-2">
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo + name */}
          <NavLink end to="/" className="flex items-center gap-3">
            <svg className="fill-violet-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width={32} height={32}>
              <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
            </svg>
            <span className="text-base font-bold text-gray-800 dark:text-gray-100 leading-tight lg:hidden lg:sidebar-expanded:block 2xl:block">
              Stock Market<br />ETL &amp; Analysis
            </span>
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">•••</span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Dashboard</span>
            </h3>
            <ul className="mt-3">
              <li className="pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]">
                <a href="#overview" onClick={go("overview")} className="block text-violet-500 truncate transition duration-150">
                  <div className="flex items-center">
                    <svg className="shrink-0 fill-current" width="18" height="18" viewBox="0 0 18 18"><path d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm4.5 9.563c0 .24-.174.562-.39.716l-6.94 4.96a1.125 1.125 0 0 1-1.53-.26L2.6 11.94a.9.9 0 0 1 .13-1.253l1.407-1.18a.9.9 0 0 1 1.27.13l1.12 1.342 4.556-3.916a1.125 1.125 0 0 1 1.592.162l.707.948c.076.1.118.224.118.39Z" /></svg>
                    <span className={labelCls}>Overview</span>
                  </div>
                </a>
              </li>
              <li className="pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0">
                <a href="#stocks" onClick={go("stocks")} className={itemCls}>
                  <div className="flex items-center">
                    <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500" width="18" height="18" viewBox="0 0 18 18"><path d="M17 0H1a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1ZM4 15H2V9h2v6ZM8 15H6V5h2v10Zm4 0h-2V3h2v12Zm4 0h-2V7h2v8Z" /></svg>
                    <span className={labelCls}>Stocks &amp; Indices</span>
                  </div>
                </a>
              </li>
              <li className="pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0">
                <a href="#price-chart" onClick={go("price-chart")} className={itemCls}>
                  <div className="flex items-center">
                    <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500" width="18" height="18" viewBox="0 0 18 18"><path d="M1 17a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14h14a1 1 0 1 1 0 2H1Zm14.707-9.707-4.5 4.5a1 1 0 0 1-1.414 0L7 8.586 3.707 11.88a1 1 0 1 1-1.414-1.415L6.293 6.46a1 1 0 0 1 1.414 0L10.5 9.254l3.793-3.793-1.293-.754a1 1 0 0 1 1-1.732l3 1.75a1 1 0 0 1 .5.866v3a1 1 0 1 1-2 0V7.293Z" /></svg>
                    <span className={labelCls}>Price Chart</span>
                  </div>
                </a>
              </li>
              <li className="pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0">
                <a href="#comparison" onClick={go("comparison")} className={itemCls}>
                  <div className="flex items-center">
                    <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500" width="18" height="18" viewBox="0 0 18 18"><path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1Zm-4 4h8v2H5V5Zm0 4h8v2H5V9Zm0 4h5v2H5v-2Z" /></svg>
                    <span className={labelCls}>Comparison</span>
                  </div>
                </a>
              </li>
              <li className="pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0">
                <a href="#quality" onClick={go("quality")} className={itemCls}>
                  <div className="flex items-center">
                    <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500" width="18" height="18" viewBox="0 0 18 18"><path d="M9 0 1 3v5c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V3L9 0Zm-1.6 13.6-3-3 1.4-1.4 1.6 1.6 4.8-4.8 1.4 1.4-6.2 6.2Z" /></svg>
                    <span className={labelCls}>ETL Data Quality</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">•••</span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Project</span>
            </h3>
            <ul className="mt-3">
              <li className="pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0">
                <a href="https://github.com/nirajthakur084-web/stock-market-etl-analysis" target="_blank" rel="noreferrer" className={itemCls}>
                  <div className="flex items-center">
                    <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500" width="18" height="18" viewBox="0 0 18 18"><path d="M9 .5A8.5 8.5 0 0 0 6.3 16.8c.4.07.55-.18.55-.4v-1.4c-2.24.49-2.71-1.08-2.71-1.08-.37-.93-.9-1.18-.9-1.18-.73-.5.06-.49.06-.49.81.06 1.24.83 1.24.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.66-.9-3.66-3.97 0-.88.31-1.6.83-2.16-.09-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.17 1.93.08 2.13.52.56.83 1.28.83 2.16 0 3.08-1.88 3.76-3.67 1.95.29.25.54.74.54 1.5v2.22c0 .22.15.47.55.4A8.5 8.5 0 0 0 9 .5Z" /></svg>
                    <span className={labelCls}>GitHub Repository</span>
                  </div>
                </a>
              </li>
              <li className="pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0">
                <a href="https://finance.yahoo.com" target="_blank" rel="noreferrer" className={itemCls}>
                  <div className="flex items-center">
                    <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500" width="18" height="18" viewBox="0 0 18 18"><path d="M9 0a9 9 0 1 0 0 18A9 9 0 0 0 9 0Zm7 6h-2.6a15.6 15.6 0 0 0-1.3-3.6A7.1 7.1 0 0 1 16 6ZM9 2.1c.7.8 1.6 2.1 2.1 3.9H6.9C7.4 4.2 8.3 2.9 9 2.1ZM2 12a7 7 0 0 1 0-6h2.6c-.2 1-.3 2-.3 3s.1 2 .3 3H2Zm1 4.1A7.1 7.1 0 0 1 6.9 15a15.6 15.6 0 0 0 1.3 3.6A7.1 7.1 0 0 1 3 16Zm3-4.1c-.2-1-.3-2-.3-3s.1-2 .3-3h6c.2 1 .3 2 .3 3s-.1 2-.3 3H6Zm3 4c-.7-.8-1.6-2.1-2.1-3.9h4.2C10.6 13.8 9.7 15.1 9 16Zm2.2-1a15.6 15.6 0 0 0 1.3-3.6H16a7.1 7.1 0 0 1-4.8 3.6Z" /></svg>
                    <span className={labelCls}>Data Source — Yahoo Finance</span>
                  </div>
                </a>
              </li>
            </ul>
            <div className="px-3 mt-6 lg:hidden lg:sidebar-expanded:block 2xl:block">
              <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl p-4">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">Niraj Thakur</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  ETL pipeline: Yahoo Finance → pandas → SQLite → this dashboard. 1 year of daily OHLCV, quality-checked.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
