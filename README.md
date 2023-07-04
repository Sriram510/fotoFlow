# fotoFlow
Logged in user can perform CRUD operations on any images he/she needs

# Image Management Application

This is a simple Node.js-based image management application that allows users to upload and manage their images.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)

## Prerequisites

Before getting started, ensure that you have the following software installed on your machine:

- Node.js (v12 or higher)
- npm (Node Package Manager)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-username/image-management.git
```

2. Navigate to the project directory:

   ```bash
   cd fotoFlow
   ```
3. Install the dependencies:

   ```bash
   npm install express bcrypt jsonwebtoken multer ejs express-session fs body-parser cookie-parser nodemon path uuid
   ```
3. Start the server:

   ```bash
   npm start
   ```
4. Open your web browser and visit http://localhost:3000 to access the application.

## Usage

 ### Sign Up

1. For sign up go to http://localhost:3000/signup
2. Enter your desired username and password, then click "Sign Up".
3. you have successfully created your account

### Login

1. On the homepage, enter your username and password, then click "Login".
2. If the credentials are valid, you will be redirected to the upload page.

### Upload Images

1. On the upload page, click on the "Choose File" button.
2. Select an image file from your computer.
3. Click on the "Upload" button to upload the image.
4. The uploaded image will be displayed in the "Previously Uploaded Images" section.

### Delete Images

1. On the upload page, select one or more images by checking the corresponding checkboxes.
2. Click on the "Delete Selected Images" button to delete the selected images.
3. The images will be removed from the server and no longer appear in the "Previously Uploaded Images" section.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request





