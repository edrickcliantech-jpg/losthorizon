/* Admin Sidebar Customizer - Expand/Collapse + Click Submenus */

( function( $ ) {
	'use strict';

	var $wrap = $( '#adminmenuwrap' );
	var $adminmenu = $( '#adminmenu' );
	var $window = $( window );
	var ASC_VERSION = ( window.ASC_CONFIG && ASC_CONFIG.version ) || 'dev';
	var isExpanded = false;
	var isMobile = $window.width() <= 782;
	var theme = 'dark';
	var $dynamicStyle = null;
	var $tooltip = null;
	var $mobilePanel = null;
	var mobilePanelOpen = false;

	function init() {
		restoreTheme();
		createToggleButton();
		createMobileFab();
		createThemeToggle();
		createDynamicStyle();
		createTooltip();
		markHasSubmenu();
		bindEvents();
		bindHover();
		checkMobile();
		restoreState();
	}

	function createDynamicStyle() {
		$dynamicStyle = $( '<style id="asc-submenu-style"></style>' ).appendTo( 'head' );
	}

	function createTooltip() {
		$tooltip = $( '<div class="asc-tooltip" aria-hidden="true"></div>' ).appendTo( 'body' );
	}

	function bindHover() {
		$wrap.on( 'mouseenter', '#adminmenu li.menu-top > a.menu-top', function() {
			if ( isExpanded || isMobile ) {
				hideTooltip();
				return;
			}

			var $a = $( this );
			var $li = $a.closest( 'li.menu-top' );
			var name = $.trim( $li.children( '.wp-menu-name' ).text() );

			if ( ! name ) {
				hideTooltip();
				return;
			}

			$tooltip.text( name );

			var rect = $a[0].getBoundingClientRect();
			var tipTop = Math.round( rect.top + rect.height / 2 - $tooltip.outerHeight() / 2 );
			var tipLeft = Math.round( rect.right + 10 );

			if ( tipLeft + $tooltip.outerWidth() + 16 > window.innerWidth ) {
				tipLeft = Math.round( rect.left - $tooltip.outerWidth() - 10 );
			}

			if ( tipTop < 8 ) {
				tipTop = 8;
			}

			$tooltip.css( { top: tipTop, left: tipLeft } );
			$tooltip.addClass( 'asc-tooltip-visible' );
		} );

		$wrap.on( 'mouseleave', '#adminmenu li.menu-top', function() {
			hideTooltip();
		} );
	}

	function hideTooltip() {
		if ( $tooltip ) {
			$tooltip.removeClass( 'asc-tooltip-visible' );
		}
	}

	function createToggleButton() {
		if ( $( '#asc-collapse-button' ).length ) {
			return;
		}

		var $btn = $( '<button>' )
			.attr( 'id', 'asc-collapse-button' )
			.addClass( 'collapse-button' )
			.attr( 'aria-label', 'Expand sidebar' )
			.attr( 'aria-expanded', 'false' )
			.html( '<span class="dashicons dashicons-arrow-right-alt2"></span>' )
			.on( 'click', toggleSidebar );

		$( 'body' ).append( $btn );
	}

	function createMobileFab() {
		if ( $( '.asc-mobile-fab' ).length ) {
			return;
		}

		var $fab = $( '<button>' )
			.attr( 'type', 'button' )
			.attr( 'id', 'asc-mobile-fab' )
			.addClass( 'asc-mobile-fab' )
			.attr( 'aria-label', 'Open navigation menu' )
			.html( '<span class="dashicons dashicons-menu-alt3"></span>' )
			.on( 'click', toggleSidebar );

		$( 'body' ).append( $fab );
	}

	function setupMobileDropdown() {
		var $bar = $( '#wpadminbar .quicklinks' );
		if ( ! $bar.length ) return;

		if ( $( '#asc-mobile-menu-toggle' ).length ) {
			return;
		}

		$( 'body' ).addClass( 'asc-mobile-dropdown' );

		var $left = $( '<div>' )
			.addClass( 'asc-mobile-head-left' )
			.appendTo( $bar );
		$( '<a>' )
			.addClass( 'asc-mobile-home' )
			.attr( 'href', ( window.ASC_CONFIG && ASC_CONFIG.homeUrl ) || '/' )
			.attr( 'aria-label', 'Visit home' )
			.html( '<span class="dashicons dashicons-admin-home"></span>' )
			.appendTo( $left );
		$( '<a>' )
			.addClass( 'asc-mobile-site-name' )
			.attr( 'href', ( window.ASC_CONFIG && ASC_CONFIG.homeUrl ) || '/' )
			.text( ( window.ASC_CONFIG && ASC_CONFIG.siteName ) || 'Lost Horizon Resort' )
			.appendTo( $left );

		$bar.append( $( '<button>' )
			.attr( 'type', 'button' )
			.attr( 'id', 'asc-mobile-menu-toggle' )
			.attr( 'aria-label', 'Admin menu' )
			.attr( 'aria-expanded', 'false' )
			.html( '<span class="dashicons dashicons-menu-alt3"></span>' )
			.on( 'click', function( e ) {
				e.stopPropagation();
				toggleMobilePanel();
			} ) );

		$mobilePanel = $( '<div class="asc-admin-pop" aria-hidden="true"></div>' ).appendTo( '#wpadminbar' );

		$( '<button>' )
			.attr( 'type', 'button' )
			.addClass( 'asc-admin-pop-close' )
			.attr( 'aria-label', 'Close menu' )
			.html( '<span class="dashicons dashicons-no-alt"></span>' )
			.on( 'click', closeMobilePanel )
			.appendTo( $mobilePanel );

		var $theme = $( '#asc-theme-toggle' );
		var $default = $( '#wp-admin-bar-root-default' );
		var $secondary = $( '#wp-admin-bar-top-secondary' );
		if ( $default.length ) $mobilePanel.append( $default );
		if ( $secondary.length ) $mobilePanel.append( $secondary );
		if ( $theme.length ) $mobilePanel.append( $theme );

		reorderHeaderItems( $default );
		bindPanelSubmenus();
		$mobilePanel.append( '<div class="asc-pop-version">v' + ASC_VERSION + '</div>' );
	}

	function bindPanelSubmenus() {
		if ( ! $mobilePanel || ! $mobilePanel.length ) return;

		$mobilePanel[ 0 ].addEventListener( 'click', function( e ) {
			var $target = $( e.target );

			if ( $target.closest( '.ab-sub-wrapper' ).length ) {
				return;
			}

			var $toggle = $target.closest( 'li.menupop > .ab-item' );
			if ( ! $toggle.length ) {
				closeMobileSubmenus();
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			var $li = $toggle.closest( 'li.menupop' );
			var wasOpen = $li.hasClass( 'asc-sub-open' );

			closeMobileSubmenus();

			if ( ! wasOpen ) {
				$li.addClass( 'asc-sub-open' );
				$toggle.attr( 'aria-expanded', 'true' );
			}
		}, true );
	}

	function closeMobileSubmenus() {
		$( '.asc-admin-pop li.asc-sub-open' ).removeClass( 'asc-sub-open' ).each( function() {
			$( this ).find( '> .ab-item' ).attr( 'aria-expanded', 'false' );
		} );
	}

	function reorderHeaderItems( $root ) {
		if ( ! $root || ! $root.length ) return;

		var $site = $root.find( '> #wp-admin-bar-site-name' );
		var $new = $root.find( '> #wp-admin-bar-new-content' );
		var $logo = $root.find( '> #wp-admin-bar-wp-logo' );
		var $first = null;

		if ( $site.length ) {
			$root.prepend( $site );
			$first = $site;
		}
		if ( $new.length ) {
			if ( $first ) $first.after( $new );
			else $root.prepend( $new );
			$first = $new;
		}
		if ( $logo.length ) {
			if ( $first ) $first.after( $logo );
			else $root.prepend( $logo );
			$first = $logo;
		}
	}

	function restoreHeaderOrder( $root ) {
		if ( ! $root || ! $root.length ) return;

		var $seq = [
			$root.find( '> #wp-admin-bar-wp-logo' ),
			$root.find( '> #wp-admin-bar-site-name' ),
			$root.find( '> #wp-admin-bar-updates' ),
			$root.find( '> #wp-admin-bar-comments' ),
			$root.find( '> #wp-admin-bar-new-content' )
		];
		var $prev = null;

		for ( var i = 0; i < $seq.length; i++ ) {
			var $el = $seq[ i ];
			if ( $el.length ) {
				if ( $prev ) $prev.after( $el );
				else $root.prepend( $el );
				$prev = $el;
			}
		}
	}

	function teardownMobileDropdown() {
		$( 'body' ).removeClass( 'asc-mobile-dropdown' );

		var $bar = $( '#wpadminbar .quicklinks' );
		var $toggle = $( '#asc-mobile-menu-toggle' );
		var $left = $( '.asc-mobile-head-left' );
		var $panel = $( '.asc-admin-pop' );

		if ( $panel.length ) {
			var $theme = $( '#asc-theme-toggle' );
			var $default = $( '#wp-admin-bar-root-default' );
			var $secondary = $( '#wp-admin-bar-top-secondary' );

			restoreHeaderOrder( $default );

			if ( $default.length ) $bar.prepend( $default );
			if ( $secondary.length ) {
				if ( $theme.length ) {
					$theme.before( $secondary );
				} else {
					$bar.append( $secondary );
				}
			}
			if ( $theme.length ) $bar.append( $theme );

			$panel.remove();
		}

		if ( $toggle.length ) {
			$toggle.remove();
		}

		if ( $left.length ) {
			$left.remove();
		}

		$mobilePanel = null;
		mobilePanelOpen = false;
	}

	function toggleMobilePanel() {
		if ( mobilePanelOpen ) {
			closeMobilePanel();
		} else {
			openMobilePanel();
		}
	}

	function openMobilePanel() {
		if ( ! $mobilePanel ) return;
		mobilePanelOpen = true;
		closeMobileSubmenus();
		$mobilePanel.addClass( 'asc-admin-pop-open' ).attr( 'aria-hidden', 'false' );
		$( '#asc-mobile-menu-toggle' ).attr( 'aria-expanded', 'true' );
	}

	function closeMobilePanel() {
		if ( ! $mobilePanel ) return;
		mobilePanelOpen = false;
		closeMobileSubmenus();
		$mobilePanel.removeClass( 'asc-admin-pop-open' ).attr( 'aria-hidden', 'true' );
		$( '#asc-mobile-menu-toggle' ).attr( 'aria-expanded', 'false' );
	}

	function createThemeToggle() {
		var $adminBar = $( '#wpadminbar .quicklinks' );

		if ( ! $adminBar.length || $( '#asc-theme-toggle' ).length ) {
			return;
		}

		var $btn = $( '<button>' )
			.attr( 'type', 'button' )
			.attr( 'id', 'asc-theme-toggle' )
			.addClass( 'asc-theme-toggle' )
			.on( 'click', toggleTheme );

		$adminBar.append( $btn );
		updateThemeToggle();
	}

	function markHasSubmenu() {
		$( '#adminmenu > li.menu-top' ).each( function() {
			var $li = $( this );
			var $submenu = $li.children( '.wp-submenu' );
			if ( $submenu.length && $submenu.find( 'li a' ).length ) {
				$li.addClass( 'asc-has-submenu' );
			}
		} );
	}

	function bindEvents() {
		$wrap.on( 'click', '#adminmenu > li.asc-has-submenu > a.menu-top', function( e ) {
			e.preventDefault();
			e.stopPropagation();

			var $li = $( this ).closest( 'li.menu-top' );
			hideTooltip();
			toggleSubmenu( $li );
		} );

		$wrap.on( 'click', '#adminmenu > li:not(.asc-has-submenu) > a.menu-top', function() {
			closeAllSubmenus();
		} );

		$( document ).on( 'click', function( e ) {
			if ( ! $( e.target ).closest( '#adminmenu' ).length ) {
				closeAllSubmenus();
			}
			if ( mobilePanelOpen && ! $( e.target ).closest( '.asc-admin-pop, #asc-mobile-menu-toggle' ).length ) {
				closeMobilePanel();
			}
		} );

		$( document ).on( 'keydown', function( e ) {
			if ( e.key === 'Escape' ) {
				closeAllSubmenus();
				closeMobilePanel();
				if ( isExpanded ) {
					collapseSidebar();
				}
			}
		} );

		$adminmenu.on( 'scroll', debounce( function() {
			hideTooltip();
			checkMobile();
			var $open = $wrap.find( '.asc-sub-open' );
			if ( $open.length ) {
				positionSubmenu( $open );
			}
		}, 50 ) );

		$window.on( 'resize', debounce( function() {
			checkMobile();
			var $open = $wrap.find( '.asc-sub-open' );
			if ( $open.length ) {
				positionSubmenu( $open );
			}
		}, 150 ) );
	}

	function toggleSubmenu( $li ) {
		var wasOpen = $li.hasClass( 'asc-sub-open' );

		closeAllSubmenus();

		if ( ! wasOpen ) {
			$li.addClass( 'asc-sub-open' );
			addMobileCloseButton( $li );
			positionSubmenu( $li );
		}
	}

	function addMobileCloseButton( $li ) {
		if ( ! isMobile ) return;

		var $sub = $li.children( '.wp-submenu' );
		if ( ! $sub.length || $sub.find( '.asc-submenu-close' ).length ) return;

		$( '<button type="button" class="asc-submenu-close">' +
			'<span class="dashicons dashicons-no-alt" aria-hidden="true"></span>' +
			'Close</button>' )
			.on( 'click', function( e ) {
				e.preventDefault();
				e.stopPropagation();
				closeAllSubmenus();
			} )
			.prependTo( $sub );
	}

	function closeAllSubmenus() {
		$wrap.find( '.asc-sub-open' ).removeClass( 'asc-sub-open' );
		$dynamicStyle.html( '' );
		hideTooltip();
	}

	function positionSubmenu( $menuItem ) {
		if ( isMobile ) return;

		var $submenu = $menuItem.children( '.wp-submenu' );
		if ( ! $submenu.length ) return;

		var $anchor = $menuItem.children( 'a.menu-top' );
		if ( ! $anchor.length ) return;

		var rect = $anchor[0].getBoundingClientRect();
		var winW = window.innerWidth;
		var winH = window.innerHeight;
		var subWidth = 240;
		var left = Math.round( rect.right + 8 );

		if ( left + subWidth > winW - 16 ) {
			left = Math.round( rect.left - subWidth - 8 );
		}

		var subHeight = $submenu.outerHeight() || 0;
		var top = Math.round( rect.bottom ) - subHeight;

		if ( top < 76 ) {
			top = 76;
		}

		if ( subHeight && top + subHeight > winH - 16 ) {
			top = Math.max( 76, winH - subHeight - 16 );
		}

		var menuId = $menuItem.attr( 'id' ) || 'submenu-' + Math.random();
		$menuItem.attr( 'id', menuId );

		var css =
			'#' + menuId + ' > .wp-submenu {' +
			'  top: ' + top + 'px !important;' +
			'  left: ' + left + 'px !important;' +
			'  bottom: auto !important;' +
			'  margin: 0 !important;' +
			'  opacity: 1 !important;' +
			'  visibility: visible !important;' +
			'  pointer-events: auto !important;' +
			'  transform: translateX(0) scale(1) !important;' +
			'}';

		$dynamicStyle.html( css );
	}

	function toggleSidebar() {
		if ( isExpanded ) {
			collapseSidebar();
		} else {
			expandSidebar();
		}
	}

	function expandSidebar() {
		isExpanded = true;
		hideTooltip();
		$wrap.addClass( 'expanded' );
		$( 'body' ).addClass( 'asc-sidebar-expanded' );
		$( '#asc-collapse-button' )
			.attr( 'aria-label', 'Collapse sidebar' )
			.attr( 'aria-expanded', 'true' )
			.find( '.dashicons' )
			.removeClass( 'dashicons-arrow-right-alt2' )
			.addClass( 'dashicons-arrow-left-alt2' );

		closeAllSubmenus();
		saveState( true );
	}

	function collapseSidebar() {
		isExpanded = false;
		$wrap.removeClass( 'expanded' );
		$( 'body' ).removeClass( 'asc-sidebar-expanded' );
		$( '#asc-collapse-button' )
			.attr( 'aria-label', 'Expand sidebar' )
			.attr( 'aria-expanded', 'false' )
			.find( '.dashicons' )
			.removeClass( 'dashicons-arrow-left-alt2' )
			.addClass( 'dashicons-arrow-right-alt2' );

		closeAllSubmenus();
		saveState( false );
	}

	function toggleTheme() {
		setTheme( theme === 'dark' ? 'light' : 'dark' );
	}

	function setTheme( mode ) {
		theme = mode === 'light' ? 'light' : 'dark';

		$( 'body' )
			.removeClass( 'asc-theme-light asc-theme-dark' )
			.addClass( 'asc-theme-' + theme );

		updateThemeToggle();
		saveTheme();
	}

	function updateThemeToggle() {
		var isLight = theme === 'light';

		$( '#asc-theme-toggle' )
			.attr( 'aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode' )
			.attr( 'title', isLight ? 'Dark mode' : 'Light mode' )
			.html( '<span class="dashicons-before dashicons ' + ( isLight ? 'dashicons-admin-appearance' : 'dashicons-lightbulb' ) + '" aria-hidden="true"></span>' );
	}

	function checkMobile() {
		var wasMobile = isMobile;
		isMobile = $window.width() <= 782;

		if ( isMobile ) {
			if ( ! wasMobile ) {
				$wrap.removeClass( 'expanded' );
				$( 'body' ).removeClass( 'asc-sidebar-expanded' );
				isExpanded = false;
				hideTooltip();
			}
			setupMobileDropdown();
		} else if ( wasMobile ) {
			teardownMobileDropdown();
			restoreState();
		}
	}

	function saveState( expanded ) {
		try {
			localStorage.setItem( 'asc_sidebar_expanded', expanded );
		} catch ( e ) {}
	}

	function saveTheme() {
		try {
			localStorage.setItem( 'asc_admin_theme', theme );
		} catch ( e ) {}
	}

	function restoreState() {
		if ( isMobile ) return;

		try {
			var saved = localStorage.getItem( 'asc_sidebar_expanded' );
			if ( saved === 'true' ) {
				expandSidebar();
			}
		} catch ( e ) {}
	}

	function restoreTheme() {
		try {
			setTheme( localStorage.getItem( 'asc_admin_theme' ) || 'dark' );
		} catch ( e ) {
			setTheme( 'dark' );
		}
	}

	function debounce( func, wait ) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			clearTimeout( timeout );
			timeout = setTimeout( function() {
				func.apply( context, args );
			}, wait );
		};
	}

	$( document ).ready( init );

	window.ASC = {
		expand: expandSidebar,
		collapse: collapseSidebar,
		toggle: toggleSidebar,
		setTheme: setTheme,
		toggleTheme: toggleTheme
	};

} )( jQuery );
