import requests


def fetch_logo(url: str) -> bytes | None:
    """組織ロゴを取得してメールに埋め込む。取得できなければロゴなしで送る。"""
    try:
        resp = requests.get(url, timeout=5)
    except requests.RequestException:
        return None
    if resp.status_code != 200:
        return None
    return resp.content
