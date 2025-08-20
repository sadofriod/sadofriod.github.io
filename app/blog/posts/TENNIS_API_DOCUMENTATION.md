---
layout: interesting
title: Freezer Backend API Documentation
date: 2025-08-20 15:35:00
tags: interesting
p: interesting
categories: interesting
keywords: hexo seo optimize, hexo seo 优化, seo 优化
isHidden: true
---

# Tennis Service API Documentation

## Overview

The Tennis Service API provides comprehensive endpoints for managing tennis-related data including user profiles, skills, games, grounds, locations, evaluations, and contacts. This service implements Domain-Driven Design (DDD) principles for better organization and maintainability.

**Base URL:** `/api/tennis`

## Table of Contents

1. [Authentication](#authentication)
2. [User Profiles](#user-profiles)
3. [Contacts](#contacts)
4. [Locations](#locations)
5. [Skills Management](#skills-management)
6. [Tennis Grounds](#tennis-grounds)
7. [Tennis Games](#tennis-games)
8. [Evaluations](#evaluations)
9. [Response Format](#response-format)
10. [Error Handling](#error-handling)

## Authentication

All tennis service endpoints require authentication using JWT tokens. Include the token in the request headers:

```
Authorization: Bearer <your-jwt-token>
```

## User Profiles

Tennis user profiles contain scheduling information and basic player details.

### Create User Profile

**POST** `/api/tennis/profiles`

Creates a new tennis user profile with availability schedule.

**Request Body:**
```json
{
  "name": "John Tennis Player",
  "openTimes": [
    {
      "day": "monday",
      "start": "09:00",
      "end": "17:00"
    },
    {
      "day": "wednesday",
      "start": "10:00",
      "end": "16:00"
    },
    {
      "day": "saturday",
      "start": "08:00",
      "end": "18:00"
    }
  ],
  "userId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Tennis Player",
    "openTimes": [...],
    "userId": 1,
    "createdAt": "2025-08-20T12:00:00.000Z",
    "updatedAt": "2025-08-20T12:00:00.000Z"
  }
}
```

### Get All User Profiles

**GET** `/api/tennis/profiles`

Retrieves all tennis user profiles.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Tennis Player",
      "openTimes": [...],
      "userId": 1,
      "createdAt": "2025-08-20T12:00:00.000Z",
      "updatedAt": "2025-08-20T12:00:00.000Z"
    }
  ]
}
```

### Get User Profile by ID

**GET** `/api/tennis/profiles/:id`

**Parameters:**
- `id` (number): Profile ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Tennis Player",
    "openTimes": [...],
    "userId": 1
  }
}
```

### Get User Profile by User ID

**GET** `/api/tennis/profiles/user/:userId`

**Parameters:**
- `userId` (number): User ID

### Check Profile Exists

**GET** `/api/tennis/profiles/exists/:userId`

**Parameters:**
- `userId` (number): User ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "exists": true
  }
}
```

### Get Profiles Count

**GET** `/api/tennis/profiles/count`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 25
  }
}
```

### Update User Profile

**PUT** `/api/tennis/profiles/:id`

**Parameters:**
- `id` (number): Profile ID

**Request Body:**
```json
{
  "name": "Updated Tennis Player",
  "openTimes": [...]
}
```

### Delete User Profile

**DELETE** `/api/tennis/profiles/:id`

**Parameters:**
- `id` (number): Profile ID

## Contacts

Manage contact information for tennis players.

### Create Contact

**POST** `/api/tennis/contacts`

**Request Body:**
```json
{
  "type": "EMAIL",
  "url": "player@example.com",
  "qrCode": "base64_encoded_qr_code_data",
  "userId": "1"
}
```

**Contact Types:**
- `EMAIL` - Email address
- `PHONE` - Phone number
- `WECHAT` - WeChat ID
- `TIKTOK` - TikTok handle
- `INSTAGRAM` - Instagram handle
- `TWITTER` - Twitter handle

### Update Contact

**PUT** `/api/tennis/contacts/:id`

**Parameters:**
- `id` (number): Contact ID

### Delete Contact

**DELETE** `/api/tennis/contacts/:id`

**Parameters:**
- `id` (number): Contact ID

## Locations

Manage tennis court locations.

### Create Location

**POST** `/api/tennis/locations`

**Request Body:**
```json
{
  "name": "Central Tennis Court",
  "address": "123 Tennis St, City, State 12345",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Get All Locations

**GET** `/api/tennis/locations`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Central Tennis Court",
      "address": "123 Tennis St, City, State 12345",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "createdAt": "2025-08-20T12:00:00.000Z"
    }
  ]
}
```

### Get Location by ID

**GET** `/api/tennis/locations/:id`

**Parameters:**
- `id` (number): Location ID

### Update Location

**PUT** `/api/tennis/locations/:id`

### Delete Location

**DELETE** `/api/tennis/locations/:id`

## Skills Management

Advanced skills management with DDD implementation.

### Skill Types

- `FOREHAND` - Forehand stroke
- `BACKHAND` - Backhand stroke  
- `SERVE` - Serve technique
- `RETURN` - Return of serve
- `NET_PLAY` - Net play skills

### Skill Metrics

Each skill is evaluated on four metrics (scale 1-10):
- `action` - Technique execution
- `stable` - Consistency 
- `speed` - Power/pace
- `control` - Precision/placement

### Create or Update Skill

**POST** `/api/tennis/skills`

Creates a new skill or updates existing one for the user.

**Request Body:**
```json
{
  "type": "FOREHAND",
  "action": 8,
  "stable": 7,
  "speed": 9,
  "control": 6,
  "userId": "1"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "FOREHAND",
    "action": 8,
    "stable": 7,
    "speed": 9,
    "control": 6,
    "userId": 1,
    "createdAt": "2025-08-20T12:00:00.000Z"
  }
}
```

### Get All Skills

**GET** `/api/tennis/skills`

**Query Parameters:**
- `skip` (number, optional): Records to skip for pagination
- `take` (number, optional): Records to take for pagination

### Get Skill Statistics

**GET** `/api/tennis/skills/statistics`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSkills": 150,
    "averageRatings": {
      "FOREHAND": 7.2,
      "BACKHAND": 6.8,
      "SERVE": 7.5,
      "RETURN": 6.9,
      "NET_PLAY": 6.5
    },
    "skillDistribution": {
      "FOREHAND": 32,
      "BACKHAND": 28,
      "SERVE": 31,
      "RETURN": 29,
      "NET_PLAY": 30
    }
  }
}
```

### Get Top Performers

**GET** `/api/tennis/skills/top-performers/:type`

**Parameters:**
- `type` (string): Skill type (FOREHAND, BACKHAND, SERVE, RETURN, NET_PLAY)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "averageScore": 8.5,
      "skillData": {
        "action": 9,
        "stable": 8,
        "speed": 9,
        "control": 8
      }
    }
  ]
}
```

### Get User Skills

**GET** `/api/tennis/users/:userId/skills`

**Parameters:**
- `userId` (number): User ID

**Query Parameters:**
- `skip` (number, optional): Records to skip for pagination
- `take` (number, optional): Records to take for pagination

### Get User Skill by Type

**GET** `/api/tennis/users/:userId/skills/:type`

**Parameters:**
- `userId` (number): User ID
- `type` (string): Skill type

### Get Skill Recommendations

**GET** `/api/tennis/users/:userId/skill-recommendations`

**Parameters:**
- `userId` (number): User ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "skillType": "BACKHAND",
        "currentLevel": 6.5,
        "targetLevel": 7.5,
        "suggestions": [
          "Focus on follow-through technique",
          "Practice cross-court consistency"
        ]
      }
    ]
  }
}
```

### Compare User Skills

**GET** `/api/tennis/skills/compare/:userAId/:userBId/:skillType`

**Parameters:**
- `userAId` (number): First user ID
- `userBId` (number): Second user ID  
- `skillType` (string): Skill type to compare

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userA": {
      "userId": 1,
      "skill": {
        "type": "FOREHAND",
        "action": 8,
        "stable": 7,
        "speed": 9,
        "control": 6
      }
    },
    "userB": {
      "userId": 2,
      "skill": {
        "type": "FOREHAND",
        "action": 7,
        "stable": 8,
        "speed": 8,
        "control": 7
      }
    },
    "comparison": {
      "winner": "userA",
      "strengths": {
        "userA": ["speed"],
        "userB": ["stable", "control"]
      }
    }
  }
}
```

