from flask import Flask, request, send_from_directory

#app = Flask(__name__)
app = Flask(__name__,
            static_url_path='',
            static_folder='web/static',
            template_folder='web/templates')


@app.route('/')
def hello():
    print('Hello')
    search_html_path = r'web\static\search.html'
    file_str = ""
    with open(search_html_path) as f:
        file_str = f.read()

    return file_str


@app.route('/web/<path:path>')
def send_webfiles(path):
    print('Sending: ' + path)
    return send_from_directory('web', path)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
