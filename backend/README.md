# Elastic Server Setup

1. Make sure updates are reflected locally.
2. Create `.env` file, store in `src/config/` and insert the values to the following values
```
PORT=
ELASTIC_NODE=
ELASTIC_API_KEY=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
MUSIC_INDEX=
```
3. In your terminal, `cd` to `backend` and run `npm run dev`
4. Test your features with Postman or CURL

## Current Working Endpoints
***Note: Localhost in port `3000` unless specified otherwise**
- `api/recommend?tag=<value>` - query songs that fit certain tag at random
- `api/generate-emotion-paragraph` - given a fixed emotion input and an optional paragraph, asks AI agent to provide complementing messages for the emotion. JSON is as of below:
```json
{
  "emotion": "hope",
  "context": "I am rebuilding my life after a setback and want something encouraging without sounding dramatic."
}
```