use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub email: String,
    pub is_admin: i64,
    pub created_at: Option<DateTime<Utc>>,
    pub last_login: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Domain {
    pub id: String,
    pub domain: String,
    pub is_active: i64,
    pub is_primary: i64,
    pub created_at: Option<DateTime<Utc>>,
    pub ssl_cert_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Link {
    pub id: String,
    pub original_url: String,
    pub short_code: String,
    pub domain_id: Option<String>,
    pub user_id: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub is_active: i64,
    pub click_count: i64,
    #[serde(skip_serializing)]
    pub password: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct AdminLink {
    pub id: String,
    pub original_url: String,
    pub short_code: String,
    pub domain_id: Option<String>,
    pub user_id: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
    pub is_active: i64,
    pub click_count: i64,
    pub has_password: i64,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Visit {
    pub id: String,
    pub link_id: Option<String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub referer: Option<String>,
    pub visited_at: Option<DateTime<Utc>>,
    pub country: Option<String>,
    pub device: Option<String>,
    pub os: Option<String>,
    pub browser: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ShortenRequest {
    pub url: String,
    pub custom_code: Option<String>,
    #[allow(dead_code)]
    pub domain_id: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
    pub use_tcn: Option<bool>,
    pub password: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ShortenResponse {
    pub short_url: String,
    pub short_code: String,
    pub tcn_url: Option<String>,
    pub qr_code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDomainRequest {
    pub domain: String,
    pub is_primary: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub expires_in: u64,
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

#[derive(Debug, Deserialize)]
pub struct UnlockRequest {
    pub short_code: String,
    pub password: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct UnlockResponse {
    pub original_url: String,
}

#[derive(Debug, Serialize)]
pub struct LinkStats {
    pub total_visits: i64,
    pub devices: Vec<(String, i64)>,
    pub os: Vec<(String, i64)>,
    pub browsers: Vec<(String, i64)>,
    pub referers: Vec<(String, i64)>,
}
