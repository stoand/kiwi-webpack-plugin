# #SPC-review_app
import os
import pathlib
from flask import Flask
from interface import TestResults

# Load test result data
current_file_dir = pathlib.Path(__file__).parent.absolute()
result_file_name = os.path.join(current_file_dir, "../kiwi_test_results.json")
result_file_contents = open(result_file_name, "r").read()

# Parse JSON
test_results = TestResults.from_json(result_file_contents)

app = Flask(__name__)

@app.route('/')
def hello_world():
    # TODO make awesome app using 'test_results' above
    return 'Hello, World!'
