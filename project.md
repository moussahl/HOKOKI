# HOKOKI Project Description

HOKOKI is a NestJS backend project designed to support a legal assistance and consultation platform. It provides a structured API for managing users, conversations, expert sessions, laws, procedures, interests, and notifications.

## Main Goals
- Provide secure authentication and role-based access control for users.
- Support user-to-user or user-to-expert conversations and messaging.
- Manage expert consultation sessions and related workflow states.
- Expose legal information such as laws, articles, procedures, and progress tracking.
- Enable interest-based personalization and notification delivery.

## Key Modules
- Auth: login, registration, JWT authentication, and role-based authorization.
- Users: user account management and related services.
- Conversations: chat/conversation creation and message handling.
- Expert Sessions: management of expert consultation sessions.
- Laws and Procedures: legal content and procedural guidance.
- Interests: user interest management.
- Notifications: notification generation and retrieval.

## Technical Stack
- NestJS framework
- TypeScript
- TypeORM with PostgreSQL-style database configuration
- JWT-based authentication
- RESTful API architecture

## Project Purpose
This backend acts as the core engine for a platform that helps users access legal knowledge, interact with experts, and track procedural progress in a structured and secure way.
