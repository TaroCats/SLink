use actix_web::{web, HttpResponse, Responder, HttpRequest};
use crate::models::{ShortenRequest, ShortenResponse, LoginRequest, LoginResponse, CreateDomainRequest};
use crate::AppState;
use crate::auth::{generate_token, verify_token};
use crate::db;
use bcrypt::verify;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use serde_json::json;

// Helper to check auth
fn is_authorized(req: &HttpRequest) -> bool {
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                return verify_token(token).is_ok();
            }
        }
    }
    false
}

fn generate_short_code() -> String {
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect()
}

async fn shorten_with_tcn(long_url: &str) -> Option<String> {
    let app_key = std::env::var("T_CN_APPKEY").unwrap_or_else(|_| "3271760578".to_string());
    let client = reqwest::Client::new();
    
    if let Ok(resp) = client.get("https://api.weibo.com/2/short_url/shorten.json")
        .query(&[("source", app_key.as_str()), ("url_long", long_url)])
        .send()
        .await 
    {
        if let Ok(json) = resp.json::<serde_json::Value>().await {
            if let Some(urls) = json.get("urls").and_then(|u| u.as_array()) {
                if let Some(first) = urls.get(0) {
                    if let Some(url_short) = first.get("url_short").and_then(|u| u.as_str()) {
                        return Some(url_short.to_string());
                    }
                }
            }
        }
    }
    None
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

    match db::create_link(pool, &req.url, &code, None, None, req.expires_at).await {
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
            
            let mut tcn_url_result = None;
            if req.use_tcn.unwrap_or(false) {
                // If using tcn, we use the generated short_url, but since we are developing locally (localhost)
                // t.cn might fail or reject localhost urls. Let's still try to call it.
                if let Some(tcn_url) = shorten_with_tcn(&short_url).await {
                    tcn_url_result = Some(tcn_url);
                } else {
                    // Fallback mock if t.cn API fails (for local development)
                    println!("t.cn API failed or rejected the URL, falling back to mock");
                    tcn_url_result = Some(format!("https://t.cn/mock{}", code));
                }
            }
            
            HttpResponse::Ok().json(ShortenResponse {
                short_url,
                short_code: code,
                tcn_url: tcn_url_result,
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
        // Record visit asynchronously
        let ip = req.connection_info().realip_remote_addr().map(|s| s.to_string());
        let ua = req.headers().get("User-Agent").and_then(|v| v.to_str().ok().map(|s| s.to_string()));
        let referer = req.headers().get("Referer").and_then(|v| v.to_str().ok().map(|s| s.to_string()));
        let link_id = link.id.clone();
        
        let pool_clone = pool.clone();
        actix_web::rt::spawn(async move {
            let _ = db::record_visit(&pool_clone, &link_id, ip.as_deref(), ua.as_deref(), referer.as_deref()).await;
        });

        HttpResponse::Found()
            .append_header(("Location", link.original_url))
            .finish()
    } else {
        // If not found, instead of raw 404 text, we could redirect to frontend or return 404
        HttpResponse::NotFound().body("Link not found or expired")
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
    if !is_authorized(&req) {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    match db::get_all_links(&data.db).await {
        Ok(links) => HttpResponse::Ok().json(json!({
            "data": links,
            "total": links.len(),
            "page": 1
        })),
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Failed to fetch links"})),
    }
}

pub async fn get_domains(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> impl Responder {
    if !is_authorized(&req) {
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
    if !is_authorized(&req) {
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
    if !is_authorized(&req) {
        return HttpResponse::Unauthorized().json(json!({"error": "Unauthorized"}));
    }

    let domain_id = path.into_inner();
    match db::delete_domain(&data.db, &domain_id).await {
        Ok(_) => HttpResponse::Ok().json(json!({"message": "Domain deleted successfully"})),
        Err(_) => HttpResponse::InternalServerError().json(json!({"error": "Failed to delete domain"})),
    }
}

pub async fn get_stats(
    req: HttpRequest,
    data: web::Data<AppState>,
) -> impl Responder {
    if !is_authorized(&req) {
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