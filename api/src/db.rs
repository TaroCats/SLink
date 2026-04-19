use sqlx::{Pool, Sqlite};
use crate::models::{User, Link, Domain, Visit};
use uuid::Uuid;
use chrono::Utc;

pub async fn get_user_by_username(pool: &Pool<Sqlite>, username: &str) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE username = ?")
        .bind(username)
        .fetch_optional(pool)
        .await
}

pub async fn get_link_by_code(pool: &Pool<Sqlite>, code: &str) -> Result<Option<Link>, sqlx::Error> {
    sqlx::query_as::<_, Link>("SELECT * FROM links WHERE short_code = ? AND is_active = 1")
        .bind(code)
        .fetch_optional(pool)
        .await
}

pub async fn record_visit(pool: &Pool<Sqlite>, link_id: &str, ip: Option<&str>, user_agent: Option<&str>, referer: Option<&str>) -> Result<(), sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    
    // Begin transaction to insert visit and increment click_count
    let mut tx = pool.begin().await?;

    sqlx::query("INSERT INTO visits (id, link_id, ip_address, user_agent, referer, visited_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(&id)
        .bind(link_id)
        .bind(ip)
        .bind(user_agent)
        .bind(referer)
        .bind(Utc::now())
        .execute(&mut *tx)
        .await?;

    sqlx::query("UPDATE links SET click_count = click_count + 1 WHERE id = ?")
        .bind(link_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;
    
    Ok(())
}

pub async fn create_link(
    pool: &Pool<Sqlite>, 
    original_url: &str, 
    short_code: &str, 
    domain_id: Option<&str>, 
    user_id: Option<&str>,
    expires_at: Option<chrono::DateTime<Utc>>
) -> Result<Link, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    sqlx::query(
        "INSERT INTO links (id, original_url, short_code, domain_id, user_id, created_at, expires_at, is_active, click_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)"
    )
    .bind(&id)
    .bind(original_url)
    .bind(short_code)
    .bind(domain_id)
    .bind(user_id)
    .bind(now)
    .bind(expires_at)
    .execute(pool)
    .await?;

    // Fetch the created link to return
    get_link_by_code(pool, short_code).await.map(|l| l.unwrap())
}

pub async fn get_all_links(pool: &Pool<Sqlite>) -> Result<Vec<Link>, sqlx::Error> {
    sqlx::query_as::<_, Link>("SELECT * FROM links ORDER BY created_at DESC")
        .fetch_all(pool)
        .await
}

pub async fn get_all_domains(pool: &Pool<Sqlite>) -> Result<Vec<Domain>, sqlx::Error> {
    sqlx::query_as::<_, Domain>("SELECT * FROM domains ORDER BY created_at DESC")
        .fetch_all(pool)
        .await
}

pub async fn get_domain_by_id(pool: &Pool<Sqlite>, id: &str) -> Result<Option<Domain>, sqlx::Error> {
    sqlx::query_as::<_, Domain>("SELECT * FROM domains WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await
}

pub async fn create_domain(pool: &Pool<Sqlite>, domain: &str, is_primary: bool) -> Result<Domain, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    let is_primary_int = if is_primary { 1 } else { 0 };

    // Begin transaction
    let mut tx = pool.begin().await?;

    if is_primary {
        sqlx::query("UPDATE domains SET is_primary = 0").execute(&mut *tx).await?;
    }

    sqlx::query("INSERT INTO domains (id, domain, is_active, is_primary) VALUES (?, ?, 1, ?)")
        .bind(&id)
        .bind(domain)
        .bind(is_primary_int)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    // Since we just created it, it might not be immediately available if we don't query correctly or if there's a delay,
    // but SQLite is synchronous enough. Let's just return it directly if we can't fetch it to avoid unwrap panic.
    let created = get_domain_by_id(pool, &id).await?;
    if let Some(d) = created {
        Ok(d)
    } else {
        // Fallback construct
        Ok(Domain {
            id,
            domain: domain.to_string(),
            is_active: 1,
            is_primary: is_primary_int,
            created_at: Some(Utc::now()),
            ssl_cert_path: None,
        })
    }
}

pub async fn delete_domain(pool: &Pool<Sqlite>, id: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM domains WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn get_stats(pool: &Pool<Sqlite>) -> Result<(i64, i64, i64), sqlx::Error> {
    let links_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM links").fetch_one(pool).await?;
    let visits_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM visits").fetch_one(pool).await?;
    
    // Sum of clicks in links
    let clicks_sum: Option<(i64,)> = sqlx::query_as("SELECT SUM(click_count) FROM links").fetch_optional(pool).await?;
    let total_clicks = clicks_sum.map(|(c,)| c).unwrap_or(0);

    Ok((links_count.0, visits_count.0, total_clicks))
}