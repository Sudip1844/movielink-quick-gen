# MovieZone Universal API Documentation

## Universal API Endpoint for All Platforms

### POST `/api/create-short-link` (Token Required)

এই Universal API endpoint যেকোনো platform থেকে ব্যবহার করা যাবে:
- **Telegram Bots** 
- **Discord Bots**
- **Web Applications**
- **Mobile Apps**
- **Any External Service**

Movie title এবং original link পাঠিয়ে secure short link তৈরি করতে পারবেন।

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
  "originalLink": "https://example.com/movie-download-link"
}
```

**Parameters:**
- `movieName` (required): মুভির নাম (string)
- `originalLink` (required): মুভির অরিজিনাল ডাউনলোড লিংক (string)

**Important Note:** API দিয়ে তৈরি সব short links এ ads **সবসময় enabled** থাকবে। Ads disable করার option নেই।

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
    "originalLink": "https://example.com/avengers-endgame-download"
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
    originalLink: 'https://example.com/avengers-endgame-download'
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
    "originalLink": "https://example.com/avengers-endgame-download"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(f"Short URL: {data['shortUrl']}")
```

## Universal Integration বৈশিষ্ট্য

### সব Platform থেকে তৈরি Links একসাথে ব্যবস্থাপনা:
- **API থেকে তৈরি links** (Telegram Bot, Discord Bot, etc.)
- **Admin Panel থেকে তৈরি links**
- **সব links একই database table এ দেখাবে**
- **সব links admin panel থেকে edit করা যাবে**
- **Views count, movie name সবকিছু track হবে**

### API vs Admin Panel Links পার্থক্য:
- **API Links:** Ads সবসময় enabled (বন্ধ করা যাবে না)
- **Admin Panel Links:** Ads on/off করার option আছে

## API Token ব্যবস্থাপনা

### API Token কীভাবে পাবেন?

1. **Admin Panel** থেকে login করুন
2. **API Tokens** ট্যাবে যান  
3. **Generate New Token** বাটনে ক্লিক করুন
4. Token এর নাম দিন (যেমন: "Telegram Bot Token")
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

## Platform Integration Examples

### Telegram Bot Integration:
```python
import requests

API_URL = "http://yourhost:5000/api/create-short-link"
API_TOKEN = "your_api_token_here"

def create_movie_short_link(movie_name, download_url):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_TOKEN}"
    }
    payload = {
        "movieName": movie_name,
        "originalLink": download_url
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    data = response.json()
    
    if data.get("success"):
        return data["shortUrl"]
    else:
        return None

# Usage in Telegram bot
short_link = create_movie_short_link("Avengers Endgame", "https://example.com/download")
# Send short_link in Telegram message
```

### Discord Bot Integration:
```javascript
const axios = require('axios');

const API_URL = 'http://yourhost:5000/api/create-short-link';
const API_TOKEN = 'your_api_token_here';

async function createMovieShortLink(movieName, originalLink) {
    try {
        const response = await axios.post(API_URL, {
            movieName,
            originalLink
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            }
        });
        
        return response.data.shortUrl;
    } catch (error) {
        console.error('Error creating short link:', error);
        return null;
    }
}

// Usage in Discord bot
const shortLink = await createMovieShortLink('Spider-Man', 'https://example.com/spiderman');
// Send shortLink in Discord message
```

## Admin Panel Management

### সব Links একসাথে দেখা:
- API থেকে তৈরি links
- Admin panel থেকে তৈরি links  
- Views count এবং সব তথ্য
- Original links edit করার সুবিধা

### Database Table Features:
- **Movie Name**: মুভির নাম
- **Original Link**: প্রকৃত ডাউনলোড লিংক (edit করা যায়)
- **Short Link**: শর্ট URL (copy button সহ)  
- **Views**: ক্লিক কাউন্ট
- **Actions**: Edit এবং Delete বাটন