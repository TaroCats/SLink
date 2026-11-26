use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::models::{
    AccountUpdateRequest, CreateDomainRequest, LoginRequest, LoginResponse, ShortenRequest,
    ShortenResponse, UnlockRequest, UnlockResponse,
};
use crate::AppState;
use crate::auth::{generate_token, verify_token, Claims};
use crate::db;
use bcrypt::{hash, verify};
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use serde_json::json;

fn extract_admin_claims(req: &HttpRequest) -> Result<Claims, HttpResponse> {
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                if let Ok(claims) = verify_token(token) {
                    if claims.is_admin {
                        return Ok(claims);
                    }
                }
            }
        }
    }
    Err(HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"})))
}

fn generate_short_code() -> String {
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect()
}

pub async fn get_public_domains(
    data: web::Data<AppState>,
) -> impl Responder {
    match db::get_all_domains(&data.db).await {
        Ok(domains) => HttpResponse::Ok().json(json!({
            "data": domains
        })),
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Failed to fetch domains"})),
    }
}

pub async fn shorten_link(
    req: web::Json<ShortenRequest>,
    data: web::Data<AppState>,
    http_req: HttpRequest,
) -> impl Responder {
    let pool = &data.db;
    
    // Auth logic for custom code? Let's just allow it for now, or check auth if custom code
    // For a real app, only logged in users might set custom codes.
    
    let code = match &req.custom_code {
        Some(c) if !c.is_empty() => {
            // Check if exists
            if db::get_link_by_code(pool, c).await.unwrap_or(None).is_some() {
                return HttpResponse::BadRequest().json(json!({"error": "Custom code already in use"}));
            }
            c.clone()
        }
        _ => generate_short_code(), // Might collide, should loop in production
    };

    match db::create_link(pool, &req.url, &code, None, None, req.password.as_deref()).await {
        Ok(_) => {
            // We just use the host of the request (or X-Forwarded-Host if behind proxy)
            let host = http_req.headers().get("X-Forwarded-Host")
                .or_else(|| http_req.headers().get("Host"))
                .and_then(|h| h.to_str().ok())
                .unwrap_or("localhost:8080");
                
            let scheme = if http_req.headers().get("X-Forwarded-Proto").is_some() {
                "https".to_string()
            } else {
                http_req.connection_info().scheme().to_owned()
            };
            
            let short_url = format!("{}://{}/{}", scheme, host, code);
            
            HttpResponse::Ok().json(ShortenResponse {
                short_url,
                short_code: code,
                qr_code: None, // Can be implemented later
            })
        }
        Err(e) => {
            eprintln!("DB Error: {:?}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to create short link"}))
        }
    }
}

