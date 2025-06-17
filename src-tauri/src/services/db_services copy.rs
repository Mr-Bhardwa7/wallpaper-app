use rusqlite::OptionalExtension;
use rusqlite::{params, Connection, Error as SqlError, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use uuid::Uuid;

/// Get the path to the SQLite DB file using the OS-specific data directory
pub fn get_db_path() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("wallpaper_app/localdb.sqlite")
}

/// Get the database connection and ensure all tables exist
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
}

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

pub fn add_favorite(wallpaper_id: &str) -> SqlResult<()> {
    let conn = get_connection()?;
    let uuid = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT OR REPLACE INTO favorites (id, wallpaper_id) VALUES (?1, ?2)",
        params![uuid, wallpaper_id],
    )?;
    Ok(())
}

pub fn get_wallpapers_with_fav(limit: u32, offset: u32) -> SqlResult<Vec<(Wallpaper, bool)>> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare(
        r#"
        SELECT w.*, f.wallpaper_id IS NOT NULL AS is_fav
        FROM wallpapers w
        LEFT JOIN favorites f ON w.id = f.wallpaper_id
        ORDER BY created_at DESC
        LIMIT ?1 OFFSET ?2
        "#,
    )?;

    let rows = stmt.query_map(params![limit, offset], |row| {
        Ok((
            Wallpaper {
                id: row.get("id")?,
                mongo_id: row.get("mongo_id")?,
                title: row.get("title")?,
                url: row.get("url")?,
                thumbnail: row.get("thumbnail")?,
                width: row.get("width")?,
                height: row.get("height")?,
                tags: row.get("tags")?,
                is_ai_generated: row.get("is_ai_generated")?,
            },
            row.get::<_, bool>("is_fav")?,
        ))
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
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_setting(key: &str) -> SqlResult<Option<String>> {
    let conn = get_connection()?;
    conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        params![key],
        |row| row.get(0),
    )
    .optional()
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

//
// Tauri Commands
//

#[tauri::command]
pub fn add_to_favorites(wallpaper_id: String) -> Result<(), String> {
    add_favorite(&wallpaper_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fetch_wallpapers(limit: u32, offset: u32) -> Result<Vec<(Wallpaper, bool)>, String> {
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
pub fn get_app_setting(key: String) -> Result<Option<String>, String> {
    get_setting(&key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_app_setting(key: String, value: String, category: String) -> Result<(), String> {
    set_setting(&key, &value, &category).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_wallpapers(limit: u32, offset: u32) -> Result<Vec<(Wallpaper, bool)>, String> {
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