### Update Skill

**PUT** `/api/tennis/skills/:id`

**Parameters:**
- `id` (number): Skill ID

### Delete Skill

**DELETE** `/api/tennis/skills/:id`

**Parameters:**
- `id` (number): Skill ID

## Tennis Grounds

Manage tennis court facilities.

### Create Tennis Ground

**POST** `/api/tennis/tennis-grounds`

**Request Body:**
```json
{
  "name": "Court #1",
  "locationId": "1",
  "description": "Professional hard court with lighting",
  "facilities": {
    "lighting": true,
    "courtType": "hard",
    "covered": false,
    "restroom": true,
    "parking": true
  }
}
```

### Get All Tennis Grounds

**GET** `/api/tennis/tennis-grounds`

### Get Tennis Ground by ID

**GET** `/api/tennis/tennis-grounds/:id`

**Parameters:**
- `id` (number): Tennis ground ID

### Update Tennis Ground

**PUT** `/api/tennis/tennis-grounds/:id`

### Delete Tennis Ground

**DELETE** `/api/tennis/tennis-grounds/:id`

## Tennis Games

Manage tennis game sessions and memberships.

### Game Status Types
- `PLANNED` - Game is scheduled
- `ACTIVE` - Game is in progress  
- `COMPLETED` - Game finished
- `CANCELLED` - Game cancelled