pub async fn redirect(
    path: web::Path<String>,
    data: web::Data<AppState>,
    req: HttpRequest,
) -> impl Responder {
    let code = path.into_inner();
    let pool = &data.db;

    if let Ok(Some(link)) = db::get_link_by_code(pool, &code).await {
        
        // Check if password protected
        if link.password.is_some() && !link.password.as_ref().unwrap().is_empty() {
            // Need password verification
            // Redirect to frontend unlock page
            return HttpResponse::Found()
                .append_header(("Location", format!("/unlock/{}", code)))
                .finish();
        }

        // Record visit asynchronously
        let ip = req.connection_info().realip_remote_addr().map(|s| s.to_string());
        let ua = req.headers().get("User-Agent").and_then(|v| v.to_str().ok().map(|s| s.to_string()));
        let referer = req.headers().get("Referer").and_then(|v| v.to_str().ok().map(|s| s.to_string()));
        let link_id = link.id.clone();
        
        // Parse device, os, browser from User-Agent (Basic implementation, can be improved)
        let (device, os, browser) = if let Some(ref ua_str) = ua {
            let d = if ua_str.contains("Mobile") || ua_str.contains("Android") || ua_str.contains("iPhone") { "Mobile" } else { "Desktop" };
            let o = if ua_str.contains("Windows") { "Windows" } 
                    else if ua_str.contains("Mac OS X") { "macOS" }
                    else if ua_str.contains("Android") { "Android" }
                    else if ua_str.contains("Linux") { "Linux" }
                    else if ua_str.contains("iOS") || ua_str.contains("iPhone") { "iOS" }
                    else { "Unknown" };
            let b = if ua_str.contains("Chrome") && !ua_str.contains("Edg") { "Chrome" }
                    else if ua_str.contains("Safari") && !ua_str.contains("Chrome") { "Safari" }
                    else if ua_str.contains("Firefox") { "Firefox" }
                    else if ua_str.contains("Edg") { "Edge" }
                    else { "Unknown" };
            (Some(d.to_string()), Some(o.to_string()), Some(b.to_string()))
        } else {
            (None, None, None)
        };

        let pool_clone = pool.clone();
        actix_web::rt::spawn(async move {
            let _ = db::record_visit(&pool_clone, &link_id, ip.as_deref(), ua.as_deref(), referer.as_deref(), device.as_deref(), os.as_deref(), browser.as_deref()).await;
        });

        HttpResponse::Found()
            .append_header(("Location", link.original_url))
            .finish()
    } else {
        // If not found, instead of raw 404 text, we could redirect to frontend or return 404
        HttpResponse::NotFound().body("Link not found or expired")
    }
}

pub async fn unlock_link(
    req: web::Json<UnlockRequest>,
    data: web::Data<AppState>,
    http_req: HttpRequest,
) -> impl Responder {
    let pool = &data.db;
    
    if let Ok(Some(link)) = db::get_link_by_code(pool, &req.short_code).await {

        if let Some(ref pw) = link.password {
            if !pw.is_empty() && req.password.as_deref() != Some(pw) {
                return HttpResponse::Unauthorized().json(json!({"error": "Incorrect password"}));
            }
        }

        // Record visit asynchronously since they successfully unlocked it
        let ip = http_req.connection_info().realip_remote_addr().map(|s| s.to_string());
        let ua = http_req.headers().get("User-Agent").and_then(|v| v.to_str().ok().map(|s| s.to_string()));
        let referer = http_req.headers().get("Referer").and_then(|v| v.to_str().ok().map(|s| s.to_string()));
        let link_id = link.id.clone();
        
        let (device, os, browser) = if let Some(ref ua_str) = ua {
            let d = if ua_str.contains("Mobile") || ua_str.contains("Android") || ua_str.contains("iPhone") { "Mobile" } else { "Desktop" };
            let o = if ua_str.contains("Windows") { "Windows" } 
                    else if ua_str.contains("Mac OS X") { "macOS" }
                    else if ua_str.contains("Android") { "Android" }
                    else if ua_str.contains("Linux") { "Linux" }
                    else if ua_str.contains("iOS") || ua_str.contains("iPhone") { "iOS" }
                    else { "Unknown" };
            let b = if ua_str.contains("Chrome") && !ua_str.contains("Edg") { "Chrome" }
                    else if ua_str.contains("Safari") && !ua_str.contains("Chrome") { "Safari" }
                    else if ua_str.contains("Firefox") { "Firefox" }
                    else if ua_str.contains("Edg") { "Edge" }
                    else { "Unknown" };
            (Some(d.to_string()), Some(o.to_string()), Some(b.to_string()))
        } else {
            (None, None, None)
        };

        let pool_clone = pool.clone();
        actix_web::rt::spawn(async move {
            let _ = db::record_visit(&pool_clone, &link_id, ip.as_deref(), ua.as_deref(), referer.as_deref(), device.as_deref(), os.as_deref(), browser.as_deref()).await;
        });

        HttpResponse::Ok().json(UnlockResponse {
            original_url: link.original_url
        })
    } else {
        HttpResponse::NotFound().json(json!({"error": "Link not found"}))
    }
}
pub async fn admin_login(
    req: web::Json<LoginRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    let pool = &data.db;

    if let Ok(Some(user)) = db::get_user_by_username(pool, &req.username).await {
        if verify(&req.password, &user.password_hash).unwrap_or(false) {
            let is_admin = user.is_admin == 1;
            match generate_token(&user.id, is_admin) {
                Ok(token) => {
                    return HttpResponse::Ok().json(LoginResponse {
                        token,
                        expires_in: 86400,
                    });
                }
                Err(_) => {
                    return HttpResponse::InternalServerError().json(json!({"error": "Token generation failed"}));
                }
            }
        }
    }

    HttpResponse::Unauthorized().json(json!({"error": "Invalid credentials"}))
}

