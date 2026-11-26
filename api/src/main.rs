use actix_cors::Cors;
use actix_files as fs;
use actix_web::{web, App, HttpServer, HttpRequest};
use dotenvy::dotenv;
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use sqlx::migrate::MigrateDatabase;
use std::env;

mod auth;
mod db;
mod handlers;
mod models;

pub struct AppState {
    pub db: Pool<Sqlite>,
}

/// bcrypt hash of the default admin (password: admin123) seeded by the init migration.
/// Used to detect whether the seeded account is still in its pristine, uninitialized state.
const SEEDED_ADMIN_HASH: &str = "$2b$12$7sA8WyYtDwQX714GsvYl5uhck9k3u3rwmlyjAPtnp.w/SCSJthjHa";

/// Initialize the admin account from ADMIN_USERNAME / ADMIN_PASSWORD env vars.
///
/// Semantics (init-only):
/// - Applied while the account is still uninitialized: the seeded default admin
///   is untouched, or no admin exists yet.
/// - Never overwrites an existing admin account afterwards (e.g. password
///   changed from the console); rotate credentials via the console in that case.
async fn ensure_initial_admin(pool: &Pool<Sqlite>) {
    let username = env::var("ADMIN_USERNAME")
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "admin".to_string());
    let password = env::var("ADMIN_PASSWORD")
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "admin123".to_string());

    // 1. Configured user already exists -> never touch it.
    if let Ok(Some(user)) = db::get_user_by_username(pool, &username).await {
        if bcrypt::verify(&password, &user.password_hash).unwrap_or(false) {
            println!("[init] admin '{}' ready", username);
        } else {
            println!(
                "[init] admin '{}' exists; ADMIN_PASSWORD not applied (init-only, change password via console)",
                username
            );
        }
        return;
    }

    // 2. Pristine seeded default admin -> convert it to the configured credentials.
    if let Ok(Some(user)) = db::get_user_by_username(pool, "admin").await {
        if user.password_hash == SEEDED_ADMIN_HASH {
            // Already matches env config (default admin / admin123) -> nothing to do.
            if username == "admin" && bcrypt::verify(&password, SEEDED_ADMIN_HASH).unwrap_or(false) {
                println!("[init] admin 'admin' ready");
                return;
            }
            let new_hash = match bcrypt::hash(&password, 12) {
                Ok(h) => h,
                Err(e) => {
                    eprintln!("[init] failed to hash admin password: {}", e);
                    return;
                }
            };
            match db::update_user_account(pool, &user.id, Some(&username), Some(&new_hash)).await {
                Ok(_) => println!("[init] admin account initialized as '{}'", username),
                Err(e) => eprintln!("[init] failed to initialize admin account: {:?}", e),
            }
            return;
        }
    }

    // 3. An admin already exists (customized) -> env config is init-only, skip.
    match db::count_admin_users(pool).await {
        Ok(n) if n > 0 => {
            println!(
                "[init] admin already initialized; ADMIN_USERNAME/ADMIN_PASSWORD are ignored (applied only at initialization)"
            );
            return;
        }
        Err(e) => {
            eprintln!("[init] failed to check admin users: {:?}", e);
            return;
        }
        Ok(_) => {}
    }

    // 4. No admin at all -> create one from env config.
    let new_hash = match bcrypt::hash(&password, 12) {
        Ok(h) => h,
        Err(e) => {
            eprintln!("[init] failed to hash admin password: {}", e);
            return;
        }
    };
    let id = uuid::Uuid::new_v4().to_string();
    let email = format!("{}@example.com", username);
    match db::create_admin_user(pool, &id, &username, &new_hash, &email).await {
        Ok(_) => println!("[init] admin account created as '{}'", username),
        Err(e) => eprintln!("[init] failed to create admin account: {:?}", e),
    }
}

async fn index_html(_req: HttpRequest) -> actix_web::Result<fs::NamedFile> {
    let path = std::path::PathBuf::from("./public/index.html");
    if path.exists() {
        Ok(fs::NamedFile::open(path)?)
    } else {
        Err(actix_web::error::ErrorNotFound("index.html not found"))
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    
    // Default to a local SQLite database file in the project
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://data/shortlink.db".to_string());

    // Ensure the data directory exists
    if database_url.starts_with("sqlite://data/") {
        std::fs::create_dir_all("data").unwrap_or_else(|e| println!("Warning: could not create data dir: {}", e));
    }
    
    // Create database file if it doesn't exist (sqlx requires it)
    if !sqlx::Sqlite::database_exists(&database_url).await.unwrap_or(false) {
        sqlx::Sqlite::create_database(&database_url).await.expect("Failed to create database");
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run database migrations");

    // Initialize admin account from ADMIN_USERNAME / ADMIN_PASSWORD (init-only)
    ensure_initial_admin(&pool).await;

    let app_state = web::Data::new(AppState { db: pool });

    println!("Server starting at http://localhost:8080");

    HttpServer::new(move || {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            // Link redirection
            .route("/{short_code}", web::get().to(handlers::redirect))
            // Admin APIs
            .service(
                web::scope("/api")
                    .route("/shorten", web::post().to(handlers::shorten_link))
                    .route("/unlock", web::post().to(handlers::unlock_link))
                    .route("/domains", web::get().to(handlers::get_public_domains))
                    .service(
                        web::scope("/admin")
                            .route("/login", web::post().to(handlers::admin_login))
                            .route("/links", web::get().to(handlers::get_links))
                            .route("/links/{id}", web::patch().to(handlers::update_link))
                            .route("/links/{id}", web::delete().to(handlers::delete_link))
                            .route("/domains", web::get().to(handlers::get_domains))
                            .route("/domains", web::post().to(handlers::create_domain))
                            .route("/domains/{id}", web::delete().to(handlers::delete_domain))
                            .route("/stats", web::get().to(handlers::get_stats))
                            .route("/links/{id}/stats", web::get().to(handlers::get_link_stats))
                            .route("/account", web::get().to(handlers::get_account))
                            .route("/account", web::post().to(handlers::update_account))
                    )
            )
            // Serve static files from the 'public' directory
            .service(
                fs::Files::new("/assets", "./public/assets")
                    .show_files_listing()
                    .use_last_modified(true),
            )
            // Serve other static files (like favicon, robots.txt) from public root
            .service(fs::Files::new("/", "./public").index_file("index.html"))
            // SPA fallback: any other route should return index.html for React Router
            .default_service(web::route().to(index_html))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
