use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

const SECRET_KEY: &[u8] = b"slink_super_secret_key_123456"; // In production, use env var

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub is_admin: bool,
}

pub fn generate_token(user_id: &str, is_admin: bool) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs() + 24 * 3600; // 24 hours

    let claims = Claims {
        sub: user_id.to_string(),
        exp: expiration as usize,
        is_admin,
    };

    encode(&Header::default(), &claims, &EncodingKey::from_secret(SECRET_KEY))
}

pub fn verify_token(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(SECRET_KEY),
        &Validation::default(),
    )?;

    Ok(token_data.claims)
}