pub async fn get_links(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> impl Responder {
    if extract_admin_claims(&req).is_err() {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    match db::get_all_admin_links(&data.db).await {
        Ok(links) => HttpResponse::Ok().json(json!({
            "data": links,
            "total": links.len(),
            "page": 1
        })),
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Failed to fetch links"})),
    }
}

pub async fn update_link(
    req: HttpRequest,
    path: web::Path<String>,
    body: web::Json<serde_json::Value>,
    data: web::Data<AppState>,
) -> impl Responder {
    if extract_admin_claims(&req).is_err() {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    let link_id = path.into_inner();
    let body = body.into_inner();

    let password = if let Some(v) = body.get("password") {
        if v.is_null() {
            Some(None)
        } else if let Some(s) = v.as_str() {
            let trimmed = s.trim().to_string();
            if trimmed.is_empty() {
                Some(None)
            } else {
                Some(Some(trimmed))
            }
        } else {
            return HttpResponse::BadRequest().json(json!({"error": "Invalid password"}));
        }
    } else {
        None
    };

    let original_url = if let Some(v) = body.get("original_url") {
        if let Some(s) = v.as_str() {
            let trimmed = s.trim().to_string();
            if !trimmed.is_empty() {
                Some(trimmed)
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };

    match db::update_link_admin_fields(&data.db, &link_id, password, original_url).await {
        Ok(_) => HttpResponse::Ok().json(json!({"message": "Link updated successfully"})),
        Err(e) => {
            eprintln!("Failed to update link: {:?}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to update link"}))
        }
    }
}

pub async fn delete_link(
    req: HttpRequest,
    path: web::Path<String>,
    data: web::Data<AppState>,
) -> impl Responder {
    if extract_admin_claims(&req).is_err() {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    let link_id = path.into_inner();
    match db::delete_link(&data.db, &link_id).await {
        Ok(_) => HttpResponse::Ok().json(json!({"message": "Link deleted successfully"})),
        Err(e) => {
            eprintln!("Failed to delete link: {:?}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to delete link"}))
        }
    }
}

pub async fn get_account(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> impl Responder {
    let claims = match extract_admin_claims(&req) {
        Ok(c) => c,
        Err(resp) => return resp,
    };

    match db::get_user_by_id(&data.db, &claims.sub).await {
        Ok(Some(user)) => HttpResponse::Ok().json(json!({
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin == 1
        })),
        Ok(None) => HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"})),
        Err(e) => {
            eprintln!("Failed to fetch account: {:?}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to fetch account"}))
        }
    }
}

pub async fn update_account(
    req: HttpRequest,
    body: web::Json<AccountUpdateRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    let claims = match extract_admin_claims(&req) {
        Ok(c) => c,
        Err(resp) => return resp,
    };

    let user = match db::get_user_by_id(&data.db, &claims.sub).await {
        Ok(Some(u)) => u,
        Ok(None) => return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"})),
        Err(e) => {
            eprintln!("Failed to fetch user: {:?}", e);
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to update account"}));
        }
    };

    if !verify(&body.current_password, &user.password_hash).unwrap_or(false) {
        return HttpResponse::Unauthorized().json(json!({"error": "Invalid current password"}));
    }

    // Username: empty / unchanged means keep
    let new_username = body.new_username.as_deref().map(str::trim).filter(|s| !s.is_empty());
    let mut username_to_set: Option<&str> = None;
    if let Some(username) = new_username {
        if username.chars().count() > 50 {
            return HttpResponse::BadRequest().json(json!({"error": "Username must be at most 50 characters"}));
        }
        if username != user.username {
            match db::get_user_by_username(&data.db, username).await {
                Ok(Some(_)) => {
                    return HttpResponse::BadRequest().json(json!({"error": "Username already taken"}));
                }
                Ok(None) => username_to_set = Some(username),
                Err(e) => {
                    eprintln!("Failed to check username: {:?}", e);
                    return HttpResponse::InternalServerError().json(json!({"error": "Failed to update account"}));
                }
            }
        }
    }

    // Password: empty means keep
    let new_password = body.new_password.as_deref().map(str::trim).filter(|s| !s.is_empty());
    let mut password_hash_to_set: Option<String> = None;
    if let Some(password) = new_password {
        if password.chars().count() < 8 {
            return HttpResponse::BadRequest().json(json!({"error": "New password must be at least 8 characters"}));
        }
        match hash(password, 12) {
            Ok(h) => password_hash_to_set = Some(h),
            Err(e) => {
                eprintln!("Failed to hash password: {:?}", e);
                return HttpResponse::InternalServerError().json(json!({"error": "Failed to update account"}));
            }
        }
    }

    if username_to_set.is_none() && password_hash_to_set.is_none() {
        return HttpResponse::BadRequest().json(json!({"error": "Nothing to update"}));
    }

    match db::update_user_account(&data.db, &user.id, username_to_set, password_hash_to_set.as_deref()).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "message": "Account updated successfully",
            "username": username_to_set.unwrap_or(&user.username)
        })),
        Err(e) => {
            eprintln!("Failed to update account: {:?}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to update account"}))
        }
    }
}

