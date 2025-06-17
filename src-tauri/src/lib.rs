// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

pub mod services;

use services::wallpaper_service::{
    apply_wallpaper, download_wallpaper, start_wallpaper_rotation, stop_wallpaper_rotation,
};

use services::db_services::{
    add_to_favorites, delete_favorite_wallpaper_command, fetch_favorite_wallpapers,
    fetch_wallpapers, get_app_settings, get_wallpaper_count_command, get_wallpapers,
    get_wallpapers_by_tag_command, prune_wallpaper_db_command, reset_wallpaper_settings,
    update_app_setting, update_app_setting_command, update_favorite_command,
};

use tauri_plugin_autostart::MacosLauncher;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .invoke_handler(tauri::generate_handler![
            greet,
            apply_wallpaper,
            download_wallpaper,
            start_wallpaper_rotation,
            stop_wallpaper_rotation,
            // DB services
            add_to_favorites,
            fetch_wallpapers,
            fetch_favorite_wallpapers,
            get_app_settings,
            update_app_setting,
            get_wallpapers,
            update_app_setting_command,
            get_wallpaper_count_command,
            prune_wallpaper_db_command,
            get_wallpapers_by_tag_command,
            delete_favorite_wallpaper_command,
            update_favorite_command,
            reset_wallpaper_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
