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
cookie_header = """LOGIN_INFO=AFmmF2swRQIgEO27tKKirA_XTSGat_OpfEpX2fcA0knoivQmvIB4-iACIQD2EXb0e3jQkUBIjEIidKLh6qAIqaHmkAye1LeaREUO2w:QUQ3MjNmeWVrQ3VTN0N0bUV6a2ozbTJHRTE3ZGhpd1dvZVZiQlFHelNkOTlvYXdERjd4M1JBcFpvOUlSZmc0TGkybHBCU0w3bURLcGlnTUdhMFh0ZjZMRTlta285V0VWOF9sVVVVYTljRFRROFJTQVhiamxOa1lPejlVTVd4NW9iR2tTcTNLRV9vS2ZoUURFa2FjcEYzUEQ5SlNFY19JbEhn; HSID=AxnZRiX8G-8ROtkMv; SSID=A0qMrsyTZn66DM5-e; APISID=PaYSEOiWBBweWHmB/AqXJfWK6lRVKwf0dH; SAPISID=SheId5oGHZ5RIaUx/AGT1FmGG8k8M_I4fQ; __Secure-1PAPISID=SheId5oGHZ5RIaUx/AGT1FmGG8k8M_I4fQ; __Secure-3PAPISID=SheId5oGHZ5RIaUx/AGT1FmGG8k8M_I4fQ; PREF=f7=4100&f4=4000000&tz=Pacific.Chatham&f5=20000; SID=g.a000yAgAhNWrugxbuhmMncWQl-WnPcySdGgmLAZ9jvucafytQ0ZxN5KUhIeoRKlmv9wnIvAD4QACgYKAQQSARISFQHGX2Mi3AcH5_x49LJJxOm2KxQnBhoVAUF8yKpw7b7iU0060Z-x_JqOG27a0076; __Secure-1PSID=g.a000yAgAhNWrugxbuhmMncWQl-WnPcySdGgmLAZ9jvucafytQ0ZxDynq3PsA-xdM8Ct0xoSOcwACgYKASMSARISFQHGX2Mi8TFBYN4SWlvE6McAML43UBoVAUF8yKq8TTgfcSKAlkC4_B95Mo5r0076; __Secure-3PSID=g.a000yAgAhNWrugxbuhmMncWQl-WnPcySdGgmLAZ9jvucafytQ0Zx8QWkwOVGVu40t6LuqmXsMgACgYKAVYSARISFQHGX2Mi33FOJzzTI1vzH-C-NrdJsBoVAUF8yKqTtaqeGxyaiEJDjSFSr8F50076; NID=524=MUN8cSAGUpTzS9M73ESdZOcYwtcUDh8qbxtcKcBZnqqNdPr2qK4Huj_hy8BznFGuR5DdRE0dE4CzwNc_ObMOA8pPEAbNN9UTpmuGWua90XLiUw9vP2FRE9StiZaf6eBoTzN4Pr5EdG3CunMUbjpbJUJ61z5A3VApdEHTQ7peuULn-vaRJ5fk8sQV1V0r2WKLHcDgeTY2a1cmQXXU32chMNbE7g; __Secure-1PSIDTS=sidts-CjEB5H03P0pqbzdfo_LkjWJ3CNBFUy5OKHwfJZbwkXYbETOYloKgwE_eIsQrIM8IsLh1EAA; __Secure-3PSIDTS=sidts-CjEB5H03P0pqbzdfo_LkjWJ3CNBFUy5OKHwfJZbwkXYbETOYloKgwE_eIsQrIM8IsLh1EAA; SIDCC=AKEyXzW7Hp-Q-OL65H8DplHjKNeXRi32xL6LMyrmjW3He_zu-bb1XX0OlJXyt7NIFw-11oJVfgA; __Secure-1PSIDCC=AKEyXzUazYaV8HogLYUrtL2ZnyrJ-NxiiZ8L8QDtkyatXlD5aLI1O4ecopgnLnvR87F7e3CY0jQ; __Secure-3PSIDCC=AKEyXzVGpJSwkyNRx3OyF6Xvy9jabPYllutZuDgwXQgwit8tSR-M8i3b4x0QRabufnojoiOImBk; VISITOR_INFO1_LIVE=rSRS27k81UY; VISITOR_PRIVACY_METADATA=CgJORxIEGgAgOA%3D%3D; YSC=yS5StfSZd0A; __Secure-ROLLOUT_TOKEN=CPbM7ouigumJDhDXkKjoyNmKAxicib_Ln_CNAw%3D%3D;"""

class MyLogger:
    def debug(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg): 
        print(json.dumps({
            "status": "error",
            "error": str(msg)
        }))

def download_video(url):
    try:
        output_dir = os.path.join(os.getcwd(), "downloads")
        os.makedirs(output_dir, exist_ok=True)

        ydl_opts = {
            'outtmpl': os.path.join(output_dir, '%(title).70s.%(ext)s'),
            'format': 'bestvideo+bestaudio/best',
            'merge_output_format': 'mp4',
            'noplaylist': True,
            'quiet': False,
            'nocheckcertificate': True,
            'logger': MyLogger(),
         'http_headers': {
        'Cookie': cookie_header,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
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

