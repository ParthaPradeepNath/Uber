# API Documentation

## Endpoint: `/users/register`

### Description

This endpoint is used to register a new user. It validates the input data, hashes the password, and creates a new user in the database. Upon successful registration, it returns a JSON Web Token (JWT) and the user details.

### Method

`POST`

### Request Body

The request body must be in JSON format and include the following fields:

| Field               | Type   | Required | Description                                   |
|---------------------|--------|----------|-----------------------------------------------|
| `fullname.firstname`| String | Yes      | The first name of the user (min 3 characters).|
| `fullname.lastname` | String | No       | The last name of the user (min 3 characters). |
| `email`             | String | Yes      | The email address of the user (must be valid).|
| `password`          | String | Yes      | The password for the user (min 6 characters). |

### Example Request

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

### Responses

#### Success (201 Created)

```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id_here",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "johndoe@example.com"
  }
}
```

#### Validation Error (400 Bad Request)

```json
{
  "errors": [
    {
      "msg": "First name must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    },
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "error": "An unexpected error occurred"
}
```

### Notes

- Ensure that the `email` field is unique.
- Passwords are securely hashed before being stored in the database.
- A valid JWT is returned upon successful registration.
