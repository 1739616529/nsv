use futures_util::StreamExt;
use std::path::Path;
use tokio::{fs::create_dir_all, io::AsyncWriteExt};
use tokio::fs::File;

pub async fn download_file(url: &str, path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let mut file = File::create(path).await?;
    let res = reqwest::get(url).await?;
    if  res.status().as_str() != "200" {
        return Err(format!("{}", res.status().as_str()).into());
    }
    let mut stream = res.bytes_stream();
    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result?;
        file.write_all(&chunk).await?;
    }
    file.flush().await?;
    Ok(())
}

pub async fn unzip_file(
    zip_file_dir: &Path,
    output_dir: &Path,
) -> Result<(), Box<dyn std::error::Error>> {
    create_dir_all(output_dir.parent().unwrap()).await.unwrap();

    #[cfg(windows)]
    {
        sevenz_rust::decompress_file(zip_file_dir, output_dir).unwrap();
    }

    #[cfg(unix)]
    {

        use tar::Archive;
        use tokio::io::AsyncReadExt;
        use xz2::read::XzDecoder;
        let mut unzip_file = File::open(zip_file_dir).await.unwrap();
        let mut unzip_file_buf = Vec::new();
        unzip_file.read_to_end(&mut unzip_file_buf).await.unwrap();
        let xz = XzDecoder::new(&unzip_file_buf[..]);
        let mut archive = Archive::new(xz);
        archive.unpack(output_dir).unwrap();
    }



    Ok(())
}

#[cfg(test)]
mod test {

    use std::path::PathBuf;

    use super::download_file;

    #[tokio::test]
    #[cfg(unix)]
    async fn test_download_file() {
        let file_url = "http://127.0.0.1:3000/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz";
        let ret = download_file(file_url, &PathBuf::from("node-v20.10.0-linux-x64.tar.xz")).await;
        assert!(matches!(ret, Ok(())));
    }
    #[tokio::test]
    #[cfg(windows)]
    async fn test_download_file() {
        let file_url = "http://127.0.0.1:3000/dist/v20.10.0/node-v20.10.0-win-x64.7z";
        let ret = download_file(file_url, &PathBuf::from("node-v20.10.0-win-x64.7z")).await;
        assert!(matches!(ret, Ok(())));
    }
}
