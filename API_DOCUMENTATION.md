# MovieZone API Documentation

## Secure API Endpoint for Bot Integration

### POST `/api/create-short-link` (Token Required)

এই API endpoint ব্যবহার করে আপনার বট secure token দিয়ে মুভি টাইটেল এবং অরিজিনাল লিংক পাঠিয়ে শর্ট লিংক তৈরি করতে পারবে।

#### Authentication

**Required:** API Token in Authorization header  
**Format:** `Authorization: Bearer YOUR_API_TOKEN`

#### Request

**Method:** POST  
**URL:** `http://yourhost:5000/api/create-short-link`  
**Content-Type:** `application/json`  
**Authorization:** `Bearer YOUR_API_TOKEN`

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
  -H "Authorization: Bearer YOUR_API_TOKEN" \
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
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
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
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
}
payload = {
    "movieName": "Avengers Endgame",
    "originalLink": "https://example.com/avengers-endgame-download",
    "adsEnabled": True
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(f"Short URL: {data['shortUrl']}")
```

## API Token ব্যবস্থাপনা

### API Token কীভাবে পাবেন?

1. **Admin Panel** থেকে login করুন
2. **API Tokens** ট্যাবে যান  
3. **Generate New Token** বাটনে ক্লিক করুন
4. Token এর নাম দিন (যেমন: "My Bot Token")
5. নতুন token copy করে নিন এবং নিরাপদ রাখুন

### Security নোট:
- প্রতিটি API token একবার দেখানো হয়
- Token হারিয়ে গেলে নতুন token তৈরি করতে হবে
- অব্যবহৃত token deactivate করে রাখুন

## Error Responses

### Authentication Errors:

**No Token (401):**
```json
{
  "error": "Access token required"
}
```

**Invalid Token (403):**
```json
{
  "error": "Invalid or inactive token"
}
```

**Validation Error (400):**
```json
{
  "error": "Invalid data",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "path": ["movieName"],
      "message": "Movie name is required"
    }
  ]
}
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