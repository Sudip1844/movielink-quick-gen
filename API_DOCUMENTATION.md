# MovieZone Universal API Documentation

MovieZone provides two different API services for creating short movie download links:

## API Token Types

### 1. Single Link Service (`single` tokens)
- Creates single movie download links
- One movie = one download link
- Endpoint: `/api/create-short-link`

### 2. Quality Link Service (`quality` tokens) 
- Creates multi-quality movie download links
- One movie = multiple quality options (480p, 720p, 1080p)
- Endpoint: `/api/create-quality-short-link`

## Authentication

All API requests require a valid Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Important:** Each token type can only access its specific service endpoint.

---

# Single Link Service API

### POST `/api/create-short-link`

Create a single movie download link.

#### Authentication
**Required:** Single type API Token  
**Header:** `Authorization: Bearer YOUR_SINGLE_TOKEN`

#### Request Body
```json
{
  "movieName": "Movie Title",
  "originalLink": "https://example.com/movie-download-link"
}
```

**Parameters:**
- `movieName` (required): Movie title (string)
- `originalLink` (required): Movie download URL (string)

#### Response

**Success (201):**
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

**Error (400):**
```json
{
  "error": "Invalid data",
  "details": [...]
}
```

**Error (403):**
```json
{
  "error": "This token is not authorized for single link creation"
}
```

#### Example Usage

**cURL:**
```bash
curl -X POST http://localhost:5000/api/create-short-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer moviezone_single_bot_token_2025_secure" \
  -d '{
    "movieName": "Avengers Endgame",
    "originalLink": "https://example.com/avengers-endgame-download"
  }'
```

**JavaScript/Node.js:**
```javascript
const response = await fetch('http://localhost:5000/api/create-short-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer moviezone_single_bot_token_2025_secure'
  },
  body: JSON.stringify({
    movieName: 'Avengers Endgame',
    originalLink: 'https://example.com/avengers-endgame-download'
  })
});

const data = await response.json();
console.log(data.shortUrl); // http://localhost:5000/m/abc123
```

**Python:**
```python
import requests

response = requests.post(
    'http://localhost:5000/api/create-short-link',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer moviezone_single_bot_token_2025_secure'
    },
    json={
        'movieName': 'Avengers Endgame',
        'originalLink': 'https://example.com/avengers-endgame-download'
    }
)

data = response.json()
print(data['shortUrl'])  # http://localhost:5000/m/abc123
```

---

# Quality Link Service API

### POST `/api/create-quality-short-link`

Create a multi-quality movie download link with up to 3 quality options.

#### Authentication
**Required:** Quality type API Token  
**Header:** `Authorization: Bearer YOUR_QUALITY_TOKEN`

#### Request Body
```json
{
  "movieName": "Movie Title",
  "quality480p": "https://example.com/movie-480p.mp4",
  "quality720p": "https://example.com/movie-720p.mp4", 
  "quality1080p": "https://example.com/movie-1080p.mp4"
}
```

**Parameters:**
- `movieName` (required): Movie title (string)
- `quality480p` (optional): 480p download URL (string)
- `quality720p` (optional): 720p download URL (string)
- `quality1080p` (optional): 1080p download URL (string)

**Note:** At least one quality link must be provided.

#### Response

**Success (201):**
```json
{
  "success": true,
  "shortUrl": "http://yourhost:5000/m/def456",
  "shortId": "def456",
  "movieName": "Movie Title",
  "qualityLinks": {
    "quality480p": "https://example.com/movie-480p.mp4",
    "quality720p": "https://example.com/movie-720p.mp4",
    "quality1080p": "https://example.com/movie-1080p.mp4"
  },
  "adsEnabled": true
}
```

**Error (400):**
```json
{
  "error": "At least one quality link is required"
}
```

**Error (403):**
```json
{
  "error": "This token is not authorized for quality link creation"
}
```

#### Example Usage

**cURL:**
```bash
curl -X POST http://localhost:5000/api/create-quality-short-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer moviezone_quality_bot_token_2025_secure" \
  -d '{
    "movieName": "Spider-Man No Way Home",
    "quality480p": "https://example.com/spiderman-480p.mp4",
    "quality720p": "https://example.com/spiderman-720p.mp4",
    "quality1080p": "https://example.com/spiderman-1080p.mp4"
  }'
```

**JavaScript/Node.js:**
```javascript
const response = await fetch('http://localhost:5000/api/create-quality-short-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer moviezone_quality_bot_token_2025_secure'
  },
  body: JSON.stringify({
    movieName: 'Spider-Man No Way Home',
    quality480p: 'https://example.com/spiderman-480p.mp4',
    quality720p: 'https://example.com/spiderman-720p.mp4',
    quality1080p: 'https://example.com/spiderman-1080p.mp4'
  })
});

const data = await response.json();
console.log(data.shortUrl); // http://localhost:5000/m/def456
```

**Python:**
```python
import requests

response = requests.post(
    'http://localhost:5000/api/create-quality-short-link',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer moviezone_quality_bot_token_2025_secure'
    },
    json={
        'movieName': 'Spider-Man No Way Home',
        'quality480p': 'https://example.com/spiderman-480p.mp4',
        'quality720p': 'https://example.com/spiderman-720p.mp4',
        'quality1080p': 'https://example.com/spiderman-1080p.mp4'
    }
)

data = response.json()
print(data['shortUrl'])  # http://localhost:5000/m/def456
```

---

## Platform Integration Examples

### Telegram Bot Example
```javascript
// For single links
bot.on('message', async (msg) => {
  const response = await fetch('http://your-server.com/api/create-short-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_SINGLE_TOKEN'
    },
    body: JSON.stringify({
      movieName: msg.text,
      originalLink: 'https://example.com/download'
    })
  });
  
  const data = await response.json();
  bot.sendMessage(msg.chat.id, `Short link: ${data.shortUrl}`);
});
```

### Discord Bot Example
```javascript
// For quality links
client.on('messageCreate', async message => {
  const response = await fetch('http://your-server.com/api/create-quality-short-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_QUALITY_TOKEN'
    },
    body: JSON.stringify({
      movieName: 'Movie Name',
      quality720p: 'https://example.com/720p.mp4',
      quality1080p: 'https://example.com/1080p.mp4'
    })
  });
  
  const data = await response.json();
  message.reply(`Quality link created: ${data.shortUrl}`);
});
```

---

## Important Notes

1. **Ads Always Enabled**: All API-created links have ads enabled by default (cannot be disabled)
2. **Token Security**: Keep your API tokens secure and never expose them in client-side code
3. **Rate Limiting**: Consider implementing rate limiting in your applications
4. **URL Validation**: All original links and quality links must be valid URLs
5. **Unique Short IDs**: The system automatically generates unique short IDs for each link

---

## Getting API Tokens

1. Access MovieZone Admin Panel
2. Go to "API" tab  
3. Click "Generate New Token"
4. Select service type: "Single" or "Quality"
5. Enter token name
6. Copy the generated token

**Remember:** Each token type can only access its corresponding service endpoint.