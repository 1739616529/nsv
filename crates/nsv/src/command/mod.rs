mod add;
mod r#use;
use crate::print_log_err;
use add::Add;
use async_trait::async_trait;
use r#use::Use;
use root::core::NsvCore;
use root::node::NsvCoreError;

#[derive(clap::Parser, Debug)]
pub enum Commands {
    /// 修改node版本
    #[clap(name = "use", bin_name = "use")]
    Use(Use),

    /// 下载node版本
    #[clap(name = "add", bin_name = "add")]
    Add(Add),
}
impl Commands {
    pub async fn call(&self, core: &mut NsvCore) {
        match self {
            Self::Use(cmd) => cmd.call(core).await,
            Self::Add(cmd) => cmd.call(core).await,
        }
    }
}

#[async_trait]
pub trait Command {
    async fn call(&self, core: &mut NsvCore) {
        match self.apply(core).await {
            Ok(()) => (),
            Err(err) => {
                match err {
                    NsvCoreError::NodeVersionLocalExist(version) => {
                        print_log_err!("node version {} already exist", version);
                    }
                    NsvCoreError::NodeVersionLocalNotFound => {
                        print_log_err!("node version not found by local");
                    }
                    NsvCoreError::NodeVersionRemoteNotFound => {
                        print_log_err!("node version not found byg remote")
                    }
                    NsvCoreError::IllegalityVersion(version) => {
                        print_log_err!("illegality version: {}", version)
                    }
                    _ => self.handle_err(err, core)
                };

            }
        }
    }

    async fn apply(&self, core: &mut NsvCore) -> Result<(), NsvCoreError>;

    fn handle_err(&self, err: NsvCoreError, core: &mut NsvCore) {
        let err_s = format!("{:?}", err);
        print_log_err!("{}.\n{:?}\n{:?}", err_s, core.context, core.config);
        std::process::exit(1);
    }
}
