# Course Categories API

This document describes the new scalable course categories system that replaces the enum-based approach.

## Overview

The course categories are now managed as database entities, allowing admins to:
- Create new categories
- Update existing categories
- Delete categories (if no courses are assigned)
- View all categories with their metadata

## API Endpoints

### Public Endpoints

#### GET /categories
Get all active categories (for frontend display)
```json
[
  {
    "id": "uuid",
    "name": "Career Skills",
    "description": "Skills for professional development",
    "icon": "career-icon.svg",
    "isActive": true,
    "order": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /categories/:id
Get a specific category by ID
```json
{
  "id": "uuid",
  "name": "Career Skills",
  "description": "Skills for professional development",
  "icon": "career-icon.svg",
  "isActive": true,
  "order": 1,
  "courses": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Admin Endpoints (Require Admin Authentication)

#### GET /categories/all
Get all categories (including inactive ones) for admin management
```json
[
  {
    "id": "uuid",
    "name": "Career Skills",
    "description": "Skills for professional development",
    "icon": "career-icon.svg",
    "isActive": true,
    "order": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /categories
Create a new category
```json
{
  "name": "New Category",
  "description": "Description of the new category",
  "icon": "icon.svg",
  "isActive": true,
  "order": 15
}
```

#### PATCH /categories/:id
Update an existing category
```json
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "isActive": false
}
```

#### DELETE /categories/:id
Delete a category (only if no courses are assigned to it)

#### POST /categories/seed
Seed default categories (admin only)

## Updated Course Endpoints

### Course Creation
When creating a course, use `categoryId` instead of `category`:

```json
{
  "title": "Course Title",
  "categoryId": "uuid-of-category",
  "description": "Course description",
  "duration": 120,
  "createdById": "user-uuid"
}
```

### Course Search by Category
Use `categoryId` parameter instead of `category`:

```
GET /courses/search/by-category?categoryId=uuid&userId=user-uuid
```

## Migration

To migrate from the old enum-based system:

1. Run the migration script to create the new table structure
2. Seed default categories using the API endpoint or script
3. Update existing courses to use the new category system

## Default Categories

The system comes with these default categories:
- Career Skills
- Money Matters
- Communication Skills
- Digital Tools
- Personal Growth
- Interviews
- Leadership
- Teamwork & Collaboration
- Time Management
- Emotional Intelligence
- Critical Thinking
- Problem Solving
- Creativity
- Learning Strategies

## Database Schema

```sql
CREATE TABLE course_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL UNIQUE,
  description VARCHAR,
  icon VARCHAR,
  isActive BOOLEAN DEFAULT true,
  order INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- Foreign key in courses table
ALTER TABLE courses ADD COLUMN categoryId UUID REFERENCES course_categories(id);
```

## Frontend Integration

Update your frontend to:
1. Fetch categories from `/categories` endpoint
2. Use category IDs instead of enum values when creating/updating courses
3. Display category names from the API response
4. Implement admin interface for category management 