### Create Tennis Game

**POST** `/api/tennis/games`

**Request Body:**
```json
{
  "name": "Weekend Singles Match",
  "dmId": "1",
  "tennisGroundId": "1", 
  "scheduledAt": "2025-08-25T14:00:00Z",
  "maxPlayers": 4,
  "description": "Friendly doubles match for intermediate players"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Weekend Singles Match",
    "dmId": 1,
    "tennisGroundId": 1,
    "scheduledAt": "2025-08-25T14:00:00.000Z",
    "maxPlayers": 4,
    "status": "PLANNED",
    "description": "Friendly doubles match for intermediate players",
    "createdAt": "2025-08-20T12:00:00.000Z"
  }
}
```

### Get All Tennis Games

**GET** `/api/tennis/games`

### Get Tennis Game by ID

**GET** `/api/tennis/games/:id`

**Parameters:**
- `id` (number): Game ID

### Update Tennis Game

**PUT** `/api/tennis/games/:id`

**Request Body:**
```json
{
  "name": "Updated Game Name",
  "scheduledAt": "2025-08-26T15:00:00Z",
  "maxPlayers": 6,
  "status": "ACTIVE",
  "description": "Updated description"
}
```

### Delete Tennis Game

**DELETE** `/api/tennis/games/:id`

### Join Game

**POST** `/api/tennis/games/join`

**Request Body:**
```json
{
  "gameId": "1",
  "userId": "2"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "gameId": 1,
    "userId": 2,
    "status": "PENDING",
    "joinedAt": "2025-08-20T12:00:00.000Z"
  }
}
```

### Update Game Member Status

**PUT** `/api/tennis/game-members/:id`

**Parameters:**
- `id` (number): Game member ID

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Member Status Types:**
- `PENDING` - Waiting for confirmation
- `CONFIRMED` - Confirmed participation
- `DECLINED` - Declined participation

### Leave Game

**DELETE** `/api/tennis/games/:gameId/leave`

**Parameters:**
- `gameId` (number): Game ID

## Evaluations

Advanced evaluation system for tennis skills with domain-driven design.

### Create Evaluation

**POST** `/api/tennis/evaluations`

**Request Body:**
```json
{
  "userId": "1",
  "evaluatorId": "2",
  "skills": [
    {
      "type": "FOREHAND",
      "action": 8,
      "stable": 7,
      "speed": 9,
      "control": 6
    },
    {
      "type": "BACKHAND", 
      "action": 7,
      "stable": 8,
      "speed": 7,
      "control": 8
    },
    {
      "type": "SERVE",
      "action": 9,
      "stable": 6,
      "speed": 10,
      "control": 7
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "evaluatorId": 2,
    "evaluationDate": "2025-08-20T12:00:00.000Z",
    "skills": [...]
  },
  "warnings": [
    "Serve speed score is exceptionally high, please verify"
  ]
}
```

