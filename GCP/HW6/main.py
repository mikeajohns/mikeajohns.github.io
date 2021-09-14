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


### another way to do this
# url_for('static', filename='style.css')
@app.route('/web/<path:path>')
def send_webfiles(path):
    print('Sending: ' + path)
    return send_from_directory('web', path)


# https://api.tomorrow.io/v4/timelines?location=-73.98529171943665,40.75872069597532&fields=temperature&timesteps=1h&units=metric&apikey=sRWfsYY1xHVnFN9f6ILSV5fVVlMQgn1O
@app.route('/apis/tomorrow/<path:path>', methods=['GET', 'POST'])
def call_tomorrow_io(path):
    print("Path: " + path)
    req_data = request.get_json()

    base_url = "https://api.tomorrow.io/v4"
    method = req_data['method']
    del req_data['method']

    import urllib.request
    import urllib.parse

    secret_key = "sRWfsYY1xHVnFN9f6ILSV5fVVlMQgn1O"
    req_data["apikey"] = secret_key

    params = urllib.parse.urlencode(req_data)
    url = base_url + "/%s?%s" % (method, params)
    print(url)

    import requests
    response = requests.get(url)

    return response.json()


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
