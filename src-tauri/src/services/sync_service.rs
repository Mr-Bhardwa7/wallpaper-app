use crate::services::db_services::{add_or_update_wallpaper, get_last_synced_mongo_id, Wallpaper};
use reqwest;
use std::error::Error;

pub async fn fetch_from_mongo_and_cache(batch_size: u32) -> Result<(), Box<dyn Error>> {
    // Get the last synced MongoDB wallpaper ID (if any)
    let last_mongo_id = get_last_synced_mongo_id().unwrap_or(None);

    // Build the request URL (your backend must support this query pattern)
    let url = if let Some(last_id) = last_mongo_id {
        format!(
            "http://localhost:3000/api/wallpapers?after={}&limit={}",
            last_id, batch_size
        )
    } else {
        format!("http://localhost:3000/api/wallpapers?limit={}", batch_size)
    };

    // Make the HTTP request
    let response = reqwest::get(&url).await?;
    if !response.status().is_success() {
        return Err(format!("Failed to fetch: {}", response.status()).into());
    }

    // Parse the JSON response
    let wallpapers: Vec<Wallpaper> = response.json().await?;

    println!(
        "Wallpaper Response:\n{}",
        serde_json::to_string_pretty(&wallpapers).unwrap_or_default()
    );

    // Add or update each wallpaper in SQLite
    for wp in wallpapers {
        add_or_update_wallpaper(&wp)?;
    }

    Ok(())
}
