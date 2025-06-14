



# import sys
# import os
# import json
# import yt_dlp

# class MyLogger:
#     def debug(self, msg): pass
#     def warning(self, msg): pass
#     def error(self, msg): 
#         print(json.dumps({
#             "status": "error",
#             "error": str(msg)
#         }))

# def download_video(url):
#     try:
#         output_dir = os.path.join(os.getcwd(), "downloads")
#         os.makedirs(output_dir, exist_ok=True)

#         ydl_opts = {
#     #     'outtmpl': os.path.join(output_dir, '%(title).70s.%(ext)s'),
#     # 'format': 'bestvideo+bestaudio/best',
#     # 'merge_output_format': 'mp4',
#     # 'noplaylist': True,
#     # 'quiet': False,
#     # 'nocheckcertificate': True,
#     # 'cookiefile': 'cookies.txt',  # <-- here
#     # 'logger': MyLogger(),

#     'outtmpl': os.path.join(output_dir, '%(title).70s.%(ext)s'),
#     'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
#     'merge_output_format': 'mp4',
#     'noplaylist': True,
#     'quiet': False,
#     'nocheckcertificate': True,
#     'cookiefile': 'cookies.txt',  # optional, only if needed
#     'logger': MyLogger(),

#         }

#         with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#             info = ydl.extract_info(url, download=True)
#             filename = ydl.prepare_filename(info)
#             filename_only = os.path.basename(filename)
#             print(json.dumps({
#                 "status": "success",
#                 "filename": filename_only
#             }))
#     except Exception as e:
#         print(json.dumps({
#             "status": "error",
#             "error": str(e)
#         }))

# if __name__ == "__main__":
#     if len(sys.argv) < 2:
#         print(json.dumps({"status": "error", "error": "No URL provided"}))
#     else:
#         download_video(sys.argv[1])


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
                'cookiefile': 'cookies.txt',  # optional, only if needed

            'nocheckcertificate': True,
            'logger': MyLogger(),
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            original_filename = ydl.prepare_filename(info)
            reencoded_filename = original_filename.replace(".mp4", "_h264.mp4")

            # Re-encode to H.264
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

