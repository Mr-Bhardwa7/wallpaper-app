use std::{
    fs::{self, File},
    io::copy,
    path::PathBuf,
    sync::{
        mpsc::{self, Sender},
        Arc, Mutex,
    },
    thread::{self, JoinHandle},
    time::Duration,
};

use app_dirs2::{app_dir, AppDataType, AppInfo};
use dirs::download_dir;
use reqwest::blocking::get;
use sanitize_filename::sanitize;
use tauri::command;

#[cfg(target_os = "windows")]
use wallpaper;

#[cfg(target_os = "macos")]
use wallpaper;

#[cfg(target_os = "linux")]
use std::process::Command;

const APP_INFO: AppInfo = AppInfo {
    name: "WallpaperRemix",
    author: "AnimeshBhardwaj",
};

// ---------------------- Apply Wallpaper ----------------------

#[command]
pub fn apply_wallpaper(image_url: String) -> Result<(), String> {
    let save_dir: PathBuf = app_dir(AppDataType::UserCache, &APP_INFO, "images")
    .map_err(|e| format!("Failed to resolve app data directory: {e}"))?;

    fs::create_dir_all(&save_dir).map_err(|e| format!("Failed to create directory: {e}"))?;

    let wallpaper_path = save_dir.join("wallpaper.jpg");

    if image_url.starts_with("http://") || image_url.starts_with("https://") {
        let mut resp = get(&image_url).map_err(|e| e.to_string())?;
        let mut out = File::create(&wallpaper_path).map_err(|e| e.to_string())?;
        copy(&mut resp, &mut out).map_err(|e| e.to_string())?;
    } else {
        fs::copy(&image_url, &wallpaper_path)
            .map_err(|e| format!("Failed to copy local image: {e}"))?;
    }

    #[cfg(any(target_os = "windows", target_os = "macos"))]
    {
        wallpaper::set_from_path(wallpaper_path.to_str().unwrap())
            .map_err(|e| format!("Failed to set wallpaper: {e}"))
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("gsettings")
            .args([
                "set",
                "org.gnome.desktop.background",
                "picture-uri",
                &format!("file://{}", wallpaper_path.to_str().unwrap()),
            ])
            .output()
            .map_err(|e| format!("Failed to execute gsettings: {e}"))?;

        if output.status.success() {
            Ok(())
        } else {
            Err(format!(
                "Failed to set wallpaper on GNOME.\nError: {}",
                String::from_utf8_lossy(&output.stderr)
            ))
        }
    }
}

// ---------------------- Download Wallpaper ----------------------

#[command]
pub fn download_wallpaper(url: String, filename: String) -> Result<String, String> {
    let download_path = download_dir()
        .ok_or("Failed to resolve system download directory")?;


    fs::create_dir_all(&download_path).map_err(|e| e.to_string())?;

    let safe_filename = sanitize(&filename);
    let file_path = download_path.join(safe_filename);

    let mut resp = get(&url).map_err(|e| e.to_string())?;
    let mut out = File::create(&file_path).map_err(|e| e.to_string())?;
    copy(&mut resp, &mut out).map_err(|e| e.to_string())?;

    Ok(file_path.to_string_lossy().into_owned())
}

// ---------------------- Wallpaper Rotation ----------------------

struct WallpaperManager {
    active: Arc<Mutex<bool>>,
    stop_sender: Arc<Mutex<Option<Sender<()>>>>,
    thread_handle: Arc<Mutex<Option<JoinHandle<()>>>>,
}

impl WallpaperManager {
    fn new() -> Self {
        Self {
            active: Arc::new(Mutex::new(false)),
            stop_sender: Arc::new(Mutex::new(None)),
            thread_handle: Arc::new(Mutex::new(None)),
        }
    }

    fn start_rotation(&self, paths: Vec<String>, interval_sec: u64) {
        self.stop_rotation(); // Stop any existing rotation

        let active_flag = Arc::clone(&self.active);
        let (tx, rx) = mpsc::channel();
        let stop_sender = Arc::clone(&self.stop_sender);
        let thread_handle = Arc::clone(&self.thread_handle);

        *active_flag.lock().unwrap() = true;
        *stop_sender.lock().unwrap() = Some(tx);

        let handle = thread::spawn(move || {
            let mut index = 0;
            let total = paths.len();

            while *active_flag.lock().unwrap() {
                if let Ok(_) = rx.try_recv() {
                    break; // Stop signal
                }

                if let Some(path) = paths.get(index % total) {
                    let _ = apply_wallpaper(path.clone());
                    index += 1;
                }

                thread::sleep(Duration::from_secs(interval_sec));
            }
        });

        *thread_handle.lock().unwrap() = Some(handle);
    }

    fn stop_rotation(&self) {
        *self.active.lock().unwrap() = false;

        if let Some(sender) = self.stop_sender.lock().unwrap().take() {
            let _ = sender.send(());
        }

        if let Some(handle) = self.thread_handle.lock().unwrap().take() {
            let _ = handle.join();
        }
    }
}

use once_cell::sync::Lazy;
static WALLPAPER_MANAGER: Lazy<WallpaperManager> = Lazy::new(WallpaperManager::new);

#[command]
pub fn start_wallpaper_rotation(paths: Vec<String>, interval_sec: u64) -> Result<(), String> {
    WALLPAPER_MANAGER.start_rotation(paths, interval_sec);
    Ok(())
}

#[command]
pub fn stop_wallpaper_rotation() {
    WALLPAPER_MANAGER.stop_rotation();
}
