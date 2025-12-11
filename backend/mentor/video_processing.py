import os
from werkzeug.utils import secure_filename

def process_video(file, upload_folder):
    """Save uploaded video file to the upload folder"""
    if not file or not file.filename:
        raise ValueError("No file provided")
    
    # Secure the filename
    filename = secure_filename(file.filename)
    # Create full path
    path = os.path.join(upload_folder, filename)
    
    # Save the file
    file.save(path)
    return path
