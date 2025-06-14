# import sys
# import os
# import json
# import yt_dlp

# def download_video(url):
#     try:
#         output_dir = os.path.join(os.getcwd(), "downloads")
#         os.makedirs(output_dir, exist_ok=True)

#         ydl_opts = {
#             'outtmpl': os.path.join(output_dir, '%(title).70s.%(ext)s'),
#             'format': 'mp4',
#             'quiet': True,               # 👈 suppress logs
#             'no_warnings': True,         # 👈 suppress warnings
#             'logger': MyLogger(),        # 👈 suppress error logs too
#             'cookies': 'cookies/cookies.txt',

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

# class MyLogger:
#     def debug(self, msg): pass
#     def warning(self, msg): pass
#     def error(self, msg): pass

# if __name__ == "__main__":
#     if len(sys.argv) < 2:
#         print(json.dumps({"status": "error", "error": "No URL provided"}))
#     else:
#         download_video(sys.argv[1])


import sys
import os
import json
import yt_dlp

class MyLogger:
    def debug(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg): pass

def download_video(url):
    try:
        output_dir = os.path.join(os.getcwd(), "downloads")
        os.makedirs(output_dir, exist_ok=True)

        ydl_opts = {
            'outtmpl': os.path.join(output_dir, '%(title).70s.%(ext)s'),
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'quiet': True,
            'no_warnings': True,
            'logger': MyLogger(),
            'cookies': 'cookies.txt',  # Optional
            'merge_output_format': 'mp4'
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            filename_only = os.path.basename(filename)
            print(json.dumps({
                "status": "success",
                "filename": filename_only
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
