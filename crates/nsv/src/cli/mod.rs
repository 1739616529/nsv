use clap::Parser;

use crate::command::Commands;



#[derive(clap::Parser, Debug)]
#[clap(name = "nsv", version = env!("CARGO_PKG_VERSION"), bin_name = "nsv")]
pub struct Cli {
    // pub core: NsvCore,

    #[clap(subcommand)]
    pub subcommand: Commands,
}

pub fn parse() -> Cli {
    Cli::parse()
}
