use actix_cors::Cors;
use actix_files as fs;
use actix_web::{web, App, HttpServer, HttpResponse, HttpRequest};
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
                    .route("/domains", web::get().to(handlers::get_public_domains))
                    .service(
                        web::scope("/admin")
                            .route("/login", web::post().to(handlers::admin_login))
                            .route("/links", web::get().to(handlers::get_links))
                            .route("/domains", web::get().to(handlers::get_domains))
                            .route("/domains", web::post().to(handlers::create_domain))
                            .route("/domains/{id}", web::delete().to(handlers::delete_domain))
                            .route("/stats", web::get().to(handlers::get_stats))
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