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

---

## Endpoint: `/users/login`

### Description

This endpoint is used to authenticate a user. It validates the input data, checks the credentials, and returns a JSON Web Token (JWT) upon successful authentication.

### Method

`POST`

### Request Body

The request body must be in JSON format and include the following fields:

| Field      | Type   | Required | Description                                   |
|------------|--------|----------|-----------------------------------------------|
| `email`    | String | Yes      | The email address of the user (must be valid).|
| `password` | String | Yes      | The password for the user (min 6 characters). |

### Example Request

```json
{
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

### Responses

#### Success (200 OK)

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
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

#### Authentication Error (401 Unauthorized)

```json
{
  "message": "Invalid email or password"
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "error": "An unexpected error occurred"
}
```

### Notes

- Ensure that the `email` and `password` fields are validated.
- A valid JWT is returned upon successful authentication.

---

## Endpoint: `/users/profile`

### Description

This endpoint is used to retrieve the profile of the authenticated user. It requires a valid JWT token for authentication.

### Method

`GET`

### Headers

| Header         | Type   | Required | Description                  |
|----------------|--------|----------|------------------------------|
| `Authorization`| String | Yes      | Bearer token for authentication.|

### Responses

#### Success (200 OK)

```json
{
  "_id": "user_id_here",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "johndoe@example.com"
}
```

#### Authentication Error (401 Unauthorized)

```json
{
  "message": "Unauthorized"
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "error": "An unexpected error occurred"
}
```

### Notes

- Ensure the `Authorization` header contains a valid JWT token.
- The user profile is retrieved from the token payload.

---

## Endpoint: `/users/logout`

### Description

This endpoint is used to log out the authenticated user. It invalidates the current JWT token by adding it to a blacklist.

### Method

`GET`

### Headers

| Header         | Type   | Required | Description                  |
|----------------|--------|----------|------------------------------|
| `Authorization`| String | Yes      | Bearer token for authentication.|

### Responses

#### Success (200 OK)

```json
{
  "message": "Logged out successfully"
}
```

#### Authentication Error (401 Unauthorized)

```json
{
  "message": "Unauthorized"
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "error": "An unexpected error occurred"
}
```

### Notes

- Ensure the `Authorization` header contains a valid JWT token.
- The token is added to a blacklist to prevent further use.

---

## Endpoint: `/captains/register`

### Description

This endpoint is used to register a new captain. It validates the input data, including vehicle details, and creates a new captain in the database.

### Method

`POST`

### Request Body

The request body must be in JSON format and include the following fields:

| Field                   | Type   | Required | Description                                           |
|-------------------------|--------|----------|-------------------------------------------------------|
| `fullname.firstname`    | String | Yes      | The first name of the captain (min 3 characters).     |
| `fullname.lastname`     | String | No       | The last name of the captain (min 3 characters).      |
| `email`                 | String | Yes      | The email address of the captain (must be valid).     |
| `password`              | String | Yes      | The password for the captain (min 6 characters).      |
| `vehicle.color`         | String | Yes      | The color of the vehicle (min 3 characters).          |
| `vehicle.plate`         | String | Yes      | The license plate of the vehicle (min 3 characters).  |
| `vehicle.capacity`      | Number | Yes      | The seating capacity of the vehicle (must be numeric).|
| `vehicle.vehicleType`   | String | Yes      | The type of vehicle (must be `car`, `motorcycle`, or `auto`).|

### Example Request

```json
{
  "fullname": {
    "firstname": "Jane",
    "lastname": "Doe"
  },
  "email": "janedoe@example.com",
  "password": "securepassword",
  "vehicle": {
    "color": "Red",
    "plate": "XYZ123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

### Responses

#### Success (201 Created)

```json
{
  "message": "Captain registered successfully",
  "captain": {
    "_id": "captain_id_here",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "janedoe@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "XYZ123",
      "capacity": 4,
      "vehicleType": "car"
    }
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
      "msg": "Vehicle type must be car, motorcycle or auto",
      "param": "vehicle.vehicleType",
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
- Vehicle details are validated before registration.
