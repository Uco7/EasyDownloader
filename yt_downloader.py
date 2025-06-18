import sys
import os
import json
import yt_dlp
import subprocess

class MyLogger:
    def debug(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg): 
        print(json.dumps({
            "status": "error",
            "error": str(msg)
        }))

def reencode_to_h264(input_path, output_path):
    try:
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-strict', 'experimental',
            '-movflags', '+faststart',
            '-y',  # overwrite if exists
            output_path
        ]
        subprocess.run(cmd, check=True)
        return True
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": f"FFmpeg Error: {str(e)}"
        }))
        return False

def download_video(url):
    try:
        output_dir = os.path.join(os.getcwd(), "downloads")
        os.makedirs(output_dir, exist_ok=True)

        ydl_opts = {
            'outtmpl': os.path.join(output_dir, '%(title).70s.%(ext)s'),
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
            'merge_output_format': 'mp4',
            'noplaylist': True,
            'quiet': False,
            'nocheckcertificate': True,
            'logger': MyLogger(),
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)

            if 'requested_downloads' not in info:
                raise Exception("Video not available for download.")

            original_filename = ydl.prepare_filename(info)
            reencoded_filename = original_filename.replace(".mp4", "_h264.mp4")

            if reencode_to_h264(original_filename, reencoded_filename):
                os.remove(original_filename)  # optional: remove original
                print(json.dumps({
                    "status": "success",
                    "filename": os.path.basename(reencoded_filename)
                }))
            else:
                print(json.dumps({
                    "status": "error",
                    "error": "Failed to re-encode video"
                }))
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        if "Sign in to confirm your age" in error_msg or "login" in error_msg.lower():
            print(json.dumps({
                "status": "error",
                "error": "This video is age-restricted or login-protected and cannot be downloaded."
            }))
        else:
            print(json.dumps({
                "status": "error",
                "error": error_msg
            }))
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": str(e)
        }))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "error": "No URL provided"}))
    else:
        download_video(sys.argv[1])
