from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import io
from scipy.ndimage import maximum_filter, minimum_filter
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

def apply_filters(image, kernel_size=3, z=8):
    image = np.array(image)

    mean_kernel = np.ones((kernel_size, kernel_size), np.float32) / (kernel_size ** 2)
    mean_filtered = cv2.filter2D(image, -1, mean_kernel)

    max_filtered = maximum_filter(image, size=kernel_size)
    min_filtered = minimum_filter(image, size=kernel_size)

    diff_kernel = np.array([[-1, -1, -1], [-1, z, -1], [-1, -1, -1]])
    diff_filtered = cv2.filter2D(image, -1, diff_kernel)

    return mean_filtered, max_filtered, min_filtered, diff_filtered

def convert_to_base64(image):
    _, buffer = cv2.imencode(".jpg", image)
    return base64.b64encode(buffer).decode("utf-8")

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["image"]
    kernel_size = int(request.form["kernel_size"])
    z = int(request.form["z"])

    image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)

    mean_filtered, max_filtered, min_filtered, diff_filtered = apply_filters(image, kernel_size, z)

    return jsonify({
        "mean": convert_to_base64(mean_filtered),
        "max": convert_to_base64(max_filtered),
        "min": convert_to_base64(min_filtered),
        "diff": convert_to_base64(diff_filtered)
    })

if __name__ == "__main__":
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)

