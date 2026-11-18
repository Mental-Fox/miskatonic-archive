"""Serve the book locally; open the browser only after the port is bound."""
import argparse
import errno
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import threading
import webbrowser


class BookServer(ThreadingHTTPServer):
    # On Windows SO_REUSEADDR can let two servers bind the same port.
    allow_reuse_address = False


def main():
    parser = argparse.ArgumentParser(description="Start Miskatonic Archive")
    parser.add_argument("--port", type=int, default=9000)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    folder = Path(__file__).resolve().parent
    handler = partial(SimpleHTTPRequestHandler, directory=str(folder))
    if not 0 <= args.port <= 65535:
        parser.error("port must be between 0 and 65535")
    # Try predictable nearby ports first; let Windows choose if all are busy.
    ports = list(range(args.port, min(args.port + 21, 65536))) if args.port else []
    for port in [*ports, 0]:
        try:
            server = BookServer(("127.0.0.1", port), handler)
            break
        except OSError as error:
            if port and (error.errno == errno.EADDRINUSE or getattr(error, "winerror", None) == 10048):
                continue
            print(f"Cannot start the server: {error}", flush=True)
            return 1

    actual_port = server.server_address[1]
    url = f"http://127.0.0.1:{actual_port}/"
    if args.port and actual_port != args.port:
        print(f"Port {args.port} is busy. Using port {actual_port} instead.", flush=True)

    with server:
        print(f"Site: {url}", flush=True)
        print("Keep this window open. Press Ctrl+C to stop the server.", flush=True)
        # Construction above has already bound and activated the listening socket.
        if not args.no_browser:
            threading.Thread(target=webbrowser.open, args=(url,), daemon=True).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
