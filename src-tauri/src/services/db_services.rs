use rusqlite::{params, Connection, Error as SqlError, OptionalExtension, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

pub type Settings = HashMap<String, String>;

pub fn get_db_path() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("wallpaper_app/localdb.sqlite")
}

pub fn get_connection() -> SqlResult<Connection> {
    let path = get_db_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| SqlError::ToSqlConversionFailure(Box::new(e)))?;
    }
    let conn = Connection::open(path)?;
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS wallpapers (
            id TEXT PRIMARY KEY,
            mongo_id TEXT UNIQUE,
            title TEXT,
            url TEXT,
            thumbnail TEXT,
            width INTEGER,
            height INTEGER,
            tags TEXT,
            is_ai_generated BOOLEAN DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            wallpaper_id TEXT,
            added_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (wallpaper_id) REFERENCES wallpapers(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            category TEXT
        );
        ",
    )?;
    Ok(conn)
}

#[derive(Serialize, Deserialize)]
pub struct Wallpaper {
    pub id: String,
    pub mongo_id: Option<String>,
    pub title: String,
    pub url: String,
    pub thumbnail: String,
    pub width: i32,
    pub height: i32,
    pub tags: String,
    pub is_ai_generated: bool,
    pub is_favorite: bool,
}

#[derive(Serialize, Deserialize)]
pub struct WallpaperSettings {
    pub auto_update: bool,
    pub save_wallpaper: bool,
    pub update_interval: String,
    pub app_theme: String,
    pub notifications: bool,
    pub auto_start: bool,
    pub experimental: bool,
    pub language: String,
}

// Basic wallpaper storage
pub fn add_or_update_wallpaper(wp: &Wallpaper) -> SqlResult<()> {
    let conn = get_connection()?;
    conn.execute(
        r#"
        INSERT INTO wallpapers (
            id, mongo_id, title, url, thumbnail, width, height, tags, is_ai_generated
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        ON CONFLICT(mongo_id) DO UPDATE SET
            title = excluded.title,
            url = excluded.url,
            thumbnail = excluded.thumbnail,
            width = excluded.width,
            height = excluded.height,
            tags = excluded.tags,
            is_ai_generated = excluded.is_ai_generated
        "#,
        params![
            wp.id,
            wp.mongo_id,
            wp.title,
            wp.url,
            wp.thumbnail,
            wp.width,
            wp.height,
            wp.tags,
            wp.is_ai_generated
        ],
    )?;
    Ok(())
}

pub fn clear_wallpapers() -> SqlResult<()> {
    let conn = get_connection()?;
    conn.execute("DELETE FROM wallpapers", [])?;
    Ok(())
}

pub fn add_favorite(wallpaper_id: &str) -> SqlResult<()> {
    let conn = get_connection()?;
    let uuid = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT OR REPLACE INTO favorites (id, wallpaper_id) VALUES (?1, ?2)",
        params![uuid, wallpaper_id],
    )?;
    Ok(())
}

pub fn remove_favorite(wallpaper_id: &str) -> SqlResult<()> {
    let conn = get_connection()?;
    conn.execute(
        "DELETE FROM favorites WHERE wallpaper_id = ?1",
        params![wallpaper_id],
    )?;
    Ok(())
}

