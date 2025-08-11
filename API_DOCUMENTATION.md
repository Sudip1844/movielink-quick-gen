# MovieZone API Documentation

## Create Short Link API Endpoint

### POST `/api/create-short-link`

এই API endpoint ব্যবহার করে আপনি মুভি টাইটেল এবং অরিজিনাল লিংক দিয়ে একটি শর্ট লিংক তৈরি করতে পারবেন।

#### Request

**Method:** POST  
**URL:** `http://yourhost:5000/api/create-short-link`  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "movieName": "Movie Title",
  "originalLink": "https://example.com/movie-download-link",
  "adsEnabled": true
}
```

**Parameters:**
- `movieName` (required): মুভির নাম (string)
- `originalLink` (required): মুভির অরিজিনাল ডাউনলোড লিংক (string)
- `adsEnabled` (optional): বিজ্ঞাপন চালু রাখবেন কি না (boolean, default: true)

#### Response

**Success Response (201):**
```json
{
  "success": true,
  "shortUrl": "http://yourhost:5000/m/abc123",
  "shortId": "abc123",
  "movieName": "Movie Title",
  "originalLink": "https://example.com/movie-download-link",
  "adsEnabled": true
}
```

**Error Response (400):**
```json
{
  "error": "Movie name is required"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to create short link"
}
```

#### Example Usage

##### cURL Example:
```bash
curl -X POST http://localhost:5000/api/create-short-link \
  -H "Content-Type: application/json" \
  -d '{
    "movieName": "Avengers Endgame",
    "originalLink": "https://example.com/avengers-endgame-download",
    "adsEnabled": true
  }'
```

##### JavaScript Example:
```javascript
const response = await fetch('/api/create-short-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    movieName: 'Avengers Endgame',
    originalLink: 'https://example.com/avengers-endgame-download',
    adsEnabled: true
  })
});

const data = await response.json();
console.log('Short URL:', data.shortUrl);
```

##### Python Example:
```python
import requests
import json

url = "http://localhost:5000/api/create-short-link"
payload = {
    "movieName": "Avengers Endgame",
    "originalLink": "https://example.com/avengers-endgame-download",
    "adsEnabled": True
}

response = requests.post(url, json=payload)
data = response.json()
print(f"Short URL: {data['shortUrl']}")
```

## Other Available API Endpoints

### GET `/api/movie-links`
সব মুভি লিংকের তালিকা পেতে

### GET `/api/movie-links/:shortId`  
নির্দিষ্ট শর্ট ID দিয়ে মুভি লিংক খুঁজে পেতে

### PATCH `/api/movie-links/:id`
মুভি লিংকের অরিজিনাল URL আপডেট করতে

### DELETE `/api/movie-links/:id`
মুভি লিংক ডিলিট করতে

### PATCH `/api/movie-links/:shortId/views`
ভিউ কাউন্ট বাড়াতে