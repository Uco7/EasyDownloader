import sys
import os
import json
import yt_dlp
import subprocess

# Logger for yt_dlp
class MyLogger:
    def debug(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg): 
        print(json.dumps({"status": "error", "error": str(msg)}))

# Force re-encode to browser-friendly MP4
def reencode_to_h264(input_path, output_path):
    try:
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-movflags', '+faststart',
            '-y',  # Overwrite if exists
            output_path
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return True
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": f"FFmpeg Error: {str(e)}"
        }))
        return False

def download_video(url):
    output_dir = os.path.join(os.getcwd(), "downloads")
    os.makedirs(output_dir, exist_ok=True)

    ydl_opts = {
        'outtmpl': os.path.join(output_dir, '%(title).70s.%(ext)s'),
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
        'merge_output_format': 'mp4',
        'noplaylist': True,
        'quiet': True,
        'cookiefile': './cookies/cookies.txt',
        'logger': MyLogger(),
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            original_filename = ydl.prepare_filename(info)
            reencoded_filename = original_filename.replace(".mp4", "_h264.mp4")

            if reencode_to_h264(original_filename, reencoded_filename):
                os.remove(original_filename)  # clean up original
                print(json.dumps({
                    "status": "success",
                    "filename": os.path.basename(reencoded_filename)
                }))
            else:
                print(json.dumps({
                    "status": "error",
                    "error": "Re-encoding failed"
                }))

    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "error": "No URL provided"}))
    else:
        download_video(sys.argv[1])
