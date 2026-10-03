<?php
/**
 * Plugin Name: Admin Sidebar Customizer
 * Description: Makes the WordPress admin sidebar expandable, floating with custom margins
 * Version: 1.0.104
 * Author: Kilo
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_enqueue_scripts', 'asc_enqueue_assets', 999 );
function asc_enqueue_assets() {
	wp_enqueue_style( 'asc-admin-css', plugin_dir_url( __FILE__ ) . 'assets/css/admin-sidebar.css', [], '1.0.104' );
	wp_enqueue_script( 'asc-admin-js', plugin_dir_url( __FILE__ ) . 'assets/js/admin-sidebar.js', ['jquery'], '1.0.104', true );
	wp_localize_script( 'asc-admin-js', 'ASC_CONFIG', [ 'version' => '1.0.104', 'siteName' => get_bloginfo( 'name' ), 'homeUrl' => home_url( '/' ) ] );
}
