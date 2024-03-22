const express=require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connection,UserModel,Flightmodel,BookingModel } = require('./db');

const app=express();

app.use(express.json());

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, 'your_secret_key', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = user;
      next();
    });
  };

app.post('/api/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new UserModel({
        name,
        email,
        password: hashedPassword
      });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
  
      res.status(201).json({ token });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/flights', async (req, res) => {
    try {
      const flights = await FlightModel.find();
      res.status(200).json(flights);
    } catch (error) {
      console.error('Error getting flights:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/flights/:id', async (req, res) => {
    try {
      const flight = await FlightModel.findById(req.params.id);
      if (!flight) {
        return res.status(404).json({ message: 'Flight not found' });
      }
      res.status(200).json(flight);
    } catch (error) {
      console.error('Error getting flight by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/flights', authenticateToken, async (req, res) => {
    try {
      const newFlight = new FlightModel(req.body);
      await newFlight.save();
      res.status(201).json({ message: 'Flight added successfully' });
    } catch (error) {
      console.error('Error adding flight:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/flights/:id', authenticateToken, async (req, res) => {
    try {
      await FlightModel.findByIdAndUpdate(req.params.id, req.body);
      res.status(204).send();
    } catch (error) {
      console.error('Error updating flight:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/flights/:id', authenticateToken, async (req, res) => {
    try {
      await FlightModel.findByIdAndDelete(req.params.id);
      res.status(202).json({ message: 'Flight deleted successfully' });
    } catch (error) {
      console.error('Error deleting flight:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/booking', authenticateToken, async (req, res) => {
    try {
      const { userId, flightId } = req.body;
  
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      const flight = await FlightModel.findById(flightId);
      if (!flight) {
        return res.status(400).json({ message: 'Flight not found' });
      }
  
      const newBooking = new BookingModel({ user: userId, flight: flightId });
      await newBooking.save();
  
      res.status(201).json({ message: 'Booking created successfully' });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
      const bookings = await BookingModel.find().populate('user').populate('flight');
      res.status(200).json(bookings);
    } catch (error) {
      console.error('Error getting bookings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/dashboard/:id', authenticateToken, async (req, res) => {
    try {
      await BookingModel.findByIdAndUpdate(req.params.id, req.body);
      res.status(204).send();
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/dashboard/:id', authenticateToken, async (req, res) => {
    try {
      await BookingModel.findByIdAndDelete(req.params.id);
      res.status(202).json({ message: 'Booking deleted successfully' });
    } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.listen(8080,async ()=>{
    try{
        await connection;
        console.log("Connection Established");
    }
    catch(error){
        console.log(error);
    }
})