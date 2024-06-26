import React, { useState } from 'react';
import './Auth.css'
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Home from '../Home/Home';
import About from '../About/About';
import Dashboard from '../DashBoard/Dashboard';
import UpLoad from '../Upload/UpLoad'
import Navbar from '../Navbar/Navbar';

const defaultTheme = createTheme();

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
  const [cameraQuantity, setCameraQuantity] = useState(0);
  const navigate = useNavigate();



  const handleLogin = () => {
    const adminUsername = process.env.REACT_APP_ADMIN_USERNAME;
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
    const userUsername = process.env.REACT_APP_USER_USERNAME;
    const userPassword = process.env.REACT_APP_USER_PASSWORD;


    if (
      (username === adminUsername && password === adminPassword) ||
      (username === userUsername && password === userPassword)
    ) {
      localStorage.setItem('user', username);
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    navigate('/');
  };


  return (
    <div>
      {isLoggedIn ? (
        <div>
          <Navbar handleLogout={handleLogout} />
          {/* <h2>Welcome, {localStorage.getItem('user')}</h2> */}
          <div style={{ padding: '20px' }}>

            <Routes>
              <Route path="/" element={<Home data={data} cameraQuantity={cameraQuantity} onCameraQuantityChange={setCameraQuantity} />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<Dashboard cameraQuantity={cameraQuantity} setCameraQuantity={setCameraQuantity} />} />
              <Route path="/upload" element={<UpLoad setData={setData} />} />
            </Routes>

          </div>
          {/* <button className='logout' onClick={handleLogout}>Logout</button> */}
        </div>
      ) : (
        <ThemeProvider theme={defaultTheme}>
          <Grid container component="main" sx={{ height: "100vh" }}>
            <CssBaseline />
            <Grid
              item
              xs={false}
              sm={4}
              md={7}
              sx={{
                backgroundColor: "#0d74ab",
                backgroundImage: `url(${process.env.PUBLIC_URL}/cglogo.png)`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: 300,
              }}
            />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
              <Box
                sx={{
                  my: 8,
                  mx: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar sx={{ m: 1, bgcolor: "#007bbd" }}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Login
                </Typography>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleLogin}
                  sx={{ mt: 1 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="userName"
                    label="UserName"
                    name="userName"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Log in
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </ThemeProvider>
      )}
    </div>
  );
};

// export default Auth;

const App = () => (
  <Router>
    <Routes>
      <Route path="/*" element={<Auth />} />
    </Routes>
  </Router>
);

export default App;


