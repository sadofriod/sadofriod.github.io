---
layout: interesting
title: Freezer Backend API Documentation
date: 2025-07-30 12:39:53
tags: interesting
p: interesting
categories: interesting
keywords: hexo seo optimize, hexo seo 优化, seo 优化
isHidden: true
---


****# Freezer Backend API Documentation

## Overview

The Freezer Backend API provides endpoints for managing users, food nutrients, images, body data, blog content, scan documents, and database dashboard functionality.

**Base URL:** `https://api.ashesborn.cloud` (or your deployed URL)

## Table of Contents

1. [Authentication](#authentication)
2. [General Endpoints](#general-endpoints)
3. [User Management](#user-management)
4. [Food Nutrients](#food-nutrients)
5. [Image Management](#image-management)
6. [Body Data](#body-data)
7. [Blog Services](#blog-services)
8. [Scan Documents](#scan-documents)
9. [Database Dashboard](#database-dashboard)
10. [Error Responses](#error-responses)

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the request headers:

```
Authorization: Bearer <your-jwt-token>
```

Or as a cookie (for web applications):
```
Cookie: token=<your-jwt-token>
```

## General Endpoints

### Health Check

#### GET `/`
Returns the API status.

**Response:**
```json
{
  "message": "Freezer Backend API is running!"
}
```

#### GET `/health`
Returns detailed health information.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-30T12:00:00.000Z"
}
```

## User Management

Base URL: `/api/users`

### Register User

#### POST `/api/users/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "USER" // Optional, defaults to USER
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Login User

#### POST `/api/users/login`
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

*Note: JWT token is set as an httpOnly cookie*

### Get Current User

#### GET `/api/users/me`
Get the current authenticated user's information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER"
}
```

### Get All Users (Admin Only)

#### GET `/api/users`
Get all users in the system.

**Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
]
```

### Get User by ID

#### GET `/api/users/:id`
Get a specific user by ID.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (number): User ID

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER"
}
```

### Get User by Email

#### GET `/api/users/email/:email`
Get a specific user by email.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `email` (string): User email

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER"
}
```

### Update User

#### PUT `/api/users/:id`
Update user information.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (number): User ID

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

### Delete User (Admin Only)

#### DELETE `/api/users/:id`
Delete a user.

**Headers:** `Authorization: Bearer <admin-token>`

**Parameters:**
- `id` (number): User ID

### Get User Freezer Items

#### GET `/api/users/:id/freezer-items`
Get freezer items for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (number): User ID

### Get User Doc Images

#### GET `/api/users/:id/doc-images`
Get document images for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (number): User ID

## Food Nutrients

Base URL: `/api/food-nutrients`

### Get All Food Nutrients

#### GET `/api/food-nutrients`
Retrieve all food nutrients from the database.

**Response:**
```json
[
  {
    "id": 1,
    "mainFoodDescription": "Apples, raw, with skin",
    "wweiaDescription": "Apple, raw",
    "energyKcal": 52,
    "protein": 0.26,
    "totalFat": 0.17,
    "carbohydrate": 13.81,
    "fiber": 2.4,
    "sugars": 10.39
  }
]
```

### Get Food Nutrient by ID

#### GET `/api/food-nutrients/:id`
Retrieve a specific food nutrient by ID.

**Parameters:**
- `id` (number): Food nutrient ID

**Response:**
```json
{
  "id": 1,
  "mainFoodDescription": "Apples, raw, with skin",
  "wweiaDescription": "Apple, raw",
  "energyKcal": 52,
  "protein": 0.26,
  "totalFat": 0.17,
  "carbohydrate": 13.81,
  "fiber": 2.4,
  "sugars": 10.39
}
```

**Error Response (404):**
```json
{
  "error": "Food nutrient not found"
}
```

### Search Food Nutrients by Description

#### GET `/api/food-nutrients/search/description`
Search food nutrients by description (searches both mainFoodDescription and wweiaDescription).

**Query Parameters:**
- `query` (string, required): Search term

**Example:** `/api/food-nutrients/search/description?query=apple`

**Response:**
```json
[
  {
    "id": 1,
    "mainFoodDescription": "Apples, raw, with skin",
    "wweiaDescription": "Apple, raw",
    "energyKcal": 52,
    "protein": 0.26,
    "totalFat": 0.17,
    "carbohydrate": 13.81,
    "fiber": 2.4,
    "sugars": 10.39
  }
]
```

### Search Food Nutrients by Calories

#### GET `/api/food-nutrients/search/kcalories`
Search food nutrients within a specific calorie range.

**Query Parameters:**
- `min` (number, required): Minimum calories
- `max` (number, required): Maximum calories

**Example:** `/api/food-nutrients/search/kcalories?min=50&max=100`

**Response:**
```json
[
  {
    "id": 1,
    "mainFoodDescription": "Apples, raw, with skin",
    "wweiaDescription": "Apple, raw",
    "energyKcal": 52,
    "protein": 0.26,
    "totalFat": 0.17,
    "carbohydrate": 13.81,
    "fiber": 2.4,
    "sugars": 10.39
  }
]
```

**Error Response (400):**
```json
{
  "error": "Min kcalories cannot be greater than max kcalories"
}
```

## Image Management

Base URL: `/api/images`

### Upload Image

#### POST `/api/images/upload`
Upload an image file.

**Headers:** 
- `Content-Type: multipart/form-data`
- `Authorization: Bearer <token>`

**Request Body:**
- `image` (file): Image file to upload

### Get Image

#### GET `/api/images/:filename`
Retrieve an uploaded image.

**Parameters:**
- `filename` (string): Image filename

### Health Check

#### GET `/api/images/health`
Check image service health.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-30T12:00:00.000Z"
}
```

## Body Data

Base URL: `/api/body-data` (requires token-based authentication)

### Create Body Data

#### POST `/api/body-data`
Create new body data entry.

**Headers:** `X-Body-Token: <body-token>`

### Get Body Data

#### GET `/api/body-data`
Retrieve body data entries.

**Headers:** `X-Body-Token: <body-token>`

### Update Body Data

#### PUT `/api/body-data/:id`
Update existing body data entry.

**Headers:** `X-Body-Token: <body-token>`

### Delete Body Data

#### DELETE `/api/body-data/:id`
Delete body data entry.

**Headers:** `X-Body-Token: <body-token>`

### Search Body Data

#### GET `/api/body-data/search`
Search body data entries.

**Headers:** `X-Body-Token: <body-token>`

## Blog Services

### Create Blog

#### POST `/api/blog/create`
Create a new blog post.

### Get Blog

#### GET `/api/blog/:id`
Get a specific blog post.

### Update Blog Views

#### POST `/api/blog/:id/views`
Increment blog post view count.

### Like/Unlike Blog

#### POST `/api/blog/:id/like`
Increment blog post likes.

#### POST `/api/blog/:id/unlike`
Decrement blog post likes.

### Add Comment

#### POST `/api/blog/:id/comments`
Add a comment to a blog post.

## Scan Documents

Base URL: `/api/scan-doc`

### Get Analysis Signature URL

#### GET `/api/scan-doc/analyze-url`
Get a pre-signed URL for document analysis.

### Process Document

#### POST `/api/scan-doc/process`
Process a scanned document.

## Database Dashboard

Base URL: `/api/db-dashboard` (Admin authentication required)

### Get Database Statistics

#### GET `/api/db-dashboard/stats`
Get database statistics and metrics.

**Headers:** `Authorization: Bearer <admin-token>`

### Execute Query

#### POST `/api/db-dashboard/query`
Execute a database query.

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "query": "SELECT * FROM users LIMIT 10"
}
```

## Error Responses

### Common Error Status Codes

- `400 Bad Request`: Invalid request parameters or body
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Requested resource not found
- `409 Conflict`: Resource already exists (e.g., email already registered)
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Examples

**400 Bad Request:**
```json
{
  "error": "Invalid user ID"
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "error": "Food nutrient not found"
}
```

**409 Conflict:**
```json
{
  "error": "User with this email already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch food nutrients"
}
```

## Rate Limiting

Currently, there are no rate limiting restrictions implemented. However, it's recommended to implement rate limiting in production environments.

## CORS

The API supports Cross-Origin Resource Sharing (CORS) and accepts requests from all origins in the current configuration.

## Notes

- All timestamps are in ISO 8601 format
- File uploads support common image formats (JPEG, PNG, GIF, WebP)
- Database queries in the dashboard require admin privileges
- Body data endpoints use a separate token-based authentication system
- JWT tokens are set as httpOnly cookies for security

## Test Endpoints

### Image Test Page

#### GET `/test-images`
Serves a test HTML page for image functionality testing.
