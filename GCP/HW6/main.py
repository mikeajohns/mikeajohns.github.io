from flask import Flask

app = Flask(__name__)


def print_hi(name):
    print(f'Hi, {name}')


@app.route('/')
def hello():
    """Return a friendly HTTP greeting."""
    rv = "<html>"
    rv += 'Hello World!'
    rv += '</br>'
    rv += '<div style="background-color: red;">foobar</div>'
    rv += "</html>"
    return rv


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    print_hi('PyCharm')
    app.run(host='127.0.0.1', port=8080, debug=True)
