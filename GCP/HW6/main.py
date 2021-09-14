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
# https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY}
@app.route('/apis/<api_name>', methods=['GET', 'POST'])
def call_api(api_name):
    req_data = request.get_json()

    api_infos = {
        "tomorrow": {
            "url": "https://api.tomorrow.io/v4",
            "params": {"apikey": "sRWfsYY1xHVnFN9f6ILSV5fVVlMQgn1O"}
        },
        "geocode": {
            "url": "https://maps.googleapis.com/maps/api/geocode",
            "params": {"key": "AIzaSyAoLc9k_wqEQNd9R-a9Skhqtl92gTHbfTc"}
        }
    }

    if api_name not in api_infos:
        return None


    import urllib.request
    import urllib.parse

    api_info = api_infos[api_name]
    url = api_info["url"]

    if "method" in req_data:
        method = req_data["method"]
        del req_data["method"]
        url = url + "/%s" % (method)

    params = urllib.parse.urlencode(req_data | api_info["params"])

    url = url + "?%s" % (params)
    print(url)

    import requests
    response = requests.get(url)

    return response.json()


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
