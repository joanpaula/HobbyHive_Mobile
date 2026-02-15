export function getContentType(fileName: string, mimeType?: string): string {
    if (mimeType) return mimeType;

    const extension = fileName.split(".").pop()?.toLowerCase();

    switch(extension) {
        case "jpg":
            return "image/jpg";
        case "jpeg":
            return "image/jpeg";  
        case "png":
            return "image/png";  
        case "mp4":
            return "video/mp4";    
        case "mp3":
            return "audio/mpeg";
        case "wav":
            return "audio/wav";
        default:
            return "application/octet-stream"    
    }
}