pub fn get_wallpapers_with_fav(limit: u32, offset: u32) -> SqlResult<Vec<Wallpaper>> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        r#"
        SELECT w.*, f.wallpaper_id IS NOT NULL AS is_favorite 
        FROM wallpapers w
        LEFT JOIN favorites f ON w.id = f.wallpaper_id
        ORDER BY created_at DESC
        LIMIT ?1 OFFSET ?2
        "#,
    )?;

    let rows = stmt.query_map(params![limit, offset], |row| {
        Ok(Wallpaper {
            id: row.get("id")?,
            mongo_id: row.get("mongo_id")?,
            title: row.get("title")?,
            url: row.get("url")?,
            thumbnail: row.get("thumbnail")?,
            width: row.get("width")?,
            height: row.get("height")?,
            tags: row.get("tags")?,
            is_ai_generated: row.get("is_ai_generated")?,
            is_favorite: row.get("is_favorite")?, // <- fetch from the alias
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_favorite_wallpapers() -> SqlResult<Vec<Wallpaper>> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        r#"
        SELECT w.* FROM wallpapers w
        INNER JOIN favorites f ON w.id = f.wallpaper_id
        "#,
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Wallpaper {
            id: row.get("id")?,
            mongo_id: row.get("mongo_id")?,
            title: row.get("title")?,
            url: row.get("url")?,
            thumbnail: row.get("thumbnail")?,
            width: row.get("width")?,
            height: row.get("height")?,
            tags: row.get("tags")?,
            is_ai_generated: row.get("is_ai_generated")?,
            is_favorite: true,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_setting() -> Result<Settings, String> {
    let conn = get_connection().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT key, value FROM settings")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let rows = stmt
        .query_map(params![], |row| {
            let key: String = row.get(0)?;
            let value: String = row.get(1)?;
            Ok((key, value))
        })
        .map_err(|e| format!("Query execution failed: {}", e))?;

    let mut settings = Settings::new();
    for row in rows {
        if let Ok((key, value)) = row {
            settings.insert(key, value);
        }
    }

    Ok(settings)
}

pub fn set_setting(key: &str, value: &str, category: &str) -> SqlResult<()> {
    let conn = get_connection()?;
    conn.execute(
        r#"
        INSERT INTO settings (key, value, category)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, category = excluded.category
        "#,
        params![key, value, category],
    )?;
    Ok(())
}

pub fn reset_settings() -> SqlResult<()> {
    let conn = get_connection()?;

    let defaults = vec![
        ("autoUpdate", "true", "wallpaper"),
        ("saveWallpaper", "false", "wallpaper"),
        ("updateInterval", "86400000", "wallpaper"),
        ("appTheme", "system", "preferences"),
        ("notifications", "true", "preferences"),
        ("autoStart", "false", "preferences"),
        ("experimental", "false", "preferences"),
        ("language", "en-US", "general"),
    ];

    for (key, value, category) in defaults {
        conn.execute(
            r#"
            INSERT INTO settings (key, value, category)
            VALUES (?1, ?2, ?3)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, category = excluded.category
            "#,
            &[key, value, category],
        )?;
    }

    Ok(())
}

pub fn update_favorite(wallpaper_id: &str, is_fav: bool) -> SqlResult<()> {
    let conn = get_connection()?;
    if is_fav {
        add_favorite(wallpaper_id)?;
    } else {
        conn.execute(
            "DELETE FROM favorites WHERE wallpaper_id = ?1",
            params![wallpaper_id],
        )?;
    }
    Ok(())
}

pub fn delete_favorite_wallpaper(wallpaper_id: &str) -> SqlResult<()> {
    let conn = get_connection()?;
    conn.execute(
        "DELETE FROM favorites WHERE wallpaper_id = ?1",
        params![wallpaper_id],
    )?;
    Ok(())
}

pub fn update_wallpaper_settings(settings: WallpaperSettings) -> SqlResult<()> {
    let conn = get_connection()?;

    let items = vec![
        ("autoUpdate", settings.auto_update.to_string(), "general"),
        (
            "saveWallpaper",
            settings.save_wallpaper.to_string(),
            "general",
        ),
        (
            "updateInterval",
            settings.update_interval.to_string(),
            "general",
        ),
        ("appTheme", settings.app_theme.to_string(), "general"),
        (
            "notifications",
            settings.notifications.to_string(),
            "general",
        ),
        ("autoStart", settings.auto_start.to_string(), "general"),
        ("experimental", settings.experimental.to_string(), "general"),
        ("language", settings.language.to_string(), "general"),
    ];

    for (key, val, category) in items {
        conn.execute(
            r#"
            INSERT INTO settings (key, value, category)
            VALUES (?1, ?2, ?3)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, category = excluded.category
            "#,
            params![key, val, category],
        )?;
    }

    Ok(())
}

pub fn get_wallpaper_settings() -> SqlResult<WallpaperSettings> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare("SELECT key, value FROM settings")?;
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;

    let mut settings = WallpaperSettings {
        auto_update: true,
        save_wallpaper: false,
        update_interval: "Daily".to_string(),
        app_theme: "system".to_string(),
        notifications: true,
        auto_start: false,
        experimental: false,
        language: "en-US".to_string(),
    };

    for row in rows {
        let (key, value) = row?;
        match key.as_str() {
            "autoUpdate" => settings.auto_update = value.parse().unwrap_or(true),
            "saveWallpaper" => settings.save_wallpaper = value.parse().unwrap_or(false),
            "updateInterval" => settings.update_interval = value,
            "appTheme" => settings.app_theme = value,
            "notifications" => settings.notifications = value.parse().unwrap_or(true),
            "autoStart" => settings.auto_start = value.parse().unwrap_or(false),
            "experimental" => settings.experimental = value.parse().unwrap_or(false),
            "language" => settings.language = value,
            _ => {}
        }
    }

    Ok(settings)
}

pub fn get_last_synced_mongo_id() -> SqlResult<Option<String>> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT mongo_id FROM wallpapers WHERE mongo_id IS NOT NULL ORDER BY created_at DESC LIMIT 1",
        [],
        |row| row.get(0),
    ).optional()
}

pub fn get_wallpaper_count() -> Result<u32, rusqlite::Error> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM wallpapers")?;
    let count: u32 = stmt.query_row([], |row| row.get(0))?;
    Ok(count)
}

pub fn get_wallpapers_by_tag(tag: &str, limit: u32, offset: u32) -> SqlResult<Vec<Wallpaper>> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        r#"
        SELECT 
            w.*, 
            CASE WHEN f.wallpaper_id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite
        FROM wallpapers w
        LEFT JOIN favorites f ON w.id = f.wallpaper_id
        WHERE w.tags LIKE ?1
        ORDER BY w.created_at DESC
        LIMIT ?2 OFFSET ?3
        "#,
    )?;
    let tag_like = format!("%{}%", tag);
    let rows = stmt.query_map(params![tag_like, limit, offset], |row| {
        Ok(Wallpaper {
            id: row.get("id")?,
            mongo_id: row.get("mongo_id")?,
            title: row.get("title")?,
            url: row.get("url")?,
            thumbnail: row.get("thumbnail")?,
            width: row.get("width")?,
            height: row.get("height")?,
            tags: row.get("tags")?,
            is_ai_generated: row.get("is_ai_generated")?,
            is_favorite: row.get("is_favorite")?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

/// Delete old wallpapers that are not marked as favorites.
/// Keeps the most recent `keep_limit` wallpapers (by `created_at`).
pub fn prune_old_wallpapers(keep_limit: usize) -> SqlResult<()> {
    let conn = get_connection()?;

    conn.execute(
        r#"
        DELETE FROM wallpapers
        WHERE id NOT IN (
            SELECT w.id
            FROM wallpapers w
            LEFT JOIN favorites f ON w.id = f.wallpaper_id
            ORDER BY f.wallpaper_id IS NOT NULL DESC, w.created_at DESC
            LIMIT ?1
        )
        "#,
        params![keep_limit],
    )?;

    Ok(())
}

//
// Tauri Commands
//

#[tauri::command]
pub fn add_to_favorites(wallpaper_id: String) -> Result<(), String> {
    add_favorite(&wallpaper_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fetch_wallpapers(limit: u32, offset: u32) -> Result<Vec<Wallpaper>, String> {
    use crate::services::{
        db_services::get_wallpapers_with_fav, sync_service::fetch_from_mongo_and_cache,
    };

    let mut local = get_wallpapers_with_fav(limit, offset).map_err(|e| e.to_string())?;

    if local.len() < limit as usize {
        fetch_from_mongo_and_cache(100)
            .await
            .map_err(|e| e.to_string())?;
        local = get_wallpapers_with_fav(limit, offset).map_err(|e| e.to_string())?;
    }

    Ok(local)
}

#[tauri::command]
pub fn fetch_favorite_wallpapers() -> Result<Vec<Wallpaper>, String> {
    get_favorite_wallpapers().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_app_settings() -> Result<Settings, String> {
    let settings = get_setting().map_err(|e| e.to_string())?;
    Ok(settings)
}

#[tauri::command]
pub fn update_app_setting(key: String, value: String, category: String) -> Result<(), String> {
    set_setting(&key, &value, &category).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_wallpapers(limit: u32, offset: u32) -> Result<Vec<Wallpaper>, String> {
    use crate::services::sync_service::fetch_from_mongo_and_cache;

    let count = get_wallpaper_count().map_err(|e| e.to_string())?;

    // If DB is empty, sync from Mongo
    if count == 0 {
        fetch_from_mongo_and_cache(100)
            .await
            .map_err(|e| format!("Mongo sync failed: {}", e))?;
    }

    // Return wallpapers from local SQLite
    get_wallpapers_with_fav(limit, offset).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_app_setting_command(
    key: String,
    value: String,
    category: String,
) -> Result<(), String> {
    set_setting(&key, &value, &category).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_wallpaper_count_command() -> Result<u32, String> {
    get_wallpaper_count().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn prune_wallpaper_db_command(limit: usize) -> Result<(), String> {
    prune_old_wallpapers(limit).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_wallpapers_by_tag_command(
    tag: String,
    limit: u32,
    offset: u32,
) -> Result<Vec<Wallpaper>, String> {
    get_wallpapers_by_tag(&tag, limit, offset).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_favorite_command(
    id: String,
    is_favorite: bool,
) -> Result<Vec<Wallpaper>, String> {
    update_favorite(&id, is_favorite).map_err(|e| e.to_string())?;

    let favorites = get_favorite_wallpapers().map_err(|e| e.to_string())?;
    Ok(favorites)
}

#[tauri::command]
pub async fn delete_favorite_wallpaper_command(id: String) -> Result<Vec<Wallpaper>, String> {
    delete_favorite_wallpaper(&id).map_err(|e| e.to_string())?;

    let favorites = get_favorite_wallpapers().map_err(|e| e.to_string())?;
    Ok(favorites)
}

#[tauri::command]
pub async fn reset_wallpaper_settings() -> Result<(), String> {
    match reset_settings() {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
