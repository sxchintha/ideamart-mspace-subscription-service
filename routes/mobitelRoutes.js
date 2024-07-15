import express from 'express';
import { getSubscriberStatus } from '../controllers/mobitelController.js';


const mobitelRoute = express.Router();

mobitelRoute.post('/getSubscriberStatus', getSubscriberStatus);

export default mobitelRoute;