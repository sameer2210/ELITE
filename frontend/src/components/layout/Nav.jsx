import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { asynclogoutuser } from '../../store/actions/userActions';
import { useProjectSearch } from '../../hooks/projectHook/useProjectSearch';
import ProjectSearchBar from '../search/ProjectSearchBar';
import ProjectSearchOverlay from '../search/ProjectSearchOverlay';
import {
  NAVIGATION,
  NAV_ORDER,
  SEARCH_SUGGESTIONS,
} from '../../config/navigation.config';
import {
  Search,
  User,
  Menu,
  X,
  Folder,
  Bookmark,
  Upload,
  Bell,
  ChevronDown,
} from 'lucide-react';

const NavDropdown = memo(({ menuItem, activeDropdown, handleMouseEnter }) => {
  const isActive = activeDropdown === menuItem.key;
  const hasMega = Boolean(menuItem.mega);

  return (
    <div
      key={menuItem.key}
      className="relative"
      onMouseEnter={() => handleMouseEnter(menuItem.key)}
    >
      <NavLink
        to={menuItem.path}
        className={`flex items-center space-x-1 text-sm font-semibold transition-colors py-2 ${
          isActive ? 'text-white' : 'text-gray-200 hover:text-white'
        }`}
        onFocus={() => handleMouseEnter(menuItem.key)}
        aria-haspopup={hasMega ? 'true' : undefined}
        aria-expanded={hasMega ? isActive : undefined}
        tabIndex={0}
      >
        <span>{menuItem.label}</span>
      </NavLink>
    </div>
  );
});

NavDropdown.displayName = 'NavDropdown';

