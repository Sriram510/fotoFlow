const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
// Get the list of previously uploaded images
const uploadedImages = fs.readdirSync('uploads');
const path = require('path');
const session = require('express-session');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');

const imageUserFilePath = path.join(__dirname, '/imageUser.json');
//const upload = multer({ dest: 'uploads/' });

const app = express();
const saltRounds = 10;
const usersFile = 'users.json';

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      cb(null, uniqueFilename);
    }
  });
  
  const upload = multer({ storage });
  

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


// Serve static files from the 'public' folder
app.use(express.static('public'));

app.use(cookieParser());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');


// Load existing users from the JSON file
let users = [];
if (fs.existsSync(usersFile)) {
  const data = fs.readFileSync(usersFile, 'utf8');
  users = JSON.parse(data);
}

let imageUserMap = {};
if (fs.existsSync('imageUser.json')) {
  const data = fs.readFileSync('imageUser.json', 'utf8');
  imageUserMap = JSON.parse(data);
}

// Route for the login page
app.get('/', (req, res) => {
  res.sendFile('login.html', { root: 'public' });
});

// Route for the signup page
app.get('/signup', (req, res) => {
  res.sendFile('signup.html', { root: 'public' });
});

// Route for user signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists
  if (users.find(user => user.username === username)) {
    res.send('Username already exists!');
    return;
  }

  // Encrypt the password
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    // Store the user in the JSON file
    users.push({ username, password: hash });
    fs.writeFileSync(usersFile, JSON.stringify(users));

    res.send('Signup successful!');
  });
});

// Route for user login
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Find the user with the matching username
  const user = users.find(user => user.username === username);
  if (!user) {
    res.send('Invalid username or password');
    return;
  }

  // Compare the decrypted password
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      console.log(err);
      res.send('Error comparing passwords');
      return;
    }

    if (result) {
      req.session.username = username;
      res.redirect('/upload');
    } else {
      res.send('Invalid username or password');
    }
  });
});



app.get('/upload', (req, res) => {
  const username = req.session.username;

  // Check if the user is logged in
  if (!username) {
    res.redirect('/');
    return;
  }

  const imageUserFilePath = path.join(__dirname, '/imageUser.json');

  // Read the imageUser data from the file
  fs.readFile(imageUserFilePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      res.send('Error reading imageUser data');
      return;
    }

    // Parse the imageUser data
    const imageUser = JSON.parse(data);

    // Get the previously uploaded images for the logged-in user
    const userImages = imageUser[username] || [];

    // Render the upload page and pass the images array
    res.render('upload', { username, images: userImages });
  });
});

// Upload image
app.post('/upload', upload.single('image'), (req, res) => {
  const username = req.session.username;
  const image = req.file;

  // Check if the user is logged in
  if (!username) {
    res.status(401).json({ message: 'User not logged in.' });
    return;
  }

  // Check if an image was uploaded
  if (!image) {
    res.status(400).json({ message: 'No image uploaded.' });
    return;
  }

  // Generate a unique ID for the uploaded image
  const imageId = uuidv4();
  const imagePath = path.join(__dirname, 'uploads', imageId);

  // Move the uploaded image to the uploads folder
  fs.rename(image.path, imagePath, err => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    // Read the imageUser data from the file
    fs.readFile(imageUserFilePath, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      const imageUser = JSON.parse(data);
      const userImages = imageUser[username] || [];

      // Add the image ID to the user's image array
      userImages.push(imageId);

      // Update the imageUser data with the updated image array
      imageUser[username] = userImages;

      // Write the updated imageUser data back to the file
      fs.writeFile(imageUserFilePath, JSON.stringify(imageUser), err => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }

        // Redirect back to the upload page with a success message
        res.redirect('/upload?message=Image uploaded successfully.');
      });
    });
  });
});



// server.js

// ...

// Delete selected images
// Delete selected images
app.post('/delete', (req, res) => {
  const username = req.session.username;
  const selectedImages = req.body.images;

  // Check if the user is logged in
  if (!username) {
    res.status(401).json({ message: 'User not logged in.' });
    return;
  }

  // Check if images are selected
  if (!Array.isArray(selectedImages) || selectedImages.length === 0) {
    res.status(400).json({ message: 'No images selected.' });
    return;
  }

  // Read the imageUser data from the file
  fs.readFile(imageUserFilePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    const imageUser = JSON.parse(data);
    const userImages = imageUser[username] || [];

    // Ensure userImages is defined and not empty
    if (!Array.isArray(userImages) || userImages.length === 0) {
      res.status(400).json({ message: 'No images found for the user.' });
      return;
    }

    // Remove the selected images from the user's image array
    const updatedImages = userImages.filter(imageId => !selectedImages.includes(imageId));

    // Update the imageUser data with the updated image array
    imageUser[username] = updatedImages;

    // Write the updated imageUser data back to the file
    fs.writeFile(imageUserFilePath, JSON.stringify(imageUser), err => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      // Delete the selected images from the uploads folder
      selectedImages.forEach(imageId => {
        const imagePath = path.join(__dirname, 'uploads', imageId);
        fs.unlink(imagePath, err => {
          if (err) {
            console.log(err);
          }
        });
      });

      // Redirect back to the upload page with a success message
      res.redirect('/upload?message=Selected images deleted successfully.');
    });
  });
});




// ...



// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
