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
def call_api(api_name, short_circuit_req_data=None):
    if not short_circuit_req_data:
        req_data = request.get_json()
    else:
        req_data = short_circuit_req_data

    debug_save_usage = False
    debug_save_usage = True
    if debug_save_usage:
        return get_fake_json(api_name)


    # NOTE: the keys/tokens below should not be shared with anyone
    api_infos = {
        "tomorrow": {
            "url": "https://api.tomorrow.io/v4",
            "params": {"apikey": "sRWfsYY1xHVnFN9f6ILSV5fVVlMQgn1O"}
        },
        "geocode": {
            "url": "https://maps.googleapis.com/maps/api/geocode",
            "params": {"key": "AIzaSyAoLc9k_wqEQNd9R-a9Skhqtl92gTHbfTc"}
        },
        "ipinfo": {
            "url": "https://ipinfo.io/" + request.remote_addr,
            "params": {"token": "6292e80abfdebd"}
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

    #print(response.json())

    #if api_name == "geocode":
     #   return call_api("tomorrow", {ln})

    #elif api_name == "ipinfo":
     #   pass


    return response.json()


def get_fake_json(api_name):
    apis = {
        "tomorrow": {
            'data': {'timelines': [
                {'timestep': '1h', 'startTime': '2021-09-15T00:00:00Z', 'endTime': '2021-09-19T12:00:00Z',
                 'intervals': [{'startTime': '2021-09-15T00:00:00Z', 'values': {'temperature': 21.38}},
                               {'startTime': '2021-09-15T01:00:00Z', 'values': {'temperature': 21.15}},
                               {'startTime': '2021-09-15T02:00:00Z', 'values': {'temperature': 21.86}},
                               {'startTime': '2021-09-15T03:00:00Z', 'values': {'temperature': 22.53}},
                               {'startTime': '2021-09-15T04:00:00Z', 'values': {'temperature': 22.71}},
                               {'startTime': '2021-09-15T05:00:00Z', 'values': {'temperature': 22.74}},
                               {'startTime': '2021-09-15T06:00:00Z', 'values': {'temperature': 21.98}},
                               {'startTime': '2021-09-15T07:00:00Z', 'values': {'temperature': 21.69}},
                               {'startTime': '2021-09-15T08:00:00Z', 'values': {'temperature': 21.21}},
                               {'startTime': '2021-09-15T09:00:00Z', 'values': {'temperature': 20.75}},
                               {'startTime': '2021-09-15T10:00:00Z', 'values': {'temperature': 20.57}},
                               {'startTime': '2021-09-15T11:00:00Z', 'values': {'temperature': 20.47}},
                               {'startTime': '2021-09-15T12:00:00Z', 'values': {'temperature': 22.02}},
                               {'startTime': '2021-09-15T13:00:00Z', 'values': {'temperature': 23.73}},
                               {'startTime': '2021-09-15T14:00:00Z', 'values': {'temperature': 24.87}},
                               {'startTime': '2021-09-15T15:00:00Z', 'values': {'temperature': 26.38}},
                               {'startTime': '2021-09-15T16:00:00Z', 'values': {'temperature': 27.89}},
                               {'startTime': '2021-09-15T17:00:00Z', 'values': {'temperature': 29.79}},
                               {'startTime': '2021-09-15T18:00:00Z', 'values': {'temperature': 30.91}},
                               {'startTime': '2021-09-15T19:00:00Z', 'values': {'temperature': 30.24}},
                               {'startTime': '2021-09-15T20:00:00Z', 'values': {'temperature': 29.75}},
                               {'startTime': '2021-09-15T21:00:00Z', 'values': {'temperature': 28.42}},
                               {'startTime': '2021-09-15T22:00:00Z', 'values': {'temperature': 26.77}},
                               {'startTime': '2021-09-15T23:00:00Z', 'values': {'temperature': 25.73}},
                               {'startTime': '2021-09-16T00:00:00Z', 'values': {'temperature': 25.58}},
                               {'startTime': '2021-09-16T01:00:00Z', 'values': {'temperature': 24.33}},
                               {'startTime': '2021-09-16T02:00:00Z', 'values': {'temperature': 22.83}},
                               {'startTime': '2021-09-16T03:00:00Z', 'values': {'temperature': 22.61}},
                               {'startTime': '2021-09-16T04:00:00Z', 'values': {'temperature': 22.13}},
                               {'startTime': '2021-09-16T05:00:00Z', 'values': {'temperature': 21.71}},
                               {'startTime': '2021-09-16T06:00:00Z', 'values': {'temperature': 21.24}},
                               {'startTime': '2021-09-16T07:00:00Z', 'values': {'temperature': 20.99}},
                               {'startTime': '2021-09-16T08:00:00Z', 'values': {'temperature': 20.61}},
                               {'startTime': '2021-09-16T09:00:00Z', 'values': {'temperature': 20.5}},
                               {'startTime': '2021-09-16T10:00:00Z', 'values': {'temperature': 20.85}},
                               {'startTime': '2021-09-16T11:00:00Z', 'values': {'temperature': 20.84}},
                               {'startTime': '2021-09-16T12:00:00Z', 'values': {'temperature': 21.49}},
                               {'startTime': '2021-09-16T13:00:00Z', 'values': {'temperature': 22.36}},
                               {'startTime': '2021-09-16T14:00:00Z', 'values': {'temperature': 24.15}},
                               {'startTime': '2021-09-16T15:00:00Z', 'values': {'temperature': 24.96}},
                               {'startTime': '2021-09-16T16:00:00Z', 'values': {'temperature': 25.15}},
                               {'startTime': '2021-09-16T17:00:00Z', 'values': {'temperature': 25.01}},
                               {'startTime': '2021-09-16T18:00:00Z', 'values': {'temperature': 25.21}},
                               {'startTime': '2021-09-16T19:00:00Z', 'values': {'temperature': 23.76}},
                               {'startTime': '2021-09-16T20:00:00Z', 'values': {'temperature': 24.57}},
                               {'startTime': '2021-09-16T21:00:00Z', 'values': {'temperature': 23.69}},
                               {'startTime': '2021-09-16T22:00:00Z', 'values': {'temperature': 22.37}},
                               {'startTime': '2021-09-16T23:00:00Z', 'values': {'temperature': 21.78}},
                               {'startTime': '2021-09-17T00:00:00Z', 'values': {'temperature': 21.91}},
                               {'startTime': '2021-09-17T01:00:00Z', 'values': {'temperature': 22.02}},
                               {'startTime': '2021-09-17T02:00:00Z', 'values': {'temperature': 22.2}},
                               {'startTime': '2021-09-17T03:00:00Z', 'values': {'temperature': 22.08}},
                               {'startTime': '2021-09-17T04:00:00Z', 'values': {'temperature': 22}},
                               {'startTime': '2021-09-17T05:00:00Z', 'values': {'temperature': 22.01}},
                               {'startTime': '2021-09-17T06:00:00Z', 'values': {'temperature': 21.91}},
                               {'startTime': '2021-09-17T07:00:00Z', 'values': {'temperature': 21.84}},
                               {'startTime': '2021-09-17T08:00:00Z', 'values': {'temperature': 21.88}},
                               {'startTime': '2021-09-17T09:00:00Z', 'values': {'temperature': 21.95}},
                               {'startTime': '2021-09-17T10:00:00Z', 'values': {'temperature': 21.92}},
                               {'startTime': '2021-09-17T11:00:00Z', 'values': {'temperature': 22.01}},
                               {'startTime': '2021-09-17T12:00:00Z', 'values': {'temperature': 22.42}},
                               {'startTime': '2021-09-17T13:00:00Z', 'values': {'temperature': 23.2}},
                               {'startTime': '2021-09-17T14:00:00Z', 'values': {'temperature': 23.82}},
                               {'startTime': '2021-09-17T15:00:00Z', 'values': {'temperature': 24.42}},
                               {'startTime': '2021-09-17T16:00:00Z', 'values': {'temperature': 24.02}},
                               {'startTime': '2021-09-17T17:00:00Z', 'values': {'temperature': 23.43}},
                               {'startTime': '2021-09-17T18:00:00Z', 'values': {'temperature': 23.61}},
                               {'startTime': '2021-09-17T19:00:00Z', 'values': {'temperature': 23.49}},
                               {'startTime': '2021-09-17T20:00:00Z', 'values': {'temperature': 23.46}},
                               {'startTime': '2021-09-17T21:00:00Z', 'values': {'temperature': 23.5}},
                               {'startTime': '2021-09-17T22:00:00Z', 'values': {'temperature': 23.12}},
                               {'startTime': '2021-09-17T23:00:00Z', 'values': {'temperature': 22.83}},
                               {'startTime': '2021-09-18T00:00:00Z', 'values': {'temperature': 22.46}},
                               {'startTime': '2021-09-18T01:00:00Z', 'values': {'temperature': 22.04}},
                               {'startTime': '2021-09-18T02:00:00Z', 'values': {'temperature': 21.63}},
                               {'startTime': '2021-09-18T03:00:00Z', 'values': {'temperature': 21.37}},
                               {'startTime': '2021-09-18T04:00:00Z', 'values': {'temperature': 21.03}},
                               {'startTime': '2021-09-18T05:00:00Z', 'values': {'temperature': 20.77}},
                               {'startTime': '2021-09-18T06:00:00Z', 'values': {'temperature': 20.28}},
                               {'startTime': '2021-09-18T07:00:00Z', 'values': {'temperature': 19.75}},
                               {'startTime': '2021-09-18T08:00:00Z', 'values': {'temperature': 19.48}},
                               {'startTime': '2021-09-18T09:00:00Z', 'values': {'temperature': 19.42}},
                               {'startTime': '2021-09-18T10:00:00Z', 'values': {'temperature': 19.29}},
                               {'startTime': '2021-09-18T11:00:00Z', 'values': {'temperature': 19.29}},
                               {'startTime': '2021-09-18T12:00:00Z', 'values': {'temperature': 20.29}},
                               {'startTime': '2021-09-18T13:00:00Z', 'values': {'temperature': 22.07}},
                               {'startTime': '2021-09-18T14:00:00Z', 'values': {'temperature': 23.83}},
                               {'startTime': '2021-09-18T15:00:00Z', 'values': {'temperature': 25.45}},
                               {'startTime': '2021-09-18T16:00:00Z', 'values': {'temperature': 27.01}},
                               {'startTime': '2021-09-18T17:00:00Z', 'values': {'temperature': 28.37}},
                               {'startTime': '2021-09-18T18:00:00Z', 'values': {'temperature': 29.19}},
                               {'startTime': '2021-09-18T19:00:00Z', 'values': {'temperature': 28.82}},
                               {'startTime': '2021-09-18T20:00:00Z', 'values': {'temperature': 27.92}},
                               {'startTime': '2021-09-18T21:00:00Z', 'values': {'temperature': 27.98}},
                               {'startTime': '2021-09-18T22:00:00Z', 'values': {'temperature': 27.97}},
                               {'startTime': '2021-09-18T23:00:00Z', 'values': {'temperature': 26.13}},
                               {'startTime': '2021-09-19T00:00:00Z', 'values': {'temperature': 25.67}},
                               {'startTime': '2021-09-19T01:00:00Z', 'values': {'temperature': 25.39}},
                               {'startTime': '2021-09-19T02:00:00Z', 'values': {'temperature': 24.74}},
                               {'startTime': '2021-09-19T03:00:00Z', 'values': {'temperature': 24.31}},
                               {'startTime': '2021-09-19T04:00:00Z', 'values': {'temperature': 23.8}},
                               {'startTime': '2021-09-19T05:00:00Z', 'values': {'temperature': 23.34}},
                               {'startTime': '2021-09-19T06:00:00Z', 'values': {'temperature': 22.91}},
                               {'startTime': '2021-09-19T07:00:00Z', 'values': {'temperature': 22.57}},
                               {'startTime': '2021-09-19T08:00:00Z', 'values': {'temperature': 22.28}},
                               {'startTime': '2021-09-19T09:00:00Z', 'values': {'temperature': 21.88}},
                               {'startTime': '2021-09-19T10:00:00Z', 'values': {'temperature': 21.49}},
                               {'startTime': '2021-09-19T11:00:00Z', 'values': {'temperature': 21.1}},
                               {'startTime': '2021-09-19T12:00:00Z', 'values': {'temperature': 21.77}}]}]}

        },
        "geocode": {
            'results': [{
                'address_components': [
                        {'long_name': 'Google Building 40', 'short_name': 'Google Building 40', 'types': ['premise']},
                        {'long_name': '1600', 'short_name': '1600', 'types': ['street_number']},
                        {'long_name': 'Amphitheatre Parkway', 'short_name': 'Amphitheatre Pkwy', 'types': ['route']},
                        {'long_name': 'Mountain View', 'short_name': 'Mountain View', 'types': ['locality', 'political']},
                        {'long_name': 'Santa Clara County', 'short_name': 'Santa Clara County', 'types': ['administrative_area_level_2', 'political']},
                        {'long_name': 'California', 'short_name': 'CA', 'types': ['administrative_area_level_1', 'political']},
                        {'long_name': 'United States', 'short_name': 'US', 'types': ['country', 'political']},
                        {'long_name': '94043', 'short_name': '94043', 'types': ['postal_code']}],
                    'formatted_address': 'Google Building 40, 1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
                    'geometry': {
                        'bounds': {'northeast': {'lat': 37.4226621, 'lng': -122.0829306}, 'southwest': {'lat': 37.4220703, 'lng': -122.0849584}},
                        'location': {'lat': 37.422388, 'lng': -122.0841883},
                        'location_type': 'ROOFTOP',
                        'viewport': {'northeast': {'lat': 37.4237151802915, 'lng': -122.0825955197085}, 'southwest': {'lat': 37.4210172197085, 'lng': -122.0852934802915}}
                    },
                    'partial_match': True,
                    'place_id': 'ChIJj38IfwK6j4ARNcyPDnEGa9g',
                    'types': ['premise']},
            {
                'address_components': [
                        {'long_name': '1600', 'short_name': '1600', 'types': ['street_number']},
                        {'long_name': 'Amphitheatre Parkway', 'short_name': 'Amphitheatre Parkway', 'types': ['route']},
                        {'long_name': 'Mountain View', 'short_name': 'Mountain View', 'types': ['locality', 'political']},
                        {'long_name': 'Santa Clara County', 'short_name': 'Santa Clara County', 'types': ['administrative_area_level_2', 'political']},
                        {'long_name': 'California', 'short_name': 'CA', 'types': ['administrative_area_level_1', 'political']},
                        {'long_name': 'United States', 'short_name': 'US', 'types': ['country', 'political']},
                        {'long_name': '94043', 'short_name': '94043', 'types': ['postal_code']}],
                'formatted_address': '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
                'geometry': {
                    'location': {'lat': 37.4103328, 'lng': -122.0716587},
                    'location_type': 'ROOFTOP',
                    'viewport': {'northeast': {'lat': 37.4116817802915, 'lng': -122.0703097197085}, 'southwest': {'lat': 37.4089838197085, 'lng': -122.0730076802915}}},
                'partial_match': True, 'place_id': 'ChIJj23lMXe3j4ARdBReUp4WTII', 'plus_code': {'compound_code': 'CW6H+48 Mountain View, CA, USA', 'global_code': '849VCW6H+48'},
                'types': ['street_address']}],
            'status': 'OK'},
        "ipinfo": {
            'ip': '47.185.202.16',
            'city': 'Plano',
            'region': 'Texas',
            'country': 'US',
            'loc': '33.0198,-96.6989',
            'org': 'AS5650 Frontier Communications of America, Inc.',
            'postal': '75026',
            'timezone': 'America/Chicago'}
    }
    return apis[api_name]


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)