const NavMegaMenu = memo(({ data }) => {
  if (!data) return null;

  const featuredItems = data.featured?.items || data.featured?.brands || [];

  return (
    <div className="p-6 grid grid-cols-4 gap-6">
      {/* Featured Section */}
      {featuredItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-700 pb-2">
            {data.featured.title}
          </h3>
          <div className="space-y-2">
            {featuredItems.map((item, index) => (
              <button
                key={index}
                className="block text-sm text-gray-400 hover:text-white transition-colors py-1"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Categories Section */}
      {data.categories && Object.keys(data.categories).length > 0 && (
        <div className="col-span-2 grid grid-cols-2 gap-6">
          {Object.entries(data.categories).map(([category, catData]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase">{category}</h3>
              <div className="space-y-1">
                {catData.items &&
                  catData.items.map((item, idx) => (
                    <button
                      key={idx}
                      className="block text-sm text-gray-400 hover:text-white transition-colors py-1"
                    >
                      {item}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Spotlight Section */}
      {data.spotlight && data.spotlight.title && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {data.spotlight.title}
            </h3>
            <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
              {data.spotlight.image && (
                <img
                  src={data.spotlight.image}
                  alt={data.spotlight.brand}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-lg">{data.spotlight.brand}</h4>
              <p className="text-sm text-gray-400">{data.spotlight.description}</p>
              {data.spotlight.link ? (
                <NavLink
                  to={data.spotlight.link}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 inline-flex items-center justify-center"
                >
                  {data.spotlight.cta}
                </NavLink>
              ) : (
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                  {data.spotlight.cta}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

NavMegaMenu.displayName = 'NavMegaMenu';

const Nav = () => {
  const { user } = useSelector((state) => state.userReducer);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDesktopSubNav, setShowDesktopSubNav] = useState(true);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [notificationCount] = useState(2);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [openMobileSections, setOpenMobileSections] = useState(() => new Set());
  const lastScrollYRef = useRef(0);
  const dispatch = useDispatch();
  const menuItems = useMemo(
    () => NAV_ORDER.map((key) => ({ key, ...NAVIGATION[key] })),
    [NAV_ORDER, NAVIGATION]
  );
  const activeMenu = useMemo(
    () => (activeDropdown ? NAVIGATION[activeDropdown] : null),
    [activeDropdown]
  );
  const activeDropdownData = activeMenu?.mega || null;
  const searchSuggestions = useMemo(
    () => SEARCH_SUGGESTIONS,
    [SEARCH_SUGGESTIONS]
  );
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    minChars: searchMinChars,
    clear: clearSearch,
  } = useProjectSearch({ minChars: 2, limit: 8, debounceMs: 250 });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      setScrolled(currentScrollY > 10);

      if (currentScrollY < 24) {
        setShowDesktopSubNav(true);
      } else if (delta > 6) {
        setShowDesktopSubNav(false);
        setActiveDropdown(null);
      } else if (delta < -6) {
        setShowDesktopSubNav(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container, .search-overlay')) {
        if (isSearchOpen) {
          setSearchOpen(false);
          clearSearch();
        }
        setUserMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    if (isSearchOpen || isUserMenuOpen || activeDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSearchOpen, isUserMenuOpen, activeDropdown, clearSearch]);

  const dropdownTimeoutRef = useRef(null);

  const handleMouseEnter = useCallback(
    (menuKey) => {
      clearTimeout(dropdownTimeoutRef.current);
      if (activeDropdown === menuKey) return;
      const mega = NAVIGATION[menuKey]?.mega;
      const hasMegaContent = Boolean(
        mega &&
          ((mega.featured?.items?.length || mega.featured?.brands?.length) ||
            Object.keys(mega.categories || {}).length > 0 ||
            mega.spotlight?.title)
      );
      if (hasMegaContent) {
        setActiveDropdown(menuKey);
      } else {
        setActiveDropdown(null);
      }
    },
    [activeDropdown, NAVIGATION]
  );

  const handleMouseLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  const handleLogout = useCallback(async () => {
    if (!user) return;
    try {
      await dispatch(asynclogoutuser(user.id));
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  }, [dispatch, user]);

  const toggleMobileSection = useCallback((menuKey) => {
    setOpenMobileSections((prev) => {
      const next = new Set(prev);
      if (next.has(menuKey)) {
        next.delete(menuKey);
      } else {
        next.add(menuKey);
      }
      return next;
    });
  }, []);

  const handleSuggestionClick = useCallback(
    (value) => {
      setSearchQuery(value);
    },
    [setSearchQuery]
  );

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ease-out relative
          ${scrolled ? 'bg-stone-950/95 backdrop-blur-xl shadow-md shadow-black/20 border-b border-white/10' : 'bg-stone-950'} `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 md:hidden">
            <div className="flex items-center gap-3">
              <NavLink to="/" className="inline-flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.35em] uppercase text-white">
                  ÉLITE
                </span>

              </NavLink>
            </div>

            <div className="flex items-center space-x-1">
              <button
                className="p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
              >
                <Search className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {user ? (
                <div className="relative dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!isUserMenuOpen);
                      if (isSearchOpen) {
                        setSearchOpen(false);
                        clearSearch();
                      }
                    }}
                    className="flex items-center p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    aria-label="Account menu"
                  >
                    <User className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-stone-950 rounded-lg shadow-xl border border-gray-800 p-2 animate-in slide-in-from-top-2 z-2">
                      <div className="px-3 py-2 border-b border-gray-700">
                        <div className="text-sm font-medium text-white">{user.name || 'User'}</div>
                        <div className="text-xs text-gray-400">
                          {user.isAdmin ? 'Admin' : 'Member'}
                        </div>
                      </div>
                      <NavLink
                        to="/profile"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        My Profile
                      </NavLink>
                      <NavLink
                        to="/my-projects"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        My Projects
                      </NavLink>
                      <NavLink
                        to="/submit"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Submit Project
                      </NavLink>
                      <NavLink
                        to="/saved"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Saved Projects
                      </NavLink>
                      <NavLink
                        to="/settings"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Settings
                      </NavLink>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block px-3 py-2 text-red-500 hover:text-white hover:bg-red-600 rounded-lg w-full text-left text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/signin"
                  className="block px-3 py-2 text-white border border-white/30 rounded-full text-xs hover:bg-white hover:text-black transition"
                >
                  SIGN IN
                </NavLink>
              )}

              <NavLink
                to="/projects"
                className="relative p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Projects"
              >
                <Folder className="w-5 h-5" strokeWidth={1.5} />
              </NavLink>

              <NavLink
                to="/saved"
                className="p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Saved projects"
              >
                <Bookmark className="w-5 h-5" strokeWidth={1.5} />
              </NavLink>

              <NavLink
                to="/notifications"
                className="relative p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" strokeWidth={1.5} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {notificationCount}
                  </span>
                )}
              </NavLink>

              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-start gap-5 py-3">
            <NavLink to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.35em] uppercase text-white">
                ÉLITE
              </span>
          
            </NavLink>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-col items-center justify-center gap-2.5 px-2 pt-0.5">
              <ProjectSearchBar
                query={searchQuery}
                onQueryChange={setSearchQuery}
                results={searchResults}
                loading={searchLoading}
                error={searchError}
                minChars={searchMinChars}
                onResultSelect={() => setSearchQuery('')}
              />
              <div className="flex flex-wrap items-center justify-center gap-2">
                {searchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase text-white/70 border border-white/15 rounded-full hover:text-white hover:border-white/35 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-1.5 pt-0.5">
              {user ? (
                <div className="relative dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!isUserMenuOpen);
                      if (isSearchOpen) {
                        setSearchOpen(false);
                        clearSearch();
                      }
                    }}
                    className="flex items-center p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    aria-label="Account menu"
                  >
                    <User className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-stone-950 rounded-lg shadow-xl border border-gray-800 p-2 animate-in slide-in-from-top-2 z-2">
                      <div className="px-3 py-2 border-b border-gray-700">
                        <div className="text-sm font-medium text-white">{user.name || 'User'}</div>
                        <div className="text-xs text-gray-400">
                          {user.isAdmin ? 'Admin' : 'Member'}
                        </div>
                      </div>
                      <NavLink
                        to="/profile"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        My Profile
                      </NavLink>
                      <NavLink
                        to="/my-projects"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        My Projects
                      </NavLink>
                      <NavLink
                        to="/submit"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Submit Project
                      </NavLink>
                      <NavLink
                        to="/saved"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Saved Projects
                      </NavLink>
                      <NavLink
                        to="/settings"
                        className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm"
                      >
                        Settings
                      </NavLink>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block px-3 py-2 text-red-500 hover:text-white hover:bg-red-600 rounded-lg w-full text-left text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/signin"
                  className="block px-3 py-2 text-white border border-white/30 rounded-full text-xs hover:bg-white hover:text-black transition"
                >
                  SIGN IN
                </NavLink>
              )}

              <NavLink
                to="/projects"
                className="relative p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Projects"
              >
                <Folder className="w-5 h-5" strokeWidth={1.5} />
              </NavLink>

              <NavLink
                to="/saved"
                className="p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Saved projects"
              >
                <Bookmark className="w-5 h-5" strokeWidth={1.5} />
              </NavLink>

              <NavLink
                to="/notifications"
                className="relative p-2 text-gray-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" strokeWidth={1.5} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {notificationCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/submit"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold tracking-[0.25em] uppercase hover:bg-gray-200 transition"
              >
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                Submit Site
              </NavLink>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <div
            className={`hidden md:flex items-center justify-center overflow-hidden transition-all duration-300 ease-out ${
              showDesktopSubNav
                ? 'max-h-20 py-3 opacity-100 border-t border-white/10'
                : 'max-h-0 py-0 opacity-0 border-t border-transparent pointer-events-none'
            }`}
          >
            <div
              className="flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 divide-x divide-white/15 dropdown-container"
              onMouseLeave={handleMouseLeave}
            >
              {menuItems.map((menuItem) => (
                <div key={menuItem.key} className="px-3.5">
                  <NavDropdown
                    menuItem={menuItem}
                    activeDropdown={activeDropdown}
                    handleMouseEnter={handleMouseEnter}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Mega Menu */}
          {showDesktopSubNav && activeDropdownData && (
            <div
              className="absolute left-0 right-0 top-full mt-2 bg-stone-950/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-4 duration-300 z-50 dropdown-container"
              onMouseEnter={() => clearTimeout(dropdownTimeoutRef.current)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <NavMegaMenu data={activeDropdownData} />
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 animate-in slide-in-from-top-4 duration-300">
              <div className="px-4 pt-4 pb-6 space-y-2 bg-gray-900">
                {menuItems.map((menuItem) => {
                  const mobileItems = menuItem.mobile?.items || [];
                  const hasChildren = mobileItems.length > 0;
                  const isOpen = openMobileSections.has(menuItem.key);
                  const isSubmit = menuItem.key === 'submit';

                  if (hasChildren) {
                    return (
                      <div key={menuItem.key} className="rounded-lg border border-white/5">
                        <button
                          type="button"
                          onClick={() => toggleMobileSection(menuItem.key)}
                          className={`w-full px-4 py-3 text-sm font-medium flex items-center justify-between transition-colors ${
                            isOpen ? 'text-white bg-gray-800' : 'text-gray-300 hover:bg-gray-800'
                          } rounded-lg`}
                        >
                          <span>{menuItem.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="mt-1 space-y-1 pb-2">
                            {mobileItems.map((item) => (
                              <NavLink
                                key={item.label}
                                to={item.path}
                                className={({ isActive }) =>
                                  `block ml-4 mr-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    isActive
                                      ? 'text-white bg-gray-800'
                                      : 'text-gray-400 hover:bg-gray-800'
                                  }`
                                }
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {item.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={menuItem.key}
                      to={menuItem.path}
                      className={({ isActive }) =>
                        `w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${
                          isSubmit
                            ? 'bg-white text-black uppercase tracking-[0.2em]'
                            : isActive
                              ? 'text-white bg-gray-800'
                              : 'text-gray-300 hover:bg-gray-800'
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                      tabIndex={0}
                    >
                      {menuItem.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <ProjectSearchOverlay
            query={searchQuery}
            onQueryChange={setSearchQuery}
            results={searchResults}
            loading={searchLoading}
            error={searchError}
            minChars={searchMinChars}
            onClose={() => {
              setSearchOpen(false);
              clearSearch();
            }}
          />
        )}
      </nav>
    </>
  );
};

export default Nav;
