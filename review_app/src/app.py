# #SPC-review_app
from flask import Flask
app = Flask(__name__)


# Needed data
# 
# aggregations:
# total coverage %
# total passed
# total failed
#
# Test Files
# file path (with resolveTilde)
# list of modules -
# 	module name
# 	module tests
# 		test name
# 		test status
# 		test line
# 		test stacktrace
#
# Covered Files
# file path (with resolveTilde)
# coverage %


@app.route('/')
def hello_world():
    return 'Hello, World!'
