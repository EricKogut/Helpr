import requests

url = 'https://api.elevenlabs.io/v1/voices'
headers = {
    'xi-api-key': 'd78b6e76837292d4495acd2168e10643'
}

response = requests.get(url, headers=headers)
print(response.json())