### Get Evaluation by ID

**GET** `/api/tennis/evaluations/:id`

**Parameters:**
- `id` (number): Evaluation ID

### Get User Evaluations

**GET** `/api/tennis/evaluations/user/:userId`

**Parameters:**
- `userId` (number): User ID

### Get Evaluations by Evaluator

**GET** `/api/tennis/evaluations/evaluator/:evaluatorId`

**Parameters:**
- `evaluatorId` (number): Evaluator ID

### Get Latest User Evaluation

**GET** `/api/tennis/evaluations/user/:userId/latest`

**Parameters:**
- `userId` (number): User ID

### Get User Evaluation Statistics

**GET** `/api/tennis/evaluations/user/:userId/statistics`

**Parameters:**
- `userId` (number): User ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEvaluations": 5,
    "averageScores": {
      "FOREHAND": 7.8,
      "BACKHAND": 7.2,
      "SERVE": 8.1,
      "RETURN": 6.9,
      "NET_PLAY": 7.0
    },
    "improvementTrends": {
      "FOREHAND": "+0.5",
      "BACKHAND": "+1.2",
      "SERVE": "+0.3",
      "RETURN": "+0.8",
      "NET_PLAY": "+1.0"
    },
    "lastEvaluationDate": "2025-08-15T12:00:00.000Z"
  }
}
```

### Get User Evaluation Summary

**GET** `/api/tennis/evaluations/user/:userId/summary`

**Parameters:**
- `userId` (number): User ID

### Get User Evaluation History

**GET** `/api/tennis/evaluations/user/:userId/history`

**Parameters:**
- `userId` (number): User ID

### Get Evaluations by Skill Type

**GET** `/api/tennis/evaluations/skill/:skillType`

**Parameters:**
- `skillType` (string): Skill type

### Compare User Evaluations

**POST** `/api/tennis/evaluations/user/:userId/compare`

**Parameters:**
- `userId` (number): User ID

**Request Body:**
```json
{
  "evaluationId1": 1,
  "evaluationId2": 2
}
```

### Validate Evaluation Data

**POST** `/api/tennis/evaluations/validate`

**Request Body:**
```json
{
  "userId": "1",
  "skills": [
    {
      "type": "FOREHAND",
      "action": 12,
      "stable": 7,
      "speed": 9,
      "control": 6
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "errors": [
      "Action score for FOREHAND exceeds maximum value of 10"
    ],
    "warnings": [
      "Consider reviewing action score as it's unusually high"
    ]
  }
}
```

### Delete Evaluation

**DELETE** `/api/tennis/evaluations/:id`

**Parameters:**
- `id` (number): Evaluation ID

## Response Format

All tennis service responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Success Response with Warnings
```json
{
  "success": true,
  "data": {
    // Response data  
  },
  "warnings": [
    "Warning message"
  ]
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation error message"
}
```

## Error Handling

### HTTP Status Codes

- **200 OK** - Successful GET, PUT requests
- **201 Created** - Successful POST requests
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing/invalid authentication
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Common Error Examples

**400 Bad Request - Missing Required Fields:**
```json
{
  "success": false,
  "message": "Name, openTimes, and userId are required"
}
```

**400 Bad Request - Invalid Skill Data:**
```json
{
  "success": false,
  "error": "User ID and skills array are required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User profile not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production environments.

## Notes

- All timestamps are in ISO 8601 format
- Skill scores should be between 1-10 for each metric
- Game scheduling uses UTC timestamps
- Profile open times use 24-hour format
- Location coordinates use decimal degrees format
- QR codes for contacts should be base64 encoded

## Domain-Driven Design Implementation

The Tennis service follows DDD principles:

- **Entities**: UserProfile, Skill, Evaluation, Game, Ground, Location, Contact
- **Value Objects**: Skill metrics (action, stable, speed, control)
- **Domain Services**: SkillDomainService, EvaluationDomainService  
- **Repositories**: Abstracted data access with interfaces
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic coordination

This architecture ensures separation of concerns, testability, and maintainability of the tennis service domain.
