use std::{env, sync::Arc};

#[derive(Debug)]
pub struct Config {
    pub port: String,
    pub host: String,
    pub db_url: String,
    pub base_url: String,
}

impl Config {
    pub fn build() -> Arc<Self> {
        dotenvy::dotenv().ok();

        let mut current_dir = env::current_exe().expect("current_dir get error");
        current_dir.pop();
        current_dir.push("db.db");


        // sqlite://path/to/db.sqlite?mode=rwc
        let db_url = format!("sqlite:{}?mode=rwc", current_dir.to_str().unwrap());


        let port = env::var("PORT").expect("PORT env var get error");
        let host = env::var("HOST").expect("HOST env var get error");

        println!("{}", db_url);

        Arc::new(Config {
            db_url,
            port,
            host,
            base_url: "https://nodejs.org/dist".to_string()
        })
    }
}
