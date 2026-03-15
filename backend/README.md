```
PORT=
ELASTIC_NODE=
ELASTIC_API_KEY=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SESSION_TOKEN=
MUSIC_INDEX=
```


# Moodz Backend Server

Our backend server mainly hosts the endpoints for our ElasticSearch and AWS S3 services. The backend has 3 endpoints and is already hosted on Vercel.

## Endpoints
1. `api/recommend` - This endpoint allows the frontend to query for a random song that fits the single tag being queried. The query is passed in as part of the URL parameter `tags=<value>`. The output will be the basic details of the audio along with the link to the audio file hosted in S3.
2. `api/recommends` - This endpoint is similar to the first one except it outputs all possible audio that matches with the tag.
3. `api/generate-emotion-paragraph` - Given a fixed emotion input and an optional paragraph, the backend prompts the Elastic-wrapped AI agent to provide complementing messages for the emotion. The JSON request body is as follow while the output will be a generated paragraph: 
```json
{
  "emotion": "hope",
  "context": "I am rebuilding my life after a setback and want something encouraging without sounding dramatic."
}
```

For more information regarding the API endpoints, please refer to the Swagger UI Documentation