pub async fn get_domains(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> impl Responder {
    if extract_admin_claims(&req).is_err() {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    match db::get_all_domains(&data.db).await {
        Ok(domains) => HttpResponse::Ok().json(json!({
            "data": domains,
            "total": domains.len(),
            "page": 1
        })),
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Failed to fetch domains"})),
    }
}

pub async fn create_domain(
    req: HttpRequest,
    body: web::Json<CreateDomainRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    if extract_admin_claims(&req).is_err() {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    let is_primary = body.is_primary.unwrap_or(false);
    match db::create_domain(&data.db, &body.domain, is_primary).await {
        Ok(domain) => HttpResponse::Ok().json(domain),
        Err(e) => {
            eprintln!("Error creating domain: {:?}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to create domain"}))
        }
    }
}

pub async fn delete_domain(
    req: HttpRequest,
    path: web::Path<String>,
    data: web::Data<AppState>,
) -> impl Responder {
    if extract_admin_claims(&req).is_err() {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    let domain_id = path.into_inner();
    match db::delete_domain(&data.db, &domain_id).await {
        Ok(_) => HttpResponse::Ok().json(json!({"message": "Domain deleted successfully"})),
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Failed to delete domain"})),
    }
}

pub async fn get_link_stats(
    req: HttpRequest,
    path: web::Path<String>,
    data: web::Data<AppState>,
) -> impl Responder {
    if extract_admin_claims(&req).is_err() {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    let link_id = path.into_inner();
    match db::get_link_detailed_stats(&data.db, &link_id).await {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(e) => {
            eprintln!("Failed to fetch link stats: {:?}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to fetch stats"}))
        }
    }
}
pub async fn get_stats(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> impl Responder {
    if extract_admin_claims(&req).is_err() {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    match db::get_stats(&data.db).await {
        Ok((links_count, visits_count, total_clicks)) => {
            HttpResponse::Ok().json(json!({
                "total_links": links_count,
                "total_visits": visits_count,
                "total_clicks": total_clicks
            }))
        }
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Failed to fetch stats"})),
    }
}
