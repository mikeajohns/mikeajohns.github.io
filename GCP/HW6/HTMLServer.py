import re


# subs: dictionary of (key: regex, value: substitution string) pairs
def serve_subed_file(filepath, subs):
    with open(filepath) as f:
        file_str = f.read()
        for regex in subs:
            re.sub(regex, subs[regex])